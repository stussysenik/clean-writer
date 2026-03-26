/// <reference types="cypress" />

// Custom commands for Clean Writer tests

Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add("typeInEditor", (text: string) => {
  // Clear first using the app's Clear button
  cy.clearEditor();
  cy.get("textarea").first().type(text, { delay: 5 });
});

Cypress.Commands.add("waitForAnalysis", () => {
  // Wait for the syntax analysis debounce (150ms) + worker processing
  cy.wait(500);
});

Cypress.Commands.add("clearEditor", () => {
  // Check if editor already empty — skip clear button if so
  cy.get("textarea").first().then(($ta) => {
    if (($ta[0] as HTMLTextAreaElement).value === "") {
      // Already empty, just focus
      cy.get("textarea").first().click();
      return;
    }
    // Use the app's Clear button to properly reset React state
    cy.get('[aria-label="Clear all content"]').click();
    cy.wait(300);
    cy.get("body").then(($body) => {
      const confirmBtn = $body.find("button").filter((_i, el) =>
        /clear page/i.test(el.textContent || "")
      );
      if (confirmBtn.length) {
        cy.wrap(confirmBtn.first()).click();
      }
    });
    // Wait for React to process the clear
    cy.wait(500);
    cy.get("textarea").first().should("have.value", "");
    cy.get("textarea").first().click();
  });
});

Cypress.Commands.add("switchMode", (mode: "syntax" | "song" | "code") => {
  cy.getByTestId(`panel-mode-${mode}`).click();
});

Cypress.Commands.add("noConsoleErrors", () => {
  cy.window().then((win) => {
    // Spy was set up in beforeEach — check it
    const spy = (win.console.error as any);
    if (spy && spy.callCount !== undefined) {
      expect(spy.callCount, "console.error was called").to.equal(0);
    }
  });
});

// Type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      typeInEditor(text: string): Chainable<void>;
      waitForAnalysis(): Chainable<void>;
      clearEditor(): Chainable<void>;
      switchMode(mode: "syntax" | "song" | "code"): Chainable<void>;
      noConsoleErrors(): Chainable<void>;
    }
  }
}
