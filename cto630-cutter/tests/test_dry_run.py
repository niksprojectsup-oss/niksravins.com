import os

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")

from pathlib import Path

from PySide6.QtWidgets import QApplication, QMessageBox

from config.settings import default_settings
from plotter.dry_run import run_dry_run
from plotter.serial_transport import SerialTransport
from ui.main_window import MainWindow
from ui.widgets import DryRunDialog

SAMPLE = Path(__file__).resolve().parents[1] / "examples" / "sample.svg"

SQUARE_20_HPGL = (
    "IN;\n"
    "PU;\n"
    "PA0,0;\n"
    "PD;\n"
    "PA800,0;\n"
    "PA800,800;\n"
    "PA0,800;\n"
    "PA0,0;\n"
    "PU;\n"
)


def _forbid_com(monkeypatch):
    def fail_open(self, **kwargs):
        raise AssertionError(f"COM port opened: {kwargs}")

    monkeypatch.setattr(SerialTransport, "open", fail_open)

    def fail_driver(*_args, **_kwargs):
        raise AssertionError("CTO630Driver was constructed")

    monkeypatch.setattr("ui.main_window.CTO630Driver", fail_driver)
    monkeypatch.setattr(QMessageBox, "warning", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(QMessageBox, "critical", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(QMessageBox, "information", lambda *_args, **_kwargs: None)


def _capture_dry_run_dialog(monkeypatch):
    captured: dict[str, str] = {}

    def dry_exec(self):
        captured["hpgl"] = self.command_view.toPlainText()
        captured["bytes"] = self.bytes_label.text()
        captured["port"] = self.port_label.text()
        return 0

    monkeypatch.setattr(DryRunDialog, "exec", dry_exec)
    return captured


def test_run_dry_run_20mm_square_sends_zero_bytes(tmp_path, monkeypatch):
    _forbid_com(monkeypatch)
    settings = default_settings()
    square = [[(0.0, 0.0), (20.0, 0.0), (20.0, 20.0), (0.0, 20.0), (0.0, 0.0)]]
    report = run_dry_run(settings, square, output_path=tmp_path / "test_job.hpgl")
    assert report.hpgl == SQUARE_20_HPGL
    assert report.bytes_sent_to_port == 0
    assert report.com_port_opened is False
    assert (tmp_path / "test_job.hpgl").read_text(encoding="ascii") == SQUARE_20_HPGL


def test_gui_dry_run_is_default_and_blocks_com(tmp_path, monkeypatch):
    monkeypatch.setenv("CTO630_CONFIG_DIR", str(tmp_path))
    monkeypatch.chdir(tmp_path)
    _forbid_com(monkeypatch)
    captured = _capture_dry_run_dialog(monkeypatch)
    app = QApplication.instance() or QApplication([])
    window = MainWindow()
    assert window.dry_run_box.isChecked() is True
    window.device_combo.addItem("COM99")
    window.device_combo.setCurrentText("COM99")
    window._toggle_connection()
    app.processEvents()
    assert window._connected is False
    assert window.driver is None
    window._test_cut()
    app.processEvents()
    assert captured["hpgl"] == SQUARE_20_HPGL
    assert captured["bytes"] == "Bytes sent to a physical port: 0"
    assert captured["port"] == "COM port opened: no"
    assert (tmp_path / "output" / "test_job.hpgl").read_text(encoding="ascii") == SQUARE_20_HPGL
    window.close()
    app.processEvents()


def test_gui_dry_run_cut_does_not_open_com(tmp_path, monkeypatch):
    monkeypatch.setenv("CTO630_CONFIG_DIR", str(tmp_path))
    monkeypatch.chdir(tmp_path)
    _forbid_com(monkeypatch)
    captured = _capture_dry_run_dialog(monkeypatch)
    app = QApplication.instance() or QApplication([])
    window = MainWindow()
    window.device_combo.addItem("COM99")
    window.device_combo.setCurrentText("COM99")
    window.load_design_file(str(SAMPLE))
    monkeypatch.setattr(MainWindow, "_confirm_cut", lambda self, summary: True)
    window._cut()
    app.processEvents()
    assert captured["hpgl"].startswith("IN;\n")
    assert "PU;" in captured["hpgl"] and "PD;" in captured["hpgl"]
    assert captured["bytes"] == "Bytes sent to a physical port: 0"
    assert captured["port"] == "COM port opened: no"
    assert window._connected is False
    window.close()
    app.processEvents()


def test_enabling_dry_run_disconnects_hardware_without_a_write(tmp_path, monkeypatch):
    monkeypatch.setenv("CTO630_CONFIG_DIR", str(tmp_path))
    app = QApplication.instance() or QApplication([])
    window = MainWindow()
    window.dry_run_box.setChecked(False)

    class _Hardware:
        def __init__(self) -> None:
            self.writes: list[str] = []
            self.disconnected = False

        def disconnect(self) -> None:
            self.disconnected = True

        def stop(self) -> None:
            self.writes.append("stop")

    hardware = _Hardware()
    window.driver = hardware
    window._connected = True
    window.dry_run_box.setChecked(True)
    app.processEvents()
    assert hardware.disconnected is True
    assert hardware.writes == []
    assert window.driver is None
    assert window._connected is False
    window.close()
    app.processEvents()


def test_dry_run_off_does_not_open_unconnected_com(tmp_path, monkeypatch):
    monkeypatch.setenv("CTO630_CONFIG_DIR", str(tmp_path))
    _forbid_com(monkeypatch)
    app = QApplication.instance() or QApplication([])
    window = MainWindow()
    window.dry_run_box.setChecked(False)
    window.device_combo.addItem("COM99")
    window.device_combo.setCurrentText("COM99")
    window._test_cut()
    app.processEvents()
    assert window.driver is None
    window.close()
    app.processEvents()
