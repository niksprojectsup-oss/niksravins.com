"""Simulator driver.

Generates the same HP-GL as the hardware driver, writes ``output/test_job.hpgl``,
and reports the command count, coordinate bounds, and per-path progress.
No serial port is opened.
"""

from __future__ import annotations

from pathlib import Path

from plotter.base import CutResult, PlotterDriver, PlotterStopped


class SimulatorDriver(PlotterDriver):
    def __init__(self, settings, output_path: str | Path | None = None) -> None:
        super().__init__(settings)
        if output_path is None:
            output_path = Path.cwd() / settings.output_filename
        self.output_path = Path(output_path)
        self._abort = False

    def _connect(self) -> None:
        self._abort = False

    def _disconnect(self) -> None:
        self._abort = False

    def _write(self, data: str) -> None:
        if self._abort or self._stop:
            raise PlotterStopped()

    def _abort_transport(self) -> None:
        self._abort = True

    def _clear_abort(self) -> None:
        self._abort = False

    def _after_cut(self, result: CutResult) -> None:
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        self.output_path.write_text(result.hpgl, encoding="ascii")
        result.output_path = str(self.output_path)
