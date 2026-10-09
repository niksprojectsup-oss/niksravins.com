"""SVG transform lists as affine matrices.

A matrix is ``(a, b, c, d, e, f)`` matching SVG ``matrix(a b c d e f)``:

    x' = a*x + c*y + e
    y' = b*x + d*y + f
"""

from __future__ import annotations

import math
import re

Matrix = tuple[float, float, float, float, float, float]

IDENTITY: Matrix = (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)

_TRANSFORM = re.compile(
    r"(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)",
    re.IGNORECASE,
)
_NUMBER = re.compile(r"[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?")


def multiply(left: Matrix, right: Matrix) -> Matrix:
    """Return ``left * right`` so ``right`` is applied to a point first."""
    a1, b1, c1, d1, e1, f1 = left
    a2, b2, c2, d2, e2, f2 = right
    return (
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1,
    )


def apply_point(matrix: Matrix, point: tuple[float, float]) -> tuple[float, float]:
    a, b, c, d, e, f = matrix
    x, y = point
    return (a * x + c * y + e, b * x + d * y + f)


def _numbers(body: str) -> list[float]:
    return [float(match) for match in _NUMBER.findall(body)]


def _translate(tx: float, ty: float = 0.0) -> Matrix:
    return (1.0, 0.0, 0.0, 1.0, tx, ty)


def _scale(sx: float, sy: float | None = None) -> Matrix:
    if sy is None:
        sy = sx
    return (sx, 0.0, 0.0, sy, 0.0, 0.0)


def _rotate(angle_deg: float, cx: float | None = None, cy: float | None = None) -> Matrix:
    radians = math.radians(angle_deg)
    cos_a = math.cos(radians)
    sin_a = math.sin(radians)
    rotation: Matrix = (cos_a, sin_a, -sin_a, cos_a, 0.0, 0.0)
    if cx is None or cy is None:
        return rotation
    return multiply(multiply(_translate(cx, cy), rotation), _translate(-cx, -cy))


def _skew_x(angle_deg: float) -> Matrix:
    return (1.0, 0.0, math.tan(math.radians(angle_deg)), 1.0, 0.0, 0.0)


def _skew_y(angle_deg: float) -> Matrix:
    return (1.0, math.tan(math.radians(angle_deg)), 0.0, 1.0, 0.0, 0.0)


def parse_transform(value: str | None) -> Matrix:
    """Parse an SVG transform attribute. Empty input is the identity."""
    if not value or not value.strip():
        return IDENTITY
    matrix = IDENTITY
    for match in _TRANSFORM.finditer(value):
        kind = match.group(1).lower()
        nums = _numbers(match.group(2))
        if kind == "matrix" and len(nums) >= 6:
            step: Matrix = (nums[0], nums[1], nums[2], nums[3], nums[4], nums[5])
        elif kind == "translate" and len(nums) >= 1:
            step = _translate(nums[0], nums[1] if len(nums) > 1 else 0.0)
        elif kind == "scale" and len(nums) >= 1:
            step = _scale(nums[0], nums[1] if len(nums) > 1 else None)
        elif kind == "rotate" and len(nums) >= 1:
            if len(nums) >= 3:
                step = _rotate(nums[0], nums[1], nums[2])
            else:
                step = _rotate(nums[0])
        elif kind == "skewx" and len(nums) >= 1:
            step = _skew_x(nums[0])
        elif kind == "skewy" and len(nums) >= 1:
            step = _skew_y(nums[0])
        else:
            continue
        matrix = multiply(matrix, step)
    return matrix
