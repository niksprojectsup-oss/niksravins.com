"""Plotter driver interface.

``cut`` turns polylines into HP-GL through ``HPGLGenerator`` and writes the
text with ``send``. Callers never assemble command strings themselves.
"""

from __future__ import annotations

import math
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Callable, Sequence

from plotter.hpgl import HPGLGenerator

Point = tuple[float, float]
ProgressCallback = Callable[[int, int], None]

CONNECT_FAILED_LV = """Neizdevās pieslēgties CTO630.

Pārbaudi:
• USB kabeli
• COM porta izvēli
• vai plotera draiveris ir instalēts"""


class PlotterConnectionError(Exception):
    def __init__(self, message: str = CONNECT_FAILED_LV):
        super().__init__(message)


class PlotterNotConnected(Exception):
    def __init__(self) -> None:
        super().__init__("Plotteris nav pieslēgts. Izvēlies Simulator vai pieslēdz COM portu.")


class JobStatus:
    """Program-side send status. There is no plotter acknowledgement."""

    SENT = "SENT"
    FAILED = "FAILED"
    INCOMPLETE = "INCOMPLETE"


class PlotterStopped(Exception):
    """Raised when STOP aborts a write. No hardware opcode was sent."""

    def __init__(self, intended: int = 0, accepted: int = 0) -> None:
        self.intended = int(intended)
        self.accepted = int(accepted)
        super().__init__("stopped")


class SerialWriteError(Exception):
    """A serial write did not fully accept the buffer, or flush failed.

    ``intended`` and ``accepted`` are byte counts from the Python serial layer.
    ``status`` is FAILED or INCOMPLETE, never SENT.
    """

    def __init__(
        self,
        intended: int,
        accepted: int,
        error: str,
        *,
        status: str,
        short_write: bool = False,
    ) -> None:
        self.intended = int(intended)
        self.accepted = int(accepted)
        self.error = str(error)
        self.short_write = bool(short_write)
        if status not in (JobStatus.FAILED, JobStatus.INCOMPLETE):
            status = JobStatus.FAILED
        self.status = status
        super().__init__(
            format_status_report(
                self.status,
                intended_bytes=self.intended,
                accepted_bytes=self.accepted,
                error=self.error,
                to_serial=True,
            )
        )


def format_status_report(
    status: str,
    *,
    intended_bytes: int,
    accepted_bytes: int,
    error: str | None,
    to_serial: bool,
) -> str:
    """User-visible status. Failures list intended bytes, accepted bytes, and the error."""
    lines = [status]
    if to_serial or status != JobStatus.SENT:
        lines.append(f"Intended bytes: {int(intended_bytes)}")
        lines.append(f"Bytes accepted by the Python serial layer: {int(accepted_bytes)}")
    if status == JobStatus.SENT:
        if not to_serial:
            lines.append("No bytes were sent to a physical port.")
        lines.append("The cutter has not confirmed the job.")
    else:
        lines.append(f"Error: {error or ''}")
    return "\n".join(lines)


@dataclass
class CutResult:
    hpgl: str
    command_count: int
    bbox_mm: tuple[float, float, float, float] | None
    output_path: str | None = None
    stopped: bool = False
    paths_sent: int = 0
    path_count: int = 0
    status: str = JobStatus.SENT
    intended_bytes: int = 0
    accepted_bytes: int = 0
    error: str | None = None
    to_serial: bool = False
    short_write: bool = False

    def report(self) -> str:
        return format_status_report(
            self.status,
            intended_bytes=self.intended_bytes,
            accepted_bytes=self.accepted_bytes,
            error=self.error,
            to_serial=self.to_serial,
        )


def polyline_bounds(paths: Sequence[Sequence[Point]]) -> tuple[float, float, float, float] | None:
    xs: list[float] = []
    ys: list[float] = []
    for path in paths:
        for x, y in path:
            xs.append(float(x))
            ys.append(float(y))
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def _usable(path: Sequence[Point]) -> bool:
    if len(path) < 2:
        return False
    x0, y0 = path[0]
    return any(abs(x - x0) > 1e-9 or abs(y - y0) > 1e-9 for x, y in path[1:])


