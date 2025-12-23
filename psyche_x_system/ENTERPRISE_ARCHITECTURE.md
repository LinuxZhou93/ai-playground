# Psyche-X™ Enterprise Architecture Design

## 🏛️ 系统架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                    Psyche-X™ Enterprise Platform                │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │ Frontend │          │ Backend │          │  Admin  │
   │  Layer   │          │   API   │          │  Portal │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Data Layer      │
                    ├───────────────────┤
                    │ PostgreSQL / MySQL│
                    │ Redis Cache       │
                    │ S3 Storage        │
                    └───────────────────┘
```

---

## 📦 核心模块架构

### 1. 用户管理系统 (User Management)

#### 1.1 多角色权限体系
```python
class UserRole(Enum):
    SUPER_ADMIN = "super_admin"      # 超级管理员
    ADMIN = "admin"                  # 机构管理员
    TEACHER = "teacher"              # 教师/测评师
    STUDENT = "student"              # 学生/受试者
    RESEARCHER = "researcher"        # 研究员
    GUEST = "guest"                  # 访客
```

#### 1.2 权限矩阵
| 功能 | Super Admin | Admin | Teacher | Student | Researcher |
|------|-------------|-------|---------|---------|------------|
| 创建机构 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 管理用户 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 查看所有数据 | ✅ | ✅ | ✅ | ❌ | ✅ |
| 导出报告 | ✅ | ✅ | ✅ | ❌ | ✅ |
| 参加测评 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 修改系统配置 | ✅ | ❌ | ❌ | ❌ | ❌ |

#### 1.3 组织架构
```
Enterprise (企业/学校)
  └── Department (部门/年级)
       └── Class (班级/小组)
            └── User (用户)
```

---

### 2. 数据分析仪表板 (Analytics Dashboard)

#### 2.1 实时统计面板
```javascript
Dashboard Metrics:
├── 今日活跃用户数
├── 本周完成测评数
├── 平均认知得分趋势
├── 各维度能力分布
├── 异常数据预警
└── 系统健康状态
```

#### 2.2 可视化图表
- **折线图**: 时间序列趋势
- **柱状图**: 群体对比分析
- **饼图**: 等级分布
- **热力图**: 能力矩阵
- **散点图**: 相关性分析
- **箱线图**: 离群值检测

#### 2.3 数据钻取
```
Level 1: 机构总览
  └── Level 2: 部门对比
       └── Level 3: 班级详情
            └── Level 4: 个人轨迹
```

---

### 3. 批量测评系统 (Batch Assessment)

#### 3.1 测评计划管理
```python
class AssessmentPlan:
    id: int
    name: str                    # 计划名称
    organization_id: int         # 所属机构
    target_users: List[int]      # 目标用户
    start_date: datetime
    end_date: datetime
    task_config: Dict            # 任务配置
    status: PlanStatus           # 进行中/已完成/已取消
    created_by: int              # 创建者
```

#### 3.2 批量导入
- **Excel 模板**: 批量导入用户信息
- **CSV 支持**: 兼容第三方系统
- **数据验证**: 自动检查格式错误
- **错误报告**: 详细的导入日志

#### 3.3 进度追踪
```
测评计划: "2024秋季认知评估"
├── 总人数: 500
├── 已完成: 342 (68.4%)
├── 进行中: 89 (17.8%)
├── 未开始: 69 (13.8%)
└── 平均用时: 8.5 分钟
```

---

### 4. 报告生成引擎 (Report Engine)

#### 4.1 多格式导出
```python
class ReportFormat(Enum):
    PDF = "pdf"              # Adobe PDF
    EXCEL = "xlsx"           # Microsoft Excel
    CSV = "csv"              # 逗号分隔值
    JSON = "json"            # 结构化数据
    HTML = "html"            # 网页报告
