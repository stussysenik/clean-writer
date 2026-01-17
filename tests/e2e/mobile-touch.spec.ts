import { test, expect } from '@playwright/test';

test.describe('Mobile Touch UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all toolbar buttons have minimum 44px tap targets', async ({ page }) => {
    // Get all buttons in the toolbar area
    const buttons = page.locator('footer button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        expect(box.width, `Button ${i} width should be >= 44px`).toBeGreaterThanOrEqual(44);
        expect(box.height, `Button ${i} height should be >= 44px`).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('touch buttons have touch-manipulation CSS', async ({ page }) => {
    const buttons = page.locator('footer button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const touchAction = await button.evaluate(
        (el) => getComputedStyle(el).touchAction
      );

      expect(touchAction).toContain('manipulation');
    }
  });

  test('toolbar buttons do not overlap', async ({ page }) => {
    const buttons = page.locator('footer button');
    const count = await buttons.count();
    const boxes: { x: number; y: number; width: number; height: number }[] = [];

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        boxes.push(box);
      }
    }

    // Check for overlaps
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];

        const overlapsX = a.x < b.x + b.width && a.x + a.width > b.x;
        const overlapsY = a.y < b.y + b.height && a.y + a.height > b.y;

        expect(overlapsX && overlapsY, `Buttons ${i} and ${j} should not overlap`).toBeFalsy();
      }
    }
  });

  test('theme selector circles are touchable on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    const themeButtons = page.locator('[title="Classic"], [title="Blueprint"], [title="Midnight"], [title="Sepia"], [title="Ink"]');
    const count = await themeButtons.count();

    expect(count).toBe(5);

    for (let i = 0; i < count; i++) {
      const button = themeButtons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        // On mobile, theme buttons should be at least 24x24
        expect(box.width).toBeGreaterThanOrEqual(24);
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test('textarea receives focus on touch', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.tap();
    await expect(textarea).toBeFocused();
  });
});
