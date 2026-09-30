import pytest

from core.optimizer import optimize_paths


def _edges(path):
    found = []
    for start, end in zip(path, path[1:]):
        a = (round(start[0], 4), round(start[1], 4))
        b = (round(end[0], 4), round(end[1], 4))
        found.append(tuple(sorted((a, b))))
    return found


def test_nearby_endpoints_join_and_far_ones_do_not():
    near = optimize_paths([[(0, 0), (10, 0)], [(10.01, 0), (10, 10)]], join_tolerance_mm=0.05)
    assert len(near) == 1
    assert near[0][0] == pytest.approx((0, 0))
    assert near[0][-1] == pytest.approx((10, 10))

    far = optimize_paths([[(0, 0), (10, 0)], [(30, 0), (40, 0)]], join_tolerance_mm=0.05)
    assert len(far) == 2


def test_closed_square_keeps_its_edges_when_start_moves():
    square = [(0, 0), (10, 0), (10, 10), (0, 10), (0, 0)]
    ordered = optimize_paths([square], join_tolerance_mm=0.05, start_hint=(9, 11))
    assert len(ordered) == 1
    assert ordered[0][0] == pytest.approx((10, 10))
    assert ordered[0][0] == pytest.approx(ordered[0][-1])
    assert sorted(_edges(ordered[0])) == sorted(_edges(square))


def test_pen_up_order_starts_near_the_origin():
    far = [(100, 100), (110, 100)]
    near = [(1, 0), (2, 0)]
    ordered = optimize_paths([far, near], join_tolerance_mm=0.05)
    assert ordered[0][0] == pytest.approx((1, 0))
    assert ordered[1][0] == pytest.approx((100, 100))
