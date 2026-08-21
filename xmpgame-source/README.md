# 西马棚幼儿园 AI 画作工场

四台同型号触摸一体机共用同一套俯拍画纸交互：把 A4 儿童画放入摄像头画框，轻触一次，系统自动理解原画并生成一张 16:9 高品质卡通动画或童书绘本作品。项目不采集人像、不使用麦克风、不提供多层选择。

## 四个固定项目

| 设备 | 项目 | 固定模型配方 | 设备入口 |
| --- | --- | --- | --- |
| 1 | 化形万物 | 生命苏醒 | `/xmpgame/station/1?kiosk=1` |
| 2 | 奇物成真 | 立体奇物 | `/xmpgame/station/2?kiosk=1` |
| 3 | 画境生长 | 奇境生长 | `/xmpgame/station/3?kiosk=1` |
| 4 | 童画大片 | 电影画面 | `/xmpgame/station/4?kiosk=1` |

根地址 `/xmpgame/` 是四个项目的入口页。四个设备页面的操作完全一致，仅模型配方不同。

## 本地运行

```bash
npm ci
npm run dev
```

生产路径构建：

```bash
XMP_PUBLIC_BASE=/xmpgame/ npm run build
```

完整测试：

```bash
npm test
```

## 模型能力

客户端只调用两个任务：

- `interaction.interpret`：理解一张俯拍 A4 原画。
- `image.edit`：依据固定配方生成 `1696×960` 横屏作品。

模型密钥只保存在服务端环境变量中。浏览器不会收到任何密钥；临时输入图上传到私有对象存储，任务结束后删除。

统一输出风格以儿童卡通为主：保留原画轮廓、颜色和真实笔触，生成圆润、明亮、有故事感的动画/绘本世界；明确禁止照片级写实、真人电影剧照、真实皮肤和写实动物皮毛。

## 主要目录

- `src/`：四项目入口、统一一触式交互和触摸屏界面。
- `api/`：艺术画作专用模型网关。
- `public/setup/`：Windows Edge 全屏启动与开机自启脚本。
- `tests/`：四项目逻辑、模型边界、静态构建测试。
- `public/assets/stations/`：当前页面实际使用的视觉资产。

## 云端集成

周小麦主页仓库使用：

- `public/xmpgame/` 保存生产构建产物。
- `api/xmpgame.mjs` 和 `api/xmpgame-model-service.mjs` 提供正式模型接口。
- `next.config.ts` 将 `/xmpgame/v1/status`、`/xmpgame/v1/tasks` 和四个设备路由转发到对应资源。

正式地址：<https://www.zhouxiaomai.com/xmpgame/>
