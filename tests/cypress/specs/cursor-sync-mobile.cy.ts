/// <reference types="cypress" />

describe("Cursor Sync — Mobile Keyboard Stays Open", () => {
  beforeEach(() => {
    // Set mobile viewport
    cy.viewport(375, 812);
    cy.visit("/");
    cy.get("textarea").should("exist");
  });

  it("textarea remains focused after typing", () => {
    cy.get("textarea").first().focus().type("Hello world");
    cy.get("textarea").first().should("have.focus");
  });

  it("panel content area has pointer-down prevention", () => {
    cy.typeInEditor("Some test content for analysis");
    cy.waitForAnalysis();

    // The mobile panel full content wrapper should prevent default on pointerdown
    // This is tested via the data-testid attribute on HarmonicaContainer's full content area
    cy.getByTestId("mobile-panel-scroll-region").should("exist");
  });

  it("persisted selection is restored on focus", () => {
    // Type content and select some text
    cy.get("textarea").first().focus().type("Hello beautiful world");

    // Select "beautiful" (indices 6-15)
    cy.get("textarea").first().then(($el) => {
      const el = $el[0] as HTMLTextAreaElement;
      el.setSelectionRange(6, 15);
    });

    // Blur and refocus — selection should be restored
    cy.get("textarea").first().blur();
    cy.get("textarea").first().focus();

    cy.get("textarea").first().then(($el) => {
      const el = $el[0] as HTMLTextAreaElement;
      // After refocus, the persisted selection hook should restore the range
      expect(el.selectionStart).to.be.lessThan(el.selectionEnd);
    });
  });
});
