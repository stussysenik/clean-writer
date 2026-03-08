/// <reference types="cypress" />

describe("Dedicated Panel Modes", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
  });

  it("shows dedicated syntax mode by default on desktop", () => {
    cy.viewport(1280, 720);
    cy.typeInEditor("The beautiful cat quickly jumped over the tall fence");
    cy.waitForAnalysis();

    cy.getByTestId("desktop-syntax-panel").within(() => {
      cy.getByTestId("panel-mode-switch").should("be.visible");
      cy.getByTestId("panel-mode-syntax").should("contain.text", "Syntax");
      cy.contains("Breakdown").should("exist");
      cy.contains("Syllables").should("not.exist");
      cy.contains("Rhymes").should("not.exist");
    });
  });

  it("switches into dedicated song mode and hides syntax breakdown", () => {
    cy.viewport(1280, 720);
    cy.typeInEditor(
      "Roses are red\nViolets are blue\nSugar is sweet\nAnd so are you"
    );
    cy.waitForAnalysis();

    cy.getByTestId("panel-mode-song").click();
    cy.waitForAnalysis();

    cy.getByTestId("desktop-syntax-panel").within(() => {
      cy.contains("Syllables").should("exist");
      cy.contains("Rhymes").should("exist");
      cy.getByTestId("rhyme-group-row").its("length").should("be.greaterThan", 0);
      cy.contains("Breakdown").should("not.exist");
      cy.contains("Press").should("not.exist");
      cy.contains("Click a rhyme to toggle, double-click to solo").should("exist");
    });
  });

  it("returns from song mode back to syntax mode", () => {
    cy.viewport(1280, 720);
    cy.typeInEditor(
      "Time to rhyme in every line\nWords align and intertwine"
    );
    cy.waitForAnalysis();

    cy.getByTestId("panel-mode-song").click();
    cy.waitForAnalysis();
    cy.getByTestId("panel-mode-syntax").click();

    cy.getByTestId("desktop-syntax-panel").within(() => {
      cy.contains("Breakdown").should("exist");
      cy.contains("Syllables").should("not.exist");
      cy.contains("Press").should("exist");
    });
  });

  it("keeps the mode switch inside the panel and lines syntax rows up cleanly", () => {
    cy.viewport(1280, 720);
    cy.typeInEditor(
      "The beautiful cat quickly jumped over the tall fence while a fox and a prince watched."
    );
    cy.waitForAnalysis();

    cy.getByTestId("desktop-syntax-panel").then(($panel) => {
      const panel = $panel[0];
      const panelRect = panel.getBoundingClientRect();
      const switchRect = panel
        .querySelector('[data-testid="panel-mode-switch"]')!
        .getBoundingClientRect();

      expect(switchRect.left).to.be.greaterThan(panelRect.left + 16);
      expect(switchRect.right).to.be.lessThan(panelRect.right - 8);

      const keys = [
        "nouns",
        "verbs",
        "adjectives",
        "adverbs",
        "pronouns",
        "prepositions",
        "conjunctions",
        "articles",
        "interjections",
      ];

      const countLefts = keys.map((key) =>
        panel
          .querySelector(`[data-testid="syntax-breakdown-count-${key}"]`)!
          .getBoundingClientRect().left
      );
      const labelLefts = keys.map((key) =>
        panel
          .querySelector(`[data-testid="syntax-breakdown-label-${key}"]`)!
          .getBoundingClientRect().left
      );

      countLefts.forEach((left) => {
        expect(Math.abs(left - countLefts[0])).to.be.lessThan(2);
      });
      labelLefts.forEach((left) => {
        expect(Math.abs(left - labelLefts[0])).to.be.lessThan(2);
      });

      keys.forEach((key) => {
        const rowRect = panel
          .querySelector(`[data-testid="syntax-breakdown-row-${key}"]`)!
          .getBoundingClientRect();
        const countRect = panel
          .querySelector(`[data-testid="syntax-breakdown-count-${key}"]`)!
          .getBoundingClientRect();

        expect(countRect.top).to.be.greaterThan(rowRect.top + 1);
        expect(countRect.bottom).to.be.lessThan(rowRect.bottom - 1);
      });
    });
  });
});
