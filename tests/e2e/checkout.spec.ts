import { test, expect } from '@playwright/test';

const testUserId = 'test-user-checkout-id';
const testUserEmail = 'checkout-test@example.com';
const validCode = 'VALID-CODE-123456';

test.describe('Stripe Checkout and Card Redemption Full Flow E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // 模拟登录，预置 localStorage
    await page.goto('/');
    await page.evaluate(({ email, id }) => {
      localStorage.setItem('current_user_email', email);
      localStorage.setItem('current_user_id', id);
    }, { email: testUserEmail, id: testUserId });

    // 拦截 Stripe Checkout API，并返回 mock 的 checkout 会话 url
    await page.route('**/api/subscription/checkout', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            url: `/mock-stripe-checkout?tier=${body.tier}&userId=${body.userId}&userEmail=${body.userEmail}`
          })
        });
      } else {
        await route.continue();
      }
    });

    // 拦截 Mock Stripe Checkout 结算网关页面
    await page.route('**/mock-stripe-checkout*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head><title>Stripe Checkout Sandbox</title></head>
            <body style="background:#03050c;color:#cbd5e1;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:sans-serif;">
              <h1 style="color:#22d3ee;font-size:32px;margin-bottom:8px;">Stripe Mock Checkout Gateway</h1>
              <p style="color:#94a3b8;margin-bottom:24px;">Simulating secure credit card payment with test cards...</p>
              <button id="pay-success-btn" style="background:#10b981;color:black;padding:14px 28px;border:none;border-radius:12px;font-size:16px;cursor:pointer;font-weight:bold;transition:all 0.2s;">
                Pay Successfully (Use Stripe Test Card)
              </button>
              <script>
                document.getElementById('pay-success-btn').onclick = () => {
                  window.location.href = '/zh/pricing?payment_status=success';
                };
              </script>
            </body>
          </html>
        `
      });
    });

    // 拦截卡密核销接口
    await page.route('**/api/redeem', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        if (body.code === validCode) {
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
            body: JSON.stringify({ error: '无效卡密' }),
          });
        }
      } else {
        await route.continue();
      }
    });

    // 拦截订阅状态接口
    await page.route('**/api/subscription/status*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isVIP: true,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        }),
      });
    });
  });

  test('should complete purchase flow and redeem card code successfully', async ({ page }) => {
    // 1. 访问中文定价页
    await page.goto('/zh/pricing');
    await expect(page.locator('[data-testid="pricing-title"]')).toContainText('加入 FUTURE 计划');

    // 2. 点击月度套餐的“挂载引擎”按钮触发 checkout 重定向
    const monthlyBtn = page.locator('button:has-text("挂载引擎")');
    await monthlyBtn.click();

    // 3. 验证是否成功重定向至 Mock Stripe Checkout 页面
    await page.waitForURL('**/mock-stripe-checkout*');
    await expect(page.locator('h1')).toHaveText('Stripe Mock Checkout Gateway');

    // 4. 在 mock Stripe 结算页上点击“模拟支付成功”
    await page.click('#pay-success-btn');

    // 5. 验证是否重定向回系统，且成功拉起 Glassmorphism 支付成功浮窗
    await page.waitForURL('**/pricing?payment_status=success');
    const successModal = page.locator('[data-testid="payment-success-modal"]');
    await expect(successModal).toBeVisible();
    await expect(page.locator('[data-testid="success-modal-title"]')).toContainText('订阅支付成功！');

    // 6. 关闭支付成功弹窗
    await page.click('#success-modal-close-btn');
    await expect(successModal).not.toBeVisible();

    // 7. 进入卡密核销页面
    await page.goto('/redeem');

    // 验证当前登录账号是否显示正确
    const emailInput = page.locator('#user-email');
    await expect(emailInput).toHaveValue(testUserEmail);

    // 输入有效卡密
    await page.fill('#redeem-code', validCode);
    await page.click('button[type="submit"]');

    // 验证核销成功 Toast 提示
    const toastLocator = page.locator('li[data-sonner-toast]');
    await expect(toastLocator).toBeVisible();
    await expect(toastLocator).toContainText('卡密核销成功');

    // 验证最终是否成功跳转回首页
    await expect(page).toHaveURL('/', { timeout: 8000 });
  });
});
