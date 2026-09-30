import pytest

from config.settings import default_settings
from core.document import load_design
from core.job import Job, format_mm, validate_test_cut
from core.validator import (
    FIT_ERROR,
    NUMBER_ERROR,
    PLOTTER_LIMIT_ERROR,
    SIZE_ERROR,
    JobValidationError,
    validate_job,
)
from tests.test_svg import FIXTURES


def _validate(**overrides):
    values = dict(
        width_mm=100,
        height_mm=50,
        x_mm=10,
        y_mm=10,
        rotation_deg=0,
        vinyl_width_mm=600,
        vinyl_length_mm=1000,
        plotter_width_mm=640,
        plotter_length_mm=20000,
        bounds=(10, 10, 110, 60),
    )
    values.update(overrides)
    return validate_job(**values)


def test_inside_vinyl_is_valid():
    assert _validate() == []


def test_outside_vinyl_is_rejected():
    errors = _validate(bounds=(590, 10, 700, 60), x_mm=590)
    assert FIT_ERROR in errors


def test_plotter_width_is_enforced():
    errors = _validate(
        vinyl_width_mm=800,
        width_mm=650,
        bounds=(0, 0, 650, 50),
        x_mm=0,
    )
    assert PLOTTER_LIMIT_ERROR in errors
    assert FIT_ERROR not in errors


def test_bad_size_and_non_finite_rotation():
    assert SIZE_ERROR in _validate(width_mm=0, bounds=(0, 0, 0, 10))
    assert NUMBER_ERROR in _validate(rotation_deg=float("nan"))


def test_negative_origin_does_not_fit():
    assert FIT_ERROR in _validate(bounds=(-1, 0, 10, 10), x_mm=-1)


def test_test_cut_must_fit():
    assert validate_test_cut(
        20,
        vinyl_width_mm=600,
        vinyl_length_mm=1000,
        plotter_width_mm=640,
        plotter_length_mm=20000,
    ) == []
    assert FIT_ERROR in validate_test_cut(
        700,
        vinyl_width_mm=600,
        vinyl_length_mm=1000,
        plotter_width_mm=640,
        plotter_length_mm=20000,
    )


def test_summary_text_and_refuses_to_send():
    design = load_design(FIXTURES / "rect.svg")
    settings = default_settings()
    job = Job(
        design,
        width_mm=100,
        height_mm=50,
        x_mm=10,
        y_mm=10,
        rotation_deg=0,
        vinyl_width_mm=600,
        vinyl_length_mm=1000,
        plotter_width_mm=settings.plotter.width_mm,
        plotter_length_mm=settings.plotter.length_mm,
        flatten_tolerance_mm=0.1,
        join_tolerance_mm=0.05,
    )
    assert job.summary_text() == "\n".join(
        [
            "Design: rect.svg",
            "Size: 100 × 50 mm",
            "Position: 10 × 10 mm",
            "Vinyl: 600 × 1000 mm",
            "Estimated paths: 1",
        ]
    )
    assert format_mm(10.5) == "10.5"
    sent = _Recorder()
    job.run(sent)
    assert sent.paths

    bad = Job(
        design,
        width_mm=100,
        height_mm=50,
        x_mm=550,
        y_mm=10,
        rotation_deg=0,
        vinyl_width_mm=600,
        vinyl_length_mm=1000,
        plotter_width_mm=640,
        plotter_length_mm=20000,
        flatten_tolerance_mm=0.1,
        join_tolerance_mm=0.05,
    )
    recorder = _Recorder()
    with pytest.raises(JobValidationError):
        bad.run(recorder)
    assert recorder.paths is None


class _Recorder:
    def __init__(self):
        self.paths = None

    def cut(self, paths, on_progress=None):
        self.paths = paths
        return paths
