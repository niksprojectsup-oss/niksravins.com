"""A cut job checks the vinyl limits, then asks a driver to cut polylines."""

from __future__ import annotations

import math

from core.document import Design
from core.geometry import PreparedGeometry, prepare_geometry
from core.validator import JobValidationError, validate_job
from plotter.base import CutResult, PlotterDriver


def format_mm(value: float) -> str:
    if not math.isfinite(value):
        return "0"
    rounded = round(float(value), 2)
    if abs(rounded - round(rounded)) < 1e-9:
        return str(int(round(rounded)))
    return f"{rounded:.2f}".rstrip("0").rstrip(".")


class Job:
    def __init__(
        self,
        design: Design,
        *,
        width_mm: float,
        height_mm: float,
        x_mm: float,
        y_mm: float,
        rotation_deg: float,
        vinyl_width_mm: float,
        vinyl_length_mm: float,
        plotter_width_mm: float,
        plotter_length_mm: float,
        flatten_tolerance_mm: float,
        join_tolerance_mm: float,
    ):
        self.design = design
        self.width_mm = width_mm
        self.height_mm = height_mm
        self.x_mm = x_mm
        self.y_mm = y_mm
        self.rotation_deg = rotation_deg
        self.vinyl_width_mm = vinyl_width_mm
        self.vinyl_length_mm = vinyl_length_mm
        self.plotter_width_mm = plotter_width_mm
        self.plotter_length_mm = plotter_length_mm
        self.prepared: PreparedGeometry = prepare_geometry(
            design.contours,
            design.natural_width_mm,
            design.natural_height_mm,
            width_mm=width_mm,
            height_mm=height_mm,
            x_mm=x_mm,
            y_mm=y_mm,
            rotation_deg=rotation_deg,
            flatten_tolerance_mm=flatten_tolerance_mm,
            join_tolerance_mm=join_tolerance_mm,
        )

    def validate(self) -> list[str]:
        return validate_job(
            width_mm=self.width_mm,
            height_mm=self.height_mm,
            x_mm=self.x_mm,
            y_mm=self.y_mm,
            rotation_deg=self.rotation_deg,
            vinyl_width_mm=self.vinyl_width_mm,
            vinyl_length_mm=self.vinyl_length_mm,
            plotter_width_mm=self.plotter_width_mm,
            plotter_length_mm=self.plotter_length_mm,
            bounds=self.prepared.bounds,
        )

    def summary_text(self) -> str:
        return "\n".join(
            [
                f"Design: {self.design.filename}",
                f"Size: {format_mm(self.width_mm)} × {format_mm(self.height_mm)} mm",
                f"Position: {format_mm(self.x_mm)} × {format_mm(self.y_mm)} mm",
                f"Vinyl: {format_mm(self.vinyl_width_mm)} × {format_mm(self.vinyl_length_mm)} mm",
                f"Estimated paths: {self.prepared.path_count}",
            ]
        )

    def run(self, driver: PlotterDriver, on_progress=None) -> CutResult:
        errors = self.validate()
        if errors:
            raise JobValidationError(errors)
        return driver.cut(self.prepared.polylines, on_progress=on_progress)


def validate_test_cut(
    size_mm: float,
    *,
    vinyl_width_mm: float,
    vinyl_length_mm: float,
    plotter_width_mm: float,
    plotter_length_mm: float,
) -> list[str]:
    bounds = (0.0, 0.0, size_mm, size_mm) if math.isfinite(size_mm) and size_mm > 0 else None
    return validate_job(
        width_mm=size_mm,
        height_mm=size_mm,
        x_mm=0.0,
        y_mm=0.0,
        rotation_deg=0.0,
        vinyl_width_mm=vinyl_width_mm,
        vinyl_length_mm=vinyl_length_mm,
        plotter_width_mm=plotter_width_mm,
        plotter_length_mm=plotter_length_mm,
        bounds=bounds,
    )
