"""Join nearby polylines and shorten pen-up travel.

Optimization may reverse an open path, rotate the start of a closed path, and
chain endpoints that already lie within the join tolerance. It does not
reshape a contour: the cut still follows the same segments.
"""

from __future__ import annotations

import math

Point = tuple[float, float]


def _dist(a: Point, b: Point) -> float:
    return math.hypot(a[0] - b[0], a[1] - b[1])


def _near(a: Point, b: Point, tolerance: float) -> bool:
    return _dist(a, b) <= tolerance


def _dedupe(path: list[Point]) -> list[Point]:
    cleaned: list[Point] = []
    for point in path:
        if not cleaned or not _near(cleaned[-1], point, 1e-6):
            cleaned.append(point)
    return cleaned


def _is_closed(path: list[Point], tolerance: float) -> bool:
    return len(path) >= 4 and _near(path[0], path[-1], tolerance)


def _append(chain: list[Point], other: list[Point]) -> list[Point]:
    if not other:
        return chain
    if chain and _near(chain[-1], other[0], 1e-6):
        return chain + other[1:]
    return chain + other


def join_paths(paths: list[list[Point]], tolerance_mm: float) -> list[list[Point]]:
    remaining = [_dedupe(list(path)) for path in paths if len(path) >= 2]
    remaining = [path for path in remaining if len(path) >= 2]
    used = [False] * len(remaining)
    chains: list[list[Point]] = []
    for index in range(len(remaining)):
        if used[index]:
            continue
        used[index] = True
        chain = remaining[index]
        extended = True
        while extended:
            extended = False
            for other_index in range(len(remaining)):
                if used[other_index]:
                    continue
                other = remaining[other_index]
                if _near(chain[-1], other[0], tolerance_mm):
                    chain = _append(chain, other)
                elif _near(chain[-1], other[-1], tolerance_mm):
                    chain = _append(chain, list(reversed(other)))
                elif _near(chain[0], other[-1], tolerance_mm):
                    chain = _append(other, chain)
                elif _near(chain[0], other[0], tolerance_mm):
                    chain = _append(list(reversed(other)), chain)
                else:
                    continue
                used[other_index] = True
                extended = True
        chains.append(_dedupe(chain))
    return chains


def _approach_distance(path: list[Point], hint: Point, tolerance_mm: float) -> float:
    if _is_closed(path, tolerance_mm):
        return min(_dist(point, hint) for point in path[:-1])
    return min(_dist(path[0], hint), _dist(path[-1], hint))


def _orient(path: list[Point], hint: Point, tolerance_mm: float) -> list[Point]:
    if _is_closed(path, tolerance_mm):
        core = path[:-1]
        if not core:
            return path
        start = min(range(len(core)), key=lambda index: (_dist(core[index], hint), index))
        rotated = core[start:] + core[:start]
        rotated.append(rotated[0])
        return rotated
    if _dist(path[-1], hint) + 1e-12 < _dist(path[0], hint):
        return list(reversed(path))
    return list(path)


def order_paths(
    paths: list[list[Point]],
    tolerance_mm: float,
    start_hint: Point = (0.0, 0.0),
) -> list[list[Point]]:
    """Greedy pen-up order. Connected point order inside a path stays intact."""
    pending = [list(path) for path in paths if len(path) >= 2]
    ordered: list[list[Point]] = []
    cursor = start_hint
    while pending:
        choice = min(
            range(len(pending)),
            key=lambda index: (_approach_distance(pending[index], cursor, tolerance_mm), index),
        )
        path = _orient(pending.pop(choice), cursor, tolerance_mm)
        ordered.append(path)
        cursor = path[-1]
    return ordered


def optimize_paths(
    paths: list[list[Point]],
    join_tolerance_mm: float = 0.05,
    start_hint: Point = (0.0, 0.0),
) -> list[list[Point]]:
    joined = join_paths(paths, join_tolerance_mm)
    return order_paths(joined, join_tolerance_mm, start_hint)
