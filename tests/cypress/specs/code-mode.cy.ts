/// <reference types="cypress" />

describe("Code Mode Edge Cases", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
    cy.clearEditor();
    cy.waitForAnalysis();
  });

  it("clicks CODE tab and verifies mode switches", () => {
    // Must have content for the panel to render
    cy.typeInEditor("const x = 1;");
    cy.waitForAnalysis();
    cy.switchMode("code");
    cy.wait(500);
    // Code mode should now be active — the Code button should have higher opacity
    cy.getByTestId("panel-mode-code").should("have.css", "opacity", "1");
  });

  it("shows Language, Lines, Characters in code mode panel", () => {
    cy.typeInEditor("const x = 1;");
    cy.waitForAnalysis();
    cy.switchMode("code");
    cy.wait(500);
    cy.getByTestId("desktop-syntax-panel").within(() => {
      cy.contains("Language").should("exist");
      cy.contains("Lines").should("exist");
      cy.contains("Characters").should("exist");
    });
  });

  it("updates line count when typing code", () => {
    cy.typeInEditor("line one\nline two\nline three");
    cy.waitForAnalysis();
    cy.switchMode("code");
    cy.wait(500);
    cy.getByTestId("desktop-syntax-panel").within(() => {
      // Should show 3 lines
      cy.contains("Lines")
        .parent()
        .find(".text-2xl")
        .should("contain.text", "3");
    });
  });

  it("enforces mutual exclusion: clicking CODE disables SONG", () => {
    // Must have content for the panel to render
    cy.typeInEditor("some content here");
    cy.waitForAnalysis();

    // First switch to song mode
    cy.switchMode("song");
    cy.wait(500);
    // Song tab should be active
    cy.getByTestId("panel-mode-song").should("have.css", "opacity", "1");

    // Now switch to code mode
    cy.switchMode("code");
    cy.wait(500);
    // Code should be active, song should be dimmed
    cy.getByTestId("panel-mode-code").should("have.css", "opacity", "1");
    cy.getByTestId("panel-mode-song").invoke("css", "opacity").then((opacity) => {
      expect(parseFloat(opacity as unknown as string)).to.be.lessThan(1);
    });
  });

  it("preserves content on code -> syntax -> code roundtrip", () => {
    const testContent = "const x = 42;\nconsole.log(x);";
    cy.typeInEditor(testContent);
    cy.waitForAnalysis();

    // Switch to code mode
    cy.switchMode("code");
    cy.waitForAnalysis();

    // Switch to syntax mode
    cy.switchMode("syntax");
    cy.waitForAnalysis();

    // Switch back to code mode
    cy.switchMode("code");
    cy.waitForAnalysis();

    // Content should be preserved
    cy.get("textarea").should("have.value", testContent);
  });

  it("does not style headings in code mode", () => {
    cy.typeInEditor("# This is a heading\nSome regular text");
    cy.waitForAnalysis();

    // In syntax mode, heading should be visible
    cy.get('[data-testid="heading-1"]').should("be.visible");

    // Switch to code mode
    cy.switchMode("code");
    cy.waitForAnalysis();

    // In code mode, the heading overlay should not render
    // (code mode uses renderCodeMode() which does not parse markdown)
    cy.get('[data-testid="heading-1"]').should("not.exist");
  });

  it("handles empty content in code mode without crashing", () => {
    // Type content first so the panel renders, then switch to code mode
    cy.typeInEditor("temporary content");
    cy.waitForAnalysis();
    cy.switchMode("code");
    cy.wait(500);

    // Now clear the editor — the panel may disappear since wordCount becomes 0
    cy.clearEditor();
    cy.waitForAnalysis();

    // App should remain functional — textarea should still exist
    cy.get("textarea").should("exist").and("be.visible");
  });

  it("handles rapid mode toggling 10 times without crashing", () => {
    cy.typeInEditor("Some test content for rapid toggling");
    cy.waitForAnalysis();

    for (let i = 0; i < 10; i++) {
      cy.switchMode("code");
      cy.wait(100);
      cy.switchMode("syntax");
      cy.wait(100);
    }

    // After rapid toggling, app should be stable
    cy.waitForAnalysis();
    cy.get("textarea").should("exist").and("be.visible");
    cy.getByTestId("desktop-syntax-panel").should("be.visible");
  });

  it("applies monospace font in code mode", () => {
    // Must have content for the panel to render and code mode to apply
    cy.typeInEditor("const x = 1;");
    cy.waitForAnalysis();
    cy.switchMode("code");
    cy.wait(500);

    // The textarea should have monospace font family in code mode
    cy.get("textarea")
      .invoke("css", "font-family")
      .then((fontFamily) => {
        const ff = (fontFamily as unknown as string).toLowerCase();
        expect(ff).to.match(/monospace|sfmono|menlo|consolas|ui-monospace/);
      });
  });
});
