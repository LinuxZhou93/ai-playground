import { test, expect } from '@playwright/test';

const testUserId = 'test-user-redeem-id';
const testUserEmail = 'redeem-test@example.com';

const invalidCode = 'INVALID-CODE-123456';
const usedCode = 'USED-CODE-123456';
const validCode = 'VALID-CODE-123456';

test.beforeEach(async ({ page }) => {
  // 模拟用户登录状态
  await page.goto('/');
  await page.evaluate(({ email, id }) => {
    localStorage.setItem('current_user_email', email);
    localStorage.setItem('current_user_id', id);
  }, { email: testUserEmail, id: testUserId });

  // 拦截卡密核销接口，进行精细的 UI-level mock
  await page.route('**/api/redeem', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      const body = req.postDataJSON();
      const { code } = body;

      if (code === invalidCode) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: '无效卡密' }),
        });
      } else if (code === usedCode) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: '该卡密已被使用' }),
        });
      } else if (code === validCode) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
            durationDays: 30,
          }),
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: '未知卡密错误' }),
        });
      }
    } else {
      await route.continue();
    }
  });
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

test('输入有效卡密后成功激活会员并跳转至个人中心', async ({ page }) => {
  await page.goto('/redeem');

  // 输入有效卡密
  await page.fill('#redeem-code', validCode);
  await page.click('button[type="submit"]');

  // 验证成功提示
  const toast = page.locator('li[data-sonner-toast]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('卡密核销成功');

  // 验证是否跳转回首页
  await expect(page).toHaveURL('/', { timeout: 5000 });
});