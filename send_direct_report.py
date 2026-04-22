import smtplib
from email.mime.text import MIMEText
from email.header import Header

# 配置
smtp_server = "smtp.qq.com"
smtp_port = 465
sender_email = "406371738@qq.com"
receiver_email = "406371738@qq.com"
auth_code = "skzaipdgbyfpbiej"

# 邮件内容
subject = "📦 Carbon-X 项目汇报 (Unit3 手机实时调度成功)"
body = """
尊敬的老板：

这是一封由您的手机发出的指令驱动产生的实时汇报邮件。

【核心进展】
1. 🔗 10维关系型Bitable看板：已经全量联动并刷新。
   查看地址：https://feishu.cn/base/BcqsbfIlNaw6p9segJqcSDnjnOg
2. 🦞 OpenClaw Webhook：本地网关已正式调通，双向反馈链路已闭环。
3. 💻 手机实时调度：Unit3 (Antigravity) 核心已能根据飞书信息流实时执行任务。

【当前环境】
- 项目：Carbon-X Graphene Curriculum
- 代理：Antigravity Agent (Unit 3)
- 网关：OpenClaw Feishu Bridge

任务执行完毕。
"""

def send_email():
    try:
        msg = MIMEText(body, 'plain', 'utf-8')
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = Header(subject, 'utf-8')

        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        server.login(sender_email, auth_code)
        server.sendmail(sender_email, [receiver_email], msg.as_string())
        server.quit()
        print("✅ 邮件已从 406371738@qq.com 成功汇出！")
    except Exception as e:
        print(f"❌ 发送失败: {e}")

if __name__ == "__main__":
    send_email()
