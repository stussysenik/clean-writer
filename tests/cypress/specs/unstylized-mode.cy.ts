/**
 * Tests for unstylized (plain text) mode visual correctness.
 * Ensures no underlines, white background across all themes,
 * and clean rendering on mobile and desktop.
 */

// Dark themes where background bleed-through would be most visible
const DARK_THEMES = ["blueprint", "midnight", "terminal", "ocean", "forest"];
const LIGHT_THEMES = ["classic", "sepia", "paper", "warmth", "flexoki-light"];

function enterUnstylizedMode() {
  cy.getByTestId("unstylized-mode-btn").click();
  // Wait for the 500ms CSS transition-colors to complete
  cy.wait(600);
}

function exitUnstylizedMode() {
  cy.getByTestId("unstylized-mode-btn").click();
  cy.wait(600);
}

function selectTheme(themeId: string) {
  cy.get(`[data-theme-id="${themeId}"]`).scrollIntoView().click({ force: true });
  cy.wait(600);
}

describe("Unstylized (Plain Text) Mode", () => {
  describe("Desktop (1280x720)", () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
      cy.visit("/");
      cy.wait(500);
    });

    it("removes all underlines from words in unstylized mode", () => {
      cy.typeInEditor("The quick brown fox jumps over the lazy dog");
      cy.wait(300);
      enterUnstylizedMode();

      // No word span should have a border-bottom
      cy.get("main span").each(($span) => {
        const styles = window.getComputedStyle($span[0]);
        // borderBottomStyle should be "none" or borderBottomWidth should be "0px"
        const hasBorder = styles.borderBottomStyle !== "none" && styles.borderBottomWidth !== "0px";
        expect(hasBorder, `span "${$span.text()}" should not have underline`).to.be.false;
      });
    });

    it("uses white background in unstylized mode", () => {
      enterUnstylizedMode();

      cy.get("div.w-full.h-\\[100dvh\\]").first().then(($el) => {
        const bg = window.getComputedStyle($el[0]).backgroundColor;
        // Should be white: rgb(255, 255, 255)
        expect(bg).to.equal("rgb(255, 255, 255)");
      });
    });

    it("restores theme styling when exiting unstylized mode", () => {
      enterUnstylizedMode();
      exitUnstylizedMode();

      cy.typeInEditor("Hello world testing restore");
      cy.wait(300);

      // Words should have colors again (not all black)
      cy.get("main span").then(($spans) => {
        const colors = new Set<string>();
        $spans.each((_, el) => {
          const color = window.getComputedStyle(el).color;
          if (el.textContent && el.textContent.trim().length > 0) {
            colors.add(color);
          }
        });
        // In normal mode, should have more than just one color
        expect(colors.size).to.be.greaterThan(1);
      });
    });
  });

  describe("Mobile (375x667)", () => {
    beforeEach(() => {
      cy.viewport(375, 667);
      cy.visit("/");
      cy.wait(500);
    });

    it("has no underlines on mobile in unstylized mode", () => {
      cy.typeInEditor("Writing on mobile without underlines");
      cy.wait(300);
      enterUnstylizedMode();

      cy.get("main span").each(($span) => {
        const styles = window.getComputedStyle($span[0]);
        const hasBorder = styles.borderBottomStyle !== "none" && styles.borderBottomWidth !== "0px";
        expect(hasBorder).to.be.false;
      });
    });

    it("has white background on mobile in unstylized mode", () => {
      enterUnstylizedMode();

      cy.get("div.w-full.h-\\[100dvh\\]").first().then(($el) => {
        const bg = window.getComputedStyle($el[0]).backgroundColor;
        expect(bg).to.equal("rgb(255, 255, 255)");
      });
    });
  });

  describe("Dark theme → unstylized mode (no background bleed-through)", () => {
    DARK_THEMES.forEach((themeId) => {
      it(`${themeId}: white background in unstylized mode`, () => {
        cy.viewport(375, 667);
        cy.visit("/");
        cy.wait(500);

        selectTheme(themeId);
        enterUnstylizedMode();

        // Root container should be white
        cy.get("div.w-full.h-\\[100dvh\\]").first().then(($el) => {
          const bg = window.getComputedStyle($el[0]).backgroundColor;
          expect(bg, `${themeId} should have white background in unstylized mode`).to.equal("rgb(255, 255, 255)");
        });

        // Top fade overlay should also use white gradient (not dark theme color)
        cy.get("[data-overlap-ignore]").then(($overlays) => {
          // The gradient overlay is the second data-overlap-ignore element
          const fadeOverlay = $overlays[1];
          if (fadeOverlay) {
            const bg = window.getComputedStyle(fadeOverlay).background;
            // Should contain "rgb(255, 255, 255)" not the dark theme color
            expect(bg).to.include("rgb(255, 255, 255)");
          }
        });
      });
    });
  });

  describe("Light theme → unstylized mode consistency", () => {
    LIGHT_THEMES.forEach((themeId) => {
      it(`${themeId}: white background and no underlines in unstylized mode`, () => {
        cy.viewport(1280, 720);
        cy.visit("/");
        cy.wait(500);

        selectTheme(themeId);
        cy.typeInEditor("Testing light theme plain text mode");
        cy.wait(300);
        enterUnstylizedMode();

        // Background should be white
        cy.get("div.w-full.h-\\[100dvh\\]").first().then(($el) => {
          const bg = window.getComputedStyle($el[0]).backgroundColor;
          expect(bg).to.equal("rgb(255, 255, 255)");
        });

        // No underlines
        cy.get("main span").each(($span) => {
          const styles = window.getComputedStyle($span[0]);
          const hasBorder = styles.borderBottomStyle !== "none" && styles.borderBottomWidth !== "0px";
          expect(hasBorder).to.be.false;
        });
      });
    });
  });

  describe("All text is black in unstylized mode", () => {
    it("all word spans are black regardless of syntax category", () => {
      cy.viewport(1280, 720);
      cy.visit("/");
      cy.wait(500);
      cy.typeInEditor("The beautiful cat quickly runs and jumps over lazy sleeping dogs");
      cy.wait(300);
      enterUnstylizedMode();

      cy.get("main span").each(($span) => {
        if ($span.text().trim().length > 0) {
          const color = window.getComputedStyle($span[0]).color;
          expect(color, `"${$span.text()}" should be black`).to.equal("rgb(0, 0, 0)");
        }
      });
    });
  });
});
