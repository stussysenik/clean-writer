/// <reference types="cypress" />

describe("Strikethrough Feature", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
    cy.clearEditor();
  });

  it("applies strikethrough to selected text via toolbar button", () => {
    cy.get("textarea").first().type("hello world", { delay: 5 });
    cy.wait(500);

    // Select "hello" (first 5 characters)
    cy.get("textarea").first().then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      textarea.focus();
      textarea.setSelectionRange(0, 5);
    });

    // Apply strikethrough via toolbar button
    cy.get('[aria-label="Strikethrough selected text"]').click();

    // Wait for state update
    cy.wait(500);

    // Verify ~~hello~~ appears in the textarea value
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("~~hello~~");
    });
  });

  it("applies strikethrough to a full line", () => {
    cy.get("textarea").first().type("Strike this entire line", { delay: 5 });
    cy.wait(500);

    // Select all text
    cy.get("textarea").first().then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      textarea.focus();
      textarea.setSelectionRange(0, "Strike this entire line".length);
    });

    // Apply strikethrough via toolbar button
    cy.get('[aria-label="Strikethrough selected text"]').click();

    cy.wait(500);

    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("~~Strike this entire line~~");
    });
  });

  it("clean strikethroughs button removes all ~~markers~~", () => {
    // Type text
    cy.get("textarea").first().type("keep this", { delay: 5 });
    cy.wait(500);

    // Select "keep" and apply strikethrough via toolbar button
    cy.get("textarea").first().then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      textarea.focus();
      textarea.setSelectionRange(0, 4);
    });

    cy.get('[aria-label="Strikethrough selected text"]').click();

    cy.wait(500);

    // Verify strikethrough was applied
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("~~");
    });

    // Click the clean strikethroughs button
    cy.getByTestId("clean-strikethroughs-btn").click();

    cy.wait(500);

    // Verify all ~~ markers are removed and the struck text is gone
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.not.include("~~");
    });
  });

  it("strikethrough renders with line-through style in backdrop", () => {
    cy.get("textarea").first().type("visible struck text", { delay: 5 });
    cy.wait(500);

    // Select "struck" and apply strikethrough via toolbar button
    cy.get("textarea").first().then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      textarea.focus();
      // "visible " is 8 chars, "struck" is 6
      textarea.setSelectionRange(8, 14);
    });

    cy.get('[aria-label="Strikethrough selected text"]').click();

    cy.wait(500);

    // The backdrop should contain a span with text-decoration: line-through
    cy.get("textarea")
      .first()
      .parent()
      .find("span")
      .filter('[style*="line-through"]')
      .should("exist");
  });

  it("does nothing when applying strikethrough with no selection (cursor only)", () => {
    cy.get("textarea").first().type("no selection here", { delay: 5 });
    cy.wait(500);

    // Place cursor without selecting (position 5, no range)
    cy.get("textarea").first().then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      textarea.focus();
      textarea.setSelectionRange(5, 5);
    });

    // Click strikethrough button with no selection
    cy.get('[aria-label="Strikethrough selected text"]').click();

    cy.wait(500);

    // Content should remain unchanged — no ~~ inserted
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.not.include("~~");
      expect(val).to.include("no selection here");
    });
  });

  it("supports multiple strikethroughs in the same content", () => {
    cy.get("textarea").first().type("aaa bbb ccc", { delay: 5 });
    cy.wait(500);

    // Strikethrough "aaa" via toolbar button
    cy.get("textarea").first().then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      textarea.focus();
      textarea.setSelectionRange(0, 3);
    });

    cy.get('[aria-label="Strikethrough selected text"]').click();

    cy.wait(500);

    // Now strikethrough "ccc" — positions shifted by 4 chars (two ~~ markers)
    cy.get("textarea").first().then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      const val = textarea.value;
      const cccStart = val.lastIndexOf("ccc");
      textarea.focus();
      textarea.setSelectionRange(cccStart, cccStart + 3);
    });

    cy.get('[aria-label="Strikethrough selected text"]').click();

    cy.wait(500);

    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("~~aaa~~");
      expect(val).to.include("~~ccc~~");
      // "bbb" should NOT be struck
      expect(val).to.not.include("~~bbb~~");
    });
  });
});
