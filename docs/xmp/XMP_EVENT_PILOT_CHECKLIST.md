# XMP 事件链试点迁移清单

状态：仅供本地评审，当前未执行数据库迁移、未连接真实儿童数据、未发布云端。

## 1. 迁移前决策

- 明确试点园所、数据控制者、处理目的、事件责任人和退出机制。
- 完成个人信息保护影响评估，确认事件中不保存儿童姓名、电话、证件、监护关系和原始音视频。
- 确认匿名 30 天、聚合 90 天、教师审核 180 天是否满足园所制度与法律意见。
- 确认 FutureClass JWT 的 `app_metadata.campus_id` 或 `user_metadata.campus_id` 为可信园所声明。

## 2. 数据库评审

- 在隔离的 Supabase 试点项目人工评审 `database/xmp_event_fabric.sql`。
- 使用迁移角色执行脚本，不把 service-role 写入浏览器、仓库、截图或日志。
- 分别以 anon、错误园所用户、正确园所用户和 service-role 验证权限。
- 验证普通角色无法 INSERT、UPDATE、DELETE；正确园所用户只能 SELECT 本园事件。
- 对同一 `(tenant_id, idempotency_key)` 重复提交，确认只存在一条记录。
- 验证更新触发器拒绝修改历史，留存函数只能由 service-role 执行。

## 3. 应用配置

仅在试点环境配置：

```text
XMP_EVENT_MODE=futureclass-server
XMP_TENANT_ID=<pilot-campus-id>
NEXT_PUBLIC_SUPABASE_URL=<pilot-project-url>
SUPABASE_SERVICE_ROLE_KEY=<server-secret>
```

浏览器不可获得 `SUPABASE_SERVICE_ROLE_KEY` 或提交 `tenantId`。启用后，事件中心应显示“园所事件服务已连接”；未登录、租户不匹配或配置缺失时必须保持只读/本地队列。

## 4. 试点验收

- 断网产生课堂事件，恢复网络后 Outbox 自动补传且无重复记录。
- 跨页面完成课堂开始、证据候选、教师确认、家庭发布和设备诊断闭环。
- 验证 API 拒绝额外字段、错配业务域、超长载荷和明显电话/证件/邮箱。
- 验证 API 错误不暴露数据库地址、SQL、密钥、表结构或儿童信息。
- 建立同步失败告警、死信处理人、审计导出审批和试点终止删除记录。

## 5. 发布闸门

只有数据库权限测试、应用验收、影响评估、园所授权、故障回滚和删除演练全部签字后，才允许进入受控试点。任何生产发布与云端部署仍需用户单独明确批准。
