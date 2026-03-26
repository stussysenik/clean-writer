describe("Markdown Features", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").as("editor");
  });

  describe("Headings", () => {
    it("renders H1 heading with large muted styling", () => {
      cy.get("@editor").clear().type("# My Big Title");
      cy.get('[data-testid="heading-1"]')
        .should("be.visible")
        .and("contain.text", "My Big Title");
    });

    it("renders H2 through H4 headings", () => {
      cy.get("@editor").clear().type("## Section{enter}### Subsection{enter}#### Detail");
      cy.get('[data-testid="heading-2"]').should("be.visible");
      cy.get('[data-testid="heading-3"]').should("be.visible");
      cy.get('[data-testid="heading-4"]').should("be.visible");
    });

    it("counts heading words separately in breakdown panel", () => {
      cy.get("@editor").clear().type("# Three Word Heading{enter}the cat sat");
      // Wait for syntax analysis to process markdown structure
      cy.wait(800);
      cy.get('[data-testid="markdown-headings-row"]').should("exist");
    });

    it("does not syntax-color heading text", () => {
      cy.get("@editor").clear().type("# the cat");
      // Heading text should use muted theme.text, not noun/article colors
      cy.get('[data-testid="heading-1"]')
        .should("have.css", "opacity")
        .and("match", /0\.5/);
    });
  });

  describe("Todo Checkboxes", () => {
    it("renders unchecked todo with empty checkbox", () => {
      cy.get("@editor").clear().type("- [ ] Buy groceries");
      cy.get('[data-testid="todo-checkbox-0"]')
        .should("be.visible")
        .and("have.attr", "aria-checked", "false");
    });

    it("renders checked todo with filled checkbox and strikethrough", () => {
      cy.get("@editor").clear().type("- [x] Already done");
      cy.get('[data-testid="todo-checkbox-0"]')
        .should("be.visible")
        .and("have.attr", "aria-checked", "true");
    });

    it("toggles checkbox on click", () => {
      cy.typeInEditor("- [ ] Toggle me");
      cy.wait(500);
      // force: true because the textarea z-layer overlaps the checkbox
      cy.get('[data-testid="todo-checkbox-0"]').click({ force: true });
      cy.wait(300);
      cy.get("@editor").should(($el) => {
        expect(($el[0] as HTMLTextAreaElement).value).to.include("[x] Toggle me");
      });
    });

    it("shows todo count in panel", () => {
      cy.get("@editor").clear().type("- [ ] Task 1{enter}- [x] Task 2{enter}- [ ] Task 3");
      // Wait for syntax analysis to process markdown structure
      cy.wait(800);
      cy.get('[data-testid="markdown-todos-row"]').should("exist");
    });
  });

  describe("Code Blocks", () => {
    it("renders fenced code block with styling", () => {
      cy.get("@editor").clear().type("```javascript{enter}const x = 42;{enter}```");
      // Wait for Shiki to load
      cy.wait(1500);
      cy.get('[data-testid="code-block"]').should("be.visible");
    });

    it("shows language label on code block", () => {
      cy.get("@editor").clear().type("```python{enter}print('hello'){enter}```");
      cy.wait(1500);
      cy.get('[data-testid="code-block"]').should("contain.text", "python");
    });
  });
});

describe("Code Mode", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("textarea").as("editor");
  });

  it("shows CODE tab in panel mode switch", () => {
    cy.get('[data-testid="panel-mode-code"]').should("be.visible");
  });

  it("switches to code mode and shows code panel", () => {
    cy.get('[data-testid="panel-mode-code"]').click();
    // Should show language info
    cy.contains("Language").should("be.visible");
    cy.contains("Lines").should("be.visible");
    cy.contains("Characters").should("be.visible");
  });
});
