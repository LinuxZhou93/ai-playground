import { test, expect } from '@playwright/test';

test('should apply 3D tilt transform on hover and reset on leave', async ({ page }) => {
  // Navigate to the labs page
  await page.goto('/resources/labs.html');

  // Wait for the labs grid to load and cards to render
  const card = page.locator('.experiment-card').first();
  await expect(card).toBeVisible({ timeout: 15000 });

  // Get initial transform style
  const initialTransform = await card.evaluate((el) => window.getComputedStyle(el).transform);

  // Get bounding box of the card to perform precise hover/move
  const box = await card.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    // Hover on the top-left offset of the card to trigger 3D tilt
    await card.hover({ position: { x: 20, y: 20 } });
    
    // Wait a short moment for any rendering/event loop ticks
    await page.waitForTimeout(200);

    // Get transform style during hover
    const hoverTransform = await card.evaluate((el) => window.getComputedStyle(el).transform);
    
    // The transform should not be 'none' and should be different from initial
    expect(hoverTransform).not.toBe('none');
    expect(hoverTransform).not.toBe(initialTransform);
    // A 3D transform computes to a matrix3d(...) or matrix(...) in getComputedStyle
    expect(hoverTransform).toContain('matrix');

    // Move mouse away
    await page.mouse.move(0, 0);
    
    // Wait for the transition to complete (transition is 0.5s ease)
    await page.waitForTimeout(600);

    // Get transform style after leaving
    const postLeaveTransform = await card.evaluate((el) => window.getComputedStyle(el).transform);
    
    // It should reset back to the identity matrix or different from the active hover state.
    expect(postLeaveTransform).not.toBe(hoverTransform);
  }
});