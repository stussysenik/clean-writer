/// <reference types="cypress" />

describe("Selection Highlight", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
  });

  it("keeps the live selection highlight enabled while selecting text", () => {
    cy.typeInEditor("Delete this clearly selected phrase");

    cy.get("textarea")
      .should("have.attr", "class")
      .and("not.include", "selection:bg-transparent");

    cy.get("textarea").then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      textarea.focus();
      textarea.setSelectionRange(0, 12);

      expect(textarea.selectionStart).to.equal(0);
      expect(textarea.selectionEnd).to.equal(12);
    });
  });
});
