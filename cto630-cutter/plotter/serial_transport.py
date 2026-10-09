"""USB serial transport.

TODO: the PCUT manual documents RS-232 and a USB port that shows up as a COM
port after the vendor driver is installed. It does not document a USB
handshake. ``open`` only opens the port. It does not write a probe command.
"""

from __future__ import annotations

import logging
import threading
from dataclasses import dataclass

from plotter.base import (
    CONNECT_FAILED_LV,
    JobStatus,
    PlotterConnectionError,
    PlotterStopped,
    SerialWriteError,
)

logger = logging.getLogger(__name__)

# pyserial's flush() is tcdrain, which is not limited by write_timeout.
# Bound it so RTS/CTS or DTR/DSR cannot stall the job with no error.
DEFAULT_FLUSH_TIMEOUT_S = 5.0

_FLOW_FLAGS = {
    "none": {"xonxoff": False, "rtscts": False, "dsrdtr": False},
    "xonxoff": {"xonxoff": True, "rtscts": False, "dsrdtr": False},
    "rtscts": {"xonxoff": False, "rtscts": True, "dsrdtr": False},
    "dsrdtr": {"xonxoff": False, "rtscts": False, "dsrdtr": True},
}


@dataclass(frozen=True)
class SerialPortInfo:
    device: str
    description: str


def list_serial_ports() -> list[SerialPortInfo]:
    from serial.tools import list_ports

    found: list[SerialPortInfo] = []
    for port in list_ports.comports():
        found.append(SerialPortInfo(port.device, port.description or ""))
    return found


@dataclass(frozen=True)
class WriteOutcome:
    intended: int
    accepted: int


