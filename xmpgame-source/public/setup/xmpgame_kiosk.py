#!/usr/bin/env python3
"""西马棚幼儿园四台 Windows 一体机开机自启动器。

仅使用 Python 标准库。安装后由 Windows 任务计划在用户登录时启动，
使用独立浏览器配置打开对应项目，并在浏览器意外退出后自动拉起。
"""

from __future__ import print_function

import argparse
import ctypes
import json
import os
import platform
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


APP_VERSION = "1.0.0"
TASK_NAME = "XMPGame Kindergarten Kiosk"
OLD_TASK_NAMES = [
    TASK_NAME,
    "XMPGame Kiosk Station 01",
    "XMPGame Kiosk Station 02",
    "XMPGame Kiosk Station 03",
    "XMPGame Kiosk Station 04",
]
DEFAULT_BASE_URL = "https://www.zhouxiaomai.com/xmpgame"
VALID_STATIONS = (1, 2, 3, 4)


def validate_station(value):
    station = int(value)
    if station not in VALID_STATIONS:
        raise ValueError("station must be 1, 2, 3, or 4")
    return station


def build_kiosk_url(station, base_url=DEFAULT_BASE_URL):
    station = validate_station(station)
    return "{}/station/{}?kiosk=1".format(base_url.rstrip("/"), station)


def install_directory(env=None):
    env = env or os.environ
    root = env.get("PROGRAMDATA") or env.get("LOCALAPPDATA") or str(Path.home())
    return Path(root) / "XMPGame"


def browser_candidates(env=None):
    env = env or os.environ
    program_files_x86 = env.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)")
    program_files = env.get("PROGRAMFILES", r"C:\Program Files")
    local_app_data = env.get("LOCALAPPDATA", "")
    candidates = [
        Path(program_files_x86) / "Microsoft/Edge/Application/msedge.exe",
        Path(program_files) / "Microsoft/Edge/Application/msedge.exe",
    ]
    if local_app_data:
        candidates.append(Path(local_app_data) / "Microsoft/Edge/Application/msedge.exe")
    candidates.extend([
        Path(program_files) / "Google/Chrome/Application/chrome.exe",
        Path(program_files_x86) / "Google/Chrome/Application/chrome.exe",
    ])
    if local_app_data:
        candidates.append(Path(local_app_data) / "Google/Chrome/Application/chrome.exe")
    return candidates


def find_browser(env=None):
    for candidate in browser_candidates(env):
        if candidate.is_file():
            return candidate
    return None


def browser_command(browser_path, kiosk_url, profile_dir):
    command = [
        str(browser_path),
        "--kiosk",
        kiosk_url,
        "--start-fullscreen",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-session-crashed-bubble",
        "--disable-pinch",
        "--overscroll-history-navigation=0",
        "--use-fake-ui-for-media-stream",
        "--autoplay-policy=no-user-gesture-required",
        "--disable-features=Translate,msEdgeSidebarV2",
        "--user-data-dir={}".format(profile_dir),
    ]
    if str(browser_path).lower().endswith("msedge.exe"):
        command.insert(3, "--edge-kiosk-type=fullscreen")
    return command


def pythonw_path(executable=None):
    executable = Path(executable or sys.executable)
    candidate = executable.with_name("pythonw.exe")
    return candidate if candidate.is_file() else executable


def task_action(python_executable, installed_script, config_path):
    return subprocess.list2cmdline([
        str(python_executable),
        str(installed_script),
        "run",
        "--config",
        str(config_path),
    ])


def write_log(log_path, message):
    log_path.parent.mkdir(parents=True, exist_ok=True)
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    with log_path.open("a", encoding="utf-8") as stream:
        stream.write("[{}] {}\n".format(timestamp, message))


def load_config(config_path):
    with Path(config_path).open("r", encoding="utf-8") as stream:
        config = json.load(stream)
    config["station"] = validate_station(config["station"])
    config["base_url"] = str(config.get("base_url") or DEFAULT_BASE_URL).rstrip("/")
    config["url"] = build_kiosk_url(config["station"], config["base_url"])
    return config


