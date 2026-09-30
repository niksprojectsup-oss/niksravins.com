"""Load SVG contours.

Supported geometry: path, rect, circle, ellipse, line, polyline, polygon.
Supported transforms: translate, scale, rotate, matrix (skew as well).
Filled shapes with no stroke are cut along the fill outline. Bitmap images
are rejected. The original SVG text is kept on the design; contours are a
separate millimetre copy.
"""

from __future__ import annotations

import math
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from svgpathtools import Arc, CubicBezier, Line as SvgLine, QuadraticBezier, parse_path

from core.document import Design
from core.geometry import Contour, Cubic, Line, contours_bounds, map_contours
from core.transforms import IDENTITY, Matrix, apply_point, multiply, parse_transform

RASTER_MESSAGE = "Šis fails satur rastra attēlu. CTO630 var griezt tikai vektora kontūras."
SVG_ERROR = "Neizdevās nolasīt SVG failu."
NO_CONTOURS = "SVG failā nav vektora kontūru, ko griezt."

_LENGTH = re.compile(
    r"^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*([a-zA-Z%]*)\s*$"
)
_NUMBER = re.compile(r"[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?")
_UNIT_TO_MM = {
    "mm": 1.0,
    "cm": 10.0,
    "in": 25.4,
    "pt": 25.4 / 72.0,
    "pc": 25.4 / 6.0,
    "px": 25.4 / 96.0,
    "q": 0.25,
}
_SKIP_TAGS = {
    "defs",
    "clippath",
    "mask",
    "symbol",
    "marker",
    "pattern",
    "metadata",
    "title",
    "desc",
    "style",
    "script",
    "lineargradient",
    "radialgradient",
    "filter",
    "text",
    "tspan",
    "textpath",
}
_SHAPE_TAGS = {"path", "rect", "circle", "ellipse", "line", "polyline", "polygon"}
_STYLE_KEYS = (
    "fill",
    "stroke",
    "stroke-width",
    "display",
    "visibility",
    "opacity",
    "fill-opacity",
    "stroke-opacity",
)


class SvgLoadError(Exception):
    pass


class RasterNotSupportedError(SvgLoadError):
    def __init__(self) -> None:
        super().__init__(RASTER_MESSAGE)


def load_svg(path: str | Path) -> Design:
    file_path = Path(path)
    try:
        svg_text = file_path.read_text(encoding="utf-8-sig")
    except (OSError, UnicodeDecodeError) as exc:
        raise SvgLoadError(SVG_ERROR) from exc
    try:
        root = ET.fromstring(svg_text)
    except ET.ParseError as exc:
        raise SvgLoadError(SVG_ERROR) from exc
    if _local(root.tag) != "svg":
        raise SvgLoadError(SVG_ERROR)
    if _contains_raster(root):
        raise RasterNotSupportedError()
    mm_per_user = _mm_per_user_unit(root)
    user_contours: list[Contour] = []
    _walk(root, IDENTITY, "black", "none", False, mm_per_user, user_contours)
    contours, width, height = _to_local_mm(user_contours, mm_per_user)
    if not contours:
        raise SvgLoadError(NO_CONTOURS)
    return Design(
        filename=file_path.name,
        source_path=str(file_path),
        svg_text=svg_text,
        natural_width_mm=width,
        natural_height_mm=height,
        contours=contours,
        path_count=len(contours),
    )


def _local(tag: object) -> str:
    if not isinstance(tag, str):
        return ""
    if "}" in tag:
        return tag.rsplit("}", 1)[-1]
    return tag


def _contains_raster(root: ET.Element) -> bool:
    for element in root.iter():
        if _local(element.tag).lower() in {"image", "img"}:
            return True
    return False


def _viewbox(value: str | None) -> tuple[float, float, float, float] | None:
    if not value:
        return None
    numbers = [float(item) for item in _NUMBER.findall(value)]
    if len(numbers) < 4 or numbers[2] == 0 or numbers[3] == 0:
        return None
    return numbers[0], numbers[1], numbers[2], numbers[3]


def _split_length(value: str) -> tuple[float, str]:
    match = _LENGTH.match(value.strip())
    if not match:
        raise SvgLoadError(SVG_ERROR)
    return float(match.group(1)), match.group(2).lower()


