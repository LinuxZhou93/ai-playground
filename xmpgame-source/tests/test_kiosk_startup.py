import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock


SCRIPT_PATH = Path(__file__).parents[1] / "public" / "setup" / "xmpgame_kiosk.py"
SPEC = importlib.util.spec_from_file_location("xmpgame_kiosk", SCRIPT_PATH)
KIOSK = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(KIOSK)


class KioskStartupTests(unittest.TestCase):
    def test_all_four_urls_are_fixed_kiosk_routes(self):
        self.assertEqual(
            [KIOSK.build_kiosk_url(index) for index in range(1, 5)],
            [
                "https://www.zhouxiaomai.com/xmpgame/station/1?kiosk=1",
                "https://www.zhouxiaomai.com/xmpgame/station/2?kiosk=1",
                "https://www.zhouxiaomai.com/xmpgame/station/3?kiosk=1",
                "https://www.zhouxiaomai.com/xmpgame/station/4?kiosk=1",
            ],
        )

    def test_browser_command_uses_real_camera_and_dedicated_kiosk_profile(self):
        command = KIOSK.browser_command(
            Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
            KIOSK.build_kiosk_url(2),
            Path(r"C:\ProgramData\XMPGame\BrowserProfile"),
        )
        self.assertIn("--kiosk", command)
        self.assertIn("--edge-kiosk-type=fullscreen", command)
        self.assertIn("--use-fake-ui-for-media-stream", command)
        self.assertNotIn("--use-fake-device-for-media-stream", command)
        self.assertTrue(any(item.startswith("--user-data-dir=") for item in command))

    def test_config_round_trip_preserves_station_and_url(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "config.json"
            KIOSK.save_config(path, 4, KIOSK.DEFAULT_BASE_URL)
            config = KIOSK.load_config(path)
            self.assertEqual(config["station"], 4)
            self.assertEqual(config["url"], KIOSK.build_kiosk_url(4))
            self.assertEqual(config["restart_delay_seconds"], 4)

    def test_task_action_is_quoted_for_paths_with_spaces(self):
        action = KIOSK.task_action(
            Path(r"C:\Program Files\Python\pythonw.exe"),
            Path(r"C:\ProgramData\XMPGame\xmpgame_kiosk.py"),
            Path(r"C:\ProgramData\XMPGame\config.json"),
        )
        self.assertIn('"C:\\Program Files\\Python\\pythonw.exe"', action)
        self.assertIn(" run ", action)

    def test_scheduled_task_runs_on_logon_with_delay_and_highest_privileges(self):
        completed = mock.Mock(returncode=0, stdout="", stderr="")
        with mock.patch.object(KIOSK.subprocess, "run", return_value=completed) as run:
            KIOSK.create_task("PYTHONW ACTION")
        command = run.call_args.args[0]
        self.assertEqual(command[0], "schtasks")
        self.assertEqual(command[command.index("/SC") + 1], "ONLOGON")
        self.assertEqual(command[command.index("/DELAY") + 1], "0000:15")
        self.assertEqual(command[command.index("/RL") + 1], "HIGHEST")
        self.assertEqual(command[command.index("/TR") + 1], "PYTHONW ACTION")


if __name__ == "__main__":
    unittest.main()
