"""Main window. Talks to a plotter driver and never builds HP-GL itself."""

from __future__ import annotations

import logging

from PySide6.QtCore import Qt, QThread, Signal
from PySide6.QtGui import QCloseEvent
from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QDialog,
    QDoubleSpinBox,
    QFileDialog,
    QFormLayout,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMessageBox,
    QPlainTextEdit,
    QPushButton,
    QScrollArea,
    QSpinBox,
    QSplitter,
    QVBoxLayout,
    QWidget,
)

from config.settings import Settings, load_settings, save_settings
from core.document import Design, load_design
from core.job import Job, validate_test_cut
from core.svg_loader import NO_CONTOURS, SVG_ERROR, RasterNotSupportedError, SvgLoadError
from plotter.base import CONNECT_FAILED_LV, CutResult, JobStatus, PlotterConnectionError, PlotterNotConnected
from plotter.cto630 import CTO630Driver
from plotter.serial_transport import list_serial_ports
from plotter.simulator import SimulatorDriver
from ui.canvas import PreviewCanvas
from ui.settings_dialog import SettingsDialog
from ui.widgets import CutProgressDialog, DryRunDialog, SectionLabel, StatusLabel

logger = logging.getLogger(__name__)

NOT_CONNECTED_LV = "Plotteris nav pieslēgts. Izvēlies Simulator vai pieslēdz COM portu."
NO_DESIGN_LV = "Nav ielādēts dizains."
SEND_FAILED_LV = "Neizdevās nosūtīt griešanas darbu."
STOP_LV = (
    "Datu sūtīšana ir apturēta.\n\n"
    "CTO630 nav pārbaudītas STOP komandas, tāpēc programma vairs nesūta datus. "
    "Ja nazis vēl kustas, nospied PAUSE uz plotera. RESET iztīra plotera buferi."
)
DRY_RUN_BLOCK_LV = (
    "Dry run ir ieslēgts. COM ports netika atvērts. Uz fizisku portu nosūtīti 0 baiti."
)

STYLESHEET = """
QWidget { color: #1c1f24; font-size: 13px; }
QMainWindow { background: #e7ebf0; }
QWidget#sidePanel { background: #f7f8fa; }
QLabel#sectionLabel {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #5c6570;
    padding-top: 8px;
}
QPushButton {
    background: #ffffff;
    border: 1px solid #cfd6df;
    border-radius: 6px;
    padding: 6px 10px;
}
QPushButton:hover { background: #f0f3f7; }
QPushButton:disabled { color: #8b939c; background: #eef1f4; }
QPushButton#cutButton {
    background: #16324f;
    color: white;
    border: none;
    font-size: 16px;
    font-weight: 700;
    padding: 12px;
    border-radius: 8px;
}
QPushButton#cutButton:hover { background: #1d4066; }
QPushButton#cutButton:disabled { background: #8ea0b3; color: #f4f7fa; }
QPushButton#stopButton {
    background: #8d1d1d;
    color: white;
    font-weight: 700;
    border: none;
    padding: 8px;
}
QPlainTextEdit {
    background: #111418;
    color: #d5dde6;
    border: none;
    font-family: "Cascadia Mono", "Consolas", monospace;
    font-size: 12px;
}
QDoubleSpinBox, QSpinBox, QComboBox, QLineEdit {
    background: white;
    border: 1px solid #cfd6df;
    border-radius: 4px;
    padding: 4px;
    min-height: 22px;
}
"""


class _CutWorker(QThread):
    progress = Signal(int, int)
    succeeded = Signal(object)
    failed = Signal(str)
    halted = Signal(object)

    def __init__(self, driver, paths) -> None:
        super().__init__()
        self._driver = driver
        self._paths = paths

    def run(self) -> None:
        try:
            result = self._driver.cut(self._paths, on_progress=self.progress.emit)
        except PlotterNotConnected:
            self.failed.emit(NOT_CONNECTED_LV)
            return
        except Exception:
            logger.exception("cut failed")
            self.failed.emit(SEND_FAILED_LV)
            return
        if result.stopped and result.status != JobStatus.FAILED:
            self.halted.emit(result)
        elif result.status == JobStatus.SENT:
            self.succeeded.emit(result)
        else:
            self.failed.emit(result.report())