def _absolute_mm(value: str) -> float | None:
    number, unit = _split_length(value)
    if unit == "%":
        return None
    if unit == "":
        unit = "px"
    if unit not in _UNIT_TO_MM:
        raise SvgLoadError(SVG_ERROR)
    return number * _UNIT_TO_MM[unit]


def _mm_per_user_unit(root: ET.Element) -> float:
    viewbox = _viewbox(root.get("viewBox"))
    width_attr = root.get("width")
    height_attr = root.get("height")
    width_mm = _absolute_mm(width_attr) if width_attr else None
    height_mm = _absolute_mm(height_attr) if height_attr else None
    if viewbox and width_mm:
        return width_mm / viewbox[2]
    if viewbox and height_mm:
        return height_mm / viewbox[3]
    return 25.4 / 96.0


def _length_to_user(value: str, mm_per_user: float) -> float:
    number, unit = _split_length(value)
    if unit == "":
        return number
    if unit == "%":
        raise SvgLoadError(SVG_ERROR)
    if unit not in _UNIT_TO_MM:
        raise SvgLoadError(SVG_ERROR)
    if mm_per_user == 0:
        raise SvgLoadError(SVG_ERROR)
    return number * _UNIT_TO_MM[unit] / mm_per_user


def _coord(element: ET.Element, name: str, mm_per_user: float, default: float = 0.0) -> float:
    raw = element.get(name)
    if raw is None or not str(raw).strip():
        return default
    return _length_to_user(str(raw), mm_per_user)


def _presentation(element: ET.Element) -> dict[str, str]:
    props: dict[str, str] = {}
    for key in _STYLE_KEYS:
        raw = element.get(key)
        if raw is not None:
            props[key] = raw
    style = element.get("style")
    if style:
        for part in style.split(";"):
            if ":" not in part:
                continue
            key, value = part.split(":", 1)
            props[key.strip().lower()] = value.strip()
    return props


def _is_none_paint(value: str | None) -> bool:
    if value is None:
        return True
    return value.strip().lower() in {"none", "transparent"}


def _opacity_zero(value: str | None) -> bool:
    if value is None or not str(value).strip():
        return False
    try:
        return float(str(value).strip()) == 0.0
    except ValueError:
        return False


def _stroke_width_zero(value: str | None) -> bool:
    if value is None or not str(value).strip():
        return False
    token = str(value).strip().split()[0]
    try:
        return float(token) == 0.0
    except ValueError:
        return False


def _painted(fill: str, stroke: str, props: dict[str, str]) -> bool:
    filled = not _is_none_paint(fill) and not _opacity_zero(props.get("fill-opacity"))
    stroked = (
        not _is_none_paint(stroke)
        and not _opacity_zero(props.get("stroke-opacity"))
        and not _stroke_width_zero(props.get("stroke-width"))
    )
    return filled or stroked


def _complex_point(value: complex) -> tuple[float, float]:
    return (float(value.real), float(value.imag))


def _quad_to_cubic(p0, p1, p2) -> Cubic:
    c1 = (p0[0] + 2.0 / 3.0 * (p1[0] - p0[0]), p0[1] + 2.0 / 3.0 * (p1[1] - p0[1]))
    c2 = (p2[0] + 2.0 / 3.0 * (p1[0] - p2[0]), p2[1] + 2.0 / 3.0 * (p1[1] - p2[1]))
    return Cubic(p0, c1, c2, p2)


def _arc_cubic(cx: float, cy: float, rx: float, ry: float, phi: float, theta: float, dtheta: float) -> Cubic:
    kappa = (4.0 / 3.0) * math.tan(dtheta / 4.0)
    cos_t = math.cos(theta)
    sin_t = math.sin(theta)
    cos_d = math.cos(theta + dtheta)
    sin_d = math.sin(theta + dtheta)
    p0 = (rx * cos_t, ry * sin_t)
    p3 = (rx * cos_d, ry * sin_d)
    p1 = (p0[0] - kappa * rx * sin_t, p0[1] + kappa * ry * cos_t)
    p2 = (p3[0] + kappa * rx * sin_d, p3[1] - kappa * ry * cos_d)

    def place(point: tuple[float, float]) -> tuple[float, float]:
        x, y = point
        cos_p = math.cos(phi)
        sin_p = math.sin(phi)
        return (cx + x * cos_p - y * sin_p, cy + x * sin_p + y * cos_p)

    return Cubic(place(p0), place(p1), place(p2), place(p3))


