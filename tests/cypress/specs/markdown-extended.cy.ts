/// <reference types="cypress" />

describe("Markdown Extended Edge Cases", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").should("exist");
    cy.clearEditor();
    cy.waitForAnalysis();
  });

  describe("Heading Edge Cases", () => {
    it("does NOT render #NoSpace as a heading (no space after hash)", () => {
      cy.typeInEditor("#NoSpace");
      cy.waitForAnalysis();
      cy.get('[data-testid="heading-1"]').should("not.exist");
    });

    it("does NOT render ##### as a heading (only H1-H4 supported)", () => {
      cy.typeInEditor("##### Five hashes");
      cy.waitForAnalysis();
      cy.get('[data-testid="heading-5"]').should("not.exist");
      cy.get('[data-testid="heading-4"]').should("not.exist");
      cy.get('[data-testid="heading-3"]').should("not.exist");
      cy.get('[data-testid="heading-2"]').should("not.exist");
      cy.get('[data-testid="heading-1"]').should("not.exist");
    });

    it("handles empty heading gracefully (just hash + space)", () => {
      // "# " with no text after should not crash
      cy.typeInEditor("# ");
      cy.waitForAnalysis();
      // The app should not crash — textarea should still be interactive
      cy.get("textarea").should("exist").and("be.visible");
    });

    it("renders heading at very end of content (no trailing newline)", () => {
      cy.typeInEditor("# Heading");
      cy.waitForAnalysis();
      cy.get('[data-testid="heading-1"]')
        .should("be.visible")
        .and("contain.text", "Heading");
    });

    it("renders multiple consecutive headings", () => {
      cy.typeInEditor("# A\n## B\n### C");
      cy.waitForAnalysis();
      cy.get('[data-testid="heading-1"]')
        .should("be.visible")
        .and("contain.text", "A");
      cy.get('[data-testid="heading-2"]')
        .should("be.visible")
        .and("contain.text", "B");
      cy.get('[data-testid="heading-3"]')
        .should("be.visible")
        .and("contain.text", "C");
    });

    it("renders very long heading (100+ chars) without overflow", () => {
      const longTitle = "A".repeat(120);
      cy.typeInEditor(`# ${longTitle}`);
      cy.waitForAnalysis();
      cy.get('[data-testid="heading-1"]').should("be.visible").then(($el) => {
        const heading = $el[0];
        const parent = heading.parentElement!;
        // Heading should not extend beyond its parent container
        expect(heading.scrollWidth).to.be.at.most(
          parent.getBoundingClientRect().width + 2
        );
      });
    });
  });

  describe("Todo Edge Cases", () => {
    it("renders todo with special characters", () => {
      cy.typeInEditor('- [ ] Buy "milk" & eggs <tag>');
      cy.waitForAnalysis();
      cy.get('[data-testid="todo-checkbox-0"]')
        .should("be.visible")
        .and("have.attr", "aria-checked", "false");
    });

    it("toggles todo on first line", () => {
      cy.typeInEditor("- [ ] First line task\nSome other text");
      cy.waitForAnalysis();
      cy.get('[data-testid="todo-checkbox-0"]').click({ force: true });
      cy.get("textarea").should("have.value", "- [x] First line task\nSome other text");
    });

    it("toggles todo in the middle of content", () => {
      cy.typeInEditor("Some intro text\n- [ ] Middle task\nSome closing text");
      cy.waitForAnalysis();
      // The todo is on line index 1 (0-indexed), so testid is todo-checkbox-1
      cy.get('[data-testid="todo-checkbox-1"]').click({ force: true });
      cy.get("textarea").should(
        "have.value",
        "Some intro text\n- [x] Middle task\nSome closing text"
      );
    });

    it("toggles todo on last line", () => {
      cy.typeInEditor("Some intro text\n- [ ] Last line task");
      cy.waitForAnalysis();
      // The todo is on line index 1 (0-indexed), so testid is todo-checkbox-1
      cy.get('[data-testid="todo-checkbox-1"]').click({ force: true });
      cy.get("textarea").should(
        "have.value",
        "Some intro text\n- [x] Last line task"
      );
    });
  });

  describe("Code Block Edge Cases", () => {
    it("does not crash with unclosed code block (single ``` with no closing)", () => {
      cy.typeInEditor("```\nsome code here\nmore code");
      cy.waitForAnalysis();
      // App should remain functional
      cy.get("textarea").should("exist").and("be.visible");
    });

    it("renders code block with unknown language as plain text", () => {
      cy.typeInEditor("```brainfuck\n++++++++++\n```");
      // Wait for Shiki to attempt loading
      cy.wait(1500);
      cy.get('[data-testid="code-block"]').should("be.visible");
      // The content should still render (as plain text)
      cy.get('[data-testid="code-block"]').should("contain.text", "++++++++++");
    });

    it("does NOT render heading inside code block as a heading", () => {
      cy.typeInEditor("```\n# This is not a heading\n```");
      cy.wait(1500);
      cy.get('[data-testid="code-block"]').should("be.visible");
      // There should be no heading element rendered for the text inside the code block
      cy.get('[data-testid="heading-1"]').should("not.exist");
    });

    it("does NOT render todo checkbox inside code block", () => {
      cy.typeInEditor("```\n- [ ] This is not a todo\n```");
      cy.wait(1500);
      cy.get('[data-testid="code-block"]').should("be.visible");
      // There should be no checkbox for text inside the code block
      cy.get('[data-testid="todo-checkbox-0"]').should("not.exist");
    });
  });
});
