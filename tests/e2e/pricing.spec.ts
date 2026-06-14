import { test, expect } from '@playwright/test';

test.describe('Pricing Multilingual E2E Tests', () => {

  test('should display Chinese currency and titles when visiting zh/pricing', async ({ page }) => {
    await page.goto('/zh/pricing');
    
    // 断言标题为中文
    const title = page.locator('[data-testid="pricing-title"]');
    await expect(title).toContainText('加入 FUTURE 计划');

    // 断言货币单位为 ¥
    const currencies = page.locator('[data-testid="price-currency"]');
    await expect(currencies.first()).toHaveText('¥');
    
    // 断言月度计费周期为 /月
    const periods = page.locator('[data-testid="price-period"]');
    await expect(periods.nth(1)).toHaveText('/月');
    
    // 断言价格值为 199
    const priceValue = page.locator('[data-testid="price-value"]');
    await expect(priceValue.nth(1)).toHaveText('199');
  });

  test('should display English currency and titles when visiting en/pricing', async ({ page }) => {
    await page.goto('/en/pricing');
    
    // 断言标题为英文
    const title = page.locator('[data-testid="pricing-title"]');
    await expect(title).toContainText('Join the FUTURE Plan');

    // 断言货币单位为 $
    const currencies = page.locator('[data-testid="price-currency"]');
    await expect(currencies.first()).toHaveText('$');
    
    // 断言月度计费周期为 /mo
    const periods = page.locator('[data-testid="price-period"]');
    await expect(periods.nth(1)).toHaveText('/mo');

    // 断言价格值为 29
    const priceValue = page.locator('[data-testid="price-value"]');
    await expect(priceValue.nth(1)).toHaveText('29');
  });
});