def save_config(config_path, station, base_url):
    config = {
        "version": APP_VERSION,
        "station": validate_station(station),
        "base_url": str(base_url).rstrip("/"),
        "url": build_kiosk_url(station, base_url),
        "startup_delay_seconds": 10,
        "network_wait_seconds": 90,
        "restart_delay_seconds": 4,
    }
    config_path.parent.mkdir(parents=True, exist_ok=True)
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8")
    return config


def wait_for_site(url, timeout_seconds, log_path):
    deadline = time.monotonic() + max(0, timeout_seconds)
    while time.monotonic() < deadline:
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "XMPGame-Kiosk/{}".format(APP_VERSION)})
            with urllib.request.urlopen(request, timeout=8) as response:
                if 200 <= response.status < 500:
                    write_log(log_path, "网络已连接：{}".format(response.status))
                    return True
        except (OSError, urllib.error.URLError):
            pass
        time.sleep(3)
    write_log(log_path, "等待网络超时，先打开浏览器并由浏览器继续重试。")
    return False


def acquire_single_instance(lock_path):
    if platform.system() != "Windows":
        return None
    import msvcrt

    lock_path.parent.mkdir(parents=True, exist_ok=True)
    lock_file = lock_path.open("a+b")
    lock_file.seek(0)
    if lock_file.read(1) == b"":
        lock_file.write(b"1")
        lock_file.flush()
    lock_file.seek(0)
    try:
        msvcrt.locking(lock_file.fileno(), msvcrt.LK_NBLCK, 1)
    except OSError:
        lock_file.close()
        return False
    return lock_file


def run_kiosk(config_path):
    config_path = Path(config_path)
    app_dir = config_path.parent
    log_path = app_dir / "xmpgame-kiosk.log"
    stop_path = app_dir / "STOP"
    lock = acquire_single_instance(app_dir / "xmpgame-kiosk.lock")
    if lock is False:
        return 0

    try:
        config = load_config(config_path)
        browser = find_browser()
        if not browser:
            write_log(log_path, "未找到 Microsoft Edge 或 Google Chrome。")
            return 2

        if stop_path.exists():
            stop_path.unlink()
        time.sleep(max(0, int(config.get("startup_delay_seconds", 10))))
        wait_for_site(config["url"], int(config.get("network_wait_seconds", 90)), log_path)

        profile_dir = app_dir / "BrowserProfile"
        profile_dir.mkdir(parents=True, exist_ok=True)
        command = browser_command(browser, config["url"], profile_dir)
        write_log(log_path, "启动 {} 号项目：{}".format(config["station"], config["url"]))

        while not stop_path.exists():
            process = subprocess.Popen(command, cwd=str(app_dir))
            exit_code = process.wait()
            if stop_path.exists():
                break
            write_log(log_path, "浏览器已退出（代码 {}），准备重新打开。".format(exit_code))
            time.sleep(max(1, int(config.get("restart_delay_seconds", 4))))
        write_log(log_path, "自启动器已停止。")
        return 0
    except Exception as error:
        write_log(log_path, "启动器异常：{}".format(error))
        return 3
    finally:
        if lock not in (None, False):
            lock.close()


def is_admin():
    if platform.system() != "Windows":
        return False
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        return False


def relaunch_as_admin():
    parameters = subprocess.list2cmdline(sys.argv)
    result = ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, parameters, None, 1)
    if result <= 32:
        raise RuntimeError("无法申请管理员权限（错误 {}）".format(result))


