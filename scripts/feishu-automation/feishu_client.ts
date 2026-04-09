import fs from 'fs';

/**
 * 飞书底层 API 客服端 (Mozi Feishu Automator)
 * 作用：当 MCP 标准操作不够用，或者需要将飞书逻辑融合进前端 Next.js / Supabase Backend 时，
 * 本工具提供最底层的飞书 Open API 全量操作能力。
 */

const APP_ID = process.env.FEISHU_APP_ID || "cli_a92f175836389bd3";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We";

class FeishuClient {
  private tenantAccessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  /**
   * 获取并缓存 Tenant Access Token
   */
  async getTenantAccessToken(): Promise<string> {
    if (this.tenantAccessToken && Date.now() < this.tokenExpiresAt) {
      return this.tenantAccessToken;
    }

    const response = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        app_id: APP_ID,
        app_secret: APP_SECRET,
      }),
    });

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(`Failed to get Feishu token: ${data.msg}`);
    }

    this.tenantAccessToken = data.tenant_access_token;
    // 提前 5 分钟过期以防万一
    this.tokenExpiresAt = Date.now() + (data.expire - 300) * 1000;
    
    return this.tenantAccessToken;
  }

  /**
   * 通用 API 请求包装器
   */
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getTenantAccessToken();
    
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
      ...(options.headers || {}),
    };

    const response = await fetch(`https://open.feishu.cn/open-apis${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (data.code !== 0) {
      console.error(`[Feishu API Error] ${endpoint}:`, data);
    }
    return data;
  }

  // ============== 自动化能力扩展区 ==============

  /**
   * 1. 发送消息到指定用户或群组 (消息自动化)
   * receive_id_type 可选: open_id, user_id, union_id, email, chat_id
   */
  async sendMessage(receive_id_type: string, receive_id: string, content: string, msg_type: string = 'text') {
    return this.request(`/im/v1/messages?receive_id_type=${receive_id_type}`, {
      method: "POST",
      body: JSON.stringify({
        receive_id,
        content: JSON.stringify({ text: content }), 
        msg_type,
      })
    });
  }

  /**
   * 2. 云文档：将 Markdown 导入为云端文档
   */
  // TODO: 实现 markdown 批量转接导入飞书空间
}

export const feishu = new FeishuClient();
