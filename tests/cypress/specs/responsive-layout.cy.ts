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

    it("uses standard padding on desktop viewport", () => {
      cy.get("textarea").first().then(($el) => {
        const styles = window.getComputedStyle($el[0]);
        const padLeft = parseFloat(styles.paddingLeft);
        // Desktop should use tablet/desktop default padding (>= 21px)
        expect(padLeft).to.be.at.least(21);
      });
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

    it("uses reduced padding on mobile viewport", () => {
      cy.get("textarea").first().then(($el) => {
        const styles = window.getComputedStyle($el[0]);
        const padLeft = parseFloat(styles.paddingLeft);
        // Mobile should use golden ratio mobile padding (13px) not tablet default (21px)
        expect(padLeft).to.be.at.most(14);
      });
    });

    it("provides enough width for 5+ words on mobile", () => {
      cy.get("textarea").first().type("The quick brown fox jumps over lazy dogs");
      cy.wait(300);
      cy.get("textarea").first().then(($el) => {
        const el = $el[0] as HTMLTextAreaElement;
        const styles = window.getComputedStyle(el);
        const available = el.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
        // At 18px default font, 5 words need ~250px minimum
        expect(available).to.be.at.least(250);
      });
    });
  });

  describe("iPad (768x1024)", () => {
    beforeEach(() => {
      cy.viewport(768, 1024);
      cy.visit("/");
      cy.wait(500);
    });

    it("provides comfortable writing width on iPad", () => {
      cy.get("textarea").first().type("The quick brown fox jumps over the lazy dog near the river");
      cy.wait(300);
      cy.get("textarea").first().then(($el) => {
        const el = $el[0] as HTMLTextAreaElement;
        const styles = window.getComputedStyle(el);
        const available = el.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
        // iPad should have plenty of space — at least 500px available
        expect(available).to.be.at.least(500);
      });
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
