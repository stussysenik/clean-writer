/// <reference types="cypress" />

describe("Edit vs View Mode — Mobile Visual Distinction", () => {
  beforeEach(() => {
    cy.viewport(375, 812);
    cy.visit("/");
    cy.get("textarea").should("exist");
  });

  it("background shifts to warm tint when textarea is focused (editing)", () => {
    // Capture initial background
    cy.get("div.w-full.h-\\[100dvh\\]")
      .first()
      .invoke("css", "background-color")
      .as("viewingBg");

    // Focus textarea to enter editing mode
    cy.get("textarea").first().focus();

    // Wait for the edit state transition
    cy.wait(200);

    // Background should have changed (warm tint applied)
    cy.get("div.w-full.h-\\[100dvh\\]")
      .first()
      .invoke("css", "background-color")
      .then(function (editingBg) {
        // The editing background should be different from viewing background
        // (warm tint applied via oklchInterpolate)
        expect(editingBg).to.not.equal(this.viewingBg);
      });
  });

  it("toolbar dims in viewing mode on mobile", () => {
    // In viewing mode (no focus), toolbar should be dimmed
    cy.get("footer")
      .first()
      .invoke("css", "opacity")
      .then((opacity) => {
        expect(parseFloat(opacity as unknown as string)).to.be.lessThan(1);
      });
  });

  it("toolbar becomes fully opaque when editing", () => {
    // Click and type into textarea to reliably enter editing mode
    // (focus alone may not trigger the native focus event in Cypress mobile viewport)
    cy.get("textarea").first().click();
    cy.get("textarea").first().type("x", { delay: 5 });
    cy.wait(500);

    // Toolbar should be fully opaque in editing mode
    cy.get("footer")
      .first()
      .invoke("css", "opacity")
      .then((opacity) => {
        expect(parseFloat(opacity as unknown as string)).to.equal(1);
      });
  });
});
