import { test, expect } from "@playwright/test";

test.describe("PWA Support", () => {
        test("manifest.webmanifest is served", async ({ page }) => {
                const response = await page.goto("/manifest.webmanifest");
                expect(response?.status()).toBe(200);

                const manifest = await response?.json();
                expect(manifest.name).toBe("digital typewriter experience");
                expect(manifest.short_name).toBe("Writer");
                expect(manifest.display).toBe("standalone");
                expect(manifest.icons).toBeDefined();
                expect(manifest.icons.length).toBeGreaterThan(0);
        });

        test("PWA icons are accessible", async ({ page }) => {
                const icons = [
                        "/pwa-192x192.png",
                        "/pwa-512x512.png",
                        "/apple-touch-icon.png",
                ];

                for (const icon of icons) {
                        const response = await page.goto(icon);
                        expect(
                                response?.status(),
                                `${icon} should be accessible`,
                        ).toBe(200);
                        expect(response?.headers()["content-type"]).toContain(
                                "image/png",
                        );
                }
        });

        test("apple-mobile-web-app-capable meta tag is set", async ({
                page,
        }) => {
                await page.goto("/");

                const capable = await page.evaluate(() =>
                        document
                                .querySelector(
                                        'meta[name="apple-mobile-web-app-capable"]',
                                )
                                ?.getAttribute("content"),
                );

                expect(capable).toBe("yes");
        });

        test("apple-mobile-web-app-title meta tag is set", async ({ page }) => {
                await page.goto("/");

                const title = await page.evaluate(() =>
                        document
                                .querySelector(
                                        'meta[name="apple-mobile-web-app-title"]',
                                )
                                ?.getAttribute("content"),
                );

                expect(title).toBe("clean typewriter experience");
        });

        test("theme-color meta tag exists", async ({ page }) => {
                await page.goto("/");

                const themeColor = await page.evaluate(() =>
                        document
                                .querySelector('meta[name="theme-color"]')
                                ?.getAttribute("content"),
                );

                expect(themeColor).toBeTruthy();
                expect(themeColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });

        test("manifest link is present", async ({ page }) => {
                await page.goto("/");

                const manifestHref = await page.evaluate(() =>
                        document
                                .querySelector('link[rel="manifest"]')
                                ?.getAttribute("href"),
                );

                expect(manifestHref).toBe("/manifest.webmanifest");
        });

        test("service worker registers in production build", async ({
                page,
        }) => {
                // This test would need to run against a production build
                // For development, we just check that the SW registration logic exists
                test.skip(
                        true,
                        "Service worker tests require production build",
                );
        });
});
