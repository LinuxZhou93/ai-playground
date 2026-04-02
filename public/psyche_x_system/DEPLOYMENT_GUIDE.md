# Psyche-X™ 部署指南

## 🚀 生产环境部署

### 环境要求

**服务器配置**:
- CPU: 4核心以上
- 内存: 8GB 以上
- 存储: 100GB SSD
- 操作系统: Ubuntu 20.04 LTS / CentOS 8

**软件依赖**:
- Python 3.9+
- PostgreSQL 13+
- Redis 6+
- Nginx 1.18+

---

## 📦 安装步骤

### 1. 克隆代码
```bash
git clone https://github.com/your-org/psyche-x.git
cd psyche-x
```

### 2. 配置数据库
```bash
# 创建 PostgreSQL 数据库
sudo -u postgres psql
CREATE DATABASE psyche_x;
CREATE USER psyche_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE psyche_x TO psyche_admin;
\q
```

### 3. 配置环境变量
```bash
cp .env.example .env
nano .env
```

```.env
# 数据库配置
DATABASE_URL=postgresql://psyche_admin:your_secure_password@localhost/psyche_x

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# 安全配置
SECRET_KEY=your_very_long_random_secret_key_here
JWT_SECRET=another_random_secret_for_jwt

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# 系统配置
ENVIRONMENT=production
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

### 4. 安装 Python 依赖
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 5. 数据库迁移
```bash
# 使用 Alembic 进行数据库迁移
alembic upgrade head
```

### 6. 配置 Nginx
```nginx
# /etc/nginx/sites-available/psyche-x
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/psyche-x/frontend;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 支持
    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 7. 配置 SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 8. 配置 Systemd 服务
```ini
# /etc/systemd/system/psyche-x.service
[Unit]
Description=Psyche-X FastAPI Application
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/psyche-x/backend
Environment="PATH=/var/www/psyche-x/backend/venv/bin"
ExecStart=/var/www/psyche-x/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable psyche-x
sudo systemctl start psyche-x
```

---

## 🔒 安全加固

### 1. 防火墙配置
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 数据库安全
```sql
-- 限制数据库访问
ALTER USER psyche_admin WITH PASSWORD 'new_strong_password';
REVOKE ALL ON DATABASE psyche_x FROM PUBLIC;
```

### 3. Redis 安全
```bash
# /etc/redis/redis.conf
bind 127.0.0.1
requirepass your_redis_password
```

### 4. 应用安全
- 启用 HTTPS
- 配置 CORS 白名单
- 启用速率限制
- 实施 JWT 认证
- 加密敏感数据

---

## 📊 监控与日志

### 1. 应用日志
```python
# backend/logging_config.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/psyche-x/app.log'),
        logging.StreamHandler()
    ]
)
```

### 2. Nginx 日志
```nginx
access_log /var/log/nginx/psyche-x-access.log;
error_log /var/log/nginx/psyche-x-error.log;
```

### 3. 性能监控
```bash
# 安装 Prometheus + Grafana
docker-compose -f monitoring/docker-compose.yml up -d
```

---

## 🔄 备份策略

### 1. 数据库备份
```bash
# 每日自动备份脚本
#!/bin/bash
# /usr/local/bin/backup-psyche-x.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/psyche-x"

# 备份数据库
pg_dump -U psyche_admin psyche_x | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 保留最近30天的备份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

```bash
# 添加到 crontab
0 2 * * * /usr/local/bin/backup-psyche-x.sh
```

### 2. 文件备份
```bash
# 备份上传的文件和配置
rsync -av /var/www/psyche-x/uploads /backups/psyche-x/uploads_$DATE
```

---

## 📈 性能优化

### 1. 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX idx_exam_results_completed_at ON exam_results(completed_at);

-- 定期 VACUUM
VACUUM ANALYZE;
```

### 2. Redis 缓存
```python
# 缓存用户会话
CACHE_TTL = 3600  # 1小时
redis_client.setex(f"user:{user_id}", CACHE_TTL, user_data)
```

### 3. CDN 配置
```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔧 故障排查

### 常见问题

**1. 数据库连接失败**
```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 检查连接
psql -U psyche_admin -d psyche_x -h localhost
```

**2. 应用无法启动**
```bash
# 查看日志
sudo journalctl -u psyche-x -n 50

# 检查端口占用
sudo netstat -tulpn | grep 8000
```

**3. 性能问题**
```bash
# 检查系统资源
htop
iotop

# 检查慢查询
tail -f /var/log/postgresql/postgresql-13-main.log
```

---

## 📞 技术支持

- 文档: https://docs.psyche-x.com
- 邮箱: support@psyche-x.com
- GitHub: https://github.com/your-org/psyche-x/issues

---

**Psyche-X™ - Production Ready Deployment**

*Last Updated: 2024-12-10*
