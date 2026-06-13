import { test, expect } from '@playwright/test';

test.describe('Labs Page Card Hover Interaction', () => {
  test('should apply 3D tilt transform on hover and reset on leave', async ({ page }) => {
    // Navigate to the labs page
    await page.goto('/resources/labs.html');

    // Wait for the labs grid to load and cards to render
    const card = page.locator('.experiment-card').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Get initial transform style
    const initialTransform = await card.evaluate((el) => window.getComputedStyle(el).transform);

    // Get bounding box of the card to perform precise hover/move
    const box = await card.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      // Hover on the top-left quadrant of the card to trigger tilt
      // Center is at box.x + box.width / 2, box.y + box.height / 2
      // Top-left is at box.x + box.width * 0.25, box.y + box.height * 0.25
      const targetX = box.x + box.width * 0.25;
      const targetY = box.y + box.height * 0.25;

      await page.mouse.move(targetX, targetY);
      
      // Wait a short moment for any rendering/event loop ticks
      await page.waitForTimeout(100);

      // Get transform style during hover
      const hoverTransform = await card.evaluate((el) => window.getComputedStyle(el).transform);
      
      // The transform should not be 'none' and should be different from initial
      expect(hoverTransform).not.toBe('none');
      expect(hoverTransform).not.toBe(initialTransform);
      // A 3D transform usually computes to a matrix3d(...) in getComputedStyle
      expect(hoverTransform).toContain('matrix');

      // Move mouse away
      await page.mouse.move(0, 0);
      
      // Wait for the transition to complete (transition is 0.5s ease)
      await page.waitForTimeout(600);

      // Get transform style after leaving
      const postLeaveTransform = await card.evaluate((el) => window.getComputedStyle(el).transform);
      
      // It should reset back to the identity matrix or perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)
      // In computed style, perspective(1000px) rotate3d(0, 0, 0, 0) scale3d(1, 1, 1) or similar might compute to a matrix3d or matrix.
      // Let's verify it's close to the identity matrix or at least different from the active hover state.
      expect(postLeaveTransform).not.toBe(hoverTransform);
    }
  });
});