"""Refuse jobs that are not finite or that leave the vinyl or the plotter."""

from __future__ import annotations

import math

from shapely.geometry import Point, box

Bounds = tuple[float, float, float, float]

FIT_ERROR = "Dizains neietilpst vinila laukumā.\n\nPārbaudi izmēru un pozīciju."
PLOTTER_LIMIT_ERROR = "Dizains pārsniedz plotera griešanas limitu."
SIZE_ERROR = "Platums un augstums jānorāda milimetros un jābūt lielākiem par nulli."
NUMBER_ERROR = "Platums, augstums, pozīcija vai rotācija nav derīga."
VINYL_ERROR = "Vinila izmērs nav derīgs."
PLOTTER_ERROR = "Plotera limiti nav derīgi."
EMPTY_ERROR = "Nav kontūru, ko griezt."


class JobValidationError(Exception):
    def __init__(self, errors: list[str]):
        self.errors = errors
        super().__init__("\n\n".join(errors))


def _finite(value: float) -> bool:
    return isinstance(value, (int, float)) and math.isfinite(value)


def _covers(container_bounds: Bounds, design_bounds: Bounds, margin_mm: float = 0.01) -> bool:
    minx, miny, maxx, maxy = container_bounds
    container = box(minx - margin_mm, miny - margin_mm, maxx + margin_mm, maxy + margin_mm)
    corners = (
        (design_bounds[0], design_bounds[1]),
        (design_bounds[0], design_bounds[3]),
        (design_bounds[2], design_bounds[1]),
        (design_bounds[2], design_bounds[3]),
    )
    return all(container.covers(Point(x, y)) for x, y in corners)


def validate_job(
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
    bounds: Bounds | None,
) -> list[str]:
    """Return Latvian error strings. An empty list means the job may be sent."""
    errors: list[str] = []
    numbers = (width_mm, height_mm, x_mm, y_mm, rotation_deg)
    if any(not _finite(value) for value in numbers):
        errors.append(NUMBER_ERROR)
    elif width_mm <= 0 or height_mm <= 0:
        errors.append(SIZE_ERROR)
    if not _finite(vinyl_width_mm) or not _finite(vinyl_length_mm) or vinyl_width_mm <= 0 or vinyl_length_mm <= 0:
        errors.append(VINYL_ERROR)
    if (
        not _finite(plotter_width_mm)
        or not _finite(plotter_length_mm)
        or plotter_width_mm <= 0
        or plotter_length_mm <= 0
    ):
        errors.append(PLOTTER_ERROR)
    if bounds is None:
        errors.append(EMPTY_ERROR)
        return errors
    if any(not _finite(value) for value in bounds):
        errors.append(NUMBER_ERROR)
        return errors
    if errors:
        return errors
    if not _covers((0.0, 0.0, vinyl_width_mm, vinyl_length_mm), bounds):
        errors.append(FIT_ERROR)
    if not _covers((0.0, 0.0, plotter_width_mm, plotter_length_mm), bounds):
        errors.append(PLOTTER_LIMIT_ERROR)
    return errors