class SerialTransport:
    def __init__(self, flush_timeout: float = DEFAULT_FLUSH_TIMEOUT_S) -> None:
        self._serial = None
        self._abort = False
        self.flush_timeout = float(flush_timeout)
        self._flow_control = "none"

    def open(
        self,
        *,
        port: str,
        baud_rate: int,
        data_bits: int,
        parity: str,
        stop_bits: float,
        flow_control: str,
    ) -> None:
        import serial

        if not port:
            raise PlotterConnectionError(CONNECT_FAILED_LV)
        # Unknown values must fail here. They must not fall through to no flow control.
        flags = self._flow_flags(flow_control)
        # TODO: parity, stop bits, and flow control are not clearly specified
        # for the CTO630. They are whatever the user configured.
        try:
            self._serial = serial.Serial(
                port=port,
                baudrate=int(baud_rate),
                bytesize=self._bytesize(serial, data_bits),
                parity=self._parity(serial, parity),
                stopbits=self._stopbits(serial, stop_bits),
                timeout=1,
                write_timeout=5,
                xonxoff=flags["xonxoff"],
                rtscts=flags["rtscts"],
                dsrdtr=flags["dsrdtr"],
            )
        except (OSError, ValueError, serial.SerialException) as exc:
            logger.exception("Failed to open %s", port)
            self._serial = None
            raise PlotterConnectionError(CONNECT_FAILED_LV) from exc
        self._flow_control = str(flow_control).strip().lower()
        self._abort = False

    def close(self) -> None:
        serial_port = self._serial
        self._serial = None
        if serial_port is not None:
            try:
                serial_port.close()
            except Exception:
                logger.debug("serial close failed", exc_info=True)

    def write(self, data: str) -> WriteOutcome:
        """Write every byte or raise. Counts only what ``write()`` returns."""
        import serial

        if self._abort:
            raise PlotterStopped()
        try:
            payload = data.encode("ascii")
        except UnicodeEncodeError as exc:
            raise SerialWriteError(
                0,
                0,
                f"UnicodeEncodeError: {exc}",
                status=JobStatus.FAILED,
                short_write=False,
            ) from exc
        intended = len(payload)
        accepted = 0
        serial_port = self._serial
        if serial_port is None or not serial_port.is_open:
            raise SerialWriteError(
                intended,
                accepted,
                CONNECT_FAILED_LV,
                status=JobStatus.FAILED,
                short_write=False,
            )
        try:
            while accepted < intended:
                if self._abort:
                    raise PlotterStopped(intended, accepted)
                remaining = payload[accepted:]
                count = serial_port.write(remaining)
                if count is None:
                    count = 0
                count = int(count)
                if count < 0 or count > len(remaining):
                    raise SerialWriteError(
                        intended,
                        accepted,
                        f"short write: serial write returned {count} for {len(remaining)} bytes submitted",
                        status=JobStatus.INCOMPLETE,
                        short_write=True,
                    )
                if count == 0:
                    raise SerialWriteError(
                        intended,
                        accepted,
                        "short write: serial write returned 0",
                        status=JobStatus.INCOMPLETE,
                        short_write=True,
                    )
                accepted += count
            self._flush(serial_port, intended, accepted)
        except PlotterStopped:
            raise
        except SerialWriteError:
            raise
        except serial.SerialTimeoutException as exc:
            detail = f"SerialTimeoutException: {exc}"
            short = 0 < accepted < intended
            if short:
                detail = f"short write. {detail}"
            raise SerialWriteError(
                intended,
                accepted,
                detail,
                status=JobStatus.INCOMPLETE if short else JobStatus.FAILED,
                short_write=short,
            ) from exc
        except OSError as exc:
            self._raise_io_failure(intended, accepted, exc)
        except serial.SerialException as exc:
            self._raise_io_failure(intended, accepted, exc)
        except Exception as exc:
            if self._abort:
                raise PlotterStopped(intended, accepted) from exc
            logger.exception("serial write failed")
            short = accepted < intended
            status = JobStatus.INCOMPLETE if short and accepted > 0 else JobStatus.FAILED
            detail = f"{type(exc).__name__}: {exc}"
            if short and accepted > 0:
                detail = f"short write. {detail}"
            raise SerialWriteError(
                intended,
                accepted,
                detail,
                status=status,
                short_write=short and accepted > 0,
            ) from exc
        return WriteOutcome(intended=intended, accepted=accepted)

    def _raise_io_failure(self, intended: int, accepted: int, exc: BaseException) -> None:
        short = 0 < accepted < intended
        detail = f"{type(exc).__name__}: {exc}"
        if short:
            detail = f"short write. {detail}"
        raise SerialWriteError(
            intended,
            accepted,
            detail,
            status=JobStatus.INCOMPLETE if short else JobStatus.FAILED,
            short_write=short,
        ) from exc

    def _flush(self, serial_port, intended: int, accepted: int) -> None:
        import serial

        error: list[BaseException] = []

        def _run() -> None:
            try:
                serial_port.flush()
            except Exception as exc:
                error.append(exc)

        thread = threading.Thread(target=_run, name="cto630-flush", daemon=True)
        thread.start()
        thread.join(self.flush_timeout)
        if thread.is_alive():
            try:
                serial_port.cancel_write()
            except Exception:
                logger.debug("cancel_write during flush timeout", exc_info=True)
            detail = f"flush timed out after {self.flush_timeout}s"
            if self._flow_control != "none":
                detail += (
                    f". Flow control {self._flow_control} is still enabled"
                    " and may be blocking the line"
                )
            raise SerialWriteError(
                intended,
                accepted,
                detail,
                status=JobStatus.FAILED,
                short_write=False,
            )
        if not error:
            return
        exc = error[0]
        if isinstance(exc, serial.SerialTimeoutException):
            text = f"SerialTimeoutException: {exc}"
        elif isinstance(exc, OSError):
            text = f"OSError: {exc}"
        else:
            text = f"{type(exc).__name__}: {exc}"
        detail = f"flush failed: {text}"
        if self._flow_control != "none":
            detail += f". Flow control {self._flow_control} is still enabled"
        raise SerialWriteError(
            intended,
            accepted,
            detail,
            status=JobStatus.FAILED,
            short_write=False,
        ) from exc

    def abort(self) -> None:
        """Unblock a write if the platform allows it. Does not send HP-GL."""
        self._abort = True
        serial_port = self._serial
        if serial_port is None:
            return
        try:
            serial_port.cancel_write()
        except Exception:
            logger.debug("cancel_write failed", exc_info=True)

    def reset_abort(self) -> None:
        self._abort = False

    @staticmethod
    def _flow_flags(flow_control: str) -> dict:
        key = str(flow_control).strip().lower()
        flags = _FLOW_FLAGS.get(key)
        if flags is None:
            allowed = ", ".join(_FLOW_FLAGS)
            raise PlotterConnectionError(
                f"Unsupported flow_control {flow_control!r}. Expected one of: {allowed}."
            )
        return dict(flags)

    @staticmethod
    def _bytesize(serial, data_bits: int):
        sizes = {
            5: serial.FIVEBITS,
            6: serial.SIXBITS,
            7: serial.SEVENBITS,
            8: serial.EIGHTBITS,
        }
        try:
            return sizes[int(data_bits)]
        except KeyError as exc:
            raise ValueError(f"Unsupported data bits: {data_bits}") from exc

    @staticmethod
    def _parity(serial, parity: str):
        mapping = {
            "N": serial.PARITY_NONE,
            "E": serial.PARITY_EVEN,
            "O": serial.PARITY_ODD,
            "M": serial.PARITY_MARK,
            "S": serial.PARITY_SPACE,
        }
        try:
            return mapping[str(parity).upper()]
        except KeyError as exc:
            raise ValueError(f"Unsupported parity: {parity}") from exc

    @staticmethod
    def _stopbits(serial, stop_bits: float):
        if abs(float(stop_bits) - 1.5) < 1e-6:
            return serial.STOPBITS_ONE_POINT_FIVE
        if int(float(stop_bits)) == 2:
            return serial.STOPBITS_TWO
        return serial.STOPBITS_ONE
