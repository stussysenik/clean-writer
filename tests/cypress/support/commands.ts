/// <reference types="cypress" />

// Custom commands for Clean Writer tests

Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add("typeInEditor", (text: string) => {
  cy.get("textarea").first().clear();
  cy.get("textarea").first().type(text, { delay: 0 });
});

Cypress.Commands.add("waitForAnalysis", () => {
  // Wait for the syntax analysis debounce (150ms) + worker processing
  cy.wait(500);
});

// Type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      typeInEditor(text: string): Chainable<void>;
      waitForAnalysis(): Chainable<void>;
    }
  }
}
