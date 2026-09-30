"""USB serial transport.

TODO: the PCUT manual documents RS-232 and a USB port that shows up as a COM
port after the vendor driver is installed. It does not document a USB
handshake. ``open`` only opens the port. It does not write a probe command.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from plotter.base import CONNECT_FAILED_LV, PlotterConnectionError, PlotterStopped

logger = logging.getLogger(__name__)


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


class SerialTransport:
    def __init__(self) -> None:
        self._serial = None
        self._abort = False

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
                xonxoff=flow_control == "xonxoff",
                rtscts=flow_control == "rtscts",
                dsrdtr=flow_control == "dsrdtr",
            )
        except (OSError, ValueError, serial.SerialException) as exc:
            logger.exception("Failed to open %s", port)
            self._serial = None
            raise PlotterConnectionError(CONNECT_FAILED_LV) from exc
        self._abort = False

    def close(self) -> None:
        serial_port = self._serial
        self._serial = None
        if serial_port is not None:
            try:
                serial_port.close()
            except Exception:
                logger.debug("serial close failed", exc_info=True)

    def write(self, data: str) -> None:
        if self._abort:
            raise PlotterStopped()
        serial_port = self._serial
        if serial_port is None or not serial_port.is_open:
            raise PlotterConnectionError(CONNECT_FAILED_LV)
        try:
            serial_port.write(data.encode("ascii"))
            serial_port.flush()
        except Exception as exc:
            if self._abort:
                raise PlotterStopped() from exc
            logger.exception("serial write failed")
            raise PlotterConnectionError(CONNECT_FAILED_LV) from exc

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