class PlotterDriver(ABC):
    def __init__(self, settings) -> None:
        self.settings = settings
        self.connected = False
        self._stop = False
        self._tx_intended = 0
        self._tx_accepted = 0
        self._tx_error: str | None = None
        self._tx_status = JobStatus.SENT
        self._tx_serial = False
        self._tx_short = False

    def connect(self) -> None:
        self._connect()
        self.connected = True
        self._stop = False

    def disconnect(self) -> None:
        self._disconnect()
        self.connected = False

    def send(self, data: str):
        if self._stop:
            raise PlotterStopped()
        return self._write(data)

    def cut(self, paths: Sequence[Sequence[Point]], on_progress: ProgressCallback | None = None) -> CutResult:
        if not self.connected:
            raise PlotterNotConnected()
        self._stop = False
        self._clear_abort()
        self._tx_intended = 0
        self._tx_accepted = 0
        self._tx_error = None
        self._tx_status = JobStatus.SENT
        self._tx_serial = False
        self._tx_short = False
        usable = [list(path) for path in paths if _usable(path)]
        sent: list[str] = []
        sent_paths: list[list[Point]] = []
        if not usable:
            result = self._result(sent, sent_paths, stopped=False, path_count=0)
            self._after_cut(result)
            return result
        generator = self._generator()
        generator.begin_job()
        if not self._emit(generator.take(), sent):
            result = self._result(sent, sent_paths, stopped=True, path_count=len(usable))
            self._after_cut(result)
            return result
        total = len(usable)
        for index, path in enumerate(usable, start=1):
            if self._stop:
                break
            generator.add_path(path)
            if not self._emit(generator.take(), sent):
                break
            sent_paths.append(path)
            if on_progress is not None:
                on_progress(index, total)
            if self._stop:
                break
        else:
            generator.end_job()
            self._emit(generator.take(), sent)
        result = self._result(sent, sent_paths, stopped=self._stop, path_count=total)
        self._after_cut(result)
        return result

    def test_cut(self, size_mm: float = 20.0, on_progress: ProgressCallback | None = None) -> CutResult:
        """Cut a square at the origin. Independent of any loaded SVG."""
        if not math.isfinite(size_mm) or size_mm <= 0:
            raise ValueError("Test cut size must be positive")
        size = float(size_mm)
        square = [(0.0, 0.0), (size, 0.0), (size, size), (0.0, size), (0.0, 0.0)]
        return self.cut([square], on_progress=on_progress)

    def stop(self) -> None:
        """Stop sending at once.

        There is no verified CTO630 STOP opcode, so this does not write a
        command. Bytes already accepted by the operating system or the cutter
        can still be cut. Press PAUSE on the cutter, or RESET to clear its buffer.
        """
        self._stop = True
        self._abort_transport()

    def _emit(self, text: str, sent: list[str]) -> bool:
        if self._stop:
            return False
        if not text:
            return True
        try:
            outcome = self.send(text)
        except PlotterStopped as exc:
            self._stop = True
            self._note_stopped_write(exc)
            return False
        except SerialWriteError as exc:
            self._note_serial_error(exc)
            return False
        if outcome is not None:
            self._tx_serial = True
            self._tx_intended += int(outcome.intended)
            self._tx_accepted += int(outcome.accepted)
        sent.append(text)
        return True

    def _note_serial_error(self, exc: SerialWriteError) -> None:
        self._tx_serial = True
        self._tx_intended += exc.intended
        self._tx_accepted += exc.accepted
        self._tx_error = exc.error
        self._tx_status = exc.status
        self._tx_short = self._tx_short or exc.short_write

    def _note_stopped_write(self, exc: PlotterStopped) -> None:
        if exc.intended or exc.accepted:
            self._tx_serial = True
            self._tx_intended += exc.intended
            self._tx_accepted += exc.accepted
            self._tx_short = self._tx_short or exc.accepted < exc.intended

    def _generator(self) -> HPGLGenerator:
        plotter = self.settings.plotter
        # TODO: speed_command and force_command are unverified. Defaults are empty
        # so a real cutter never receives a guessed opcode.
        prefix: list[str] = []
        speed_command = (plotter.speed_command or "").strip()
        force_command = (plotter.force_command or "").strip()
        if speed_command:
            prefix.append(speed_command.format(speed=plotter.speed).strip().rstrip(";"))
        if force_command:
            prefix.append(force_command.format(force=plotter.force).strip().rstrip(";"))
        return HPGLGenerator(
            units_per_mm=plotter.units_per_mm,
            x_sign=plotter.x_sign,
            y_sign=plotter.y_sign,
            emit_initialize=plotter.emit_initialize,
            prefix_commands=prefix,
        )

    def _result(self, sent: list[str], paths: list[list[Point]], *, stopped: bool, path_count: int) -> CutResult:
        hpgl = "".join(sent)
        status = self._tx_status
        error = self._tx_error
        if stopped and status == JobStatus.SENT:
            status = JobStatus.INCOMPLETE
            error = "stopped by the user; no STOP opcode was sent"
        return CutResult(
            hpgl=hpgl,
            command_count=hpgl.count(";"),
            bbox_mm=polyline_bounds(paths),
            output_path=None,
            stopped=stopped,
            paths_sent=len(paths),
            path_count=path_count,
            status=status,
            intended_bytes=self._tx_intended,
            accepted_bytes=self._tx_accepted,
            error=error,
            to_serial=self._tx_serial,
            short_write=self._tx_short,
        )

    def _after_cut(self, result: CutResult) -> None:
        return None

    def _clear_abort(self) -> None:
        return None

    def _abort_transport(self) -> None:
        return None

    @abstractmethod
    def _connect(self) -> None: ...

    @abstractmethod
    def _disconnect(self) -> None: ...

    @abstractmethod
    def _write(self, data: str) -> None: ...
