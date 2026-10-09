"""Small reusable widgets for the main window."""

from __future__ import annotations

from PySide6.QtCore import Signal
from PySide6.QtWidgets import (
    QDialog,
    QLabel,
    QPlainTextEdit,
    QProgressBar,
    QPushButton,
    QVBoxLayout,
)


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


class DryRunDialog(QDialog):
    """Shows generated HP-GL and whether any bytes went to a physical port."""

    def __init__(
        self,
        hpgl: str,
        *,
        bytes_sent_to_port: int,
        com_port_opened: bool,
        output_path: str | None,
        parent=None,
    ) -> None:
        super().__init__(parent)
        self.setWindowTitle("Dry run")
        self.setModal(True)
        self.setMinimumSize(560, 420)
        layout = QVBoxLayout(self)
        title = QLabel("Generated command text")
        title.setStyleSheet("font-size: 16px; font-weight: 700;")
        self.bytes_label = QLabel(f"Bytes sent to a physical port: {int(bytes_sent_to_port)}")
        opened = "yes" if com_port_opened else "no"
        self.port_label = QLabel(f"COM port opened: {opened}")
        self.bytes_label.setStyleSheet("font-weight: 600;")
        self.port_label.setStyleSheet("font-weight: 600;")
        self.confirm_label = QLabel("The cutter has not confirmed the job.")
        self.command_view = QPlainTextEdit()
        self.command_view.setReadOnly(True)
        self.command_view.setPlainText(hpgl)
        self.command_view.setLineWrapMode(QPlainTextEdit.LineWrapMode.NoWrap)
        layout.addWidget(title)
        layout.addWidget(self.bytes_label)
        layout.addWidget(self.port_label)
        layout.addWidget(self.confirm_label)
        if output_path:
            self.file_label = QLabel(f"Simulator file: {output_path}")
            layout.addWidget(self.file_label)
        else:
            self.file_label = None
        layout.addWidget(self.command_view, 1)
        close_button = QPushButton("Close")
        close_button.clicked.connect(self.accept)
        layout.addWidget(close_button)
