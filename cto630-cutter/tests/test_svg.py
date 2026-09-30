from pathlib import Path

import pytest

from core.document import load_design
from core.geometry import flatten_contours
from core.svg_loader import NO_CONTOURS, RASTER_MESSAGE, RasterNotSupportedError, SvgLoadError

FIXTURES = Path(__file__).parent / "fixtures"
EXAMPLES = Path(__file__).resolve().parents[1] / "examples"


def test_rect_size_and_original_svg_are_separate():
    design = load_design(FIXTURES / "rect.svg")
    assert design.filename == "rect.svg"
    assert design.natural_width_mm == pytest.approx(100)
    assert design.natural_height_mm == pytest.approx(50)
    assert design.path_count == 1
    assert "rect" in design.svg_text
    before = design.contours[0][0].p0
    flatten_contours(design.contours, 0.1)
    assert design.contours[0][0].p0 == before


def test_fill_without_stroke_is_a_closed_contour():
    design = load_design(FIXTURES / "fill_only.svg")
    assert design.path_count == 1
    points = flatten_contours(design.contours, 0.1)[0]
    assert points[0] == pytest.approx(points[-1])
    assert len(points) >= 5


def test_unpainted_shape_is_rejected():
    with pytest.raises(SvgLoadError, match=NO_CONTOURS):
        load_design(FIXTURES / "hidden.svg")


def test_raster_image_message():
    for name in ("raster.svg", "raster_xlink.svg"):
        with pytest.raises(RasterNotSupportedError) as caught:
            load_design(FIXTURES / name)
        assert str(caught.value) == RASTER_MESSAGE


def test_group_scale_and_translate():
    design = load_design(FIXTURES / "group_scale.svg")
    assert design.natural_width_mm == pytest.approx(10)
    assert design.natural_height_mm == pytest.approx(8)


def test_matrix_transform():
    design = load_design(FIXTURES / "matrix.svg")
    assert design.natural_width_mm == pytest.approx(10)
    assert design.natural_height_mm == pytest.approx(10)


def test_rotate_transform():
    design = load_design(FIXTURES / "rotate.svg")
    assert design.natural_width_mm == pytest.approx(10)
    assert design.natural_height_mm == pytest.approx(20)


def test_all_basic_shapes_load():
    design = load_design(FIXTURES / "shapes.svg")
    assert design.path_count == 7
    assert design.natural_width_mm > 0
    assert design.natural_height_mm > 0


def test_inherited_stroke_is_cut():
    design = load_design(FIXTURES / "inherit.svg")
    assert design.path_count == 1
    assert design.natural_width_mm == pytest.approx(4)
    assert design.natural_height_mm == pytest.approx(3)


def test_css_pixels_convert_to_millimetres():
    design = load_design(FIXTURES / "pixels.svg")
    assert design.natural_width_mm == pytest.approx(25.4)
    assert design.natural_height_mm == pytest.approx(25.4)


def test_circle_bounds_and_point_count():
    design = load_design(FIXTURES / "circle.svg")
    assert design.natural_width_mm == pytest.approx(20)
    assert design.natural_height_mm == pytest.approx(20)
    points = flatten_contours(design.contours, 0.1)[0]
    assert 8 < len(points) < 400
    for x, y in points:
        radius = ((x - 10) ** 2 + (y - 10) ** 2) ** 0.5
        assert radius == pytest.approx(10, abs=0.15)


def test_arc_path_bounds():
    design = load_design(FIXTURES / "arc.svg")
    assert design.natural_width_mm == pytest.approx(20, abs=0.2)
    assert design.natural_height_mm == pytest.approx(10, abs=0.2)
    points = flatten_contours(design.contours, 0.1)[0]
    assert max(point[1] for point in points) == pytest.approx(10, abs=0.2)


def test_sample_svg_loads():
    design = load_design(EXAMPLES / "sample.svg")
    assert design.natural_width_mm == pytest.approx(100)
    assert design.natural_height_mm == pytest.approx(50)
    assert design.path_count >= 7
