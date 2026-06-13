import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { setAuthCookies, getAuthCookies } from '../app/erp/auth-actions';
import { encryptSession, decryptSession } from '../lib/crypto';
import * as fs from 'fs';
import * as path from 'path';

// 轻量级加载本地 env 以便密钥对齐
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
    process.env[key] = val;
  });
}

// 模拟 Next.js 的 next/headers 中的 cookies 接口
// 这是一个经典的 Vitest mock 技巧
const mockCookiesStore = new Map<string, string>();

vi.mock('next/headers', () => {
  return {
    cookies: async () => ({
      get: (name: string) => {
        const val = mockCookiesStore.get(name);
        return val ? { name, value: val } : undefined;
      },
      set: (name: string, value: string) => {
        mockCookiesStore.set(name, value);
      },
      delete: (name: string) => {
        mockCookiesStore.delete(name);
      }
    })
  };
});

describe('CHRONOS ERP 鉴权防伪造与越权安全测试', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockCookiesStore.clear();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('🔒 渗透加固：生产环境下，单纯修改明文 X-FC-Role Cookie，鉴权一律安全退回 GUEST', async () => {
    // 强制设为 production
    process.env.NODE_ENV = 'production';
    
    // 模拟黑客攻击：在客户端修改明文 Cookie 企图伪造超级管理员
    mockCookiesStore.set('X-FC-Role', 'ADMIN');
    mockCookiesStore.set('X-FC-Campus-Name', 'ALL');

    // 运行 auth 接口
    const auth = await getAuthCookies();

    // 必须被拦截并重置为 GUEST 最低权限
    expect(auth.role).toBe('GUEST');
    expect(auth.campus_id).toBe('');
  });

  it('🔒 渗透加固：伪造或篡改 X-FC-Auth-Token 密文，解密失败，一律退回 GUEST', async () => {
    process.env.NODE_ENV = 'production';
    
    // 伪造非法的加密 session token
    mockCookiesStore.set('X-FC-Auth-Token', 'illegal-iv-part.illegal-ciphertext-part');

    const auth = await getAuthCookies();

    // 必须解密失败退回到 GUEST
    expect(auth.role).toBe('GUEST');
  });

  it('🚀 授权逻辑：合法的 Token 在生产环境下能够被安全解密并正确授信', async () => {
    process.env.NODE_ENV = 'production';

    // 1. 调用特权 Action 写入 Cookie
    await setAuthCookies('TEACHER', '太古里校区', 'camp-2');

    // 验证密文 Cookie 已经生成
    expect(mockCookiesStore.has('X-FC-Auth-Token')).toBe(true);
    const token = mockCookiesStore.get('X-FC-Auth-Token') || '';
    expect(token.includes('.')).toBe(true);

    // 2. 调用读 API 校验解密
    const auth = await getAuthCookies();

    // 校验解析出的字段与写入的 payload 完全一致
    expect(auth.role).toBe('TEACHER');
    expect(auth.campus_name).toBe('太古里校区');
    expect(auth.campus_id).toBe('camp-2');
  });

  it('🛠️ 开发环境兼容：在本地 development 环境下，无加密 Token 时，自动降级兼容原有的明文 Mock 方便联调', async () => {
    process.env.NODE_ENV = 'development';

    // 模拟本地测试：仅提供明文 X-FC-Role
    mockCookiesStore.set('X-FC-Role', 'SALES');
    mockCookiesStore.set('X-FC-Campus-Name', '高新校区');

    const auth = await getAuthCookies();

    // 允许通过明文读取以方便开发
    expect(auth.role).toBe('SALES');
    expect(auth.campus_name).toBe('高新校区');
  });
});
