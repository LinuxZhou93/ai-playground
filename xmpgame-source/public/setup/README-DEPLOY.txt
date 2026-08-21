西马棚幼儿园 XMPGame 四台触屏一体机部署包
==========================================

推荐方式：U盘逐台安装，每台约 1 分钟。

安装前检查：
1. 四台电脑已经连接互联网并安装 Microsoft Edge。
2. 四台电脑已经安装 Python 3；桌面已有 Python 图标时通常已经满足。
3. Windows 开机后能自动进入当前桌面账号。浏览器无法在尚未登录的界面显示。

逐台安装：
- 1号机（化形万物）：双击 install-station-1.cmd
- 2号机（奇物成真）：双击 install-station-2.cmd
- 3号机（画境生长）：双击 install-station-3.cmd
- 4号机（童画大片）：双击 install-station-4.cmd

出现 Windows 管理员确认窗口时点“是”。安装完成后会立即打开对应项目。

现场验收：
1. 检查页面右上角“全屏体验”、俯拍摄像头画面和触摸操作。
2. 重启电脑；进入桌面约 15～30 秒后，应自动打开对应项目的全屏页面。
3. 浏览器意外关闭后约 4 秒会自动重新打开。

固定网址：
1号机 https://www.zhouxiaomai.com/xmpgame/station/1?kiosk=1
2号机 https://www.zhouxiaomai.com/xmpgame/station/2?kiosk=1
3号机 https://www.zhouxiaomai.com/xmpgame/station/3?kiosk=1
4号机 https://www.zhouxiaomai.com/xmpgame/station/4?kiosk=1

维护：
- 双击 check-installation.cmd 查看本机项目、网址、浏览器和开机任务状态。
- 日志位于 C:\ProgramData\XMPGame\xmpgame-kiosk.log。
- 双击 uninstall-xmpgame-kiosk.cmd 可取消开机自启动。
- 安装器只会清理 XMPGame 旧版开机快捷方式，不会删除其他程序。

如果机器没有 Python：
- 可使用包内 install-xmpgame-autostart.ps1，或先安装 Python 3。
- 建议把本部署包长期保留在同一个U盘，作为四台设备的维修包。
