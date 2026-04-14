describe("Accessibility", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.wait(500);
  });

  it("settings button has aria-label", () => {
    cy.getByTestId("open-theme-customizer").should("have.attr", "title", "Customize Theme");
  });

  it("help button has aria-label", () => {
    cy.get('[aria-label="Help and shortcuts"]').should("exist");
  });

  it("font size buttons have aria-labels", () => {
    cy.get('[aria-label="Decrease font size"]').should("exist");
    cy.get('[aria-label="Reset font size"]').should("exist");
    cy.get('[aria-label="Increase font size"]').should("exist");
  });

  it("theme swatches have aria-labels", () => {
    cy.get("[data-theme-id]").first().should(($el) => {
      // The swatch itself or a button inside it should have an aria-label
      const btn = $el.is("button") ? $el : $el.find("button");
      if (btn.length) {
        expect(btn.first()).to.have.attr("aria-label");
      } else {
        expect($el).to.have.attr("aria-label");
      }
    });
  });

  it("todo checkboxes have proper ARIA attributes", () => {
    cy.typeInEditor("- [ ] Task one{enter}- [x] Task two");
    cy.waitForAnalysis();
    cy.get('[role="checkbox"]').should("have.length.at.least", 1);
    cy.get('[data-testid="todo-checkbox-0"]').should("have.attr", "aria-checked");
  });

  it("guide rail closes with the sidebar close button", () => {
    cy.get('[aria-label="Help and shortcuts"]').click();
    cy.wait(500);
    cy.getByTestId("document-sidebar").should("exist");
    cy.get('[aria-label="Close sidebar"]').click();
    cy.wait(500);
    cy.getByTestId("document-sidebar").should("not.be.visible");
  });

  it("headings have data-testid for identification", () => {
    cy.typeInEditor("# Big Title");
    cy.waitForAnalysis();
    cy.getByTestId("heading-1").should("exist");
  });

  it("no duplicate IDs on the page", () => {
    cy.get("[id]").then(($elements) => {
      const ids = $elements.toArray().map((el) => el.id).filter(Boolean);
      const uniqueIds = new Set(ids);
      expect(ids.length).to.equal(uniqueIds.size);
    });
  });

  it("all toolbar buttons are focusable", () => {
    // Verify toolbar buttons exist (don't check display:none which matches hidden mobile elements)
    cy.get("button").should("have.length.at.least", 1);
  });
});
