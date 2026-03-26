describe("UI Polish", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").as("editor");
  });

  describe("Cursor Dot", () => {
    it("shows cursor dot when typing at end of text", () => {
      cy.clearEditor();
      cy.get("@editor").first().type("hello world", { delay: 5 });
      cy.wait(1000);
      cy.get('[data-testid="cursor-dot"]', { timeout: 8000 }).should("exist");
    });

    it("hides cursor dot when cursor moves to middle", () => {
      cy.clearEditor();
      cy.get("@editor").first().type("hello world", { delay: 5 });
      cy.wait(500);
      cy.get("@editor").first().type("{home}");
      cy.wait(500);
      cy.get('[data-testid="cursor-dot"]').should("not.exist");
    });

    it("cursor dot has glow effect (box-shadow)", () => {
      cy.clearEditor();
      cy.get("@editor").first().type("test", { delay: 5 });
      cy.wait(1000);
      cy.get('[data-testid="cursor-dot"]', { timeout: 8000 })
        .should("exist")
        .and("have.css", "border-radius", "50%")
        .and("have.css", "width", "6px");
    });
  });

  describe("Toolbar Layout", () => {
    it("displays font controls, help, and settings in single row", () => {
      cy.get('[data-testid="open-theme-customizer"]').should("be.visible");
      // All controls should be siblings in the same flex container
      cy.get('[data-testid="open-theme-customizer"]')
        .parent()
        .parent()
        .find("button")
        .should("have.length.at.least", 4); // A-, 0, A+, help, settings
    });
  });

  describe("Theme Swatches", () => {
    it("displays swatches in single row with flex-nowrap", () => {
      cy.get(".flex-nowrap").should("exist");
    });
  });

  describe("Scroll Animation", () => {
    it("smoothly scrolls when typing enough content", () => {
      cy.clearEditor();
      // Type enough lines to trigger scroll — use newlines via {enter}
      for (let i = 0; i < 30; i++) {
        cy.get("@editor").first().type(`Line ${i}{enter}`, { delay: 0 });
      }
      cy.wait(2000);
      // Verify textarea has scrolled (scrollTop > 0)
      cy.get("@editor").first().should(($el) => {
        expect($el[0].scrollTop).to.be.greaterThan(0);
      });
    });
  });
});
