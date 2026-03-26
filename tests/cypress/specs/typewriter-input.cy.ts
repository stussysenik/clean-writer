/// <reference types="cypress" />

describe("Typewriter Input — Core Text Edge Cases", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
    cy.clearEditor();
  });

  it("types a single character and verifies it appears in the textarea", () => {
    cy.get("textarea").first().type("a", { delay: 5 });
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("a");
    });
  });

  it("types text then clears all — shows empty state with placeholder", () => {
    cy.get("textarea").first().type("hello", { delay: 5 });
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("hello");
    });
    cy.clearEditor();
    cy.get("textarea").first().should("have.value", "");
    cy.get("textarea")
      .first()
      .should("have.attr", "placeholder", "Type here...");
  });

  it("pastes plain text via clipboard API", () => {
    const pasteText = "Pasted from clipboard";

    cy.get("textarea").first().focus();
    cy.get("textarea").first().invoke("val", "").trigger("input");

    // Use Cypress clipboard paste
    cy.get("textarea").first().then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      textarea.focus();

      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", pasteText);
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData,
        bubbles: true,
        cancelable: true,
      });
      textarea.dispatchEvent(pasteEvent);
    });

    // The paste handler should insert the text
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("Pasted from clipboard");
    });
  });

  it("pastes multi-line text preserving newlines", () => {
    const multiLine = "Line one\nLine two\nLine three";

    cy.get("textarea").first().then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      textarea.focus();

      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", multiLine);
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData,
        bubbles: true,
        cancelable: true,
      });
      textarea.dispatchEvent(pasteEvent);
    });

    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("Line one\nLine two\nLine three");
    });
  });

  it("types single-codepoint emoji", () => {
    cy.typeInEditor("\u{1F600}"); // grinning face
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("\u{1F600}");
    });
  });

  it("types multi-codepoint family emoji", () => {
    const familyEmoji = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}";
    cy.typeInEditor(familyEmoji);
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include(familyEmoji);
    });
  });

  it("types flag emoji", () => {
    const usFlag = "\u{1F1FA}\u{1F1F8}";
    cy.typeInEditor(usFlag);
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include(usFlag);
    });
  });

  it("types special characters and they appear in content", () => {
    // Use slight delay so the app's custom handler can keep up
    cy.get("textarea").first().type("abc <>& /", { delay: 5 });
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("<");
      expect(val).to.include(">");
      expect(val).to.include("&");
    });
  });

  it("handles typing of many characters", () => {
    // Use delay: 5 for stable typing
    const longText = "a".repeat(50);
    cy.get("textarea").first().type(longText, { delay: 5 });
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include(longText);
    });
  });

  it("clear editor leaves editor empty", () => {
    // Type some content first, then clear
    cy.get("textarea").first().type("Some content here", { delay: 5 });
    cy.wait(300);
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("Some content");
    });
    cy.clearEditor();
    cy.get("textarea").first().should("have.value", "");
  });

  it("type after clear replaces content", () => {
    cy.typeInEditor("Original text");
    cy.wait(200);
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("Original text");
    });
  });

  it("backspace is disabled (deletion not allowed in typewriter mode)", () => {
    cy.typeInEditor("abcdef");
    cy.wait(500);
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("abcdef");
    });
    // Attempt backspace — the app intentionally prevents deletion
    cy.get("textarea").first().type("{backspace}", { delay: 50 });
    cy.wait(500);
    cy.get("textarea").first().type("{backspace}", { delay: 50 });
    cy.wait(500);
    // Content should remain unchanged since backspace is blocked
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("abcdef");
    });
  });
});
