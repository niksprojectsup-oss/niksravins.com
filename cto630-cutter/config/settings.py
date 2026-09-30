"""Load and save cutter settings.

Factory defaults live in ``default_settings.json``. User overrides are stored
under the per-user config directory (or ``CTO630_CONFIG_DIR`` when set).

Fields that are still unverified on a real CTO630:

* ``plotter.units_per_mm`` — HP-GL's usual scale is 40 units per millimetre
  (0.025 mm). The PCUT manual does not state the CTO630 scale.
* ``plotter.x_sign`` / ``plotter.y_sign`` — axis direction is not documented.
* ``plotter.emit_initialize`` — ``IN`` is standard HP-GL. The manual names
  HP-GL as a language but does not list an init sequence.
* ``plotter.speed_command`` / ``plotter.force_command`` — empty on purpose.
  Speed and knife pressure are panel settings in the PCUT manual. Leave these
  empty until a command captured from a real CTO630 is known.
* ``serial`` parity, stop bits, and flow control — the manual fixes 8-bit
  words and lists baud rates including 9600, but its parity/stop table is
  ambiguous. 9600 8N1 with no flow control is the editable default.
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parent.parent
DEFAULTS_PATH = Path(__file__).resolve().parent / "default_settings.json"


@dataclass
class SerialSettings:
    port: str = ""
    baud_rate: int = 9600
    data_bits: int = 8
    parity: str = "N"
    stop_bits: float = 1
    flow_control: str = "none"


@dataclass
class PlotterSettings:
    width_mm: float = 640.0
    length_mm: float = 20000.0
    units_per_mm: float = 40.0
    x_sign: int = 1
    y_sign: int = 1
    emit_initialize: bool = True
    speed_command: str = ""
    force_command: str = ""
    speed: int = 50
    force: int = 100


@dataclass
class VinylSettings:
    width_mm: float = 600.0
    length_mm: float = 1000.0


@dataclass
class GeometrySettings:
    flatten_tolerance_mm: float = 0.1
    join_tolerance_mm: float = 0.05


@dataclass
class Settings:
    serial: SerialSettings
    plotter: PlotterSettings
    vinyl: VinylSettings
    geometry: GeometrySettings
    test_cut_size_mm: float = 20.0
    units: str = "mm"
    output_filename: str = "output/test_job.hpgl"

    def to_dict(self) -> dict:
        return asdict(self)


def user_config_dir() -> Path:
    override = os.environ.get("CTO630_CONFIG_DIR")
    if override:
        return Path(override)
    if sys.platform == "win32":
        root = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
    elif sys.platform == "darwin":
        root = Path.home() / "Library" / "Application Support"
    else:
        root = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))
    return root / "CTO630Cutter"


def user_config_path() -> Path:
    return user_config_dir() / "settings.json"


def _merge(base: dict, override: dict) -> dict:
    merged = dict(base)
    for key, value in override.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
            merged[key] = _merge(merged[key], value)
        else:
            merged[key] = value
    return merged


def _settings_from_dict(data: dict) -> Settings:
    serial = data.get("serial") or {}
    plotter = data.get("plotter") or {}
    vinyl = data.get("vinyl") or {}
    geometry = data.get("geometry") or {}
    return Settings(
        serial=SerialSettings(
            port=str(serial.get("port", "")),
            baud_rate=int(serial.get("baud_rate", 9600)),
            data_bits=int(serial.get("data_bits", 8)),
            parity=str(serial.get("parity", "N")),
            stop_bits=float(serial.get("stop_bits", 1)),
            flow_control=str(serial.get("flow_control", "none")),
        ),
        plotter=PlotterSettings(
            width_mm=float(plotter.get("width_mm", 640)),
            length_mm=float(plotter.get("length_mm", 20000)),
            units_per_mm=float(plotter.get("units_per_mm", 40)),
            x_sign=int(plotter.get("x_sign", 1)),
            y_sign=int(plotter.get("y_sign", 1)),
            emit_initialize=bool(plotter.get("emit_initialize", True)),
            speed_command=str(plotter.get("speed_command", "")),
            force_command=str(plotter.get("force_command", "")),
            speed=int(plotter.get("speed", 50)),
            force=int(plotter.get("force", 100)),
        ),
        vinyl=VinylSettings(
            width_mm=float(vinyl.get("width_mm", 600)),
            length_mm=float(vinyl.get("length_mm", 1000)),
        ),
        geometry=GeometrySettings(
            flatten_tolerance_mm=float(geometry.get("flatten_tolerance_mm", 0.1)),
            join_tolerance_mm=float(geometry.get("join_tolerance_mm", 0.05)),
        ),
        test_cut_size_mm=float(data.get("test_cut_size_mm", 20)),
        units=str(data.get("units", "mm")) or "mm",
        output_filename=str(data.get("output_filename", "output/test_job.hpgl")),
    )


def default_settings() -> Settings:
    raw = json.loads(DEFAULTS_PATH.read_text(encoding="utf-8"))
    return _settings_from_dict(raw)


def load_settings() -> Settings:
    defaults = json.loads(DEFAULTS_PATH.read_text(encoding="utf-8"))
    path = user_config_path()
    if path.is_file():
        try:
            override = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(override, dict):
                defaults = _merge(defaults, override)
        except (OSError, json.JSONDecodeError):
            pass
    settings = _settings_from_dict(defaults)
    if settings.units.lower() != "mm":
        settings.units = "mm"
    return settings


def save_settings(settings: Settings) -> Path:
    path = user_config_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(settings.to_dict(), indent=2) + "\n", encoding="utf-8")
    return path
