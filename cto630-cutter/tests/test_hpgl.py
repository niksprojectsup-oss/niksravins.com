from config.settings import default_settings
from plotter.cto630 import CTO630Driver
from plotter.hpgl import HPGLGenerator


def test_pen_commands_are_the_only_text_layer():
    generator = HPGLGenerator(units_per_mm=40)
    generator.pen_up()
    generator.move(1, 2)
    generator.pen_down()
    generator.move(3, 4)
    text = generator.take()
    assert text == "PU;\nPA40,80;\nPD;\nPA120,160;\n"


def test_square_job_matches_hpgl_shape():
    text = HPGLGenerator().generate([[(0, 0), (10, 0), (10, 10), (0, 0)]])
    lines = [line for line in text.splitlines() if line]
    assert lines[0] == "IN;"
    assert "PU;" in lines
    assert "PD;" in lines
    assert "PA0,0;" in lines
    assert "PA400,0;" in lines
    assert "PA400,400;" in lines
    assert lines[-1] == "PU;"
    assert "VS" not in text
    assert "FS" not in text
    assert "!" not in text


def test_initialize_can_be_disabled():
    text = HPGLGenerator(emit_initialize=False).generate([[(0, 0), (1, 0)]])
    assert "IN;" not in text
    assert text.startswith("PU;")


def test_axis_sign_is_configurable():
    text = HPGLGenerator(y_sign=-1).generate([[(0, 0), (0, 10)]])
    assert "PA0,-400;" in text


def test_driver_sends_generator_output_and_no_speed_by_default():
    settings = default_settings()
    transport = _FakeTransport()
    driver = CTO630Driver(settings, transport=transport)
    settings.serial.port = "COM3"
    driver.connect()
    assert transport.writes == []
    paths = [[(0.0, 0.0), (10.0, 0.0), (10.0, 5.0), (0.0, 0.0)]]
    result = driver.cut(paths)
    assert transport.writes
    assert "".join(transport.writes) == result.hpgl
    assert result.hpgl == HPGLGenerator().generate(paths)
    assert "VS" not in result.hpgl
    assert "FS" not in result.hpgl


def test_configured_speed_template_is_emitted_only_when_set():
    settings = default_settings()
    settings.plotter.speed_command = "VS{speed}"
    settings.plotter.speed = 50
    settings.serial.port = "COM3"
    transport = _FakeTransport()
    driver = CTO630Driver(settings, transport=transport)
    driver.connect()
    result = driver.cut([[(0.0, 0.0), (1.0, 0.0)]])
    assert "VS50;" in result.hpgl


class _FakeTransport:
    def __init__(self):
        self.writes = []
        self.opened = False
        self.aborted = False

    def open(self, **_kwargs):
        self.opened = True

    def close(self):
        self.opened = False

    def write(self, data):
        self.writes.append(data)

    def abort(self):
        self.aborted = True

    def reset_abort(self):
        self.aborted = False
