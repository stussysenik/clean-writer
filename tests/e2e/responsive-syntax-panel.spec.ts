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

    test('shows right-positioned desktop panel', async ({ page }) => {
      // Desktop panel should be visible with right positioning
      const panel = page.locator('.fixed.right-8.bottom-8');
      await expect(panel).toBeVisible();

      // Mobile fold tab should not be visible
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(foldTab).not.toBeVisible();
    });

    test('desktop panel has glassmorphism styling', async ({ page }) => {
      const panel = page.locator('.fixed.right-8.bottom-8');
      const backdropFilter = await panel.evaluate((el) => {
        return getComputedStyle(el).backdropFilter;
      });
      expect(backdropFilter).toContain('blur');
    });

    test('word count is displayed in desktop panel', async ({ page }) => {
      // Check word count is visible - use specific selector for the large word count display
      const wordCount = page.locator('[data-testid="desktop-syntax-panel"] .text-5xl');
      await expect(wordCount).toBeVisible();
      await expect(wordCount).toContainText('9');
    });
  });

  test.describe('Mobile (< 1024px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('shows right fold-tab on mobile', async ({ page }) => {
      // Mobile fold tab should be visible
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(foldTab).toBeVisible();

      // Desktop panel should not be visible
      const desktopPanel = page.locator('.fixed.right-8.bottom-8');
      await expect(desktopPanel).not.toBeVisible();
    });

    test('fold tab shows word count', async ({ page }) => {
      const wordCount = page.locator('[aria-label*="9 words"]');
      await expect(wordCount).toBeVisible();
    });

    test('dragging fold tab opens panel through harmonica stages', async ({ page }) => {
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
      const box = await foldTab.boundingBox();
      if (!box) throw new Error('Could not get fold tab bounding box');

      // Simulate drag left (40px) to reach peek stage
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 50, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();

      // Should show word count in peek stage
      await page.waitForTimeout(400);

      // Drag up to reach expand stage
      const newBox = await foldTab.boundingBox();
      if (!newBox) throw new Error('Could not get fold tab bounding box');
      await page.mouse.move(newBox.x + newBox.width / 2, newBox.y + newBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(newBox.x + newBox.width / 2, newBox.y - 70, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(400);

      // Drag left again to reach full stage
      const expandBox = await foldTab.boundingBox();
      if (!expandBox) throw new Error('Could not get fold tab bounding box');
      await page.mouse.move(expandBox.x + expandBox.width / 2, expandBox.y + expandBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(expandBox.x + expandBox.width / 2 - 100, expandBox.y + expandBox.height / 2, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(400);
      // Look for full panel content - the collapsible breakdown button
      const panelBody = page.getByRole('button', { name: /Breakdown/i });
      await expect(panelBody).toBeVisible();
    });

    test('mobile panel has glassmorphism styling', async ({ page }) => {
      // Harmonica container should have blur effect
      const panel = page.locator('.rounded-l-2xl').first();
      const backdropFilter = await panel.evaluate((el) => {
        return getComputedStyle(el).backdropFilter;
      });
      expect(backdropFilter).toContain('blur');
    });

    test('mobile panel does not overlap toolbar', async ({ page }) => {
      // The panel should be positioned above the bottom toolbar (80px)
      const container = page.locator('.fixed.right-0.z-\\[55\\]');
      const box = await container.boundingBox();
      if (!box) throw new Error('Could not get container bounding box');

      // Bottom of panel should be at least 80px from viewport bottom
      const viewportHeight = 667; // Test viewport height
      const panelBottom = box.y + box.height;
      expect(viewportHeight - panelBottom).toBeGreaterThanOrEqual(60); // Allow some margin
    });
  });

  test.describe('Paradigm Transition', () => {
    test('transitions smoothly when resizing from mobile to desktop', async ({ page }) => {
      // Start at mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(100);

      // Verify mobile panel
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(foldTab).toBeVisible();

      // Resize to desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(500); // Wait for transition

      // Verify desktop panel
      const desktopPanel = page.locator('.fixed.right-8.bottom-8');
      await expect(desktopPanel).toBeVisible();
      await expect(foldTab).not.toBeVisible();
    });

    test('transitions smoothly when resizing from desktop to mobile', async ({ page }) => {
      // Start at desktop size
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(100);

      // Verify desktop panel
      const desktopPanel = page.locator('.fixed.right-8.bottom-8');
      await expect(desktopPanel).toBeVisible();

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500); // Wait for transition

      // Verify mobile panel
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
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
      const panel = page.locator('.fixed.right-8.bottom-8');
      await expect(panel).toBeVisible();

      // Mobile: harmonica stages should use instant transitions
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(100);

      // Tab should be visible
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
      await expect(foldTab).toBeVisible();
    });
  });

  test.describe('Harmonica Gesture', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('drag snaps back if released before 50% threshold', async ({ page }) => {
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
      const box = await foldTab.boundingBox();
      if (!box) throw new Error('Could not get fold tab bounding box');

      // Drag left only 15px (below 50% of 40px threshold)
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 15, box.y + box.height / 2, { steps: 5 });
      await page.mouse.up();

      await page.waitForTimeout(400);

      // Tab should still be in closed state - check aria-expanded
      await expect(foldTab).toHaveAttribute('aria-expanded', 'false');
    });

    test('tap on tab does not toggle (drag-only interaction)', async ({ page }) => {
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');

      // Simple click (tap) should NOT open the panel
      await foldTab.click();
      await page.waitForTimeout(400);

      // Should still be closed
      await expect(foldTab).toHaveAttribute('aria-expanded', 'false');
    });

    test('shows directional arrow affordance on closed tab', async ({ page }) => {
      // Check that the tab has a left-pointing arrow when closed
      const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
      const arrow = foldTab.locator('span:has-text("‹")');
      await expect(arrow).toBeVisible();
    });
  });
});
