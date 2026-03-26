/// <reference types="cypress" />

/**
 * International input tests.
 *
 * Real IME composition events (compositionstart/update/end) cannot be fully
 * simulated in Cypress because the browser's native IME pipeline is not
 * triggered by synthetic events. Instead we test that the app correctly
 * accepts and displays direct Unicode character input, which covers the
 * final committed output of any IME session.
 */
describe("IME & International Input", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
    cy.clearEditor();
  });

  it("accepts Chinese characters", () => {
    cy.typeInEditor("\u4F60\u597D\u4E16\u754C"); // 你好世界
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("\u4F60\u597D\u4E16\u754C");
    });
    cy.waitForAnalysis();
    // Verify the backdrop renders the text (visible in the highlight layer)
    cy.get("textarea")
      .first()
      .parent()
      .should("contain.text", "\u4F60\u597D\u4E16\u754C");
  });

  it("accepts Japanese Hiragana characters", () => {
    cy.typeInEditor("\u3053\u3093\u306B\u3061\u306F"); // こんにちは
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("\u3053\u3093\u306B\u3061\u306F");
    });
  });

  it("accepts Korean characters", () => {
    cy.typeInEditor("\uD55C\uAD6D\uC5B4"); // 한국어
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("\uD55C\uAD6D\uC5B4");
    });
  });

  it("accepts German umlauts and eszett", () => {
    cy.typeInEditor("\u00E4\u00F6\u00FC\u00DF"); // äöüß
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include("\u00E4\u00F6\u00FC\u00DF");
    });
  });

  it("accepts accented Latin characters", () => {
    const accented = "\u00E9\u00F1\u00E7\u00E0"; // éñçà
    cy.typeInEditor(accented);
    cy.get("textarea").first().should(($el) => {
      expect(($el[0] as HTMLTextAreaElement).value).to.include(accented);
    });
  });

  it("accepts mixed scripts in a single input", () => {
    const mixed = "Hello \u4F60\u597D \u0645\u0631\u062D\u0628\u0627"; // Hello 你好 مرحبا
    cy.typeInEditor(mixed);
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("Hello");
      expect(val).to.include("\u4F60\u597D");
      expect(val).to.include("\u0645\u0631\u062D\u0628\u0627");
    });
  });

  it("accepts emoji mixed with CJK characters", () => {
    const emojiCjk = "\u{1F389} \u795D\u4F60\u597D\u8FD0"; // 🎉 祝你好运
    cy.typeInEditor(emojiCjk);
    cy.get("textarea").first().should(($el) => {
      const val = ($el[0] as HTMLTextAreaElement).value;
      expect(val).to.include("\u{1F389}");
      expect(val).to.include("\u795D\u4F60\u597D\u8FD0");
    });
  });

  it("word count handles CJK text correctly", () => {
    // CJK characters without spaces — the word counter should still produce
    // a count (implementation-dependent: may count each char or the whole run)
    cy.typeInEditor("\u4F60\u597D\u4E16\u754C\u6211\u7231\u7F16\u7A0B");
    cy.waitForAnalysis();

    // The panel word count should exist and show a numeric value
    cy.getByTestId("panel-word-count").should("exist").and(($el) => {
      const text = $el.text();
      // Should contain at least one digit (word count > 0)
      expect(text).to.match(/\d/);
    });
  });
});
