import { test, expect } from '@playwright/test';

const THEMES = [
  { id: 'classic', name: 'Classic', background: 'rgb(253, 251, 247)', cursor: '#F15060' },
  { id: 'blueprint', name: 'Blueprint', background: 'rgb(0, 120, 191)', cursor: '#FFE800' },
  { id: 'midnight', name: 'Midnight', background: 'rgb(26, 26, 46)', cursor: '#00d9ff' },
  { id: 'sepia', name: 'Sepia', background: 'rgb(244, 236, 216)', cursor: '#8b6914' },
  { id: 'ink', name: 'Ink', background: 'rgb(13, 13, 13)', cursor: '#ff6b6b' },
];

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('default theme is Classic', async ({ page }) => {
    const container = page.locator('.w-full.h-\\[100dvh\\]');
    const bgColor = await container.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe(THEMES[0].background);
  });

  test('all themes apply correct background colors', async ({ page }) => {
    for (const theme of THEMES) {
      const themeButton = page.locator(`[title="${theme.name}"]`);
      await themeButton.click();

      // Wait for transition
      await page.waitForTimeout(600);

      const container = page.locator('.w-full.h-\\[100dvh\\]');
      const bgColor = await container.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bgColor, `Theme ${theme.name} should have correct background`).toBe(theme.background);
    }
  });

  test('theme persists after page reload', async ({ page }) => {
    // Switch to Midnight theme
    await page.locator('[title="Midnight"]').click();
    await page.waitForTimeout(600);

    // Reload page
    await page.reload();

    // Check theme is still Midnight
    const container = page.locator('.w-full.h-\\[100dvh\\]');
    const bgColor = await container.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe(THEMES[2].background);
  });

  test('selection color CSS variable is set', async ({ page }) => {
    const selectionColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--selection-color').trim()
    );
    expect(selectionColor).toBeTruthy();
    expect(selectionColor).toContain('rgba');
  });

  test('theme-color meta tag updates with theme', async ({ page }) => {
    // Switch to Blueprint theme
    await page.locator('[title="Blueprint"]').click();
    await page.waitForTimeout(600);

    const themeColor = await page.evaluate(() =>
      document.querySelector('meta[name="theme-color"]')?.getAttribute('content')
    );

    // Blueprint background is #0078BF
    expect(themeColor).toBe('#0078BF');
  });

  test('strikethrough color changes with theme', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('~~test~~', { delay: 10 });

    // Check strikethrough color on Classic theme
    let strikethroughSpan = page.locator('span[style*="line-through"]').first();
    let decorColor = await strikethroughSpan.evaluate(
      (el) => getComputedStyle(el).textDecorationColor
    );
    // Classic strikethrough is #F15060
    expect(decorColor).toBe('rgb(241, 80, 96)');

    // Switch to Midnight theme
    await page.locator('[title="Midnight"]').click();
    await page.waitForTimeout(600);

    // Midnight strikethrough is #ff79c6
    decorColor = await strikethroughSpan.evaluate(
      (el) => getComputedStyle(el).textDecorationColor
    );
    expect(decorColor).toBe('rgb(255, 121, 198)');
  });
});
