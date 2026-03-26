/// <reference types="cypress" />

describe("Song Mode", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
    cy.clearEditor();
    cy.waitForAnalysis();
  });

  it("clicks SONG tab and verifies mode switches", () => {
    // Must have content for the panel to render
    cy.typeInEditor("some content here");
    cy.waitForAnalysis();
    cy.switchMode("song");
    cy.wait(500);
    // Song mode should now be active — the Song button should have full opacity
    cy.getByTestId("panel-mode-song").should("have.css", "opacity", "1");
    // Syntax tab should be dimmed
    cy.getByTestId("panel-mode-syntax").invoke("css", "opacity").then((opacity) => {
      expect(parseFloat(opacity as unknown as string)).to.be.lessThan(1);
    });
  });

  it("shows Syllables and Rhymes labels in song mode", () => {
    cy.typeInEditor("Roses are red\nViolets are blue");
    cy.waitForAnalysis();
    cy.switchMode("song");
    cy.waitForAnalysis();

    cy.getByTestId("desktop-syntax-panel").within(() => {
      cy.contains("Syllables").should("exist");
      cy.contains("Rhymes").should("exist");
    });
  });

  it("shows rhyme groups when typing rhyming content", () => {
    cy.typeInEditor("The cat sat on the mat\nThe hat was very flat");
    cy.waitForAnalysis();
    cy.switchMode("song");
    cy.waitForAnalysis();

    // Extra wait for rhyme analysis processing
    cy.wait(500);
    cy.getByTestId("desktop-syntax-panel").within(() => {
      // Rhyme groups should be detected for cat/mat/hat/flat
      cy.getByTestId("rhyme-group-row").should("have.length.gte", 1);
    });
  });

  it("preserves content on song -> syntax -> song roundtrip", () => {
    const testContent = "Hello world\nGoodbye moon";
    cy.typeInEditor(testContent);
    cy.waitForAnalysis();

    cy.switchMode("song");
    cy.waitForAnalysis();
    cy.switchMode("syntax");
    cy.waitForAnalysis();
    cy.switchMode("song");
    cy.waitForAnalysis();

    // Content should be preserved after roundtrip
    cy.get("textarea").should("have.value", testContent);
    // App should remain functional
    cy.getByTestId("desktop-syntax-panel").should("be.visible");
  });

  it("enforces mutual exclusion: clicking SONG disables CODE", () => {
    // Must have content for the panel to render
    cy.typeInEditor("some content here");
    cy.waitForAnalysis();

    // First switch to code mode
    cy.switchMode("code");
    cy.wait(500);
    cy.getByTestId("panel-mode-code").should("have.css", "opacity", "1");

    // Now switch to song mode
    cy.switchMode("song");
    cy.wait(500);

    // Song should be active, code should be dimmed
    cy.getByTestId("panel-mode-song").should("have.css", "opacity", "1");
    cy.getByTestId("panel-mode-code").invoke("css", "opacity").then((opacity) => {
      expect(parseFloat(opacity as unknown as string)).to.be.lessThan(1);
    });
  });

  it("handles empty content in song mode without crashing", () => {
    // Type content first so the panel renders, then switch to song mode
    cy.typeInEditor("temporary content");
    cy.waitForAnalysis();
    cy.switchMode("song");
    cy.wait(500);

    // Now clear the editor — the panel may disappear since wordCount becomes 0
    cy.clearEditor();
    cy.waitForAnalysis();

    // App should not crash — textarea should still exist
    cy.get("textarea").should("exist").and("be.visible");
  });

  it("handles rapid mode toggling 10 times without crashing", () => {
    cy.typeInEditor("Some test content for rapid toggling");
    cy.waitForAnalysis();

    for (let i = 0; i < 10; i++) {
      cy.switchMode("song");
      cy.wait(100);
      cy.switchMode("syntax");
      cy.wait(100);
    }

    // After rapid toggling, app should be stable
    cy.waitForAnalysis();
    cy.get("textarea").should("exist").and("be.visible");
    cy.getByTestId("desktop-syntax-panel").should("be.visible");
  });

  it("shows non-Latin warning for non-English text in song mode", () => {
    // Type non-Latin text first so the panel renders, then switch to song mode
    cy.typeInEditor("\u4F60\u597D\u4E16\u754C\n\u518D\u89C1\u6708\u4EAE");
    cy.waitForAnalysis();
    cy.switchMode("song");
    cy.waitForAnalysis();
    cy.wait(500);

    // Should show the non-Latin warning
    cy.getByTestId("desktop-syntax-panel").within(() => {
      cy.contains("Rhyme analysis supports English only").should("exist");
    });
  });
});
