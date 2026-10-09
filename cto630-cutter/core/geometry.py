"""Curve geometry in millimetres.

Contours stored on a design are the original parsed curves, in a local Y-up
millimetre frame whose bounding box starts at (0, 0). Placement (scale,
rotate, translate) returns new geometry and does not mutate that source.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from core.optimizer import optimize_paths

Point = tuple[float, float]
Contour = list["Line | Cubic"]


@dataclass(frozen=True)
class Line:
    p0: Point
    p1: Point


@dataclass(frozen=True)
class Cubic:
    p0: Point
    p1: Point
    p2: Point
    p3: Point


@dataclass(frozen=True)
class PreparedGeometry:
    polylines: list[list[Point]]
    bounds: tuple[float, float, float, float] | None
    path_count: int


def map_contours(contours: list[Contour], fn) -> list[Contour]:
    mapped: list[Contour] = []
    for contour in contours:
        new_contour: Contour = []
        for segment in contour:
            if isinstance(segment, Line):
                new_contour.append(Line(fn(segment.p0), fn(segment.p1)))
            else:
                new_contour.append(
                    Cubic(fn(segment.p0), fn(segment.p1), fn(segment.p2), fn(segment.p3))
                )
        if new_contour:
            mapped.append(new_contour)
    return mapped


def scale_contours(contours: list[Contour], sx: float, sy: float) -> list[Contour]:
    return map_contours(contours, lambda point: (point[0] * sx, point[1] * sy))


def translate_contours(contours: list[Contour], dx: float, dy: float) -> list[Contour]:
    return map_contours(contours, lambda point: (point[0] + dx, point[1] + dy))


def rotate_point(point: Point, degrees: float, origin: Point) -> Point:
    radians = math.radians(degrees)
    cos_a = math.cos(radians)
    sin_a = math.sin(radians)
    x = point[0] - origin[0]
    y = point[1] - origin[1]
    return (
        origin[0] + x * cos_a - y * sin_a,
        origin[1] + x * sin_a + y * cos_a,
    )


def rotate_contours(contours: list[Contour], degrees: float, origin: Point) -> list[Contour]:
    if abs(degrees) % 360 < 1e-12:
        return contours
    return map_contours(contours, lambda point: rotate_point(point, degrees, origin))


def cubic_point(p0: Point, p1: Point, p2: Point, p3: Point, t: float) -> Point:
    u = 1.0 - t
    b0 = u * u * u
    b1 = 3 * u * u * t
    b2 = 3 * u * t * t
    b3 = t * t * t
    return (
        b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0],
        b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1],
    )


def _quadratic_roots(a: float, b: float, c: float) -> list[float]:
    if abs(a) < 1e-12:
        if abs(b) < 1e-12:
            return []
        return [-c / b]
    discriminant = b * b - 4 * a * c
    if discriminant < 0:
        return []
    root = math.sqrt(discriminant)
    return [(-b + root) / (2 * a), (-b - root) / (2 * a)]


def _cubic_bounds(curve: Cubic) -> tuple[float, float, float, float]:
    xs = [curve.p0[0], curve.p3[0]]
    ys = [curve.p0[1], curve.p3[1]]
    for axis, bucket in ((0, xs), (1, ys)):
        p0 = curve.p0[axis]
        p1 = curve.p1[axis]
        p2 = curve.p2[axis]
        p3 = curve.p3[axis]
        a = -p0 + 3 * p1 - 3 * p2 + p3
        b = 2 * p0 - 4 * p1 + 2 * p2
        c = p1 - p0
        for t in _quadratic_roots(a, b, c):
            if 0.0 < t < 1.0:
                point = cubic_point(curve.p0, curve.p1, curve.p2, curve.p3, t)
                bucket.append(point[axis])
    return min(xs), min(ys), max(xs), max(ys)


def _union_bounds(
    current: tuple[float, float, float, float] | None,
    extra: tuple[float, float, float, float],
) -> tuple[float, float, float, float]:
    if current is None:
        return extra
    return (
        min(current[0], extra[0]),
        min(current[1], extra[1]),
        max(current[2], extra[2]),
        max(current[3], extra[3]),
    )


def contours_bounds(contours: list[Contour]) -> tuple[float, float, float, float] | None:
    bounds: tuple[float, float, float, float] | None = None
    for contour in contours:
        for segment in contour:
            if isinstance(segment, Line):
                extra = (
                    min(segment.p0[0], segment.p1[0]),
                    min(segment.p0[1], segment.p1[1]),
                    max(segment.p0[0], segment.p1[0]),
                    max(segment.p0[1], segment.p1[1]),
                )
            else:
                extra = _cubic_bounds(segment)
            bounds = _union_bounds(bounds, extra)
    return bounds


def polyline_bounds(paths: list[list[Point]]) -> tuple[float, float, float, float] | None:
    xs: list[float] = []
    ys: list[float] = []
    for path in paths:
        for x, y in path:
            xs.append(x)
            ys.append(y)
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def _line_distance(point: Point, start: Point, end: Point) -> float:
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    length = math.hypot(dx, dy)
    if length < 1e-12:
        return math.hypot(point[0] - start[0], point[1] - start[1])
    return abs(dx * (point[1] - start[1]) - dy * (point[0] - start[0])) / length


def _split_cubic(p0: Point, p1: Point, p2: Point, p3: Point) -> tuple[tuple[Point, Point, Point, Point], tuple[Point, Point, Point, Point]]:
    def mid(a: Point, b: Point) -> Point:
        return ((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5)

    p01 = mid(p0, p1)
    p12 = mid(p1, p2)
    p23 = mid(p2, p3)
    p012 = mid(p01, p12)
    p123 = mid(p12, p23)
    p0123 = mid(p012, p123)
    return (p0, p01, p012, p0123), (p0123, p123, p23, p3)


def flatten_cubic(curve: Cubic, tolerance_mm: float, depth: int = 0, max_depth: int = 12) -> list[Point]:
    """Adaptive flatten. Control points within ``tolerance_mm`` of the chord stop the split.

    A cubic stays inside the convex hull of its controls, so this bounds the
    curve-to-chord error by ``tolerance_mm``.
    """
    p0, p1, p2, p3 = curve.p0, curve.p1, curve.p2, curve.p3
    deviation = max(_line_distance(p1, p0, p3), _line_distance(p2, p0, p3))
    if depth >= max_depth or deviation <= tolerance_mm:
        return [p0, p3]
    left, right = _split_cubic(p0, p1, p2, p3)
    left_points = flatten_cubic(Cubic(*left), tolerance_mm, depth + 1, max_depth)
    right_points = flatten_cubic(Cubic(*right), tolerance_mm, depth + 1, max_depth)
    return left_points + right_points[1:]


def flatten_segment(segment: Line | Cubic, tolerance_mm: float) -> list[Point]:
    if isinstance(segment, Line):
        return [segment.p0, segment.p1]
    return flatten_cubic(segment, tolerance_mm)


def _append_points(target: list[Point], extra: list[Point]) -> None:
    if not extra:
        return
    if target and _near(target[-1], extra[0], 1e-9):
        target.extend(extra[1:])
    else:
        target.extend(extra)


def _near(a: Point, b: Point, tol: float) -> bool:
    return math.hypot(a[0] - b[0], a[1] - b[1]) <= tol


def flatten_contour(contour: Contour, tolerance_mm: float) -> list[Point]:
    points: list[Point] = []
    for segment in contour:
        _append_points(points, flatten_segment(segment, tolerance_mm))
    cleaned: list[Point] = []
    for point in points:
        if not cleaned or not _near(cleaned[-1], point, 1e-6):
            cleaned.append(point)
    return cleaned


def flatten_contours(contours: list[Contour], tolerance_mm: float) -> list[list[Point]]:
    paths: list[list[Point]] = []
    for contour in contours:
        points = flatten_contour(contour, tolerance_mm)
        if len(points) >= 2:
            paths.append(points)
    return paths


def prepare_geometry(
    contours: list[Contour],
    natural_width_mm: float,
    natural_height_mm: float,
    *,
    width_mm: float,
    height_mm: float,
    x_mm: float,
    y_mm: float,
    rotation_deg: float,
    flatten_tolerance_mm: float,
    join_tolerance_mm: float,
) -> PreparedGeometry:
    """Scale, rotate, translate, flatten, then optimize.

    ``width_mm`` and ``height_mm`` are the pre-rotation size. ``x_mm`` and
    ``y_mm`` are the bottom-left of the axis-aligned bounds after rotation.
    """
    sx = width_mm / natural_width_mm if natural_width_mm > 1e-9 else 1.0
    sy = height_mm / natural_height_mm if natural_height_mm > 1e-9 else 1.0
    scaled = scale_contours(contours, sx, sy)
    center = (width_mm * 0.5, height_mm * 0.5)
    rotated = rotate_contours(scaled, rotation_deg, center)
    bounds = contours_bounds(rotated)
    if bounds is None:
        return PreparedGeometry([], None, 0)
    dx = x_mm - bounds[0]
    dy = y_mm - bounds[1]
    placed = translate_contours(rotated, dx, dy)
    placed_bounds = contours_bounds(placed)
    polylines = optimize_paths(flatten_contours(placed, flatten_tolerance_mm), join_tolerance_mm)
    return PreparedGeometry(polylines, placed_bounds, len(polylines))