class MainWindow(QMainWindow):
    def __init__(self, settings: Settings | None = None) -> None:
        super().__init__()
        self.settings = settings if settings is not None else load_settings()
        self.design: Design | None = None
        self.driver = None
        self._connected = False
        self._guard = False
        self._busy = False
        self._worker: _CutWorker | None = None
        self._prepared = None
        self.setWindowTitle("CTO630 Cutter")
        self.resize(1200, 800)
        self.setStyleSheet(STYLESHEET)
        self._build()
        self._refresh_ports(prefer_saved=True)
        self._apply_settings_to_form()

    def _build(self) -> None:
        side = QWidget()
        side.setObjectName("sidePanel")
        side.setMinimumWidth(300)
        side_layout = QVBoxLayout(side)
        side_layout.setContentsMargins(16, 12, 16, 16)
        side_layout.setSpacing(6)

        side_layout.addWidget(SectionLabel("PROJECT"))
        self.open_button = QPushButton("Open SVG")
        self.open_button.clicked.connect(self._open_svg)
        side_layout.addWidget(self.open_button)

        side_layout.addWidget(SectionLabel("OBJECT"))
        form = QFormLayout()
        form.setSpacing(6)
        self.width_spin = self._mm_spin(0.01, 10000, 100)
        self.height_spin = self._mm_spin(0.01, 10000, 50)
        self.lock_box = QCheckBox("Lock proportions")
        self.lock_box.setChecked(True)
        self.x_spin = self._mm_spin(-100000, 100000, 0)
        self.y_spin = self._mm_spin(-100000, 100000, 0)
        self.rotation_spin = QDoubleSpinBox()
        self.rotation_spin.setRange(-3600, 3600)
        self.rotation_spin.setDecimals(1)
        self.rotation_spin.setValue(0)
        form.addRow("Width mm", self.width_spin)
        form.addRow("Height mm", self.height_spin)
        form.addRow("", self.lock_box)
        form.addRow("X position mm", self.x_spin)
        form.addRow("Y position mm", self.y_spin)
        form.addRow("Rotation degrees", self.rotation_spin)
        side_layout.addLayout(form)

        center_row = QHBoxLayout()
        self.center_h = QPushButton("Center horizontally")
        self.center_v = QPushButton("Center vertically")
        self.center_h.clicked.connect(self._center_horizontally)
        self.center_v.clicked.connect(self._center_vertically)
        center_row.addWidget(self.center_h)
        center_row.addWidget(self.center_v)
        side_layout.addLayout(center_row)

        side_layout.addWidget(SectionLabel("VINYL"))
        vinyl_form = QFormLayout()
        self.vinyl_w = self._mm_spin(1, 5000, self.settings.vinyl.width_mm)
        self.vinyl_l = self._mm_spin(1, 50000, self.settings.vinyl.length_mm)
        vinyl_form.addRow("Width mm", self.vinyl_w)
        vinyl_form.addRow("Length mm", self.vinyl_l)
        side_layout.addLayout(vinyl_form)

        side_layout.addWidget(SectionLabel("PLOTTER"))
        self.device_combo = QComboBox()
        device_row = QHBoxLayout()
        device_label = QLabel("Device")
        device_row.addWidget(device_label)
        device_row.addWidget(self.device_combo, 1)
        side_layout.addLayout(device_row)
        port_row = QHBoxLayout()
        self.refresh_button = QPushButton("Refresh")
        self.connect_button = QPushButton("Connect")
        self.refresh_button.clicked.connect(lambda: self._refresh_ports(prefer_saved=False))
        self.connect_button.clicked.connect(self._toggle_connection)
        port_row.addWidget(self.refresh_button)
        port_row.addWidget(self.connect_button)
        side_layout.addLayout(port_row)
        self.status = StatusLabel()
        side_layout.addWidget(self.status)

        plotter_form = QFormLayout()
        self.speed_spin = QSpinBox()
        self.speed_spin.setRange(1, 1000)
        self.speed_spin.setValue(self.settings.plotter.speed)
        self.speed_spin.setToolTip(
            "Saved for the cutter panel. Not sent: no CTO630 speed opcode is verified."
        )
        self.force_spin = QSpinBox()
        self.force_spin.setRange(1, 1000)
        self.force_spin.setValue(self.settings.plotter.force)
        self.force_spin.setToolTip(
            "Saved for the cutter panel. Not sent: no CTO630 force opcode is verified."
        )
        self.test_size = self._mm_spin(1, 500, self.settings.test_cut_size_mm)
        plotter_form.addRow("Speed", self.speed_spin)
        plotter_form.addRow("Force", self.force_spin)
        plotter_form.addRow("Test cut mm", self.test_size)
        side_layout.addLayout(plotter_form)

        self.dry_run_box = QCheckBox("Dry run")
        self.dry_run_box.setChecked(True)
        self.dry_run_box.setToolTip(
            "Show the generated HP-GL and send nothing. "
            "CUT and TEST CUT cannot open a COM port while this is checked."
        )
        self.dry_run_box.toggled.connect(self._on_dry_run_toggled)
        side_layout.addWidget(self.dry_run_box)

        self.test_button = QPushButton("TEST CUT")
        self.test_button.setObjectName("testButton")
        self.cut_button = QPushButton("CUT")
        self.cut_button.setObjectName("cutButton")
        self.cut_button.setMinimumHeight(52)
        self.test_button.clicked.connect(self._test_cut)
        self.cut_button.clicked.connect(self._cut)
        side_layout.addWidget(self.test_button)
        side_layout.addWidget(self.cut_button)
        self.settings_button = QPushButton("Settings...")
        self.settings_button.clicked.connect(self._edit_settings)
        side_layout.addWidget(self.settings_button)
        side_layout.addStretch(1)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setWidget(side)
        scroll.setMinimumWidth(320)
        scroll.setFrameShape(QScrollArea.Shape.NoFrame)

        self.canvas = PreviewCanvas()
        self.canvas.positionChanged.connect(self._on_canvas_position)
        self.log_view = QPlainTextEdit()
        self.log_view.setReadOnly(True)
        self.log_view.setMaximumBlockCount(1000)
        self.log_view.setFixedHeight(150)
        right = QWidget()
        right_layout = QVBoxLayout(right)
        right_layout.setContentsMargins(0, 0, 0, 0)
        right_layout.setSpacing(0)
        right_layout.addWidget(self.canvas, 1)
        right_layout.addWidget(self.log_view)

        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.addWidget(scroll)
        splitter.addWidget(right)
        splitter.setStretchFactor(1, 1)
        splitter.setSizes([340, 860])
        self.setCentralWidget(splitter)

        self.width_spin.valueChanged.connect(self._on_width)
        self.height_spin.valueChanged.connect(self._on_height)
        self.x_spin.valueChanged.connect(lambda _value: self._update_preview())
        self.y_spin.valueChanged.connect(lambda _value: self._update_preview())
        self.rotation_spin.valueChanged.connect(lambda _value: self._update_preview())
        self.vinyl_w.valueChanged.connect(lambda _value: self._update_preview())
        self.vinyl_l.valueChanged.connect(lambda _value: self._update_preview())
        self.speed_spin.valueChanged.connect(self._pull_runtime_settings)
        self.force_spin.valueChanged.connect(self._pull_runtime_settings)
        self.test_size.valueChanged.connect(self._pull_runtime_settings)
        self._set_object_enabled(False)

    @staticmethod
    def _mm_spin(low: float, high: float, value: float) -> QDoubleSpinBox:
        box = QDoubleSpinBox()
        box.setRange(low, high)
        box.setDecimals(2)
        box.setSingleStep(1)
        box.setValue(value)
        return box

    def log(self, message: str, level: str = "INFO") -> None:
        self.log_view.appendPlainText(f"[{level}] {message}")

    def load_design_file(self, path: str) -> None:
        try:
            design = load_design(path)
        except RasterNotSupportedError as exc:
            QMessageBox.warning(self, "SVG", str(exc))
            return
        except SvgLoadError as exc:
            QMessageBox.critical(self, "SVG", str(exc) or SVG_ERROR)
            return
        except Exception:
            logger.exception("svg load failed")
            QMessageBox.critical(self, "SVG", SVG_ERROR)
            return
        self.design = design
        self._guard = True
        self.width_spin.setValue(design.natural_width_mm if design.natural_width_mm > 0 else 0.01)
        self.height_spin.setValue(design.natural_height_mm if design.natural_height_mm > 0 else 0.01)
        self.x_spin.setValue(0)
        self.y_spin.setValue(0)
        self.rotation_spin.setValue(0)
        self._guard = False
        self._set_object_enabled(True)
        self.log("SVG loaded")
        self.log(
            f"Size: {_format_log_number(design.natural_width_mm)} x "
            f"{_format_log_number(design.natural_height_mm)} mm"
        )
        self.log(f"Paths: {design.path_count}")
        self._update_preview()

    def closeEvent(self, event: QCloseEvent) -> None:  # noqa: N802
        if self._worker is not None and self._worker.isRunning():
            if self.driver is not None:
                self.driver.stop()
            self._worker.wait(2000)
        self._pull_runtime_settings()
        try:
            save_settings(self.settings)
        except OSError:
            logger.exception("could not save settings")
        if self.driver is not None and self._connected:
            self.driver.disconnect()
        super().closeEvent(event)

    def _open_svg(self) -> None:
        path, _selected = QFileDialog.getOpenFileName(self, "Open SVG", "", "SVG (*.svg)")
        if path:
            self.load_design_file(path)

    def _edit_settings(self) -> None:
        self._pull_runtime_settings()
        dialog = SettingsDialog(self.settings, self)
        if dialog.exec() != QDialog.DialogCode.Accepted:
            return
        was_hardware = self._connected and not isinstance(self.driver, SimulatorDriver)
        if was_hardware:
            self._set_disconnected()
            self.log("Disconnected")
        self._apply_settings_to_form()
        try:
            save_settings(self.settings)
        except OSError:
            logger.exception("could not save settings")
            QMessageBox.warning(self, "Kļūda", "Neizdevās saglabāt iestatījumus.")
        self._update_preview()

    def _refresh_ports(self, prefer_saved: bool) -> None:
        current = self.device_combo.currentText() if self.device_combo.count() else "Simulator"
        self.device_combo.blockSignals(True)
        self.device_combo.clear()
        self.device_combo.addItem("Simulator")
        try:
            ports = list_serial_ports()
        except Exception:
            logger.exception("port scan failed")
            ports = []
        for port in ports:
            self.device_combo.addItem(port.device)
        target = self.settings.serial.port if prefer_saved and self.settings.serial.port else current
        index = self.device_combo.findText(target)
        self.device_combo.setCurrentIndex(index if index >= 0 else 0)
        self.device_combo.blockSignals(False)

    def _toggle_connection(self) -> None:
        if self._connected:
            self._set_disconnected()
            self.log("Disconnected")
            return
        device = self.device_combo.currentText() or "Simulator"
        if self.dry_run_box.isChecked() and device != "Simulator":
            self.log("Dry run: COM port was not opened. Bytes sent to a physical port: 0")
            QMessageBox.warning(self, "Dry run", DRY_RUN_BLOCK_LV)
            return
        self.log(f"Connecting {device}")
        self._pull_runtime_settings()
        try:
            driver = self._make_driver(device)
            driver.connect()
        except PlotterConnectionError as exc:
            logger.exception("connect failed")
            self._show_connect_failure(exc)
            return
        except Exception:
            logger.exception("connect failed")
            self._show_connect_failure(None)
            return
        self.driver = driver
        self._connected = True
        self.status.set_connected(True)
        self.connect_button.setText("Disconnect")
        self.log("Connected")

    def _test_cut(self) -> None:
        if self._busy:
            return
        self._pull_runtime_settings()
        if not self._ensure_ready():
            return
        errors = validate_test_cut(
            self.test_size.value(),
            vinyl_width_mm=self.vinyl_w.value(),
            vinyl_length_mm=self.vinyl_l.value(),
            plotter_width_mm=self.settings.plotter.width_mm,
            plotter_length_mm=self.settings.plotter.length_mm,
        )
        if errors:
            QMessageBox.warning(self, "Kļūda", "\n\n".join(errors))
            return
        size = self.test_size.value()
        square = [(0.0, 0.0), (size, 0.0), (size, size), (0.0, size), (0.0, 0.0)]
        self._start_job([square])

    def _cut(self) -> None:
        if self._busy:
            return
        if self.design is None:
            QMessageBox.warning(self, "Kļūda", NO_DESIGN_LV)
            return
        self._pull_runtime_settings()
        if not self._ensure_ready():
            return
        try:
            job = self._make_job()
        except Exception:
            logger.exception("job build failed")
            QMessageBox.critical(self, "Kļūda", SVG_ERROR)
            return
        errors = job.validate()
        if errors:
            QMessageBox.warning(self, "Kļūda", "\n\n".join(errors))
            return
        if not self._confirm_cut(job.summary_text()):
            return
        self._start_job(job.prepared.polylines)

    def _start_job(self, paths) -> None:
        dry_run = self.dry_run_box.isChecked()
        if dry_run:
            # Simulator only. Do not use a connected hardware driver and do not
            # construct CTO630Driver, so this job cannot open a COM port.
            driver = SimulatorDriver(self.settings)
            driver.connect()
        else:
            if self.driver is None:
                QMessageBox.warning(self, "Kļūda", NOT_CONNECTED_LV)
                return
            driver = self.driver
        self._busy = True
        self.cut_button.setEnabled(False)
        self.test_button.setEnabled(False)
        dialog = CutProgressDialog(self)
        worker = _CutWorker(driver, paths)
        self._worker = worker

        def finish_ok(result: CutResult) -> None:
            dialog.accept()
            self._log_result(result, stopped=False)
            if dry_run:
                self._show_dry_run(result)

        def finish_stopped(result: CutResult) -> None:
            dialog.accept()
            self._log_result(result, stopped=True)
            if dry_run:
                self._show_dry_run(result)
            QMessageBox.information(self, "STOP", STOP_LV)

        def finish_failed(message: str) -> None:
            dialog.reject()
            self.log(message, level="ERROR")
            QMessageBox.critical(self, "Kļūda", message)

        def cleanup() -> None:
            if dry_run:
                try:
                    driver.disconnect()
                except Exception:
                    logger.exception("dry-run simulator disconnect failed")
            self._busy = False
            self.cut_button.setEnabled(True)
            self.test_button.setEnabled(True)

        worker.progress.connect(dialog.update_progress)
        worker.succeeded.connect(finish_ok)
        worker.halted.connect(finish_stopped)
        worker.failed.connect(finish_failed)
        worker.finished.connect(cleanup)
        dialog.stop_requested.connect(driver.stop)
        self.log("Job started")
        if dry_run:
            self.log("Dry run: COM port will not be opened")
        self._log_speed_force()
        worker.start()
        dialog.exec()

    def _confirm_cut(self, summary: str) -> bool:
        box = QMessageBox(self)
        box.setIcon(QMessageBox.Icon.Question)
        box.setWindowTitle("Cut")
        box.setText(summary)
        box.setStandardButtons(QMessageBox.StandardButton.Cancel)
        cut_button = box.addButton("CUT", QMessageBox.ButtonRole.AcceptRole)
        box.setDefaultButton(cut_button)
        box.exec()
        return box.clickedButton() is cut_button

    def _ensure_ready(self) -> bool:
        if self.dry_run_box.isChecked():
            return True
        device = self.device_combo.currentText() or "Simulator"
        if device == "Simulator" and not self._connected:
            self.log("Connecting Simulator")
            try:
                driver = self._make_driver("Simulator")
                driver.connect()
            except Exception:
                logger.exception("simulator connect failed")
                QMessageBox.critical(self, "Kļūda", CONNECT_FAILED_LV)
                return False
            self.driver = driver
            self._connected = True
            self.status.set_connected(True)
            self.connect_button.setText("Disconnect")
            self.log("Connected")
            return True
        if not self._connected:
            QMessageBox.warning(self, "Kļūda", NOT_CONNECTED_LV)
            return False
        return True

    def _make_driver(self, device: str):
        if device == "Simulator":
            return SimulatorDriver(self.settings)
        if self.dry_run_box.isChecked():
            raise RuntimeError("Dry run cannot open a COM port")
        self.settings.serial.port = device
        return CTO630Driver(self.settings)

    def _on_dry_run_toggled(self, checked: bool) -> None:
        if not checked or self._busy:
            return
        if self._connected and not isinstance(self.driver, SimulatorDriver):
            self._set_disconnected()
            self.log("Dry run: COM disconnected. No command bytes were sent.")

    def _show_dry_run(self, result: CutResult) -> None:
        self.log("Bytes sent to a physical port: 0")
        self.log("COM port opened: no")
        dialog = DryRunDialog(
            result.hpgl,
            bytes_sent_to_port=0,
            com_port_opened=False,
            output_path=result.output_path,
            parent=self,
        )
        dialog.exec()

    def _make_job(self) -> Job:
        if self.design is None:
            raise SvgLoadError(NO_CONTOURS)
        return Job(
            self.design,
            width_mm=self.width_spin.value(),
            height_mm=self.height_spin.value(),
            x_mm=self.x_spin.value(),
            y_mm=self.y_spin.value(),
            rotation_deg=self.rotation_spin.value(),
            vinyl_width_mm=self.vinyl_w.value(),
            vinyl_length_mm=self.vinyl_l.value(),
            plotter_width_mm=self.settings.plotter.width_mm,
            plotter_length_mm=self.settings.plotter.length_mm,
            flatten_tolerance_mm=self.settings.geometry.flatten_tolerance_mm,
            join_tolerance_mm=self.settings.geometry.join_tolerance_mm,
        )

    def _update_preview(self) -> None:
        if self._guard:
            return
        vinyl_w = self.vinyl_w.value()
        vinyl_l = self.vinyl_l.value()
        if self.design is None:
            self._prepared = None
            self.canvas.set_preview(vinyl_w, vinyl_l, [], None)
            return
        try:
            job = self._make_job()
        except Exception:
            logger.exception("preview failed")
            return
        self._prepared = job.prepared
        self.canvas.set_preview(vinyl_w, vinyl_l, job.prepared.polylines, job.prepared.bounds)

    def _on_width(self, value: float) -> None:
        if self._guard:
            return
        if (
            self.lock_box.isChecked()
            and self.design is not None
            and self.design.natural_width_mm > 1e-9
            and self.design.natural_height_mm > 1e-9
        ):
            height = value * self.design.natural_height_mm / self.design.natural_width_mm
            self._guard = True
            self.height_spin.setValue(height)
            self._guard = False
        self._update_preview()

    def _on_height(self, value: float) -> None:
        if self._guard:
            return
        if (
            self.lock_box.isChecked()
            and self.design is not None
            and self.design.natural_width_mm > 1e-9
            and self.design.natural_height_mm > 1e-9
        ):
            width = value * self.design.natural_width_mm / self.design.natural_height_mm
            self._guard = True
            self.width_spin.setValue(width)
            self._guard = False
        self._update_preview()

    def _on_canvas_position(self, x_mm: float, y_mm: float) -> None:
        self._guard = True
        self.x_spin.setValue(x_mm)
        self.y_spin.setValue(y_mm)
        self._guard = False
        self._update_preview()

    def _center_horizontally(self) -> None:
        if self._prepared is None or self._prepared.bounds is None:
            return
        minx, _miny, maxx, _maxy = self._prepared.bounds
        self.x_spin.setValue(self.x_spin.value() + (self.vinyl_w.value() - (maxx - minx)) / 2 - minx)

    def _center_vertically(self) -> None:
        if self._prepared is None or self._prepared.bounds is None:
            return
        _minx, miny, _maxx, maxy = self._prepared.bounds
        self.y_spin.setValue(self.y_spin.value() + (self.vinyl_l.value() - (maxy - miny)) / 2 - miny)

    def _pull_runtime_settings(self, *_args) -> None:
        self.settings.vinyl.width_mm = self.vinyl_w.value()
        self.settings.vinyl.length_mm = self.vinyl_l.value()
        self.settings.plotter.speed = self.speed_spin.value()
        self.settings.plotter.force = self.force_spin.value()
        self.settings.test_cut_size_mm = self.test_size.value()
        device = self.device_combo.currentText()
        if device and device != "Simulator":
            self.settings.serial.port = device

    def _apply_settings_to_form(self) -> None:
        self._guard = True
        self.vinyl_w.setValue(self.settings.vinyl.width_mm)
        self.vinyl_l.setValue(self.settings.vinyl.length_mm)
        self.speed_spin.setValue(int(self.settings.plotter.speed))
        self.force_spin.setValue(int(self.settings.plotter.force))
        self.test_size.setValue(self.settings.test_cut_size_mm)
        self._guard = False
        if self.settings.serial.port:
            index = self.device_combo.findText(self.settings.serial.port)
            if index >= 0:
                self.device_combo.setCurrentIndex(index)
        self._update_preview()

    def _set_disconnected(self) -> None:
        if self.driver is not None:
            try:
                self.driver.disconnect()
            except Exception:
                logger.exception("disconnect failed")
        self.driver = None
        self._connected = False
        self.status.set_connected(False)
        self.connect_button.setText("Connect")

    def _set_object_enabled(self, enabled: bool) -> None:
        for widget in (
            self.width_spin,
            self.height_spin,
            self.lock_box,
            self.x_spin,
            self.y_spin,
            self.rotation_spin,
            self.center_h,
            self.center_v,
        ):
            widget.setEnabled(enabled)

    def _log_speed_force(self) -> None:
        self.log(
            f"Speed {self.speed_spin.value()} and force {self.force_spin.value()} "
            "were not sent (no verified CTO630 opcode)"
        )

    def _show_connect_failure(self, exc: PlotterConnectionError | None) -> None:
        self.driver = None
        self._connected = False
        self.status.set_connected(False)
        self.connect_button.setText("Connect")
        message = CONNECT_FAILED_LV
        if exc is not None and str(exc).strip() != CONNECT_FAILED_LV.strip():
            message = str(exc)
        QMessageBox.critical(self, "Kļūda", message)

    def _log_result(self, result: CutResult, *, stopped: bool) -> None:
        del stopped
        self.log(result.report())
        self.log(f"Commands: {result.command_count}")
        if result.bbox_mm is not None:
            minx, miny, maxx, maxy = result.bbox_mm
            self.log(
                "Bounds: "
                f"{minx:.2f} {miny:.2f} {maxx:.2f} {maxy:.2f} mm"
            )
        if result.output_path:
            self.log(f"Wrote {result.output_path}")


def _format_log_number(value: float) -> str:
    rounded = round(float(value), 2)
    if abs(rounded - round(rounded)) < 1e-9:
        return str(int(round(rounded)))
    return f"{rounded:.2f}".rstrip("0").rstrip(".")
