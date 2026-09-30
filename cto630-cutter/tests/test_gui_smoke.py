import os
from pathlib import Path

os.environ["QT_QPA_PLATFORM"] = "offscreen"

from PySide6.QtWidgets import QApplication

from ui.main_window import MainWindow

SAMPLE = Path(__file__).resolve().parents[1] / "examples" / "sample.svg"


def test_window_starts_loads_svg_and_resizes(tmp_path, monkeypatch):
    monkeypatch.setenv("CTO630_CONFIG_DIR", str(tmp_path))
    app = QApplication.instance() or QApplication([])
    window = MainWindow()
    window.resize(1200, 800)
    window.show()
    app.processEvents()
    window.load_design_file(str(SAMPLE))
    app.processEvents()
    assert window.design is not None
    assert window.design.natural_width_mm == 100
    window.width_spin.setValue(80)
    app.processEvents()
    assert window._prepared is not None
    assert window._prepared.bounds is not None
    minx, miny, maxx, maxy = window._prepared.bounds
    assert maxx - minx == 80
    assert maxy - miny == 40
    assert window.device_combo.itemText(0) == "Simulator"
    assert window.status.text() == "Status: ● Disconnected"
    window.close()
    app.processEvents()
