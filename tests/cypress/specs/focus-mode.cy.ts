/// <reference types="cypress" />

describe("Focus Mode Navigation", () => {
  /**
   * Helper: click the focus-mode cycle button in the toolbar.
   * The button label cycles through: Focus -> Word -> Sentence -> Paragraph -> Focus
   */
  function clickFocusButton() {
    cy.get('[aria-label="Cycle focus mode"]').click();
  }

  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
    cy.clearEditor();
  });

  it("cycles focus mode: none -> word -> sentence -> paragraph -> none", () => {
    // Type some content so focus mode has something to highlight
    cy.get("textarea").first().type("The quick brown fox. Jumps over the lazy dog.", { delay: 5 });
    cy.waitForAnalysis();

    // Initially: Focus label (none mode)
    cy.get('[aria-label="Cycle focus mode"]').should("exist");

    // Click 1: none -> word
    clickFocusButton();
    cy.wait(500);
    cy.get('[aria-label="Cycle focus mode"]')
      .parent()
      .should("contain.text", "Word");

    // Click 2: word -> sentence
    clickFocusButton();
    cy.wait(500);
    cy.get('[aria-label="Cycle focus mode"]')
      .parent()
      .should("contain.text", "Sentence");

    // Click 3: sentence -> paragraph
    clickFocusButton();
    cy.wait(500);
    cy.get('[aria-label="Cycle focus mode"]')
      .parent()
      .should("contain.text", "Para");

    // Click 4: paragraph -> none (Focus label)
    clickFocusButton();
    cy.wait(500);
    cy.get('[aria-label="Cycle focus mode"]')
      .parent()
      .should("contain.text", "Focus");
  });

  it("in word mode: focus-range test id exists", () => {
    cy.get("textarea").first().type("Hello world test words here", { delay: 5 });
    cy.waitForAnalysis();

    clickFocusButton(); // none -> word
    cy.wait(500);

    cy.getByTestId("focus-range").should("exist");
  });

  it("in sentence mode: focus-range test id exists", () => {
    cy.get("textarea").first().type("First sentence here. Second sentence here.", { delay: 5 });
    cy.waitForAnalysis();

    // Cycle to sentence mode (none -> word -> sentence)
    clickFocusButton();
    cy.wait(500);
    clickFocusButton();
    cy.wait(500);

    cy.getByTestId("focus-range").should("exist");
  });

  it("focus mode with empty content does not crash", () => {
    // Editor is already cleared in beforeEach
    cy.get("textarea").first().should("have.value", "");

    // Cycle through all focus modes on empty content
    clickFocusButton(); // word
    cy.wait(500);
    clickFocusButton(); // sentence
    cy.wait(500);
    clickFocusButton(); // paragraph
    cy.wait(500);
    clickFocusButton(); // none
    cy.wait(500);

    // App should still be functional — textarea exists and is usable
    cy.get("textarea").first().should("exist");
    cy.get("textarea").first().type("Still works", { delay: 5 });
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("Still works");
    });
  });

  it("focus mode + clear content does not crash", () => {
    cy.get("textarea").first().type("Some content for focus", { delay: 5 });
    cy.waitForAnalysis();

    // Enter word focus mode
    clickFocusButton();
    cy.wait(500);

    // Now clear all content while in focus mode
    cy.clearEditor();
    cy.wait(500);

    // App should not crash — textarea still functional
    cy.get("textarea").first().should("exist");
    cy.get("textarea").first().type("Recovered", { delay: 5 });
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("Recovered");
    });
  });

  it("toggles focus mode on/off rapidly 5 cycles without errors", () => {
    cy.get("textarea").first().type("Rapid toggle test content. Multiple sentences. Third one.", { delay: 5 });
    cy.waitForAnalysis();

    // 5 full cycles = 20 clicks (4 states per cycle)
    for (let i = 0; i < 20; i++) {
      clickFocusButton();
    }

    cy.wait(500);

    // After 20 clicks we should be back at "none" (Focus label)
    cy.get('[aria-label="Cycle focus mode"]')
      .parent()
      .should("contain.text", "Focus");

    // App should still be stable
    cy.get("textarea").first().should("exist");
  });

  it("focus mode button cycles modes (replaces keyboard shortcut test)", () => {
    cy.get("textarea").first().type("Shortcut test sentence. Another one.", { delay: 5 });
    cy.waitForAnalysis();

    // Click focus mode button to cycle
    clickFocusButton();
    cy.wait(500);

    // Should have moved from none -> word
    cy.get('[aria-label="Cycle focus mode"]')
      .parent()
      .should("contain.text", "Word");

    // Click again to go to sentence
    clickFocusButton();
    cy.wait(500);

    cy.get('[aria-label="Cycle focus mode"]')
      .parent()
      .should("contain.text", "Sentence");
  });
});
