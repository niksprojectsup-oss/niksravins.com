"""HP-GL command text.

Only this module turns pen operations into command strings. ``pen_up``,
``pen_down``, and ``move`` are the operations callers use.

TODO: the PCUT / CTO630 manual says the machine speaks HP-GL and DM-PL, but it
does not publish the unit scale, axis direction, or an initialization sequence.
``units_per_mm`` defaults to the HP-GL value of 40 (0.025 mm) and can be changed.
``IN`` is emitted only when ``emit_initialize`` is set.
"""

from __future__ import annotations


class HPGLGenerator:
    def __init__(
        self,
        units_per_mm: float = 40.0,
        x_sign: int = 1,
        y_sign: int = 1,
        emit_initialize: bool = True,
        prefix_commands: list[str] | None = None,
    ) -> None:
        if units_per_mm <= 0:
            raise ValueError("units_per_mm must be positive")
        self.units_per_mm = float(units_per_mm)
        # TODO: sign of each axis is unverified on the CTO630. +1 matches HP-GL Y-up.
        self.x_sign = 1 if x_sign >= 0 else -1
        self.y_sign = 1 if y_sign >= 0 else -1
        # TODO: IN; is standard HP-GL, not a sequence taken from a CTO630 capture.
        self.emit_initialize = emit_initialize
        self.prefix_commands = list(prefix_commands or [])
        self._commands: list[str] = []

    def pen_up(self) -> None:
        self._emit("PU")

    def pen_down(self) -> None:
        self._emit("PD")

    def move(self, x: float, y: float) -> None:
        ix = int(round(x * self.units_per_mm * self.x_sign))
        iy = int(round(y * self.units_per_mm * self.y_sign))
        self._emit(f"PA{ix},{iy}")

    def begin_job(self) -> None:
        if self.emit_initialize:
            self._emit("IN")
        for command in self.prefix_commands:
            body = command.strip().rstrip(";")
            if body:
                self._emit(body)

    def add_path(self, path: list[tuple[float, float]]) -> None:
        self.pen_up()
        self.move(path[0][0], path[0][1])
        self.pen_down()
        for x, y in path[1:]:
            self.move(x, y)

    def end_job(self) -> None:
        self.pen_up()

    def take(self) -> str:
        if not self._commands:
            return ""
        text = "\n".join(f"{command};" for command in self._commands) + "\n"
        self._commands = []
        return text

    def generate(self, paths: list[list[tuple[float, float]]]) -> str:
        self.begin_job()
        parts = [self.take()]
        for path in paths:
            if len(path) < 2:
                continue
            self.add_path(path)
            parts.append(self.take())
        self.end_job()
        parts.append(self.take())
        return "".join(parts)

    def _emit(self, body: str) -> None:
        """Lowest layer: record one HP-GL opcode without a terminator."""
        self._commands.append(body)