def _arc_to_cubics(arc: Arc) -> Contour:
    rx = float(arc.radius.real)
    ry = float(arc.radius.imag)
    delta = math.radians(float(arc.delta))
    if abs(delta) < 1e-9 or rx == 0 or ry == 0:
        return [Line(_complex_point(arc.start), _complex_point(arc.end))]
    theta = math.radians(float(arc.theta))
    steps = max(1, math.ceil(abs(delta) / (math.pi / 2.0) - 1e-9))
    dtheta = delta / steps
    center = arc.center
    cubics: Contour = []
    for index in range(steps):
        cubics.append(
            _arc_cubic(
                float(center.real),
                float(center.imag),
                rx,
                ry,
                float(arc.phi),
                theta + index * dtheta,
                dtheta,
            )
        )
    return cubics


def _segment_to_curves(segment) -> Contour:
    if isinstance(segment, SvgLine):
        return [Line(_complex_point(segment.start), _complex_point(segment.end))]
    if isinstance(segment, CubicBezier):
        return [
            Cubic(
                _complex_point(segment.start),
                _complex_point(segment.control1),
                _complex_point(segment.control2),
                _complex_point(segment.end),
            )
        ]
    if isinstance(segment, QuadraticBezier):
        return [
            _quad_to_cubic(
                _complex_point(segment.start),
                _complex_point(segment.control),
                _complex_point(segment.end),
            )
        ]
    if isinstance(segment, Arc):
        return _arc_to_cubics(segment)
    return []


def _end_point(segment: Line | Cubic) -> tuple[float, float]:
    return segment.p1 if isinstance(segment, Line) else segment.p3


def _start_point(segment: Line | Cubic) -> tuple[float, float]:
    return segment.p0


def _path_contours(d: str) -> list[Contour]:
    if not d or not d.strip():
        return []
    try:
        parsed = parse_path(d)
    except Exception as exc:
        raise SvgLoadError(SVG_ERROR) from exc
    contours: list[Contour] = []
    current: Contour = []
    for segment in parsed:
        curves = _segment_to_curves(segment)
        if not curves:
            continue
        if current:
            previous = _end_point(current[-1])
            start = _start_point(curves[0])
            if math.hypot(previous[0] - start[0], previous[1] - start[1]) > 1e-4:
                contours.append(current)
                current = []
        current.extend(curves)
    if current:
        contours.append(current)
    return contours


def _ellipse_cubics(cx: float, cy: float, rx: float, ry: float) -> Contour:
    return [_arc_cubic(cx, cy, rx, ry, 0.0, index * math.pi / 2.0, math.pi / 2.0) for index in range(4)]


def _rounded_rect(x: float, y: float, w: float, h: float, rx: float, ry: float) -> Contour:
    rx = min(abs(rx), w / 2.0)
    ry = min(abs(ry), h / 2.0)
    if rx <= 1e-9 or ry <= 1e-9:
        return [
            Line((x, y), (x + w, y)),
            Line((x + w, y), (x + w, y + h)),
            Line((x + w, y + h), (x, y + h)),
            Line((x, y + h), (x, y)),
        ]
    return [
        Line((x + rx, y), (x + w - rx, y)),
        _arc_cubic(x + w - rx, y + ry, rx, ry, 0.0, -math.pi / 2.0, math.pi / 2.0),
        Line((x + w, y + ry), (x + w, y + h - ry)),
        _arc_cubic(x + w - rx, y + h - ry, rx, ry, 0.0, 0.0, math.pi / 2.0),
        Line((x + w - rx, y + h), (x + rx, y + h)),
        _arc_cubic(x + rx, y + h - ry, rx, ry, 0.0, math.pi / 2.0, math.pi / 2.0),
        Line((x, y + h - ry), (x, y + ry)),
        _arc_cubic(x + rx, y + ry, rx, ry, 0.0, math.pi, math.pi / 2.0),
    ]


def _points_attr(value: str | None) -> list[tuple[float, float]]:
    numbers = [float(item) for item in _NUMBER.findall(value or "")]
    return list(zip(numbers[0::2], numbers[1::2]))


