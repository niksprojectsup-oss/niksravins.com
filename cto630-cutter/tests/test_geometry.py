import math

import pytest

from core.geometry import Cubic, Line, cubic_point, flatten_cubic, prepare_geometry


def _square():
    return [[
        Line((0, 0), (1, 0)),
        Line((1, 0), (1, 1)),
        Line((1, 1), (0, 1)),
        Line((0, 1), (0, 0)),
    ]]


def _rect(width, height):
    return [[
        Line((0, 0), (width, 0)),
        Line((width, 0), (width, height)),
        Line((width, height), (0, height)),
        Line((0, height), (0, 0)),
    ]]


def _distance_to_polyline(point, polyline):
    best = math.inf
    for start, end in zip(polyline, polyline[1:]):
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        length_sq = dx * dx + dy * dy
        if length_sq < 1e-18:
            distance = math.hypot(point[0] - start[0], point[1] - start[1])
        else:
            t = max(0.0, min(1.0, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / length_sq))
            distance = math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy))
        best = min(best, distance)
    return best


def test_straight_cubic_stays_two_points():
    points = flatten_cubic(Cubic((0, 0), (1, 0), (2, 0), (3, 0)), 0.1)
    assert len(points) == 2


def test_adaptive_flatten_stays_within_tolerance():
    curve = Cubic((0, 0), (0, 40), (100, 40), (100, 0))
    points = flatten_cubic(curve, 0.1)
    assert 2 < len(points) < 500
    for index in range(1, 50):
        sample = cubic_point(curve.p0, curve.p1, curve.p2, curve.p3, index / 50)
        assert _distance_to_polyline(sample, points) <= 0.1 + 1e-6


def test_place_scales_and_positions_bounds():
    prepared = prepare_geometry(
        _square(),
        1,
        1,
        width_mm=100,
        height_mm=50,
        x_mm=10,
        y_mm=10,
        rotation_deg=0,
        flatten_tolerance_mm=0.1,
        join_tolerance_mm=0.05,
    )
    assert prepared.bounds == pytest.approx((10, 10, 110, 60))
    assert prepared.path_count == 1
    flat = prepared.polylines[0]
    assert max(point[0] for point in flat) == pytest.approx(110)
    assert max(point[1] for point in flat) == pytest.approx(60)


def test_rotation_uses_axis_aligned_bounds_as_position():
    prepared = prepare_geometry(
        _rect(20, 10),
        20,
        10,
        width_mm=20,
        height_mm=10,
        x_mm=0,
        y_mm=0,
        rotation_deg=90,
        flatten_tolerance_mm=0.1,
        join_tolerance_mm=0.05,
    )
    assert prepared.bounds[0] == pytest.approx(0, abs=1e-6)
    assert prepared.bounds[1] == pytest.approx(0, abs=1e-6)
    assert prepared.bounds[2] - prepared.bounds[0] == pytest.approx(10)
    assert prepared.bounds[3] - prepared.bounds[1] == pytest.approx(20)


def test_source_contours_are_not_mutated():
    contours = _square()
    original = contours[0][0].p1
    prepare_geometry(
        contours,
        1,
        1,
        width_mm=30,
        height_mm=30,
        x_mm=5,
        y_mm=5,
        rotation_deg=15,
        flatten_tolerance_mm=0.1,
        join_tolerance_mm=0.05,
    )
    assert contours[0][0].p1 == original
