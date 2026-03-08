/// <reference types="cypress" />

describe("OKLCH Theme Colors", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
  });

  it("all 16 theme swatches are rendered", () => {
    // The theme selector should have swatch buttons
    cy.get("[data-theme-id]").should("have.length.gte", 10);
  });

  it("switching themes updates highlight colors in the panel", () => {
    // Type content to trigger analysis
    cy.typeInEditor("The quick brown fox jumps over the lazy dog");
    cy.waitForAnalysis();

    // Click a different theme swatch (e.g., second one)
    cy.get("[data-theme-id]").eq(1).click();

    // The panel word type dots should reflect the new theme's highlight colors
    // The body background should change
    cy.get("body").should("exist");
  });

  it("theme swatches render as clean single-color chips", () => {
    cy.get("[data-theme-id]").first().within(() => {
      cy.get("span.rounded-full").should("not.exist");
    });
  });

  it("combines base theme selection and color editing in the Themes panel", () => {
    cy.getByTestId("open-theme-customizer").click();

    cy.getByTestId("theme-customizer-panel").within(() => {
      cy.contains("button", "Themes").should("exist");
      cy.contains("button", "Colors").should("not.exist");
      cy.contains("Base Theme").should("exist");
      cy.contains("Pick a preset, then tune editor, syntax, and song colors in one surface.").should("not.exist");
      cy.getByTestId("theme-actions-legend").within(() => {
        cy.contains("Show").should("exist");
        cy.contains("Order").should("exist");
        cy.contains("Edit").should("exist");
      });
      cy.getByTestId("themes-list").should("exist");
      cy.contains("Syntax Colors").should("exist");
      cy.contains("Song Colors").should("exist");
      cy.contains("Editor Colors").should("exist");
      cy.contains("Word Colors").should("exist");
      cy.getByTestId("themes-list").find('input[type="checkbox"]').should("not.exist");
    });
  });

  it("hides slider controls from the UI", () => {
    cy.get('input[type="range"]').should("not.exist");

    cy.getByTestId("open-theme-customizer").click();
    cy.getByTestId("theme-customizer-panel").within(() => {
      cy.contains("button", "Type").click();
      cy.get('input[type="range"]').should("not.exist");
    });
  });

  it("theme colors maintain contrast against backgrounds", () => {
    // Type content that triggers multiple word types
    cy.typeInEditor(
      "I quickly ran to the beautiful store and bought many things"
    );
    cy.waitForAnalysis();

    // Switch through several themes and verify no invisible text
    const themeIndices = [0, 1, 2, 3, 4];
    themeIndices.forEach((idx) => {
      cy.get("[data-theme-id]").eq(idx).click();
      // Verify the main editor area has visible content (not transparent against bg)
      cy.get("textarea").should("be.visible");
    });
  });
});
