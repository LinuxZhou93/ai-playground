// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * 用户身份系统自动化测试
 * 测试范围: Email/Password 注册、登录、登出
 */

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Test123456!';

test.describe('用户身份系统测试', () => {

    test.beforeEach(async ({ page }) => {
        // 每个测试前访问首页
        await page.goto(BASE_URL);
        // 等待页面完全加载
        await page.waitForLoadState('networkidle');
    });

    test('应该能打开认证模态框', async ({ page }) => {
        // 点击登录/注册按钮
        await page.click('#auth-btn');

        // 验证模态框显示
        const modal = page.locator('#auth-modal');
        await expect(modal).toBeVisible();

        // 验证表单元素存在
        await expect(page.locator('#auth-email')).toBeVisible();
        await expect(page.locator('#auth-password')).toBeVisible();
        await expect(page.locator('button:has-text("LOGIN")')).toBeVisible();
        await expect(page.locator('button:has-text("REGISTER")')).toBeVisible();
        await expect(page.locator('button:has-text("LOGIN WITH GITHUB")')).toBeVisible();
    });

    test('应该能关闭认证模态框', async ({ page }) => {
        // 打开模态框
        await page.click('#auth-btn');
        await expect(page.locator('#auth-modal')).toBeVisible();

        // 点击关闭按钮
        await page.click('.auth-close');

        // 验证模态框隐藏
        await expect(page.locator('#auth-modal')).toBeHidden();
    });

    test('应该能成功注册新用户', async ({ page }) => {
        // 打开认证模态框
        await page.click('#auth-btn');

        // 填写注册信息
        await page.fill('#auth-email', TEST_EMAIL);
        await page.fill('#auth-password', TEST_PASSWORD);

        // 点击注册按钮
        await page.click('button:has-text("REGISTER")');

        // 等待响应消息
        await page.waitForTimeout(2000);

        // 验证成功消息
        const message = await page.locator('#auth-message').textContent();
        expect(message).toContain('successful');
    });

    test('应该能使用已注册账户登录', async ({ page }) => {
        // 注意: 此测试依赖上一个测试创建的账户
        // 在实际环境中,应该先创建测试账户或使用固定的测试账户

        // 打开认证模态框
        await page.click('#auth-btn');

        // 填写登录信息
        await page.fill('#auth-email', TEST_EMAIL);
        await page.fill('#auth-password', TEST_PASSWORD);

        // 点击登录按钮
        await page.click('button:has-text("LOGIN")');

        // 等待登录完成
        await page.waitForTimeout(2000);

        // 验证模态框关闭
        await expect(page.locator('#auth-modal')).toBeHidden();

        // 验证用户信息显示
        const authLabel = await page.locator('#auth-label').textContent();
        expect(authLabel).not.toBe('登录/注册');
    });

    test('应该能在登录后显示用户资料', async ({ page }) => {
        // 先登录
        await page.click('#auth-btn');
        await page.fill('#auth-email', TEST_EMAIL);
        await page.fill('#auth-password', TEST_PASSWORD);
        await page.click('button:has-text("LOGIN")');
        await page.waitForTimeout(2000);

        // 再次打开模态框查看用户资料
        await page.click('#auth-btn');

        // 验证显示用户资料而非登录表单
        await expect(page.locator('#user-profile')).toBeVisible();
        await expect(page.locator('#auth-form')).toBeHidden();

        // 验证邮箱显示
        const emailDisplay = await page.locator('#user-email-display').textContent();
        expect(emailDisplay).toBe(TEST_EMAIL);
    });

    test('应该能成功登出', async ({ page }) => {
        // 先登录
        await page.click('#auth-btn');
        await page.fill('#auth-email', TEST_EMAIL);
        await page.fill('#auth-password', TEST_PASSWORD);
        await page.click('button:has-text("LOGIN")');
        await page.waitForTimeout(2000);

        // 打开用户资料
        await page.click('#auth-btn');

        // 点击登出按钮
        await page.click('button:has-text("LOGOUT")');

        // 等待页面刷新
        await page.waitForLoadState('networkidle');

        // 验证恢复到未登录状态
        const authLabel = await page.locator('#auth-label').textContent();
        expect(authLabel).toBe('登录/注册');
    });

    test('应该在输入无效信息时显示错误', async ({ page }) => {
        // 打开认证模态框
        await page.click('#auth-btn');

        // 不填写任何信息直接点击登录
        await page.click('button:has-text("LOGIN")');

        // 验证错误消息
        await page.waitForTimeout(500);
        const message = await page.locator('#auth-message').textContent();
        expect(message).toContain('Please enter email and password');
    });

    test('应该在会话持久化后保持登录状态', async ({ page }) => {
        // 先登录
        await page.click('#auth-btn');
        await page.fill('#auth-email', TEST_EMAIL);
        await page.fill('#auth-password', TEST_PASSWORD);
        await page.click('button:has-text("LOGIN")');
        await page.waitForTimeout(2000);

        // 刷新页面
        await page.reload();
        await page.waitForLoadState('networkidle');

        // 验证仍然保持登录状态
        const authLabel = await page.locator('#auth-label').textContent();
        expect(authLabel).not.toBe('登录/注册');
    });

    test('GitHub OAuth 按钮应该可点击并跳转', async ({ page }) => {
        // 打开认证模态框
        await page.click('#auth-btn');

        // 监听页面导航
        const navigationPromise = page.waitForNavigation({ timeout: 5000 }).catch(() => null);

        // 点击 GitHub 登录按钮
        await page.click('button:has-text("LOGIN WITH GITHUB")');

        // 等待导航或超时
        await navigationPromise;

        // 验证: 要么跳转到 GitHub (URL 包含 github.com)
        // 要么显示错误消息 (如果 OAuth 未配置)
        const currentUrl = page.url();
        const hasError = await page.locator('#auth-message').isVisible();

        expect(currentUrl.includes('github.com') || hasError).toBeTruthy();
    });
});
