"""Persisted cutter settings. Serial changes apply on the next connect."""

from __future__ import annotations

from PySide6.QtWidgets import (
    QComboBox,
    QDialog,
    QDialogButtonBox,
    QDoubleSpinBox,
    QFormLayout,
    QLabel,
    QLineEdit,
    QMessageBox,
    QSpinBox,
    QVBoxLayout,
)

from config.settings import Settings


class SettingsDialog(QDialog):
    def __init__(self, settings: Settings, parent=None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Settings")
        self.settings = settings
        self.setMinimumWidth(420)
        layout = QVBoxLayout(self)
        form = QFormLayout()

        self.port = QLineEdit(settings.serial.port)
        self.baud = QComboBox()
        self.baud.setEditable(True)
        for rate in (300, 600, 1200, 4800, 9600, 19200):
            self.baud.addItem(str(rate))
        self.baud.setCurrentText(str(settings.serial.baud_rate))

        self.data_bits = QComboBox()
        for bits in (8, 7):
            self.data_bits.addItem(str(bits))
        self.data_bits.setCurrentText(str(settings.serial.data_bits))

        self.parity = QComboBox()
        for label, value in (("None", "N"), ("Even", "E"), ("Odd", "O")):
            self.parity.addItem(label, value)
        parity_index = max(self.parity.findData(settings.serial.parity.upper()), 0)
        self.parity.setCurrentIndex(parity_index)

        self.stop_bits = QComboBox()
        self.stop_bits.addItem("1", 1.0)
        self.stop_bits.addItem("1.5", 1.5)
        self.stop_bits.addItem("2", 2.0)
        stop_index = 0
        for index in range(self.stop_bits.count()):
            if abs(float(self.stop_bits.itemData(index)) - float(settings.serial.stop_bits)) < 1e-6:
                stop_index = index
        self.stop_bits.setCurrentIndex(stop_index)

        self.flow = QComboBox()
        for label, value in (
            ("None", "none"),
            ("RTS/CTS", "rtscts"),
            ("DTR/DSR", "dsrdtr"),
            ("XON/XOFF", "xonxoff"),
        ):
            self.flow.addItem(label, value)
        flow_index = max(self.flow.findData(settings.serial.flow_control), 0)
        self.flow.setCurrentIndex(flow_index)

        self.plotter_width = self._mm(settings.plotter.width_mm, 1, 5000)
        self.vinyl_width = self._mm(settings.vinyl.width_mm, 1, 5000)
        self.vinyl_length = self._mm(settings.vinyl.length_mm, 1, 50000)
        self.speed = QSpinBox()
        self.speed.setRange(1, 1000)
        self.speed.setValue(int(settings.plotter.speed))
        self.force = QSpinBox()
        self.force.setRange(1, 1000)
        self.force.setValue(int(settings.plotter.force))
        self.flatten = QDoubleSpinBox()
        self.flatten.setRange(0.01, 5.0)
        self.flatten.setDecimals(3)
        self.flatten.setSingleStep(0.05)
        self.flatten.setValue(settings.geometry.flatten_tolerance_mm)
        self.units = QComboBox()
        self.units.addItem("mm")

        form.addRow("COM port", self.port)
        form.addRow("Baud", self.baud)
        form.addRow("Data bits", self.data_bits)
        form.addRow("Parity", self.parity)
        form.addRow("Stop bits", self.stop_bits)
        form.addRow("Flow control", self.flow)
        form.addRow("Plotter width mm", self.plotter_width)
        form.addRow("Default vinyl width mm", self.vinyl_width)
        form.addRow("Default vinyl length mm", self.vinyl_length)
        form.addRow("Speed", self.speed)
        form.addRow("Force", self.force)
        form.addRow("Flatten tolerance mm", self.flatten)
        form.addRow("Units", self.units)
        layout.addLayout(form)

        note = (
            "Speed and force are saved here and shown in the main window. "
            "They are not sent to the CTO630: the PCUT manual sets them on the cutter panel, "
            "and no speed or force opcode has been verified. "
            "Plotter units per millimetre stay in the JSON config until a measured test cut confirms them."
        )
        label = QLabel(note)
        label.setWordWrap(True)
        layout.addWidget(label)

        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)

    def accept(self) -> None:
        try:
            baud = int(self.baud.currentText())
            if baud <= 0:
                raise ValueError
        except ValueError:
            QMessageBox.warning(self, "Kļūda", "Baud ātrums nav derīgs.")
            return
        self.settings.serial.port = self.port.text().strip()
        self.settings.serial.baud_rate = baud
        self.settings.serial.data_bits = int(self.data_bits.currentText())
        self.settings.serial.parity = str(self.parity.currentData())
        self.settings.serial.stop_bits = float(self.stop_bits.currentData())
        self.settings.serial.flow_control = str(self.flow.currentData())
        self.settings.plotter.width_mm = self.plotter_width.value()
        self.settings.vinyl.width_mm = self.vinyl_width.value()
        self.settings.vinyl.length_mm = self.vinyl_length.value()
        self.settings.plotter.speed = self.speed.value()
        self.settings.plotter.force = self.force.value()
        self.settings.geometry.flatten_tolerance_mm = self.flatten.value()
        self.settings.units = "mm"
        super().accept()

    @staticmethod
    def _mm(value: float, low: float, high: float) -> QDoubleSpinBox:
        box = QDoubleSpinBox()
        box.setRange(low, high)
        box.setDecimals(1)
        box.setValue(value)
        return box
