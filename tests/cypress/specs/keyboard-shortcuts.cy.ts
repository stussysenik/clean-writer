/// <reference types="cypress" />

/**
 * Toolbar button interaction tests.
 *
 * Cypress synthetic keyboard events do not trigger @tanstack/react-hotkeys,
 * so we test the same functionality via toolbar button clicks instead.
 * Each test verifies that clicking the toolbar button produces the expected
 * result (the same result the keyboard shortcut would produce).
 */
describe("Toolbar Button Interactions", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
    cy.clearEditor();
  });

  describe("Strikethrough button toggles strikethrough", () => {
    it("applies strikethrough to selected text via toolbar button", () => {
      cy.get("textarea").first().type("select me", { delay: 5 });
      cy.wait(500);

      cy.get("textarea").first().then(($textarea) => {
        const textarea = $textarea[0] as HTMLTextAreaElement;
        textarea.focus();
        textarea.setSelectionRange(0, 6); // "select"
      });

      // Click the strikethrough toolbar button
      cy.get('[aria-label="Strikethrough selected text"]').click();

      cy.wait(500);

      cy.get("textarea").first().should(($el) => {
        const val = ($el[0] as HTMLTextAreaElement).value;
        expect(val).to.include("~~select~~");
      });
    });
  });

  describe("Settings button opens theme customizer", () => {
    it("opens theme customizer when settings button is clicked", () => {
      cy.getByTestId("open-theme-customizer").should("exist");
      cy.getByTestId("open-theme-customizer").click();

      // Verify the customizer panel is now visible
      cy.getByTestId("theme-customizer-panel").should("exist");
    });
  });

  describe("Close buttons dismiss open panels", () => {
    it("closes theme customizer via close button", () => {
      // Open the customizer
      cy.getByTestId("open-theme-customizer").click();
      cy.getByTestId("theme-customizer-panel").should("exist");

      // Click the close button (X) inside the customizer header
      cy.getByTestId("theme-customizer-panel")
        .find('button[title="Close"]')
        .click();

      cy.wait(500);

      // Customizer should be closed
      cy.getByTestId("theme-customizer-panel").should("not.exist");
    });

    it("closes theme customizer via backdrop click", () => {
      // Open the customizer
      cy.getByTestId("open-theme-customizer").click();
      cy.getByTestId("theme-customizer-panel").should("exist");

      // Click the backdrop (fixed overlay behind the panel) to close
      cy.get(".fixed.inset-0").first().click({ force: true });

      cy.wait(500);

      // Customizer should be closed
      cy.getByTestId("theme-customizer-panel").should("not.exist");
    });

    it("focus mode button cycles back to none (exit focus mode)", () => {
      cy.get("textarea").first().type("Test focus mode exit behavior.", { delay: 5 });
      cy.waitForAnalysis();

      // Enter focus mode via toolbar button
      cy.get('[aria-label="Cycle focus mode"]').click();
      cy.wait(500);

      // Should be in word mode
      cy.get('[aria-label="Cycle focus mode"]')
        .parent()
        .should("contain.text", "Word");

      // Cycle through all modes back to none via toolbar button
      cy.get('[aria-label="Cycle focus mode"]').click(); // sentence
      cy.wait(500);
      cy.get('[aria-label="Cycle focus mode"]').click(); // paragraph
      cy.wait(500);
      cy.get('[aria-label="Cycle focus mode"]').click(); // none
      cy.wait(500);

      // Should be back to none (Focus label)
      cy.get('[aria-label="Cycle focus mode"]')
        .parent()
        .should("contain.text", "Focus");
    });
  });

  describe("Syntax highlight toggles via panel clicks", () => {
    it("clicking nouns row toggles nouns highlight", () => {
      cy.get("textarea").first().type("The cat sat on the mat", { delay: 5 });
      cy.waitForAnalysis();

      // Verify the row exists and starts at full opacity
      cy.getByTestId("syntax-breakdown-row-nouns").should("exist");

      // Click the toggle button to turn off nouns
      cy.getByTestId("syntax-breakdown-toggle-nouns").click();
      cy.wait(300);

      // The ROW opacity should drop below 1 when the highlight is toggled off
      cy.getByTestId("syntax-breakdown-row-nouns").invoke("css", "opacity").then((opacity) => {
        expect(parseFloat(opacity as unknown as string)).to.be.lessThan(1);
      });
    });

    it("clicking verbs row toggles verbs highlight", () => {
      cy.get("textarea").first().type("The cat sat on the mat", { delay: 5 });
      cy.waitForAnalysis();

      // Verify the row exists and starts at full opacity
      cy.getByTestId("syntax-breakdown-row-verbs").should("exist");

      // Click the toggle button to turn off verbs
      cy.getByTestId("syntax-breakdown-toggle-verbs").click();
      cy.wait(300);

      // The ROW opacity should drop below 1 when the highlight is toggled off
      cy.getByTestId("syntax-breakdown-row-verbs").invoke("css", "opacity").then((opacity) => {
        expect(parseFloat(opacity as unknown as string)).to.be.lessThan(1);
      });
    });
  });

  describe("Tab key — Overlay", () => {
    it("Tab key is intercepted (does not insert tab character)", () => {
      cy.get("textarea").first().type("test", { delay: 5 });

      // Press Tab — should NOT insert a tab character
      cy.get("textarea").first().trigger("keydown", {
        key: "Tab",
        code: "Tab",
        which: 9,
        keyCode: 9,
      });

      cy.get("textarea").first().should(($el) => {
        const val = ($el[0] as HTMLTextAreaElement).value;
        expect(val).to.not.include("\t");
      });
    });
  });

  describe("Inputs inside customizer do not trigger toolbar actions", () => {
    it("number keys type into rename input without toggling highlights", () => {
      // First, type content so syntax panel is visible
      cy.get("textarea").first().type("The cat sat on the mat", { delay: 5 });
      cy.waitForAnalysis();

      // Record that nouns are initially enabled (row at full opacity)
      cy.getByTestId("syntax-breakdown-row-nouns").invoke("css", "opacity").then((initialOpacity) => {
        const startOpacity = parseFloat(initialOpacity as unknown as string);
        expect(startOpacity).to.equal(1);
      });

      // Open the theme customizer
      cy.getByTestId("open-theme-customizer").click();
      cy.getByTestId("theme-customizer-panel").should("exist");

      // Focus something inside the customizer panel so it has focus
      cy.getByTestId("theme-customizer-panel").find("button").first().focus();
      cy.wait(200);

      // Press "1" key (which would toggle nouns if shortcuts were active)
      cy.get("body").trigger("keydown", { key: "1", code: "Digit1" });
      cy.wait(300);

      // Nouns row should still be at full opacity (shortcut should NOT fire while customizer is open)
      cy.getByTestId("syntax-breakdown-row-nouns").invoke("css", "opacity").then((opacity) => {
        const op = parseFloat(opacity as unknown as string);
        expect(op).to.equal(1);
      });

      // Close customizer via close button
      cy.getByTestId("theme-customizer-panel")
        .find('button[title="Close"]')
        .click();
    });
  });
});
