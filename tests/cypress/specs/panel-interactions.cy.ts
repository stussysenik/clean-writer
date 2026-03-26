/// <reference types="cypress" />

describe("Panel Interactions", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
    cy.clearEditor();
    cy.waitForAnalysis();
  });

  it("displays word count correctly after typing", () => {
    cy.typeInEditor("The quick brown fox jumps");
    cy.waitForAnalysis();

    // The WordCount component renders inside panel-word-count with role="status"
    cy.getByTestId("panel-word-count")
      .find('[role="status"]')
      .should("contain.text", "5");
  });

  it("shows 5 in word count after typing 5 words", () => {
    cy.typeInEditor("one two three four five");
    cy.waitForAnalysis();

    // WordCount: <div role="status"><span>{count}</span><span>words</span></div>
    cy.getByTestId("panel-word-count")
      .find('[role="status"] span')
      .first()
      .should("contain.text", "5");
  });

  it("shows 0 word count after clearing editor", () => {
    cy.typeInEditor("some words here");
    cy.waitForAnalysis();
    cy.clearEditor();
    cy.waitForAnalysis();

    // Panel returns null when wordCount === 0, so the panel should not exist
    cy.getByTestId("desktop-syntax-panel").should("not.exist");
  });

  it("toggles a highlight category via shortcut badge", () => {
    cy.typeInEditor("The beautiful cat quickly jumped over the tall fence");
    cy.waitForAnalysis();

    // Verify the nouns row exists before clicking
    cy.getByTestId("syntax-breakdown-row-nouns").should("exist");

    // Click the nouns toggle button (shortcut badge)
    cy.getByTestId("syntax-breakdown-toggle-nouns").click();
    cy.wait(300);

    // The nouns row should reflect toggled state (reduced opacity when off)
    cy.getByTestId("syntax-breakdown-row-nouns").invoke("css", "opacity").then((opacity) => {
      const op = parseFloat(opacity as unknown as string);
      expect(op).to.be.lessThan(1);
    });
  });

  it("toggles category off then on and verifies restored state", () => {
    cy.typeInEditor("The beautiful cat quickly jumped over the tall fence");
    cy.waitForAnalysis();

    // Verify the nouns row exists before clicking
    cy.getByTestId("syntax-breakdown-row-nouns").should("exist");

    // Toggle nouns off
    cy.getByTestId("syntax-breakdown-toggle-nouns").click();
    cy.wait(300);
    cy.getByTestId("syntax-breakdown-row-nouns").invoke("css", "opacity").then((opacity) => {
      expect(parseFloat(opacity as unknown as string)).to.be.lessThan(1);
    });

    // Toggle nouns back on
    cy.getByTestId("syntax-breakdown-toggle-nouns").click();
    cy.wait(300);
    cy.getByTestId("syntax-breakdown-row-nouns").invoke("css", "opacity").then((opacity) => {
      expect(parseFloat(opacity as unknown as string)).to.equal(1);
    });
  });

  it("displays all 9 word type rows", () => {
    cy.typeInEditor("I quickly ran to the beautiful store and bought many things oh wow");
    cy.waitForAnalysis();

    const wordTypes = [
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

    wordTypes.forEach((type) => {
      cy.getByTestId(`syntax-breakdown-row-${type}`).should("exist");
    });
  });

  it("shows heading word count row when typing a heading", () => {
    cy.typeInEditor("# My Important Heading\nSome body text here");
    cy.waitForAnalysis();
    // Extra wait for markdown structure detection
    cy.wait(500);

    cy.getByTestId("markdown-headings-row").scrollIntoView().should("exist");
    // Should show the heading word count (3 for "My Important Heading")
    cy.getByTestId("markdown-headings-row").should("contain.text", "3");
  });

  it("shows todo count row when typing a todo", () => {
    cy.typeInEditor("- [ ] Buy groceries\n- [x] Clean house\nSome other text");
    cy.waitForAnalysis();
    // Extra wait for markdown structure detection
    cy.wait(500);

    cy.getByTestId("markdown-todos-row").scrollIntoView().should("exist");
    // Should show done/total format: "1/2"
    cy.getByTestId("markdown-todos-row").should("contain.text", "1/2");
  });

  it("has Syntax mode active by default, switches to Song on click", () => {
    // Panel requires content to render (returns null when wordCount === 0)
    cy.typeInEditor("The quick brown fox jumps over the lazy dog");
    cy.waitForAnalysis();

    // Syntax should be active by default (full opacity)
    cy.getByTestId("panel-mode-syntax").invoke("css", "opacity").then((opacity) => {
      expect(parseFloat(opacity as unknown as string)).to.equal(1);
    });

    // Song should be dimmed
    cy.getByTestId("panel-mode-song").invoke("css", "opacity").then((opacity) => {
      expect(parseFloat(opacity as unknown as string)).to.be.lessThan(1);
    });

    // Click Song tab
    cy.switchMode("song");
    cy.wait(500);
    cy.waitForAnalysis();

    // Now Song should be active
    cy.getByTestId("panel-mode-song").invoke("css", "opacity").then((opacity) => {
      expect(parseFloat(opacity as unknown as string)).to.equal(1);
    });

    // Syntax should be dimmed
    cy.getByTestId("panel-mode-syntax").invoke("css", "opacity").then((opacity) => {
      expect(parseFloat(opacity as unknown as string)).to.be.lessThan(1);
    });
  });

  it("desktop syntax panel exists on desktop viewport", () => {
    cy.viewport(1280, 720);
    // Panel requires content to render (returns null when wordCount === 0)
    cy.typeInEditor("Some content to render the panel");
    cy.waitForAnalysis();
    cy.getByTestId("desktop-syntax-panel").should("exist").and("be.visible");
  });
});
