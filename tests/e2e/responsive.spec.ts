import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test.describe('Mobile viewport', () => {
    test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12 size

    test('uses smaller font size on mobile', async ({ page }) => {
      await page.goto('/');

      const backdrop = page.locator('div[class*="whitespace-pre-wrap"]').first();
      const fontSize = await backdrop.evaluate((el) => getComputedStyle(el).fontSize);

      expect(parseInt(fontSize)).toBe(18);
    });

    test('toolbar stacks vertically on mobile', async ({ page }) => {
      await page.goto('/');

      const footer = page.locator('footer');
      const flexDirection = await footer.evaluate((el) => getComputedStyle(el).flexDirection);

      expect(flexDirection).toBe('column-reverse');
    });

    test('word count is visible on mobile', async ({ page }) => {
      await page.goto('/');

      const wordCount = page.locator('text=/words/i');
      await expect(wordCount).toBeVisible();
    });

    test('theme selector is accessible on mobile', async ({ page }) => {
      await page.goto('/');

      const themeButtons = page.locator('[title="Classic"]');
      await expect(themeButtons).toBeVisible();

      const box = await themeButtons.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(24);
    });
  });

  test.describe('Desktop viewport', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('uses larger font size on desktop', async ({ page }) => {
      await page.goto('/');

      const backdrop = page.locator('div[class*="whitespace-pre-wrap"]').first();
      const fontSize = await backdrop.evaluate((el) => getComputedStyle(el).fontSize);

      expect(parseInt(fontSize)).toBe(24);
    });

    test('toolbar is horizontal on desktop', async ({ page }) => {
      await page.goto('/');

      const footer = page.locator('footer');
      const flexDirection = await footer.evaluate((el) => getComputedStyle(el).flexDirection);

      expect(flexDirection).toBe('row');
    });
  });

  test.describe('Tablet viewport', () => {
    test.use({ viewport: { width: 1024, height: 1366 } }); // iPad Pro size

    test('has appropriate layout for tablet', async ({ page }) => {
      await page.goto('/');

      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Tablet should use desktop font size
      const backdrop = page.locator('div[class*="whitespace-pre-wrap"]').first();
      const fontSize = await backdrop.evaluate((el) => getComputedStyle(el).fontSize);
      expect(parseInt(fontSize)).toBe(24);
    });
  });

  test.describe('Content reflow', () => {
    test('content max-width can be adjusted', async ({ page }) => {
      await page.goto('/');

      // Click width control button
      const widthButton = page.locator('[title="Adjust Line Width"]');
      await widthButton.click();

      // Slider should appear
      const slider = page.locator('input[type="range"]');
      await expect(slider).toBeVisible();

      // Change width
      await slider.fill('1200');

      // Check that the width was updated
      const typewriter = page.locator('div[class*="max-width"]').first();
      const maxWidth = await typewriter.evaluate((el) => el.style.maxWidth);

      expect(maxWidth).toBe('1200px');
    });

    test('text wraps properly at different widths', async ({ page }) => {
      await page.goto('/');

      const textarea = page.locator('textarea');
      const longText = 'This is a very long sentence that should wrap properly across multiple lines when the viewport is narrow enough to require text wrapping behavior.';
      await textarea.click();
      await textarea.pressSequentially(longText, { delay: 5 });

      // Content should be visible without horizontal scroll
      const main = page.locator('main');
      const scrollWidth = await main.evaluate((el) => el.scrollWidth);
      const clientWidth = await main.evaluate((el) => el.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow small margin
    });
  });
});
