"""Vinyl preview. Coordinates are millimetres, Y up, origin at the sheet's bottom-left."""

from __future__ import annotations

from PySide6.QtCore import QPointF, Qt, Signal
from PySide6.QtGui import QColor, QPainter, QPen, QPolygonF
from PySide6.QtWidgets import QWidget

Point = tuple[float, float]
Bounds = tuple[float, float, float, float]


class PreviewCanvas(QWidget):
    positionChanged = Signal(float, float)

    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.setMinimumSize(480, 360)
        self.setMouseTracking(True)
        self.vinyl_width = 600.0
        self.vinyl_length = 1000.0
        self.paths: list[list[Point]] = []
        self.bounds: Bounds | None = None
        self.selected = False
        self.zoom = 1.0
        self.pan_x = 0.0
        self.pan_y = 0.0
        self._dragging = False
        self._panning = False
        self._drag_anchor = (0.0, 0.0)
        self._drag_origin = (0.0, 0.0)
        self._pan_anchor = QPointF()
        self._pan_origin = (0.0, 0.0)

    def set_preview(
        self,
        vinyl_width: float,
        vinyl_length: float,
        paths: list[list[Point]],
        bounds: Bounds | None,
    ) -> None:
        self.vinyl_width = max(vinyl_width, 1.0)
        self.vinyl_length = max(vinyl_length, 1.0)
        self.paths = paths
        self.bounds = bounds
        self.update()

    def paintEvent(self, event) -> None:  # noqa: N802
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)
        painter.fillRect(self.rect(), QColor("#d5dbe3"))
        origin = self._origin()
        scale = self._scale()
        sheet = self._sheet_rect(origin, scale)
        painter.setPen(QPen(QColor("#2c333a"), 1))
        painter.setBrush(QColor("#f4f1ea"))
        painter.drawRect(sheet)
        pen = QPen(QColor("#161616"))
        pen.setCosmetic(True)
        pen.setWidthF(1.6)
        painter.setPen(pen)
        painter.setBrush(Qt.BrushStyle.NoBrush)
        for path in self.paths:
            if len(path) < 2:
                continue
            polygon = QPolygonF([self._to_screen(point, origin, scale) for point in path])
            painter.drawPolyline(polygon)
        if self.bounds is not None:
            box_pen = QPen(QColor("#1d4e89") if self.selected else QColor("#5b7ea6"))
            box_pen.setCosmetic(True)
            box_pen.setStyle(Qt.PenStyle.DashLine)
            box_pen.setWidthF(1.4 if self.selected else 1.0)
            painter.setPen(box_pen)
            minx, miny, maxx, maxy = self.bounds
            top_left = self._to_screen((minx, maxy), origin, scale)
            bottom_right = self._to_screen((maxx, miny), origin, scale)
            painter.drawRect(
                int(top_left.x()),
                int(top_left.y()),
                int(bottom_right.x() - top_left.x()),
                int(bottom_right.y() - top_left.y()),
            )
        painter.setPen(QColor("#3d4652"))
        painter.drawText(
            12,
            22,
            f"Vinyl  {self.vinyl_width:.0f} × {self.vinyl_length:.0f} mm",
        )

    def wheelEvent(self, event) -> None:  # noqa: N802
        delta = event.angleDelta().y()
        if delta == 0:
            return
        factor = 1.15 if delta > 0 else 1 / 1.15
        cursor = event.position()
        before = self._to_mm(cursor)
        self.zoom = min(40.0, max(0.15, self.zoom * factor))
        self._keep_point_under_cursor(before, cursor)
        self.update()
        event.accept()

    def mousePressEvent(self, event) -> None:  # noqa: N802
        if event.button() == Qt.MouseButton.MiddleButton:
            self._panning = True
            self._pan_anchor = event.position()
            self._pan_origin = (self.pan_x, self.pan_y)
            event.accept()
            return
        if event.button() != Qt.MouseButton.LeftButton:
            return
        millimetres = self._to_mm(event.position())
        if self._hit(millimetres):
            self.selected = True
            self._dragging = True
            self._drag_anchor = millimetres
            if self.bounds is not None:
                self._drag_origin = (self.bounds[0], self.bounds[1])
            self.update()
        else:
            self.selected = False
            self.update()
        event.accept()

    def mouseMoveEvent(self, event) -> None:  # noqa: N802
        if self._panning:
            delta = event.position() - self._pan_anchor
            self.pan_x = self._pan_origin[0] + delta.x()
            self.pan_y = self._pan_origin[1] + delta.y()
            self.update()
            event.accept()
            return
        if self._dragging and self.bounds is not None:
            millimetres = self._to_mm(event.position())
            dx = millimetres[0] - self._drag_anchor[0]
            dy = millimetres[1] - self._drag_anchor[1]
            self.positionChanged.emit(self._drag_origin[0] + dx, self._drag_origin[1] + dy)
            event.accept()
            return
        self.setCursor(
            Qt.CursorShape.SizeAllCursor if self._hit(self._to_mm(event.position())) else Qt.CursorShape.ArrowCursor
        )

    def mouseReleaseEvent(self, event) -> None:  # noqa: N802
        self._dragging = False
        self._panning = False

    def _hit(self, point: Point) -> bool:
        if self.bounds is None:
            return False
        pad = 6.0 / self._scale()
        minx, miny, maxx, maxy = self.bounds
        return (minx - pad) <= point[0] <= (maxx + pad) and (miny - pad) <= point[1] <= (maxy + pad)

    def _fit_scale(self) -> float:
        margin = 28.0
        available_w = max(1.0, self.width() - 2 * margin)
        available_h = max(1.0, self.height() - 2 * margin)
        return min(available_w / self.vinyl_width, available_h / self.vinyl_length)

    def _scale(self) -> float:
        return self._fit_scale() * self.zoom

    def _origin(self) -> QPointF:
        scale = self._scale()
        sheet_w = self.vinyl_width * scale
        sheet_h = self.vinyl_length * scale
        return QPointF((self.width() - sheet_w) / 2 + self.pan_x, (self.height() + sheet_h) / 2 + self.pan_y)

    def _sheet_rect(self, origin: QPointF, scale: float):
        from PySide6.QtCore import QRectF

        return QRectF(
            origin.x(),
            origin.y() - self.vinyl_length * scale,
            self.vinyl_width * scale,
            self.vinyl_length * scale,
        )

    def _to_screen(self, point: Point, origin: QPointF, scale: float) -> QPointF:
        return QPointF(origin.x() + point[0] * scale, origin.y() - point[1] * scale)

    def _to_mm(self, position: QPointF) -> Point:
        origin = self._origin()
        scale = self._scale()
        return ((position.x() - origin.x()) / scale, (origin.y() - position.y()) / scale)

    def _keep_point_under_cursor(self, millimetres: Point, cursor: QPointF) -> None:
        scale = self._scale()
        sheet_w = self.vinyl_width * scale
        sheet_h = self.vinyl_length * scale
        self.pan_x = cursor.x() - (self.width() - sheet_w) / 2 - millimetres[0] * scale
        self.pan_y = cursor.y() - (self.height() + sheet_h) / 2 + millimetres[1] * scale
