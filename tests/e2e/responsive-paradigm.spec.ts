import { test, expect } from '@playwright/test';

/**
 * Responsive Paradigm Tests
 *
 * These tests verify the mutual exclusivity of desktop and mobile UI paradigms.
 * The breakpoint is 1024px:
 * - Desktop (>= 1024px): Left-positioned always-visible panel
 * - Mobile (< 1024px): Right-positioned fold-tab that reveals panel on tap
 *
 * CRITICAL: Desktop and mobile components must NEVER appear simultaneously.
 */

test.describe('Responsive Paradigm - Mutual Exclusivity', () => {
  // Helper to set viewport and reload to ensure proper initialization
  async function setupViewportAndLoad(page: any, width: number, height: number) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.waitForSelector('textarea');
    // Use click + pressSequentially since the append-only textarea blocks standard fill
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('The quick brown fox jumps over the lazy dog', { delay: 10 });
    // Wait for syntax analysis to complete and panel to render
    await page.waitForTimeout(800);
  }

  test.describe('Desktop Mode (>= 1024px)', () => {
    test('Desktop: left panel visible at 1024px (exact breakpoint)', async ({ page }) => {
      await setupViewportAndLoad(page, 1024, 768);

      const desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(desktopPanel).toBeVisible({ timeout: 10000 });
    });

    test('Desktop: left panel visible at 1440px', async ({ page }) => {
      await setupViewportAndLoad(page, 1440, 900);

      const desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(desktopPanel).toBeVisible({ timeout: 10000 });
    });

    test('Desktop: NO right fold-tab at 1024px', async ({ page }) => {
      await setupViewportAndLoad(page, 1024, 768);

      // Wait for panel to appear (to ensure rendering has completed)
      await expect(page.locator('[data-testid="desktop-syntax-panel"]')).toBeVisible({ timeout: 10000 });

      const mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(mobileFoldTab).toHaveCount(0);
    });

    test('Desktop: NO right fold-tab at 1440px', async ({ page }) => {
      await setupViewportAndLoad(page, 1440, 900);

      await expect(page.locator('[data-testid="desktop-syntax-panel"]')).toBeVisible({ timeout: 10000 });

      const mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(mobileFoldTab).toHaveCount(0);
    });

    test('Desktop: panel positioned on left side', async ({ page }) => {
      await setupViewportAndLoad(page, 1280, 800);

      const desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(desktopPanel).toBeVisible({ timeout: 10000 });

      const boundingBox = await desktopPanel.boundingBox();

      // Panel should be on the left side (x < half of viewport)
      expect(boundingBox).not.toBeNull();
      expect(boundingBox!.x).toBeLessThan(640); // Left half of 1280px viewport
    });
  });

  test.describe('Mobile Mode (< 1024px)', () => {
    test('Mobile: right fold-tab visible at 1023px (just below breakpoint)', async ({ page }) => {
      await setupViewportAndLoad(page, 1023, 768);

      const mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(mobileFoldTab).toBeVisible({ timeout: 10000 });
    });

    test('Mobile: right fold-tab visible at 375px (iPhone)', async ({ page }) => {
      await setupViewportAndLoad(page, 375, 812);

      const mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(mobileFoldTab).toBeVisible({ timeout: 10000 });
    });

    test('Mobile: right fold-tab visible at 768px (tablet)', async ({ page }) => {
      await setupViewportAndLoad(page, 768, 1024);

      const mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(mobileFoldTab).toBeVisible({ timeout: 10000 });
    });

    test('Mobile: NO left panel at 1023px', async ({ page }) => {
      await setupViewportAndLoad(page, 1023, 768);

      // Wait for mobile fold tab to appear (to ensure rendering has completed)
      await expect(page.locator('[data-testid="mobile-fold-tab"]')).toBeVisible({ timeout: 10000 });

      const desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(desktopPanel).toHaveCount(0);
    });

    test('Mobile: NO left panel at 375px', async ({ page }) => {
      await setupViewportAndLoad(page, 375, 812);

      await expect(page.locator('[data-testid="mobile-fold-tab"]')).toBeVisible({ timeout: 10000 });

      const desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(desktopPanel).toHaveCount(0);
    });

    test('Mobile: fold-tab positioned on right side', async ({ page }) => {
      await setupViewportAndLoad(page, 375, 812);

      const mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(mobileFoldTab).toBeVisible({ timeout: 10000 });

      const boundingBox = await mobileFoldTab.boundingBox();

      // Tab should be on the right side (touching right edge)
      expect(boundingBox).not.toBeNull();
      expect(boundingBox!.x + boundingBox!.width).toBeGreaterThan(350); // Near right edge
    });
  });

  test.describe('Breakpoint Transition', () => {
    test('transition from mobile to desktop at exact breakpoint', async ({ page }) => {
      // Start at mobile
      await setupViewportAndLoad(page, 1023, 768);

      // Verify mobile state
      let mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      let desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(mobileFoldTab).toBeVisible({ timeout: 10000 });
      await expect(desktopPanel).toHaveCount(0);

      // Cross to desktop
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(500);

      // Verify desktop state
      mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(desktopPanel).toBeVisible({ timeout: 10000 });
      await expect(mobileFoldTab).toHaveCount(0);
    });

    test('transition from desktop to mobile at exact breakpoint', async ({ page }) => {
      // Start at desktop
      await setupViewportAndLoad(page, 1024, 768);

      // Verify desktop state
      let mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      let desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(desktopPanel).toBeVisible({ timeout: 10000 });
      await expect(mobileFoldTab).toHaveCount(0);

      // Cross to mobile
      await page.setViewportSize({ width: 1023, height: 768 });
      await page.waitForTimeout(500);

      // Verify mobile state
      mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(mobileFoldTab).toBeVisible({ timeout: 10000 });
      await expect(desktopPanel).toHaveCount(0);
    });

    test('rapid resize does not cause both to appear', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/');
      const textarea = page.locator('textarea');
      await textarea.click();
      await textarea.pressSequentially('test content for transition', { delay: 10 });
      await page.waitForTimeout(800);

      // Rapidly toggle between sizes
      for (let i = 0; i < 5; i++) {
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.waitForTimeout(50);
        await page.setViewportSize({ width: 1023, height: 768 });
        await page.waitForTimeout(50);
      }

      // Final state should be clean mobile
      await page.waitForTimeout(500);
      const mobileFoldTab = page.locator('[data-testid="mobile-fold-tab"]');
      const desktopPanel = page.locator('[data-testid="desktop-syntax-panel"]');

      // Only one should be visible
      const mobileCount = await mobileFoldTab.count();
      const desktopCount = await desktopPanel.count();

      // XOR: exactly one must exist
      expect(mobileCount + desktopCount).toBe(1);
    });
  });

  test.describe('Content Preservation Across Transitions', () => {
    test('content preserved when transitioning from mobile to desktop', async ({ page }) => {
      // Start mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await page.waitForSelector('textarea');

      const textarea = page.locator('textarea');
      await textarea.click();
      await textarea.pressSequentially('Preserved content test', { delay: 10 });
      await page.waitForTimeout(100);

      // Transition to desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(300);

      // Content should be preserved
      await expect(textarea).toHaveValue('Preserved content test');
    });

    test('content preserved when transitioning from desktop to mobile', async ({ page }) => {
      // Start desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await page.waitForSelector('textarea');

      const textarea = page.locator('textarea');
      await textarea.click();
      await textarea.pressSequentially('Desktop to mobile content', { delay: 10 });
      await page.waitForTimeout(100);

      // Transition to mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(300);

      // Content should be preserved
      await expect(textarea).toHaveValue('Desktop to mobile content');
    });
  });

  test.describe('Syntax Panel State Across Transitions', () => {
    test('word count accurate after transition', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await page.waitForSelector('textarea');

      const textarea = page.locator('textarea');
      await textarea.click();
      await textarea.pressSequentially('one two three four five', { delay: 10 });
      await page.waitForTimeout(800);

      // Transition to desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(500);

      // Word count should be correct (5 words)
      const panel = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(panel).toBeVisible({ timeout: 10000 });
      await expect(panel).toContainText('5');
    });
  });

  test.describe('No Leaking Between Paradigms', () => {
    test('desktop panel styles do not leak to mobile', async ({ page }) => {
      // Start desktop to initialize desktop panel
      await setupViewportAndLoad(page, 1280, 800);

      // Transition to mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(500);

      // Verify no element has desktop panel positioning
      const leftPositioned = page.locator('[data-testid="desktop-syntax-panel"]');
      await expect(leftPositioned).toHaveCount(0);
    });

    test('mobile fold-tab styles do not leak to desktop', async ({ page }) => {
      // Start mobile to initialize mobile panel
      await setupViewportAndLoad(page, 375, 812);

      // Transition to desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(500);

      // Verify no fold-tab is visible
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(foldTab).toHaveCount(0);
    });
  });
});
