/// <reference types="cypress" />

describe("Help Modal", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
  });

  it("uses the available desktop width and lays shortcuts out comfortably", () => {
    cy.viewport(1280, 800);

    cy.get('[aria-label="Help and shortcuts"]').click();
    cy.getByTestId("help-modal").should("be.visible");
    cy.getByTestId("help-modal")
      .invoke("outerWidth")
      .should("be.greaterThan", 900);

    cy.getByTestId("help-modal").within(() => {
      cy.contains("Editing").should("exist");
      cy.contains("View").should("exist");
      cy.contains("Focus Mode").should("exist");
      cy.contains("Mobile").should("exist");
      cy.contains("Tap a theme chip to switch").should("exist");
    });

    cy.contains("Editing").then(($editing) => {
      cy.contains("View").then(($view) => {
        const editingLeft = $editing[0].getBoundingClientRect().left;
        const viewLeft = $view[0].getBoundingClientRect().left;
        expect(viewLeft).to.be.greaterThan(editingLeft + 180);
      });
    });
  });
});
