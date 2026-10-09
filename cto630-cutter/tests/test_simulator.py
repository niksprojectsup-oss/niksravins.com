from pathlib import Path

from config.settings import default_settings
from core.document import load_design
from core.geometry import prepare_geometry
from core.job import Job
from plotter.hpgl import HPGLGenerator
from plotter.simulator import SimulatorDriver

EXAMPLES = Path(__file__).resolve().parents[1] / "examples"


def test_simulator_writes_hpgl_and_reports_bounds(tmp_path):
    settings = default_settings()
    output = tmp_path / "test_job.hpgl"
    driver = SimulatorDriver(settings, output_path=output)
    driver.connect()
    paths = [[(0.0, 0.0), (20.0, 0.0), (20.0, 20.0), (0.0, 20.0), (0.0, 0.0)]]
    progress = []
    result = driver.cut(paths, on_progress=lambda index, total: progress.append((index, total)))
    assert progress == [(1, 1)]
    assert result.command_count == result.hpgl.count(";")
    assert result.command_count > 0
    assert result.bbox_mm == (0.0, 0.0, 20.0, 20.0)
    assert result.output_path == str(output)
    assert output.read_text(encoding="ascii") == result.hpgl
    assert result.hpgl == HPGLGenerator().generate(paths)
    assert result.stopped is False


def test_simulator_stop_halts_later_paths(tmp_path):
    settings = default_settings()
    driver = SimulatorDriver(settings, output_path=tmp_path / "test_job.hpgl")
    driver.connect()
    paths = [
        [(0.0, 0.0), (1.0, 0.0)],
        [(5.0, 5.0), (6.0, 6.0)],
    ]

    def progress(index, _total):
        if index == 1:
            driver.stop()

    result = driver.cut(paths, on_progress=progress)
    assert result.stopped is True
    assert result.paths_sent == 1
    assert "PA200,200;" not in result.hpgl
    assert "PA240,240;" not in result.hpgl


def test_test_cut_square_is_independent_of_svg(tmp_path):
    driver = SimulatorDriver(default_settings(), output_path=tmp_path / "test_job.hpgl")
    driver.connect()
    result = driver.test_cut(20)
    assert "PA0,0;" in result.hpgl
    assert "PA800,0;" in result.hpgl
    assert "PA800,800;" in result.hpgl
    assert result.bbox_mm == (0.0, 0.0, 20.0, 20.0)


def test_sample_resize_and_simulator(tmp_path):
    design = load_design(EXAMPLES / "sample.svg")
    prepared = prepare_geometry(
        design.contours,
        design.natural_width_mm,
        design.natural_height_mm,
        width_mm=50,
        height_mm=25,
        x_mm=10,
        y_mm=10,
        rotation_deg=0,
        flatten_tolerance_mm=0.1,
        join_tolerance_mm=0.05,
    )
    assert prepared.bounds == pytest_bounds(10, 10, 60, 35)
    settings = default_settings()
    job = Job(
        design,
        width_mm=50,
        height_mm=25,
        x_mm=10,
        y_mm=10,
        rotation_deg=0,
        vinyl_width_mm=settings.vinyl.width_mm,
        vinyl_length_mm=settings.vinyl.length_mm,
        plotter_width_mm=settings.plotter.width_mm,
        plotter_length_mm=settings.plotter.length_mm,
        flatten_tolerance_mm=0.1,
        join_tolerance_mm=0.05,
    )
    assert job.validate() == []
    driver = SimulatorDriver(settings, output_path=tmp_path / "test_job.hpgl")
    driver.connect()
    result = job.run(driver)
    assert result.command_count > 10
    assert (tmp_path / "test_job.hpgl").is_file()
    assert result.hpgl.startswith("IN;")
    assert "PU;" in result.hpgl and "PD;" in result.hpgl


def pytest_bounds(minx, miny, maxx, maxy):
    return (pytest_approx(minx), pytest_approx(miny), pytest_approx(maxx), pytest_approx(maxy))


def pytest_approx(value):
    import pytest

    return pytest.approx(value, abs=0.05)
