/// <reference types="cypress" />

describe("Guide Rail", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
  });

  it("opens help inside the sidebar rail and keeps workspace padding on desktop", () => {
    cy.viewport(1280, 800);

    cy.get('[aria-label="Help and shortcuts"]').click();
    cy.getByTestId("document-sidebar").should(($sidebar) => {
      const rect = $sidebar[0].getBoundingClientRect();
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(280);
    });

    cy.getByTestId("sidebar-guide-section").within(() => {
      cy.contains("Core rhythm").should("exist");
      cy.contains("Editing").should("exist");
      cy.contains("Focus mode").should("exist");
      cy.contains("Toggle preview").should("exist");
    });

    cy.get("main").should(($main) => {
      const styles = window.getComputedStyle($main[0]);
      expect(styles.paddingLeft).to.equal("280px");
    });
  });
});
