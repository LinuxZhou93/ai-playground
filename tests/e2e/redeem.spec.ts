import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// 初始化特权 Supabase 客户端以在测试中操作数据库
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-service-role-key-placeholder';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const testUserId = 'test-user-redeem-id';
const testUserEmail = 'redeem-test@example.com';

const invalidCode = 'INVALID-CODE-123456';
const usedCode = 'USED-CODE-123456';
const validCode = 'VALID-CODE-123456';

test.beforeAll(async () => {
  // 1. 清理测试数据
  await supabaseAdmin.from('redeem_codes').delete().in('code', [usedCode, validCode]);
  await supabaseAdmin.from('user_subscriptions').delete().eq('user_id', testUserId);
  await supabaseAdmin.from('profiles').delete().eq('id', testUserId);

  // 2. 插入测试卡密
  // 已使用的卡密
  await supabaseAdmin.from('redeem_codes').insert({
    code: usedCode,
    is_used: true,
    used_by: 'another-user-id',
    used_at: new Date().toISOString(),
    duration_days: 30,
  });

  // 有效未使用的卡密
  await supabaseAdmin.from('redeem_codes').insert({
    code: validCode,
    is_used: false,
    duration_days: 30,
  });

  // 3. 插入测试用户 profile
  await supabaseAdmin.from('profiles').insert({
    id: testUserId,
    email: testUserEmail,
    nickname: '测试核销员',
  });
});

test.afterAll(async () => {
  // 清理测试数据
  await supabaseAdmin.from('redeem_codes').delete().in('code', [usedCode, validCode]);
  await supabaseAdmin.from('user_subscriptions').delete().eq('user_id', testUserId);
  await supabaseAdmin.from('profiles').delete().eq('id', testUserId);
});

test.beforeEach(async ({ page }) => {
  // 模拟用户登录状态
  await page.goto('/');
  await page.evaluate(({ email, id }) => {
    localStorage.setItem('current_user_email', email);
    localStorage.setItem('current_user_id', id);
  }, { email: testUserEmail, id: testUserId });
});

test('输入无效卡密时应该显示错误提示', async ({ page }) => {
  await page.goto('/redeem');

  // 等待页面加载并确认当前登录账号显示正确
  const emailInput = page.locator('#user-email');
  await expect(emailInput).toHaveValue(testUserEmail);

  // 输入无效卡密
  await page.fill('#redeem-code', invalidCode);
  await page.click('button[type="submit"]');

  // 验证错误提示 (sonner toast)
  const toast = page.locator('li[data-sonner-toast]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('无效卡密');
});

test('输入已使用卡密时应该拦截并显示错误提示', async ({ page }) => {
  await page.goto('/redeem');

  // 输入已使用卡密
  await page.fill('#redeem-code', usedCode);
  await page.click('button[type="submit"]');

  // 验证错误提示
  const toast = page.locator('li[data-sonner-toast]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('该卡密已被使用');
});

test('输入有效卡密后成功激活会员并跳转至个人中心，且数据库状态更新', async ({ page }) => {
  await page.goto('/redeem');

  // 输入有效卡密
  await page.fill('#redeem-code', validCode);
  await page.click('button[type="submit"]');

  // 验证成功提示
  const toast = page.locator('li[data-sonner-toast]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('卡密核销成功');

  // 验证是否跳转回首页 (个人中心)
  await expect(page).toHaveURL('/', { timeout: 5000 });

  // 验证数据库中该卡密的状态已被标记为已核销
  const { data: redeemCode, error } = await supabaseAdmin
    .from('redeem_codes')
    .select('*')
    .eq('code', validCode)
    .single();

  expect(error).toBeNull();
  expect(redeemCode).not.toBeNull();
  expect(redeemCode.is_used).toBe(true);
  expect(redeemCode.used_by).toBe(testUserId);
  expect(redeemCode.used_at).not.toBeNull();

  // 验证用户订阅状态已更新为 active
  const { data: subscription } = await supabaseAdmin
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', testUserId)
    .single();

  expect(subscription).not.toBeNull();
  expect(subscription.status).toBe('active');
  expect(new Date(subscription.current_period_end).getTime()).toBeGreaterThan(Date.now());
});