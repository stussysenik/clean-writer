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

  describe("Selection in normal mode", () => {
    it("can select from start of line", () => {
      cy.typeInEditor("First line of text");
      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(0, 5);
        expect(ta.selectionStart).to.equal(0);
        expect(ta.selectionEnd).to.equal(5);
        expect(ta.value.slice(0, 5)).to.equal("First");
      });
    });

    it("can select to end of line", () => {
      cy.typeInEditor("Hello world");
      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(6, 11);
        expect(ta.selectionStart).to.equal(6);
        expect(ta.selectionEnd).to.equal(11);
        expect(ta.value.slice(6, 11)).to.equal("world");
      });
    });

    it("can select across newline boundary", () => {
      cy.typeInEditor("Line one{enter}Line two");
      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        // Select from "one" through newline into "Line"
        const text = ta.value;
        const newlinePos = text.indexOf("\n");
        ta.setSelectionRange(newlinePos - 3, newlinePos + 5);
        expect(ta.selectionStart).to.equal(newlinePos - 3);
        expect(ta.selectionEnd).to.equal(newlinePos + 5);
      });
    });

    it("can select multiple lines", () => {
      cy.typeInEditor("First line{enter}Second line{enter}Third line");
      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(0, ta.value.length);
        expect(ta.selectionStart).to.equal(0);
        expect(ta.selectionEnd).to.equal(ta.value.length);
      });
    });
  });

  describe("Selection in unstylized (plain text) mode", () => {
    function enterUnstylizedMode() {
      cy.getByTestId("unstylized-mode-btn").click();
      cy.wait(600);
    }

    it("can select text in unstylized mode", () => {
      cy.typeInEditor("Plain text selection test");
      cy.wait(300);
      enterUnstylizedMode();

      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(0, 10);
        expect(ta.selectionStart).to.equal(0);
        expect(ta.selectionEnd).to.equal(10);
        expect(ta.value.slice(0, 10)).to.equal("Plain text");
      });
    });

    it("shows persisted selection overlay on blur in unstylized mode", () => {
      cy.typeInEditor("Select me in plain mode");
      cy.wait(300);
      enterUnstylizedMode();

      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(0, 9);
      });

      // Blur textarea to trigger persisted selection
      cy.get("textarea").blur();
      cy.wait(300);

      // The persisted selection overlay should appear
      cy.getByTestId("persisted-selection-overlay").should("exist");
    });

    it("persisted selection overlay uses monospace font in unstylized mode", () => {
      cy.typeInEditor("Font alignment check");
      cy.wait(300);
      enterUnstylizedMode();

      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(0, 4);
      });

      cy.get("textarea").blur();
      cy.wait(300);

      cy.getByTestId("persisted-selection-overlay").then(($el) => {
        const fontFamily = window.getComputedStyle($el[0]).fontFamily;
        // Should contain Courier New (monospace) to match the textarea
        expect(fontFamily.toLowerCase()).to.include("courier");
      });
    });

    it("can select at start of line in unstylized mode", () => {
      cy.typeInEditor("Start of line selection");
      cy.wait(300);
      enterUnstylizedMode();

      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(0, 5);
        expect(ta.value.slice(0, 5)).to.equal("Start");
      });
    });

    it("can select across newline in unstylized mode", () => {
      cy.typeInEditor("Line A{enter}Line B");
      cy.wait(300);
      enterUnstylizedMode();

      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        const text = ta.value;
        const newlinePos = text.indexOf("\n");
        // Select across the newline boundary
        ta.setSelectionRange(newlinePos - 1, newlinePos + 2);
        expect(ta.selectionStart).to.equal(newlinePos - 1);
        expect(ta.selectionEnd).to.equal(newlinePos + 2);
      });
    });

    it("selection uses neutral gray in unstylized mode", () => {
      cy.typeInEditor("Neutral selection color");
      cy.wait(300);
      enterUnstylizedMode();

      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(0, 7);
      });

      cy.get("textarea").blur();
      cy.wait(300);

      cy.getByTestId("persisted-selection-overlay").find("span").eq(1).then(($span) => {
        const bg = window.getComputedStyle($span[0]).backgroundColor;
        // Should be a neutral gray, not a theme color
        // rgba(0, 0, 0, 0.15) computes to roughly rgba(0, 0, 0, 0.15)
        expect(bg).to.match(/rgba?\(0,\s*0,\s*0/);
      });
    });

    it("can select entire content in unstylized mode", () => {
      cy.typeInEditor("Select everything here");
      cy.wait(300);
      enterUnstylizedMode();

      cy.get("textarea").then(($el) => {
        const ta = $el[0] as HTMLTextAreaElement;
        ta.focus();
        ta.setSelectionRange(0, ta.value.length);
        expect(ta.selectionStart).to.equal(0);
        expect(ta.selectionEnd).to.equal(ta.value.length);
      });
    });
  });
});
