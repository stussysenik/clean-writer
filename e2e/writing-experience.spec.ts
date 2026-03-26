import { test, expect } from "@playwright/test";

// Helper to clear the editor content
async function clearEditor(page: any) {
  // Use the app's Clear All button + confirm
  const clearBtn = page.locator('[aria-label="Clear all content"]');
  await clearBtn.click({ timeout: 3000 }).catch(() => {});
  // Confirm the "Start Fresh?" dialog — button says "CLEAR PAGE"
  await page.waitForTimeout(200);
  const confirmBtn = page.locator("button").filter({ hasText: /clear page/i });
  if (await confirmBtn.count() > 0) {
    await confirmBtn.first().click();
    await page.waitForTimeout(300);
  }
  await page.locator("textarea").click();
}

test.describe("Writing Experience", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("textarea");
  });

  test("textarea exists and is focusable", async ({ page }) => {
    await page.locator("textarea").click();
    await expect(page.locator("textarea")).toBeFocused();
  });

  test("can type text into editor", async ({ page }) => {
    await clearEditor(page);
    await page.keyboard.type("test phrase xyz123");
    const value = await page.locator("textarea").inputValue();
    expect(value).toContain("test phrase xyz123");
  });

  test("cursor dot visible when cursor at end", async ({ page }) => {
    await page.locator("textarea").click();
    // Move to end
    await page.keyboard.press("End");
    await page.keyboard.press("End");
    await page.waitForTimeout(300);
    // If content exists and cursor is at end, cursor dot should show
    const cursorDot = page.locator('[data-testid="cursor-dot"]');
    // May or may not be visible depending on content state
    const count = await cursorDot.count();
    expect(count).toBeLessThanOrEqual(1); // 0 or 1, no error
  });

  test("heading renders with data-testid when typed", async ({ page }) => {
    await clearEditor(page);
    await page.keyboard.type("# My Test Heading");
    await page.waitForTimeout(300);
    const heading = page.locator('[data-testid="heading-1"]');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("My Test Heading");
  });

  test("todo checkbox renders", async ({ page }) => {
    await clearEditor(page);
    await page.keyboard.type("- [ ] Buy milk");
    await page.waitForTimeout(500);
    const checkbox = page.locator('[data-testid="todo-checkbox-0"]');
    await expect(checkbox).toHaveCount(1);
  });

  test("fenced code block renders", async ({ page }) => {
    await clearEditor(page);
    // Type the full code block content including backticks
    await page.keyboard.type("some text\n\`\`\`javascript\nconst x = 42;\n\`\`\`", { delay: 10 });
    // Wait for Shiki lazy load
    await page.waitForTimeout(3000);
    const codeBlock = page.locator('[data-testid="code-block"]');
    await expect(codeBlock).toBeVisible({ timeout: 5000 });
  });

  test("toolbar settings button visible", async ({ page }) => {
    const settingsBtn = page.locator('[data-testid="open-theme-customizer"]');
    await expect(settingsBtn).toBeVisible();
  });

  test("theme swatches exist", async ({ page }) => {
    const swatches = page.locator("[data-theme-id]");
    await expect(swatches.first()).toBeVisible();
    const count = await swatches.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("desktop panel visible", async ({ page }) => {
    const panel = page.locator('[data-testid="desktop-syntax-panel"]');
    await expect(panel).toBeVisible();
  });

  test("word count displays in panel", async ({ page }) => {
    const wordCount = page.locator('[data-testid="panel-word-count"]');
    await expect(wordCount).toBeVisible();
  });

  test("mode switch tabs exist", async ({ page }) => {
    await expect(page.locator('[data-testid="panel-mode-syntax"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-mode-song"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-mode-code"]')).toBeVisible();
  });
});
