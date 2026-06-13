import { test, expect } from '@playwright/test';

test.describe('Dashboard Charts E2E Test Suite', () => {
  
  test('⚡️ 慢速网络下应该先展示 Skeleton 骨架屏，加载完毕后展示正常图表', async ({ page }) => {
    // 拦截 api 请求并延迟返回数据，以确保能捕获到骨架屏状态
    let resolveResponse: () => void = () => {};
    const delayPromise = new Promise<void>((resolve) => {
      resolveResponse = resolve;
    });

    await page.route('**/api/dashboard/stats', async (route) => {
      await delayPromise;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { label: '周一', value: 100 },
          { label: '周二', value: 150 },
        ]),
      });
    });

    // 访问页面
    await page.goto('/dashboard');

    // 此时数据应在加载中，必须展示骨架屏
    const skeleton = page.locator('[data-testid="dashboard-skeleton"]');
    await expect(skeleton).toBeVisible();

    // 释放 API 响应
    resolveResponse();

    // 骨架屏应该消失，图表应该展示
    await expect(skeleton).toBeHidden();
    const chart = page.locator('[data-testid="dashboard-chart"]');
    await expect(chart).toBeVisible();
  });

  test('⚡️ 空数据 API 响应下应该正确展示 EmptyState 空提示和 Lucide 图标', async ({ page }) => {
    // 拦截 api 并返回空数组
    await page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // 访问页面
    await page.goto('/dashboard');

    // 必须展示空状态提示
    const emptyState = page.locator('[data-testid="dashboard-empty"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('暂无看板分析数据');

    // 图表和骨架屏都不应该出现
    await expect(page.locator('[data-testid="dashboard-chart"]')).toBeHidden();
    await expect(page.locator('[data-testid="dashboard-skeleton"]')).toBeHidden();
  });

  test('⚡️ 正常 API 响应下应该直接展示数据图表', async ({ page }) => {
    // 访问页面（不拦截，直接使用 API 默认数据）
    await page.goto('/dashboard');

    // 正常图表应该可见
    const chart = page.locator('[data-testid="dashboard-chart"]');
    await expect(chart).toBeVisible();
    await expect(page.locator('[data-testid="echarts-dom"]')).toBeVisible();
  });
});
