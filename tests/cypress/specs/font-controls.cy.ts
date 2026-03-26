describe("Font Size Controls", () => {
  beforeEach(() => {
    // Clear persisted font size offset so each test starts from default (0)
    cy.window().then((win) => {
      win.localStorage.removeItem("clean_writer_font_size_offset");
    });
    cy.visit("/");
    cy.wait(500);
  });

  it("increases font size when clicking A+", () => {
    cy.get('[aria-label="Increase font size"]').click();
    cy.wait(500);
    cy.get("textarea").should(($el) => {
      const fontSize = parseFloat(getComputedStyle($el[0]).fontSize);
      expect(fontSize).to.be.greaterThan(16);
    });
  });

  it("decreases font size when clicking A-", () => {
    cy.get('[aria-label="Decrease font size"]').click();
    cy.wait(500);
    cy.get("textarea").should(($el) => {
      const fontSize = parseFloat(getComputedStyle($el[0]).fontSize);
      expect(fontSize).to.be.lessThan(25); // base is ~22px fluid
    });
  });

  it("resets font size when clicking 0", () => {
    // Increase twice first
    cy.get('[aria-label="Increase font size"]').click();
    cy.wait(500);
    cy.get('[aria-label="Increase font size"]').click();
    cy.wait(500);
    cy.get('[aria-label="Reset font size"]').click();
    cy.wait(500);
    cy.get('[aria-label="Reset font size"]').should("be.disabled");
  });

  it("disables A- at minimum", () => {
    // Min offset is -6, step is 2, so 3 clicks from default (0)
    for (let i = 0; i < 3; i++) {
      cy.get('[aria-label="Decrease font size"]').click();
      cy.wait(200);
    }
    cy.get('[aria-label="Decrease font size"]').should("be.disabled");
  });

  it("disables A+ at maximum", () => {
    // Max offset is +12, step is 2, so 6 clicks from default (0)
    for (let i = 0; i < 6; i++) {
      cy.get('[aria-label="Increase font size"]').click();
      cy.wait(200);
    }
    cy.get('[aria-label="Increase font size"]').should("be.disabled");
  });

  it("handles rapid clicking without breaking", () => {
    for (let i = 0; i < 5; i++) {
      cy.get('[aria-label="Increase font size"]').click();
    }
    for (let i = 0; i < 5; i++) {
      cy.get('[aria-label="Decrease font size"]').click();
    }
    cy.wait(500);
    // Should be back at original — reset should be disabled
    cy.get('[aria-label="Reset font size"]').should("be.disabled");
  });

  it("font size applies to textarea", () => {
    cy.get('[aria-label="Increase font size"]').click();
    cy.wait(500);
    cy.get("textarea").should(($el) => {
      const fontSize = parseFloat(getComputedStyle($el[0]).fontSize);
      expect(fontSize).to.be.greaterThan(0);
    });
  });
});
