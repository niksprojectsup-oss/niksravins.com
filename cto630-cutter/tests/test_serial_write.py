"""Serial write accounting. These tests never open a physical COM port."""

import time

import pytest

from config.settings import default_settings
from plotter.base import CONNECT_FAILED_LV, JobStatus, PlotterConnectionError
from plotter.cto630 import CTO630Driver
from plotter.dry_run import run_dry_run
from plotter.hpgl import HPGLGenerator
from plotter.serial_transport import SerialTransport

SQUARE = [[(0.0, 0.0), (20.0, 0.0), (20.0, 20.0), (0.0, 20.0), (0.0, 0.0)]]
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


class _Port:
    def __init__(self, write, flush=None, *, is_open=True):
        self.is_open = is_open
        self._write = write
        self._flush = flush or (lambda: None)
        self.cancelled = False

    def write(self, data):
        return self._write(data)

    def flush(self):
        return self._flush()

    def cancel_write(self):
        self.cancelled = True


def _cut(port, *, flush_timeout=5.0, flow_control="none"):
    transport = SerialTransport(flush_timeout=flush_timeout)
    transport._serial = port
    transport._flow_control = flow_control
    settings = default_settings()
    settings.serial.port = "COM99"
    driver = CTO630Driver(settings, transport=transport)
    driver.connected = True
    return driver.cut(SQUARE)


def _assert_failure_facts(result):
    report = result.report()
    assert result.status in (JobStatus.FAILED, JobStatus.INCOMPLETE)
    assert result.status != JobStatus.SENT
    assert "COMPLETED" not in report
    assert "FINISHED" not in report
    assert f"Intended bytes: {result.intended_bytes}" in report
    assert f"Bytes accepted by the Python serial layer: {result.accepted_bytes}" in report
    assert f"Error: {result.error}" in report
    assert result.error


def test_partial_write_is_incomplete_and_records_the_short_count():
    calls = {"n": 0}

    def write(data):
        calls["n"] += 1
        if calls["n"] == 1:
            return 1
        return 0

    result = _cut(_Port(write))
    assert result.status == JobStatus.INCOMPLETE
    assert result.short_write is True
    assert result.intended_bytes == 4
    assert result.accepted_bytes == 1
    assert "short write: serial write returned 0" in result.error
    _assert_failure_facts(result)


def test_write_timeout_is_failed_and_shows_the_exception_text():
    import serial

    def write(_data):
        raise serial.SerialTimeoutException("Write timeout")

    result = _cut(_Port(write))
    assert result.status == JobStatus.FAILED
    assert result.accepted_bytes == 0
    assert result.intended_bytes == 4
    assert "SerialTimeoutException: Write timeout" in result.error
    _assert_failure_facts(result)


def test_flush_oserror_fails_after_the_serial_layer_accepted_the_buffer():
    def write(data):
        return len(data)

    def flush():
        raise OSError("drain failed")

    result = _cut(_Port(write, flush))
    assert result.status == JobStatus.FAILED
    assert result.accepted_bytes == result.intended_bytes == 4
    assert "flush failed: OSError: drain failed" in result.error
    _assert_failure_facts(result)


def test_flush_timeout_fails_and_keeps_flow_control_enabled():
    def write(data):
        return len(data)

    def flush():
        time.sleep(1.0)

    started = time.monotonic()
    result = _cut(_Port(write, flush), flush_timeout=0.2, flow_control="rtscts")
    elapsed = time.monotonic() - started
    assert elapsed < 0.8
    assert result.status == JobStatus.FAILED
    assert result.accepted_bytes == result.intended_bytes == 4
    assert "flush timed out after 0.2s" in result.error
    assert "Flow control rtscts is still enabled" in result.error
    _assert_failure_facts(result)


def test_closed_port_is_failed_and_uses_the_connect_error_text():
    result = _cut(None)
    transport_result = result
    assert transport_result.status == JobStatus.FAILED
    assert transport_result.accepted_bytes == 0
    assert transport_result.intended_bytes == 4
    assert transport_result.short_write is False
    assert CONNECT_FAILED_LV in transport_result.error
    _assert_failure_facts(transport_result)

    closed = _cut(_Port(lambda data: (_ for _ in ()).throw(AssertionError("write called")), is_open=False))
    assert closed.status == JobStatus.FAILED
    assert closed.accepted_bytes == 0
    assert CONNECT_FAILED_LV in closed.error
    _assert_failure_facts(closed)


def test_full_write_is_sent_not_completed_and_command_bytes_stay_the_same():
    chunks = []

    def write(data):
        chunk = bytes(data)
        chunks.append(chunk[:1])
        return 1

    result = _cut(_Port(write))
    assert result.status == JobStatus.SENT
    assert result.error is None
    assert result.stopped is False
    assert result.hpgl == SQUARE_20_HPGL
    assert result.hpgl == HPGLGenerator().generate(SQUARE)
    assert result.accepted_bytes == result.intended_bytes == len(SQUARE_20_HPGL.encode("ascii"))
    assert b"".join(chunks) == SQUARE_20_HPGL.encode("ascii")
    report = result.report()
    assert "The cutter has not confirmed the job." in report
    assert "COMPLETED" not in report
    assert "FINISHED" not in report
    assert f"Intended bytes: {result.intended_bytes}" in report
    assert f"Bytes accepted by the Python serial layer: {result.accepted_bytes}" in report


def test_unknown_flow_control_fails_before_opening_a_port(monkeypatch):
    import serial

    def boom(*_args, **_kwargs):
        raise AssertionError("serial.Serial was called")

    monkeypatch.setattr(serial, "Serial", boom)
    transport = SerialTransport()
    with pytest.raises(PlotterConnectionError) as caught:
        transport.open(
            port="COM99",
            baud_rate=9600,
            data_bits=8,
            parity="N",
            stop_bits=1,
            flow_control="hardware",
        )
    assert transport._serial is None
    assert "hardware" in str(caught.value)
    assert "none, xonxoff, rtscts, dsrdtr" in str(caught.value)
    assert default_settings().serial.flow_control == "none"


def test_enabled_flow_control_is_passed_through(monkeypatch):
    import serial

    captured = {}

    class _FakeSerial:
        def __init__(self, **kwargs):
            captured.update(kwargs)
            self.is_open = True

        def close(self):
            self.is_open = False

    monkeypatch.setattr(serial, "Serial", _FakeSerial)
    transport = SerialTransport()
    transport.open(
        port="COM99",
        baud_rate=9600,
        data_bits=8,
        parity="N",
        stop_bits=1,
        flow_control="rtscts",
    )
    assert captured["rtscts"] is True
    assert captured["xonxoff"] is False
    assert captured["dsrdtr"] is False
    transport.close()


def test_dry_run_opens_no_port_and_sends_no_bytes(tmp_path, monkeypatch):
    def fail_open(self, **_kwargs):
        raise AssertionError("COM port opened")

    monkeypatch.setattr(SerialTransport, "open", fail_open)
    report = run_dry_run(default_settings(), SQUARE, output_path=tmp_path / "test_job.hpgl")
    assert report.hpgl == SQUARE_20_HPGL
    assert report.bytes_sent_to_port == 0
    assert report.com_port_opened is False
    assert (tmp_path / "test_job.hpgl").read_text(encoding="ascii") == SQUARE_20_HPGL
