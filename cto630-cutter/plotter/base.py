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


class PlotterStopped(Exception):
    """Raised when STOP aborts a write. No hardware opcode was sent."""


@dataclass
class CutResult:
    hpgl: str
    command_count: int
    bbox_mm: tuple[float, float, float, float] | None
    output_path: str | None = None
    stopped: bool = False
    paths_sent: int = 0
    path_count: int = 0


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

    def connect(self) -> None:
        self._connect()
        self.connected = True
        self._stop = False

    def disconnect(self) -> None:
        self._disconnect()
        self.connected = False

    def send(self, data: str) -> None:
        if self._stop:
            raise PlotterStopped()
        self._write(data)

    def cut(self, paths: Sequence[Sequence[Point]], on_progress: ProgressCallback | None = None) -> CutResult:
        if not self.connected:
            raise PlotterNotConnected()
        self._stop = False
        self._clear_abort()
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
            self.send(text)
        except PlotterStopped:
            self._stop = True
            return False
        sent.append(text)
        return True

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
        return CutResult(
            hpgl=hpgl,
            command_count=hpgl.count(";"),
            bbox_mm=polyline_bounds(paths),
            output_path=None,
            stopped=stopped,
            paths_sent=len(paths),
            path_count=path_count,
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
