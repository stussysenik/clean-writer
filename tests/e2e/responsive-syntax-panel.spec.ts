import { test, expect } from '@playwright/test';

test.describe('Responsive Syntax Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Type some content to trigger syntax analysis
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('The quick brown fox jumps over the lazy dog.', { delay: 10 });
    // Wait for syntax analysis
    await page.waitForTimeout(600);
  });

  test.describe('Desktop (>= 1024px)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('shows left-positioned desktop panel', async ({ page }) => {
      // Desktop panel should be visible with left positioning
      const panel = page.locator('.fixed.left-8.bottom-8');
      await expect(panel).toBeVisible();

      // Mobile fold tab should not be visible
      const foldTab = page.locator('.fixed.right-0.top-1\\/2');
      await expect(foldTab).not.toBeVisible();
    });

    test('desktop panel has glassmorphism styling', async ({ page }) => {
      const panel = page.locator('.fixed.left-8.bottom-8');
      const backdropFilter = await panel.evaluate((el) => {
        return getComputedStyle(el).backdropFilter;
      });
      expect(backdropFilter).toContain('blur');
    });

    test('word count is displayed in desktop panel', async ({ page }) => {
      // Check word count is visible
      const wordCount = page.locator('.fixed.left-8.bottom-8 >> text=9');
      await expect(wordCount).toBeVisible();
    });
  });

  test.describe('Mobile (< 1024px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('shows right fold-tab on mobile', async ({ page }) => {
      // Mobile fold tab should be visible
      const foldTab = page.locator('[aria-label*="syntax panel"]');
      await expect(foldTab).toBeVisible();

      // Desktop panel should not be visible
      const desktopPanel = page.locator('.fixed.left-8.bottom-8');
      await expect(desktopPanel).not.toBeVisible();
    });

    test('fold tab shows word count', async ({ page }) => {
      const wordCount = page.locator('[aria-label*="9 words"]');
      await expect(wordCount).toBeVisible();
    });

    test('clicking fold tab opens panel', async ({ page }) => {
      const foldTab = page.locator('[aria-label*="syntax panel"]');
      await foldTab.click();

      // Panel should slide in
      await page.waitForTimeout(400); // Wait for animation
      const panelBody = page.locator('text=Breakdown');
      await expect(panelBody).toBeVisible();
    });

    test('mobile panel has glassmorphism styling', async ({ page }) => {
      const foldTab = page.locator('[aria-label*="syntax panel"]');
      await foldTab.click();
      await page.waitForTimeout(400);

      const panel = page.locator('.rounded-l-2xl');
      const backdropFilter = await panel.evaluate((el) => {
        return getComputedStyle(el).backdropFilter;
      });
      expect(backdropFilter).toContain('blur');
    });
  });

  test.describe('Paradigm Transition', () => {
    test('transitions smoothly when resizing from mobile to desktop', async ({ page }) => {
      // Start at mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(100);

      // Verify mobile panel
      const foldTab = page.locator('[aria-label*="syntax panel"]');
      await expect(foldTab).toBeVisible();

      // Resize to desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(500); // Wait for transition

      // Verify desktop panel
      const desktopPanel = page.locator('.fixed.left-8.bottom-8');
      await expect(desktopPanel).toBeVisible();
      await expect(foldTab).not.toBeVisible();
    });

    test('transitions smoothly when resizing from desktop to mobile', async ({ page }) => {
      // Start at desktop size
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(100);

      // Verify desktop panel
      const desktopPanel = page.locator('.fixed.left-8.bottom-8');
      await expect(desktopPanel).toBeVisible();

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500); // Wait for transition

      // Verify mobile panel
      const foldTab = page.locator('[aria-label*="syntax panel"]');
      await expect(foldTab).toBeVisible();
      await expect(desktopPanel).not.toBeVisible();
    });
  });

  test.describe('Hover Effects', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('hovering syntax category highlights words in text', async ({ page }) => {
      // Hover over nouns category
      const nounsRow = page.locator('text=Nouns').first();
      await nounsRow.hover();

      // Check that words have glow effect (text-shadow should be applied)
      await page.waitForTimeout(350); // Wait for 0.3s transition

      // The words should have a glow effect via text-shadow
      const foxSpan = page.locator('.whitespace-pre-wrap span:has-text("fox")').first();
      const textShadow = await foxSpan.evaluate((el) => {
        return getComputedStyle(el).textShadow;
      });

      // Should have a glow (non-'none' text-shadow)
      expect(textShadow).not.toBe('none');
    });
  });

  test.describe('Garfield Cursor', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('cursor color changes based on last typed word syntax', async ({ page }) => {
      // Reload to start fresh and type a noun
      await page.reload();
      await page.waitForSelector('textarea');
      const textarea = page.locator('textarea');
      await textarea.click();
      await textarea.pressSequentially('cat', { delay: 10 });
      await page.waitForTimeout(600); // Wait for syntax analysis

      // The ghost cursor should have the noun color
      const ghostCursor = page.locator('.whitespace-pre-wrap > span').last();
      const bgColor = await ghostCursor.evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });

      // Should have some color (not transparent)
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(bgColor).not.toBe('transparent');
    });
  });

  test.describe('Reduced Motion', () => {
    test('respects prefers-reduced-motion', async ({ page }) => {
      // Emulate reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      const textarea = page.locator('textarea');
      await textarea.click();
      await textarea.pressSequentially('The quick brown fox jumps over the lazy dog.', { delay: 10 });
      await page.waitForTimeout(600);

      // Desktop panel should still be visible but without complex animations
      await page.setViewportSize({ width: 1280, height: 800 });
      const panel = page.locator('.fixed.left-8.bottom-8');
      await expect(panel).toBeVisible();

      // Mobile panel should use opacity fade instead of transform
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(100);

      const foldTab = page.locator('[aria-label*="syntax panel"]');
      await foldTab.click();

      // Panel content should still be accessible
      const breakdown = page.locator('text=Breakdown');
      await expect(breakdown).toBeVisible();
    });
  });
});