def delete_task(task_name):
    subprocess.run(
        ["schtasks", "/Delete", "/TN", task_name, "/F"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )


def create_task(action):
    base = [
        "schtasks", "/Create", "/TN", TASK_NAME,
        "/SC", "ONLOGON", "/RL", "HIGHEST", "/TR", action, "/F",
    ]
    delayed = [
        "schtasks", "/Create", "/TN", TASK_NAME,
        "/SC", "ONLOGON", "/DELAY", "0000:15",
        "/RL", "HIGHEST", "/TR", action, "/F",
    ]
    result = subprocess.run(delayed, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        result = subprocess.run(base, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "unknown schtasks error").strip()
        raise RuntimeError("创建开机任务失败：{}".format(detail))


def remove_legacy_startup_shortcuts():
    app_data = os.environ.get("APPDATA")
    if not app_data:
        return
    startup = Path(app_data) / "Microsoft/Windows/Start Menu/Programs/Startup"
    for shortcut in startup.glob("XMP Kindergarten - Station *.lnk"):
        shortcut.unlink(missing_ok=True)


def launch_installed_runner(installed_script, config_path):
    flags = getattr(subprocess, "DETACHED_PROCESS", 0) | getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
    subprocess.Popen(
        [str(pythonw_path()), str(installed_script), "run", "--config", str(config_path)],
        cwd=str(installed_script.parent),
        close_fds=True,
        creationflags=flags,
    )


def install(station, base_url, launch_now):
    if platform.system() != "Windows":
        raise RuntimeError("安装命令只能在 Windows 一体机上运行。")
    if not is_admin():
        relaunch_as_admin()
        return 0

    app_dir = install_directory()
    app_dir.mkdir(parents=True, exist_ok=True)
    installed_script = app_dir / "xmpgame_kiosk.py"
    source_script = Path(__file__).resolve()
    if source_script != installed_script.resolve():
        shutil.copy2(str(source_script), str(installed_script))

    config_path = app_dir / "config.json"
    config = save_config(config_path, station, base_url)
    (app_dir / "STOP").unlink(missing_ok=True)
    for old_task in OLD_TASK_NAMES:
        delete_task(old_task)
    remove_legacy_startup_shortcuts()

    action = task_action(pythonw_path(), installed_script, config_path)
    create_task(action)
    if launch_now:
        launch_installed_runner(installed_script, config_path)

    print("安装成功：{} 号项目".format(config["station"]))
    print("开机网址：{}".format(config["url"]))
    print("任务名称：{}".format(TASK_NAME))
    print("日志位置：{}".format(app_dir / "xmpgame-kiosk.log"))
    return 0


def show_status(config_path=None):
    config_path = Path(config_path) if config_path else install_directory() / "config.json"
    print("XMPGame 自启动器 {}".format(APP_VERSION))
    print("配置文件：{}".format(config_path))
    if config_path.is_file():
        config = load_config(config_path)
        print("项目：{}".format(config["station"]))
        print("网址：{}".format(config["url"]))
    else:
        print("状态：尚未安装")
    browser = find_browser()
    print("浏览器：{}".format(browser or "未找到"))
    if platform.system() == "Windows":
        result = subprocess.run(
            ["schtasks", "/Query", "/TN", TASK_NAME, "/FO", "LIST"],
            capture_output=True,
            text=True,
            check=False,
        )
        print("开机任务：{}".format("已安装" if result.returncode == 0 else "未安装"))
    return 0


def uninstall():
    if platform.system() != "Windows":
        raise RuntimeError("卸载命令只能在 Windows 一体机上运行。")
    if not is_admin():
        relaunch_as_admin()
        return 0
    app_dir = install_directory()
    app_dir.mkdir(parents=True, exist_ok=True)
    (app_dir / "STOP").write_text("stop", encoding="utf-8")
    for task in OLD_TASK_NAMES:
        delete_task(task)
    remove_legacy_startup_shortcuts()
    print("开机任务已删除。当前全屏浏览器关闭后将不再自动打开。")
    return 0


def create_parser():
    parser = argparse.ArgumentParser(description="西马棚幼儿园 XMPGame Windows 自启动器")
    parser.add_argument("--version", action="version", version=APP_VERSION)
    commands = parser.add_subparsers(dest="command", required=True)

    install_parser = commands.add_parser("install", help="安装开机自启动")
    install_parser.add_argument("--station", type=validate_station, required=True, choices=VALID_STATIONS)
    install_parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    install_parser.add_argument("--launch-now", action="store_true")

    run_parser = commands.add_parser("run", help="运行并守护全屏浏览器")
    run_parser.add_argument("--config", required=True)

    status_parser = commands.add_parser("status", help="检查本机安装状态")
    status_parser.add_argument("--config")

    commands.add_parser("uninstall", help="删除开机自启动任务")
    return parser


def main(argv=None):
    args = create_parser().parse_args(argv)
    try:
        if args.command == "install":
            return install(args.station, args.base_url, args.launch_now)
        if args.command == "run":
            return run_kiosk(args.config)
        if args.command == "status":
            return show_status(args.config)
        if args.command == "uninstall":
            return uninstall()
    except Exception as error:
        print("错误：{}".format(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
