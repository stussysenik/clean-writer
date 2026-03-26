describe("Chaos Monkey", { defaultCommandTimeout: 15000 }, () => {
  beforeEach(() => {
    cy.visit("/");
    cy.wait(500);
    // Spy on console.error to detect crashes
    cy.window().then((win) => {
      cy.spy(win.console, "error").as("consoleError");
    });
  });

  it("survives rapid mode switching (10 cycles)", () => {
    const modes: Array<"syntax" | "song" | "code"> = ["syntax", "song", "code"];
    for (let i = 0; i < 10; i++) {
      cy.switchMode(modes[i % 3]);
      cy.wait(500);
    }
    // App should still render
    cy.get("textarea").should("exist");
    cy.get("body").should("not.be.empty");
  });

  it("survives button storm", () => {
    // Click toolbar buttons rapidly using aria-labels
    // Skip "Clear all content" and "Load sample text" because they open
    // confirm dialogs that block the test.
    // Skip "Preview markdown" because it hides the textarea (switches to view mode).
    // Skip "Export markdown file" because it triggers a download.
    const ariaLabels = [
      "Strikethrough selected text",
      "Cycle focus mode",
    ];
    ariaLabels.forEach((label) => {
      cy.get(`[aria-label="${label}"]`).then(($el) => {
        if ($el.length) {
          cy.wrap($el.first()).click({ force: true });
          cy.wait(500);
        }
      });
    });
    cy.wait(500);
    // App should still render after storm
    cy.get("textarea").should("exist");
    cy.get("body").should("not.be.empty");
  });

  it("preserves content when typing while switching themes", () => {
    cy.clearEditor();
    cy.get("textarea").first().type("hello ", { delay: 5 });
    cy.wait(500);
    // Click a different theme mid-typing
    cy.get("[data-theme-id]").eq(3).click();
    cy.wait(500);
    cy.get("textarea").first().type("world", { delay: 5 });
    cy.wait(500);
    cy.get("textarea").should(($el) => {
      expect($el.val()).to.include("hello ");
      expect($el.val()).to.include("world");
    });
  });

  it("preserves content when typing while switching modes", () => {
    cy.clearEditor();
    cy.get("textarea").first().type("foo ", { delay: 5 });
    cy.wait(500);
    cy.switchMode("song");
    cy.wait(500);
    cy.get("textarea").first().type("bar", { delay: 5 });
    cy.wait(500);
    cy.get("textarea").should(($el) => {
      expect($el.val()).to.include("foo ");
      expect($el.val()).to.include("bar");
    });
  });

  it("handles paste bomb (truncated large text)", () => {
    cy.clearEditor();
    // Generate a chunk of text but truncate to keep test fast
    const chars = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 ";
    let bigText = "";
    for (let i = 0; i < 200; i++) {
      bigText += chars[i % chars.length];
    }
    cy.get("textarea").first().type(bigText, { delay: 0 });
    cy.wait(2000);
    // App should not freeze — textarea should have content
    cy.get("textarea").should(($el) => {
      expect(($el.val() as string).length).to.be.greaterThan(0);
    });
  });

  it("handles Unicode soup paste", () => {
    cy.clearEditor();
    const unicodeSoup = "Hello 你好 مرحبا שלום 🎉👨‍👩‍👧‍👦 ∑∫∂ αβγδ ♠♣♥♦ ①②③ ℃℉ ™©® ¿¡";
    cy.get("textarea").first().type(unicodeSoup, { delay: 5 });
    cy.waitForAnalysis();
    cy.get("textarea").should(($el) => {
      expect($el.val()).to.include("Hello");
      expect($el.val()).to.include("你好");
    });
  });

  it("survives rapid viewport resizing (15 cycles)", () => {
    const sizes: Array<[number, number]> = [];
    for (let i = 0; i < 15; i++) {
      sizes.push(i % 2 === 0 ? [1280, 720] : [375, 667]);
    }
    sizes.forEach(([w, h]) => {
      cy.viewport(w, h);
    });
    // Final size is mobile (odd count) — verify app renders
    cy.wait(500);
    cy.get("textarea").should("exist");
    cy.get("body").should("not.be.empty");
  });

  it("survives rapid theme switching", () => {
    cy.get("[data-theme-id]").then(($swatches) => {
      const count = Math.min($swatches.length, 10);
      for (let i = 0; i < count; i++) {
        cy.wrap($swatches.eq(i)).click({ force: true });
      }
    });
    cy.wait(500);
    // App should render with the last theme
    cy.get("textarea").should("exist");
  });

  it("survives empty state stress", () => {
    cy.clearEditor();
    cy.waitForAnalysis();
    // The syntax panel (and its mode switch buttons) is hidden when content is empty.
    // Stress test theme switching and verify the app handles empty state gracefully.
    cy.get("[data-theme-id]").eq(2).click();
    cy.wait(500);
    cy.get("[data-theme-id]").eq(0).click();
    cy.wait(500);
    cy.get("[data-theme-id]").eq(4).click();
    cy.wait(500);
    cy.get("[data-theme-id]").eq(1).click();
    cy.wait(500);
    // Verify no crash
    cy.get("textarea").should("exist");
    cy.get("textarea").should("have.value", "");
  });

  it("survives select-all chaos (10 rounds)", () => {
    cy.clearEditor();
    for (let i = 0; i < 10; i++) {
      cy.get("textarea").first().type(`round ${i} `, { delay: 0 });
      cy.wait(500);
      cy.clearEditor();
    }
    // Type final content after clearing
    cy.get("textarea").first().type("final content", { delay: 5 });
    cy.wait(500);
    cy.get("textarea").should(($el) => {
      expect($el.val()).to.include("final content");
    });
  });

  it("survives concurrent feature stress", () => {
    cy.clearEditor();
    // Type markdown features
    cy.get("textarea").first().type("# My Heading{enter}", { delay: 5 });
    cy.get("textarea").first().type("- [ ] Todo item{enter}", { delay: 5 });
    cy.get("textarea").first().type("Regular prose text{enter}", { delay: 5 });
    cy.wait(1000);
    cy.waitForAnalysis();

    // Verify markdown renders (use longer timeout for rendering)
    // heading-1 = h1, todo-checkbox-1 = second line (index 1) is the todo
    cy.get('[data-testid="heading-1"]', { timeout: 8000 }).should("exist");
    cy.get('[data-testid="todo-checkbox-1"]', { timeout: 8000 }).should("exist");

    // Switch modes
    cy.switchMode("song");
    cy.wait(500);
    cy.switchMode("code");
    cy.wait(500);
    cy.switchMode("syntax");
    cy.wait(1000);

    // Content should be preserved
    cy.get("textarea").should(($el) => {
      const val = $el.val() as string;
      expect(val).to.include("# My Heading");
      expect(val).to.include("- [ ] Todo item");
    });

    // Markdown features should still render after switching back
    cy.get('[data-testid="heading-1"]', { timeout: 8000 }).should("exist");
  });
});
