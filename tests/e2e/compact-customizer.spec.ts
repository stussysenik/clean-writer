import { test, expect } from "@playwright/test";

test.describe("Compact Customizer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("customizer scrollHeight ≤ 1.5× clientHeight on mobile viewport", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Open customizer
    const gearBtn = page.locator('button[title="Customize Theme"]');
    await gearBtn.click();
    await expect(page.locator('h2:has-text("Customize Theme")')).toBeVisible();

    // Measure scroll height vs client height
    const panel = page.locator(".fixed.right-0.top-0.bottom-0.overflow-y-auto");
    const measurements = await panel.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));

    // scrollHeight should be ≤ 1.5× clientHeight (≤2 scrolls)
    expect(measurements.scrollHeight).toBeLessThanOrEqual(
      measurements.clientHeight * 1.5,
    );
  });

  test('"Visible Presets" is the first section heading after "Customize Theme"', async ({
    page,
  }) => {
    // Open customizer
    const gearBtn = page.locator('button[title="Customize Theme"]');
    await gearBtn.click();
    await expect(page.locator('h2:has-text("Customize Theme")')).toBeVisible();

    // Get all h3 section headings in order
    const headings = page.locator(".fixed.right-0.top-0.bottom-0 h3");
    const firstHeading = headings.first();
    await expect(firstHeading).toHaveText("Visible Presets");
  });

  test("font section collapsed by default, expands on click", async ({
    page,
  }) => {
    // Open customizer
    const gearBtn = page.locator('button[title="Customize Theme"]');
    await gearBtn.click();
    await expect(page.locator('h2:has-text("Customize Theme")')).toBeVisible();

    // Font section should show the "Font" heading
    const fontHeading = page.locator('h3:has-text("Font")');
    await expect(fontHeading).toBeVisible();

    // Should see the selected font preview (collapsed state shows one font button)
    const fontPreview = page.locator("text=The quick brown fox jumps");
    await expect(fontPreview).toHaveCount(1); // Only 1 preview visible when collapsed

    // Click the font section header to expand
    await fontHeading.click();

    // Now all 6 font options should be visible
    const fontPreviews = page.locator("text=The quick brown fox jumps");
    await expect(fontPreviews).toHaveCount(6);

    // Click the header again to collapse
    await fontHeading.click();
    await expect(page.locator("text=The quick brown fox jumps")).toHaveCount(1);
  });

  test("word type labels are not truncated", async ({ page }) => {
    // Open customizer
    const gearBtn = page.locator('button[title="Customize Theme"]');
    await gearBtn.click();
    await expect(page.locator('h2:has-text("Customize Theme")')).toBeVisible();

    // Find word type label spans (10px uppercase tracking-wide)
    const wordTypeLabels = page.locator(
      ".text-\\[10px\\].uppercase.tracking-wide.opacity-60",
    );
    const count = await wordTypeLabels.count();

    for (let i = 0; i < count; i++) {
      const textOverflow = await wordTypeLabels
        .nth(i)
        .evaluate((el) => getComputedStyle(el).textOverflow);
      expect(textOverflow).not.toBe("ellipsis");
    }
  });
});
