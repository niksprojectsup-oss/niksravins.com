"""Loaded design. Source SVG and parsed contours stay independent of placement."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from core.geometry import Contour


@dataclass
class Design:
    filename: str
    source_path: str
    svg_text: str
    natural_width_mm: float
    natural_height_mm: float
    contours: list[Contour]
    path_count: int


def load_design(path: str | Path) -> Design:
    from core.svg_loader import load_svg

    return load_svg(path)
