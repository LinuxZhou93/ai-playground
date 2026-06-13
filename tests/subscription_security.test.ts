import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 自研轻量级 env 加载，免去对 dotenv 的物理依赖
// 使用 process.cwd() 锚定根目录，防止 vitest 临时路径编译漂移
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log('supabaseUrl len:', supabaseUrl.length);
  console.log('supabaseAnonKey len:', supabaseAnonKey.length);
  console.log('supabaseServiceKey len:', supabaseServiceKey.length);
  throw new Error('测试所需的 Supabase 环境变量未配置完整，请检查 .env 文件。');
}

console.log('[DEBUG] supabaseServiceKey len:', supabaseServiceKey.length);
console.log('[DEBUG] supabaseServiceKey starting with:', supabaseServiceKey.substring(0, 15));

// 初始化两个客户端：一个特权管理员客户端，一个普通用户模拟客户端
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

describe('zhouxiaomai.com 卡密兑换与 RLS 安全加固集成测试', () => {
  let testUser: any = null;
  let userClient: any = null;
  let testVoucherCode = 'VIP-TEST-7D-ABC123XYZ';

  beforeAll(async () => {
    // 1. 创建临时的测试用户
    const email = `test_security_user_${Date.now()}@example.com`;
    const password = 'TestSecurePassword123!';
    
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError || !userData.user) {
      throw new Error('创建测试用户失败: ' + createError?.message);
    }
    testUser = userData.user;

    // 2. 登录测试用户以获取 JWT token 模拟客户端
    const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (signInError || !sessionData.session) {
      throw new Error('登录测试用户失败: ' + signInError?.message);
    }

    userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      }
    });

    // 3. 为该测试用户生成初始的 profiles 表记录 (以防触发 RLS 校验异常)
    const { error: pError } = await supabaseAdmin.from('profiles').insert({
      id: testUser.id,
      username: `testuser_${Date.now()}`,
      expiry_date: null
    });
    if (pError) console.warn('初始化 Profile 警告:', pError.message);

    // 4. 在 vouchers 表中插入一张未兑换的 7 天测试卡密
    // 先清理原有可能残留的相同卡密
    await supabaseAdmin.from('vouchers').delete().eq('code', testVoucherCode);
    const { error: vError } = await supabaseAdmin.from('vouchers').insert({
      code: testVoucherCode,
      duration_months: 0, // 0 个月代表 7 天试用卡
      status: 'active'
    });
    if (vError) {
      throw new Error('创建测试卡密失败: ' + vError.message);
    }
  });

  afterAll(async () => {
    // 清理创建的测试卡密
    if (testVoucherCode) {
      await supabaseAdmin.from('vouchers').delete().eq('code', testVoucherCode);
    }
    // 清理测试用户 (同时会级联删除对应的 profile)
    if (testUser) {
      await supabaseAdmin.auth.admin.deleteUser(testUser.id);
    }
  });

  it('🔒 渗透测试：普通用户绝对无法直接通过客户端 update 修改 profiles 表的 expiry_date', async () => {
    // 尝试在客户端恶意越权修改自己的过期时间为 2099 年
    const fakeExpiry = '2099-12-31T23:59:59.000Z';
    const { error } = await userClient
      .from('profiles')
      .update({ expiry_date: fakeExpiry })
      .eq('id', testUser.id);

    // 如果修改被 RLS 拦截，应该返回错误，或者受影响行数为 0（由于 WITH CHECK 拒绝）
    if (error) {
      expect(error.message).toMatch(/(violates row-level security|policy)/i);
    } else {
      // 如果没有报错，再获取一次，确认 expiry_date 没有被修改成功
      const { data: checkData } = await supabaseAdmin
        .from('profiles')
        .select('expiry_date')
        .eq('id', testUser.id)
        .single();
      expect(checkData?.expiry_date).not.toBe(fakeExpiry);
    }
  });

  it('🚀 兑换流：用户可以使用正常的卡密，通过 RPC 原子事务完成兑换，顺延 VIP 时间', async () => {
    // 调用特权 RPC 兑换
    const { data: redeemData, error: redeemError } = await userClient.rpc('redeem_voucher', {
      p_voucher_code: testVoucherCode
    });

    expect(redeemError).toBeNull();
    expect(redeemData.success).toBe(true);
    expect(redeemData.duration_applied).toBe(0); // 7天卡

    // 检查 profiles 中的到期时间是否在今天之后的 7 天左右
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('expiry_date')
      .eq('id', testUser.id)
      .single();

    expect(profile?.expiry_date).not.toBeNull();
    const expiry = new Date(profile.expiry_date);
    const diffDays = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 3600 * 24));
    expect(diffDays).toBeGreaterThanOrEqual(6);
    expect(diffDays).toBeLessThanOrEqual(8);

    // 检查 vouchers 表状态是否已被修改为 'used'，且 used_by 正确对齐
    const { data: voucher } = await supabaseAdmin
      .from('vouchers')
      .select('status, used_by, used_at')
      .eq('code', testVoucherCode)
      .single();

    expect(voucher?.status).toBe('used');
    expect(voucher?.used_by).toBe(testUser.id);
    expect(voucher?.used_at).not.toBeNull();
  });

  it('❌ 并发/安全性防御：同一个已兑换的卡密无法被再次兑换', async () => {
    // 再次请求同一张卡密，确认报错
    const { data, error } = await userClient.rpc('redeem_voucher', {
      p_voucher_code: testVoucherCode
    });

    expect(data).toBeNull();
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/(已被使用|used)/i);
  });
});
