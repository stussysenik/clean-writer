import { test, expect } from '@playwright/test';

test.describe('UTF-8 Display, Hashtags, and Wordism Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('textarea');
  });

  test('settings panel exposes a UTF-8 display toggle that persists', async ({ page }) => {
    await page.locator('button[title="Customize Theme"]').click();

    const toggle = page.locator('[data-testid="utf8-display-toggle"]');
    await expect(toggle).toBeVisible();

    await toggle.click();

    const storedValue = await page.evaluate(() =>
      localStorage.getItem('clean_writer_utf8_display_enabled')
    );
    expect(storedValue).toBe('true');

    await page.reload();
    await page.waitForSelector('textarea');
    await page.locator('button[title="Customize Theme"]').click();
    await expect(page.locator('[data-testid="utf8-display-toggle"]')).toBeChecked();
  });

  test('utf toggle switches emoji rendering without mutating content', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('riso_flow_content', 'emoji check 😀');
    });
    await page.reload();
    await page.waitForSelector('textarea');
    await page.waitForTimeout(500);

    const textarea = page.locator('textarea');

    await expect(page.locator('text=😀').first()).toBeVisible();

    await page.locator('button[title="Customize Theme"]').click();
    await page.locator('[data-testid="utf8-display-toggle"]').check();
    await page.locator('button[title="Close"]').click();
    await page.waitForTimeout(300);

    await expect(page.locator('text=U+1F600').first()).toBeVisible();
    await expect(textarea).toHaveValue('emoji check 😀');
  });

  test('settings footer shows build number and memorable expression', async ({ page }) => {
    await page.locator('button[title="Customize Theme"]').click();

    const footer = page.locator('[data-testid="settings-build-footer"]');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/Build v?\d+\.\d+\.\d+/);
    await expect(footer).toContainText('Build wordism');
  });

  test('syntax panel has a separate hashtag counter', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('hello #artisanattitude #build #build', { delay: 10 });
    await page.waitForTimeout(800);

    const panel = page.locator('[data-testid="desktop-syntax-panel"]');
    await expect(panel).toBeVisible();

    const quickStatsGrid = panel.locator('[data-testid="quick-stats-grid"]');
    if (!(await quickStatsGrid.isVisible())) {
      await panel.locator('[data-testid="quick-stats-toggle"]').click();
    }

    const hashtagsCounter = panel.locator('[data-testid="hashtags-counter"]');
    await expect(hashtagsCounter).toBeVisible();
    await expect(hashtagsCounter).toHaveText('3');
  });

  test('syntax panel footer includes a memorable build wordism', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('hello world', { delay: 10 });
    await page.waitForTimeout(700);

    const panel = page.locator('[data-testid="desktop-syntax-panel"]');
    await expect(panel).toBeVisible();

    const wordism = panel.locator('[data-testid="panel-wordism"]');
    await expect(wordism).toBeVisible();
    await expect(wordism).toContainText('Build wordism');

    const panelBuild = panel.locator('[data-testid="panel-build-footer"]');
    await expect(panelBuild).toBeVisible();
    await expect(panelBuild).toContainText(/Build v?\d+\.\d+\.\d+/);
  });

  test('settings panel opens without horizontal visual artifacts', async ({ page }) => {
    await page.locator('button[title="Customize Theme"]').click();
    await expect(page.locator('[data-testid="theme-customizer-panel"]')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > window.innerWidth + 1;
    });

    expect(hasHorizontalOverflow).toBeFalsy();
  });

  test('quick stats use a spaced grid proportion layout', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('alpha #one beta #two gamma', { delay: 10 });
    await page.waitForTimeout(700);

    const grid = page.locator('[data-testid="quick-stats-grid"]');
    if (!(await grid.isVisible())) {
      await page.locator('[data-testid="quick-stats-toggle"]').click();
    }
    await expect(grid).toBeVisible();

    const gridStyles = await grid.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        display: style.display,
        columns: style.gridTemplateColumns,
      };
    });

    expect(gridStyles.display).toBe('grid');
    expect(gridStyles.columns.split(' ').length).toBe(2);

    const hashtagsCard = grid.locator('button:has-text("Hashtags")');
    const hashtagGridEnd = await hashtagsCard.evaluate((el) =>
      getComputedStyle(el).gridColumnEnd
    );
    expect(hashtagGridEnd).toContain('span 2');
  });

  test('quick stats keep usable card width on compact desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });

    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('alpha #one beta #two gamma', { delay: 10 });
    await page.waitForTimeout(700);

    const grid = page.locator('[data-testid="quick-stats-grid"]');
    if (!(await grid.isVisible())) {
      await page.locator('[data-testid="quick-stats-toggle"]').click();
    }

    const cardWidths = await grid
      .locator('button')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));

    expect(cardWidths.length).toBe(3);
    expect(cardWidths[0]).toBeGreaterThan(90);
    expect(cardWidths[1]).toBeGreaterThan(90);
    expect(cardWidths[2]).toBeGreaterThan(180);
  });

  test('tablet view removes legacy bottom syntax strip', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('hello world #tablet', { delay: 10 });
    await page.waitForTimeout(700);

    await expect(page.locator('[data-testid="toolbar-syntax-toggles"]')).toHaveCount(0);
  });

  test('mobile panel uses a single clear arrow indicator when expanded', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('hello world #one #two', { delay: 10 });
    await page.waitForTimeout(700);

    const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
    await expect(foldTab).toBeVisible();

    const box = await foldTab.boundingBox();
    if (!box) throw new Error('Could not get fold tab bounds');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 250, box.y + box.height / 2, { steps: 25 });
    await page.mouse.up();
    await page.waitForTimeout(350);

    const arrowCount = await foldTab.locator('span').evaluateAll((els) =>
      els.filter((el) => {
        const value = (el.textContent || '').trim();
        return value === '‹' || value === '›' || value === '⌃';
      }).length
    );

    expect(arrowCount).toBeLessThanOrEqual(1);
  });

  test('mobile expanded panel scrolls to quick stats section', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });

    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('hello world #one #two #three', { delay: 10 });
    await page.waitForTimeout(700);

    const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
    const box = await foldTab.boundingBox();
    if (!box) throw new Error('Could not get fold tab bounds');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 250, box.y + box.height / 2, { steps: 25 });
    await page.mouse.up();
    await page.waitForTimeout(350);

    const scrollRegion = page.locator('[data-testid="mobile-panel-scroll-region"]');
    await expect(scrollRegion).toBeVisible();

    const canScroll = await scrollRegion.evaluate((el) => {
      const node = el as HTMLElement;
      return node.scrollHeight > node.clientHeight;
    });
    expect(canScroll).toBeTruthy();

    await scrollRegion.evaluate((el) => {
      const node = el as HTMLElement;
      node.scrollTop = node.scrollHeight;
    });
    await page.waitForTimeout(150);

    await expect(page.getByRole('button', { name: /Hashtags/i })).toBeVisible();
  });

  test('mobile closed fold tab has no glass smudge background', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('hello world', { delay: 10 });
    await page.waitForTimeout(600);

    const closedContainer = page.locator('.rounded-l-2xl').first();
    await expect(closedContainer).toBeVisible();

    const styles = await closedContainer.evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        backdropFilter: computed.backdropFilter,
      };
    });

    expect(styles.backgroundColor === 'rgba(0, 0, 0, 0)' || styles.backgroundColor === 'transparent').toBeTruthy();
    expect(styles.backdropFilter === 'none' || styles.backdropFilter === '').toBeTruthy();
  });

  test('mobile breakdown stat pills keep right inset spacing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('hello world #one', { delay: 10 });
    await page.waitForTimeout(650);

    const foldTab = page.locator('[data-testid="mobile-fold-tab"]');
    const box = await foldTab.boundingBox();
    if (!box) throw new Error('Could not get fold tab bounds');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 250, box.y + box.height / 2, { steps: 25 });
    await page.mouse.up();
    await page.waitForTimeout(350);

    const panel = page.locator('.rounded-l-2xl').first();
    const nounsRow = page
      .locator('div.absolute')
      .filter({ has: page.locator('span.font-medium:has-text("Nouns")') })
      .first();
    const statPill = nounsRow.locator('button').first();

    const panelBox = await panel.boundingBox();
    const pillBox = await statPill.boundingBox();
    if (!panelBox || !pillBox) throw new Error('Could not measure panel/pill bounds');

    const panelRight = panelBox.x + panelBox.width;
    const pillRight = pillBox.x + pillBox.width;
    const rightInset = panelRight - pillRight;
    expect(rightInset).toBeGreaterThan(8);
  });

  test('quick stats collapse by default when extras are all zero', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.click();
    await textarea.pressSequentially('plain text only', { delay: 10 });
    await page.waitForTimeout(700);

    const toggle = page.locator('[data-testid="quick-stats-toggle"]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toContainText('All Zero');

    const quickStatsContent = page.locator('[data-testid="quick-stats-content"]');
    await expect(quickStatsContent).toHaveCSS('max-height', '0px');
    await expect(quickStatsContent).toHaveCSS('opacity', '0');
  });
});