def _lines_through(points: list[tuple[float, float]], close: bool) -> list[Contour]:
    if len(points) < 2:
        return []
    lines = [Line(points[index], points[index + 1]) for index in range(len(points) - 1)]
    if close and math.hypot(points[0][0] - points[-1][0], points[0][1] - points[-1][1]) > 1e-9:
        lines.append(Line(points[-1], points[0]))
    return [lines] if lines else []


def _shape_contours(element: ET.Element, tag: str, mm_per_user: float) -> list[Contour]:
    if tag == "path":
        return _path_contours(element.get("d") or "")
    if tag == "rect":
        width = _coord(element, "width", mm_per_user)
        height = _coord(element, "height", mm_per_user)
        if width <= 0 or height <= 0:
            return []
        rx_raw = element.get("rx")
        ry_raw = element.get("ry")
        rx = _length_to_user(rx_raw, mm_per_user) if rx_raw not in (None, "") else None
        ry = _length_to_user(ry_raw, mm_per_user) if ry_raw not in (None, "") else None
        if rx is None and ry is None:
            rx = ry = 0.0
        elif rx is None:
            rx = ry
        elif ry is None:
            ry = rx
        return [
            _rounded_rect(
                _coord(element, "x", mm_per_user),
                _coord(element, "y", mm_per_user),
                width,
                height,
                rx or 0.0,
                ry or 0.0,
            )
        ]
    if tag == "circle":
        radius = _coord(element, "r", mm_per_user)
        if radius <= 0:
            return []
        return [
            _ellipse_cubics(
                _coord(element, "cx", mm_per_user),
                _coord(element, "cy", mm_per_user),
                radius,
                radius,
            )
        ]
    if tag == "ellipse":
        rx = _coord(element, "rx", mm_per_user)
        ry = _coord(element, "ry", mm_per_user)
        if rx <= 0 or ry <= 0:
            return []
        return [
            _ellipse_cubics(
                _coord(element, "cx", mm_per_user),
                _coord(element, "cy", mm_per_user),
                rx,
                ry,
            )
        ]
    if tag == "line":
        return [
            [
                Line(
                    (_coord(element, "x1", mm_per_user), _coord(element, "y1", mm_per_user)),
                    (_coord(element, "x2", mm_per_user), _coord(element, "y2", mm_per_user)),
                )
            ]
        ]
    if tag == "polyline":
        return _lines_through(_points_attr(element.get("points")), close=False)
    if tag == "polygon":
        return _lines_through(_points_attr(element.get("points")), close=True)
    return []


def _transform_contour(contour: Contour, matrix: Matrix) -> Contour:
    transformed = map_contours([contour], lambda point: apply_point(matrix, point))
    return transformed[0]


def _walk(
    element: ET.Element,
    parent: Matrix,
    inherited_fill: str,
    inherited_stroke: str,
    hidden: bool,
    mm_per_user: float,
    output: list[Contour],
) -> None:
    tag = _local(element.tag).lower()
    if tag in _SKIP_TAGS:
        return
    props = _presentation(element)
    if props.get("display", "").strip().lower() == "none":
        return
    if _opacity_zero(props.get("opacity")):
        return
    visibility = props.get("visibility")
    now_hidden = hidden or (visibility is not None and visibility.strip().lower() == "hidden")
    fill = props.get("fill", inherited_fill)
    stroke = props.get("stroke", inherited_stroke)
    matrix = multiply(parent, parse_transform(element.get("transform")))
    if tag in _SHAPE_TAGS and not now_hidden and _painted(fill, stroke, props):
        for contour in _shape_contours(element, tag, mm_per_user):
            if contour:
                output.append(_transform_contour(contour, matrix))
    for child in list(element):
        _walk(child, matrix, fill, stroke, now_hidden, mm_per_user, output)


def _to_local_mm(contours: list[Contour], mm_per_user: float) -> tuple[list[Contour], float, float]:
    if not contours:
        return [], 0.0, 0.0
    millimetres = map_contours(contours, lambda point: (point[0] * mm_per_user, point[1] * mm_per_user))
    bounds = contours_bounds(millimetres)
    if bounds is None:
        return [], 0.0, 0.0
    minx, miny, maxx, maxy = bounds
    width = maxx - minx
    height = maxy - miny
    if width <= 1e-9 and height <= 1e-9:
        return [], 0.0, 0.0

    def flip(point: tuple[float, float]) -> tuple[float, float]:
        return (point[0] - minx, maxy - point[1])

    return map_contours(millimetres, flip), width, height
