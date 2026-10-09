"""Dry run.

Generates the same HP-GL the cutter driver would send and lets the simulator
write its file. This module never constructs a hardware driver and never
opens a COM port.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

from plotter.base import ProgressCallback
from plotter.simulator import SimulatorDriver

Point = tuple[float, float]


@dataclass(frozen=True)
class DryRunReport:
    hpgl: str
    command_count: int
    output_path: str | None
    bytes_sent_to_port: int
    com_port_opened: bool
    stopped: bool


def run_dry_run(
    settings,
    paths: Sequence[Sequence[Point]],
    output_path: str | Path | None = None,
    on_progress: ProgressCallback | None = None,
) -> DryRunReport:
    """Generate HP-GL through the simulator only.

    ``bytes_sent_to_port`` is always 0 and ``com_port_opened`` is always False.
    The simulator may still write ``output_path``.
    """
    driver = SimulatorDriver(settings, output_path=output_path)
    driver.connect()
    try:
        result = driver.cut(paths, on_progress=on_progress)
    finally:
        driver.disconnect()
    return DryRunReport(
        hpgl=result.hpgl,
        command_count=result.command_count,
        output_path=result.output_path,
        bytes_sent_to_port=0,
        com_port_opened=False,
        stopped=result.stopped,
    )
