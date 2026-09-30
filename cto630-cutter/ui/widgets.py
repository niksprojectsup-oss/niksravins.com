"""Small reusable widgets for the main window."""

from __future__ import annotations

from PySide6.QtCore import Signal
from PySide6.QtWidgets import QDialog, QLabel, QProgressBar, QPushButton, QVBoxLayout


class SectionLabel(QLabel):
    def __init__(self, text: str) -> None:
        super().__init__(text)
        self.setObjectName("sectionLabel")


class StatusLabel(QLabel):
    def __init__(self) -> None:
        super().__init__()
        self.set_connected(False)

    def set_connected(self, connected: bool) -> None:
        if connected:
            self.setText("Status: ● Connected")
            self.setStyleSheet("color: #0a7a32; font-weight: 600;")
        else:
            self.setText("Status: ● Disconnected")
            self.setStyleSheet("color: #8a1f1f; font-weight: 600;")


class CutProgressDialog(QDialog):
    stop_requested = Signal()

    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Cutting")
        self.setModal(True)
        self.setMinimumWidth(340)
        layout = QVBoxLayout(self)
        title = QLabel("Cutting...")
        title.setStyleSheet("font-size: 16px; font-weight: 700;")
        self.bar = QProgressBar()
        self.bar.setRange(0, 100)
        self.bar.setValue(0)
        self.paths = QLabel("Path 0 / 0")
        self.stop_button = QPushButton("STOP")
        self.stop_button.setObjectName("stopButton")
        self.stop_button.clicked.connect(self.stop_requested.emit)
        layout.addWidget(title)
        layout.addWidget(self.bar)
        layout.addWidget(self.paths)
        layout.addWidget(self.stop_button)

    def update_progress(self, index: int, total: int) -> None:
        self.paths.setText(f"Path {index} / {total}")
        percent = 0 if total <= 0 else int(round(100 * index / total))
        self.bar.setValue(percent)

    def reject(self) -> None:
        self.stop_requested.emit()
        super().reject()