```

#### 4.2 报告模板系统
```
Templates/
├── individual_report.html      # 个人详细报告
├── class_summary.html          # 班级汇总报告
├── organization_overview.html  # 机构总览报告
├── research_data.html          # 科研数据报告
└── custom_template.html        # 自定义模板
```

#### 4.3 报告内容
**个人报告**:
- 封面（姓名、日期、机构）
- 测评概况（得分、等级、排名）
- 能力雷达图
- 各维度详细分析
- 历史趋势对比
- 个性化建议
- 附录（原始数据）

**班级报告**:
- 整体统计
- 能力分布
- 优秀/需关注学生
- 班级排名
- 同比/环比分析

---

### 5. 系统配置中心 (Configuration Center)

#### 5.1 测评参数配置
```yaml
assessment_config:
  dual_n_back:
    trials: 20                    # 试炼次数
    duration: 2500                # 刺激持续时间 (ms)
    initial_level: 2              # 初始难度
    max_level: 5                  # 最大难度
    min_level: 1                  # 最小难度
    adaptive_threshold_up: 0.8    # 升级阈值
    adaptive_threshold_down: 0.5  # 降级阈值
    letters: ['C','H','K','L','Q','R','S','T']
```

#### 5.2 评分标准配置
```yaml
grading_standards:
  grade_A: [90, 100]
  grade_B: [75, 90)
  grade_C: [60, 75)
  grade_D: [45, 60)
  grade_E: [0, 45)
  
  percentile_A: 90    # 前10%
  percentile_B: 70    # 前30%
  percentile_C: 40    # 前60%
  percentile_D: 15    # 前85%
```

#### 5.3 系统行为配置
```yaml
system_behavior:
  session_timeout: 3600           # 会话超时 (秒)
  max_concurrent_users: 1000      # 最大并发
  data_retention_days: 365        # 数据保留期
  backup_frequency: "daily"       # 备份频率
  log_level: "INFO"               # 日志级别
  enable_analytics: true          # 启用分析
  enable_notifications: true      # 启用通知
```

---

### 6. 日志审计系统 (Audit Logging)

#### 6.1 操作日志
```python
class AuditLog:
    id: int
    timestamp: datetime
    user_id: int
    user_role: str
    action: str              # CREATE/READ/UPDATE/DELETE
    resource_type: str       # User/Assessment/Report
    resource_id: int
    ip_address: str
    user_agent: str
    status: str              # SUCCESS/FAILED
    details: Dict            # 详细信息
```

#### 6.2 日志类型
- **登录日志**: 用户登录/登出
- **操作日志**: CRUD 操作
- **数据访问日志**: 敏感数据查看
- **系统日志**: 错误、警告、性能
- **安全日志**: 异常行为检测

#### 6.3 日志分析
```sql
-- 查询最活跃用户
SELECT user_id, COUNT(*) as action_count
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY action_count DESC
LIMIT 10;

-- 检测异常登录
SELECT user_id, ip_address, COUNT(*) as login_attempts
FROM audit_logs
WHERE action = 'LOGIN' AND status = 'FAILED'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY user_id, ip_address
HAVING COUNT(*) > 5;
```

---

## 🔐 安全架构

### 7. 认证与授权 (Authentication & Authorization)

#### 7.1 JWT Token 体系
```python
Token Structure:
{
  "user_id": 12345,
  "role": "teacher",
  "organization_id": 100,
  "permissions": ["read:users", "write:assessments"],
  "exp": 1702345678,
  "iat": 1702342078
}
```

#### 7.2 密码策略
- **最小长度**: 8 字符
- **复杂度要求**: 大写+小写+数字+特殊字符
- **历史限制**: 不能重复最近5次密码
- **过期策略**: 90天强制更换
- **锁定机制**: 5次失败后锁定30分钟

#### 7.3 数据加密
```
传输层: TLS 1.3
存储层: AES-256
密码: bcrypt (cost=12)
敏感字段: RSA-2048
```

---

## 📊 数据库架构

### 8. 数据模型扩展

#### 8.1 核心表结构
```sql
-- 组织表
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),  -- school/enterprise/research
    contact_email VARCHAR(255),
    license_key VARCHAR(255),
    max_users INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 部门表
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    organization_id INT REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 用户表（扩展）
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    organization_id INT REFERENCES organizations(id),
    department_id INT REFERENCES departments(id),
    full_name VARCHAR(255),
    age INT,
    grade VARCHAR(50),
    gender VARCHAR(10),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 测评计划表
