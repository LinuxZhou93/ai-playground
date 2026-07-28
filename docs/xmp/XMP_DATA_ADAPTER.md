# XMP 数据适配层运行说明

## 当前结论

XMP 已具备独立的 FutureClass 只读聚合适配层，但默认仍运行在本地演示模式。适配层只返回园所级数量，不返回幼儿姓名、电话、监护人、原始音视频或成长档案正文，也不包含任何写操作。

## 模式

### 本地演示（默认）

无需配置。`/api/xmp/snapshot` 返回带有明确 `demo` 标识的内置快照。

### FutureClass 只读聚合（显式开启）

仅在本地环境配置下列变量后生效：

```bash
XMP_DATA_MODE=futureclass-readonly
XMP_TENANT_ID=<已确认的 campus_id>
XMP_TENANT_NAME=<园所展示名称>
XMP_CAMPUS_NAME=<园区展示名称>
NEXT_PUBLIC_SUPABASE_URL=<现有 Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<现有匿名公钥>
```

不要为 XMP 配置 `SUPABASE_SERVICE_ROLE_KEY`。适配器只使用匿名客户端和现有 RLS；没有明确租户 ID 时不会猜测或执行查询。

## 安全回退

以下情况会自动返回演示快照，并把原因显示在“数据源与安全边界”弹窗：

- 没有显式开启只读模式。
- 缺少 Supabase 公共连接参数。
- 缺少租户 ID。
- ERP 聚合查询全部被 RLS 拒绝。
- 连接超时或不可用。

该机制避免“真实数据为空”被误解为园所经营数据为零，也避免旧表缺失导致 XMP 页面崩溃。

## 首批接入范围

| 能力     | 数据表                                       | 当前读取内容           |
| -------- | -------------------------------------------- | ---------------------- |
| 园所 ERP | `erp_students`、`erp_classes`、`erp_courses` | 仅精确计数             |
| 课程资产 | `edu_assets`                                 | 仅精确计数             |
| 成长档案 | `erp_growth_archives`                        | 仅精确计数             |
| 课堂事件 | 未接入                                       | 保留演示数据并明确标记 |
| 设备遥测 | 未接入                                       | 保留演示数据并明确标记 |

## 本地验收

```bash
pnpm check:xmp
pnpm dev
pnpm test:xmp:e2e
```

浏览器测试会检查快照响应头 `X-XMP-Privacy: aggregate-only`、隐私声明、敏感字段缺失以及十三大模块回归。
