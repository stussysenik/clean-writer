describe("Responsive Layout", () => {
  describe("Desktop (1280x720)", () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
      cy.visit("/");
      cy.wait(500);
    });

    it("shows desktop syntax panel", () => {
      cy.getByTestId("desktop-syntax-panel").should("exist");
    });

    it("shows settings gear and help button", () => {
      cy.getByTestId("open-theme-customizer").should("be.visible");
      cy.get('[aria-label="Help and shortcuts"]').should("be.visible");
    });

    it("shows theme swatches", () => {
      cy.get("[data-theme-id]").should("have.length.at.least", 5);
    });
  });

  describe("Mobile (375x667)", () => {
    beforeEach(() => {
      cy.viewport(375, 667);
      cy.visit("/");
      cy.wait(500);
    });

    it("hides desktop syntax panel on mobile", () => {
      cy.getByTestId("desktop-syntax-panel").should("not.exist");
    });

    it("shows toolbar buttons", () => {
      cy.get('[aria-label="Preview markdown"]').should("exist");
    });

    it("shows theme swatches scrollable", () => {
      cy.get("[data-theme-id]").should("have.length.at.least", 3);
    });
  });

  describe("Resize transitions", () => {
    it("panel appears when resizing from mobile to desktop", () => {
      cy.viewport(375, 667);
      cy.visit("/");
      cy.wait(500);
      cy.getByTestId("desktop-syntax-panel").should("not.exist");
      cy.viewport(1280, 720);
      cy.wait(500);
      cy.getByTestId("desktop-syntax-panel").should("exist");
    });

    it("panel disappears when resizing from desktop to mobile", () => {
      cy.viewport(1280, 720);
      cy.visit("/");
      cy.wait(500);
      cy.getByTestId("desktop-syntax-panel").should("exist");
      cy.viewport(375, 667);
      cy.wait(500);
      cy.getByTestId("desktop-syntax-panel").should("not.exist");
    });

    it("content preserved across resize", () => {
      cy.visit("/");
      cy.wait(500);
      cy.typeInEditor("hello resize test");
      cy.wait(500);
      cy.viewport(375, 667);
      cy.wait(500);
      cy.viewport(1280, 720);
      cy.wait(500);
      cy.get("textarea").should(($el) => {
        expect($el.val()).to.include("hello resize test");
      });
    });
  });
});