CREATE TABLE assessment_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization_id INT REFERENCES organizations(id),
    created_by INT REFERENCES users(id),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    task_config JSONB,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 计划参与者表
CREATE TABLE plan_participants (
    id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES assessment_plans(id),
    user_id INT REFERENCES users(id),
    status VARCHAR(50),  -- pending/in_progress/completed
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- 审计日志表
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(100),
    resource_type VARCHAR(100),
    resource_id INT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    status VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 8.2 索引优化
```sql
-- 性能优化索引
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_dept ON users(department_id);
CREATE INDEX idx_results_user ON exam_results(user_id);
CREATE INDEX idx_results_completed ON exam_results(completed_at);
CREATE INDEX idx_audit_user_time ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

---

## 🚀 微服务架构（可选）

### 9. 服务拆分

```
┌─────────────────────────────────────────────────┐
│              API Gateway (Kong/Nginx)           │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐   ┌───▼────┐   ┌───▼────┐
   │  Auth   │   │  Core  │   │ Report │
   │ Service │   │Service │   │Service │
   └─────────┘   └────────┘   └────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
              ┌───────▼────────┐
              │  Message Queue │
              │  (RabbitMQ)    │
              └────────────────┘
```

#### 9.1 服务职责
- **Auth Service**: 认证、授权、用户管理
- **Core Service**: 测评逻辑、数据存储
- **Report Service**: 报告生成、数据分析
- **Notification Service**: 邮件、短信通知
- **Analytics Service**: 实时统计、数据挖掘

---

## 📈 性能优化

### 10. 缓存策略

#### 10.1 Redis 缓存层
```python
Cache Strategy:
├── User Session: TTL=3600s
├── User Profile: TTL=1800s
├── Assessment Config: TTL=86400s
├── Report Cache: TTL=3600s
└── Leaderboard: TTL=300s
```

#### 10.2 数据库优化
- **读写分离**: Master-Slave 架构
- **分库分表**: 按机构/时间分片
- **连接池**: 最大100连接
- **查询优化**: 慢查询日志分析

---

## 🔔 通知系统

### 11. 多渠道通知

```python
class NotificationChannel(Enum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"
    WEBHOOK = "webhook"

Notification Types:
├── 测评完成通知
├── 报告生成通知
├── 计划开始提醒
├── 异常数据预警
├── 系统维护通知
└── 账户安全提醒
```

---

## 📱 移动端支持

### 12. 响应式设计 + Native App

```
Platform Support:
├── Web (Desktop)
├── Web (Mobile)
├── iOS App (Swift)
├── Android App (Kotlin)
└── WeChat Mini Program
```

---

## 🌐 国际化 (i18n)

### 13. 多语言支持

```javascript
Supported Languages:
├── 简体中文 (zh-CN)
├── 繁体中文 (zh-TW)
├── English (en-US)
├── 日本語 (ja-JP)
├── 한국어 (ko-KR)
└── Español (es-ES)
```

---

## 📊 商业智能 (BI)

### 14. 数据仓库

```sql
Data Warehouse Schema:
├── Fact Tables
│   ├── fact_assessments
│   ├── fact_scores
│   └── fact_user_activities
└── Dimension Tables
    ├── dim_users
    ├── dim_organizations
    ├── dim_time
    └── dim_tasks
```

---

**Psyche-X™ Enterprise - Million-Dollar Architecture**

*Designed for Scale, Built for Excellence*
