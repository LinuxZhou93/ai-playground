import { test, expect } from '@playwright/test';

test('📱 应该在移动端视口下正确处理标签页切换与启动编辑器流程', async ({ page }) => {
  // 动态设置视口大小为 iPhone 14 (390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });

  // 1. 导航到 Scratch IDE 页面
  await page.goto('/resources/ide-scratch.html');

  // 等待 Vue 应用挂载和首选 Tab 渲染
  const mobileTabLessons = page.locator('[data-testid="mobile-tab-lessons"]');
  const mobileTabEditor = page.locator('[data-testid="mobile-tab-editor"]');
  await expect(mobileTabLessons).toBeVisible({ timeout: 15000 });
  await expect(mobileTabEditor).toBeVisible();

  // 2. 验证默认状态：展示教学课程侧边栏，隐藏编辑器主区
  const sidebarLessons = page.locator('[data-testid="sidebar-lessons"]');
  const mainEditor = page.locator('[data-testid="main-editor"]');
  
  await expect(sidebarLessons).toBeVisible();
  await expect(mainEditor).toBeHidden();

  // 3. 点击“编辑器”标签，验证标签切换逻辑
  await mobileTabEditor.click();
  await expect(sidebarLessons).toBeHidden();
  await expect(mainEditor).toBeVisible();

  // 4. 点击“教学课程”标签，验证能够切换回侧边栏
  await mobileTabLessons.click();
  await expect(sidebarLessons).toBeVisible();
  await expect(mainEditor).toBeHidden();

  // 5. 切换回“编辑器”标签，验证启动创作按钮点击响应
  await mobileTabEditor.click();
  const launchBtn = page.locator('[data-testid="launch-btn"]');
  await expect(launchBtn).toBeVisible();

  // 点击启动创作按钮
  await launchBtn.click();

  // 验证编辑器 loading 或 iframe 区域被激活挂载
  const iframe = page.locator('iframe');
  await expect(iframe).toBeVisible();
});
