"""CTO630 driver.

Sends HP-GL pen motion over the serial transport. See the class docstring for
what the PCUT manual actually confirms.
"""

from __future__ import annotations

from plotter.base import PlotterDriver
from plotter.serial_transport import SerialTransport


class CTO630Driver(PlotterDriver):
    """HP-GL driver for a Creation PCUT CTO630 (CT630 family).

    Verified from the PCUT series manual for the CT630:

    * Plotting language is HP-GL / DM-PL with automatic identification.
    * Link is RS-232 or USB 1.0, and USB appears as a COM port.
    * Word length is 8 bits. Listed baud rates include 9600.
    * Maximum cutting width is 640 mm and maximum cutting length is 20000 mm.
    * Speed and knife pressure are set on the cutter panel.
    * The cutter must be ONLINE. The operator sets the origin on the panel.
    * RESET clears the cutter buffer. PAUSE pauses the machine.

    Not verified, and therefore not invented here:

    * Initialization bytes beyond the optional standard HP-GL ``IN``.
    * Speed, force, or hardware STOP opcodes. Those templates stay empty.
    * A USB handshake. Connect only opens the COM port.
    * Plotter units per millimetre and the sign of Y.

    ``stop`` does not send a command. It stops this process from writing any
    further bytes. Data already in the cutter buffer can still move the knife.
    """

    def __init__(self, settings, transport: SerialTransport | None = None) -> None:
        super().__init__(settings)
        self.transport = transport if transport is not None else SerialTransport()

    def _connect(self) -> None:
        serial_settings = self.settings.serial
        self.transport.open(
            port=serial_settings.port,
            baud_rate=serial_settings.baud_rate,
            data_bits=serial_settings.data_bits,
            parity=serial_settings.parity,
            stop_bits=serial_settings.stop_bits,
            flow_control=serial_settings.flow_control,
        )

    def _disconnect(self) -> None:
        self.transport.close()
        self.transport.reset_abort()

    def _write(self, data: str):
        return self.transport.write(data)

    def _abort_transport(self) -> None:
        self.transport.abort()

    def _clear_abort(self) -> None:
        self.transport.reset_abort()
