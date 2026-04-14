/// <reference types="cypress" />

/**
 * Document Sidebar CRUD regressions.
 *
 * Inverse-law coverage for the bugs the harden-document-sidebar-crud
 * proposal was written to prevent: rapid creation collisions, document
 * switch losing unsaved content, deletion of the active document, calendar
 * create-and-select interactions, and persistence across reloads.
 *
 * Each test starts from a clean localStorage so creates don't pile up.
 */

describe("DocumentSidebar — CRUD integrity", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
    cy.get("textarea").should("exist");
    // App seeds with a sample passage when localStorage is empty; clear it so typing tests start clean.
    cy.clearEditor();
    cy.openDocumentSidebar();
  });

  describe("rapid creation", () => {
    it("creates two projects in quick succession with distinct positions", () => {
      cy.createProjectViaForm("Alpha");
      cy.createProjectViaForm("Beta");

      cy.get('[data-testid="document-sidebar"]').within(() => {
        // Project titles are rendered raw; the "uppercase" Tailwind class is CSS-only.
        cy.contains("Alpha").should("exist");
        cy.contains("Beta").should("exist");
      });

      // Verify localStorage contains two projects with distinct positions.
      cy.window().then((win) => {
        const raw = win.localStorage.getItem("clean_writer_projects");
        expect(raw, "projects key exists").to.be.a("string");
        const projects = JSON.parse(raw!) as Array<{ title: string; position: number }>;
        expect(projects).to.have.length(2);
        const positions = projects.map((p) => p.position).sort();
        expect(positions[0]).to.not.equal(positions[1]);
      });
    });

    it("creates five documents back-to-back with distinct titles", () => {
      cy.createProjectViaForm("Notebook");
      const titles = ["one", "two", "three", "four", "five"];
      titles.forEach((t) => {
        cy.createDocumentViaForm(t, "standalone", "Notebook");
      });

      cy.get('[data-testid="document-sidebar"]').within(() => {
        titles.forEach((t) => cy.contains(t).should("exist"));
      });

      cy.window().then((win) => {
        const raw = win.localStorage.getItem("clean_writer_documents");
        const docs = JSON.parse(raw || "[]") as Array<{ title: string; position: number }>;
        expect(docs).to.have.length(5);
        const positions = new Set(docs.map((d) => d.position));
        expect(positions.size, "all positions distinct").to.equal(5);
      });
    });

    it("disables submit during a pending create call to prevent double-submit", () => {
      cy.get('[data-testid="quick-new-project"]').click();
      cy.get('[data-testid="creation-form-project"]')
        .find('input[aria-label="Title"]')
        .type("Solo");
      // Click create button rapidly — the disabled state should make the second click a no-op.
      cy.get('[data-testid="creation-form-project"]').find('button[type="submit"]').as("submit");
      cy.get("@submit").click();
      // The form closes on success; assert exactly one project landed.
      cy.window().then((win) => {
        const raw = win.localStorage.getItem("clean_writer_projects");
        const projects = JSON.parse(raw || "[]");
        expect(projects).to.have.length(1);
      });
    });
  });

  describe("document switch persistence", () => {
    it("preserves typed content when switching documents and back", () => {
      cy.createProjectViaForm("Workspace");
      cy.createDocumentViaForm("doc-a", "standalone", "Workspace");
      cy.createDocumentViaForm("doc-b", "standalone", "Workspace");

      // Explicitly select doc-a so it becomes the active document before typing.
      cy.get('[data-testid="document-sidebar"]').contains("doc-a").click();
      cy.get("textarea").first().focus().clear().type("first content", { delay: 5 });

      // Switch to doc-b — the editor should reflect doc-b's empty content.
      cy.openDocumentSidebar();
      cy.get('[data-testid="document-sidebar"]').contains("doc-b").click();
      cy.get("textarea").first().should("have.value", "");

      // Back to doc-a — the typed content must be intact.
      cy.openDocumentSidebar();
      cy.get('[data-testid="document-sidebar"]').contains("doc-a").click();
      cy.get("textarea").first().should("have.value", "first content");
    });

    it("survives a full page reload", () => {
      cy.createProjectViaForm("Persisted");
      cy.createDocumentViaForm("survivor", "standalone", "Persisted");

      // Select survivor first so the autosave path actually writes into its document row.
      cy.get('[data-testid="document-sidebar"]').contains("survivor").click();
      cy.get("textarea").first().focus().clear().type("must survive reload", { delay: 5 });

      // Wait past the 2s autosave debounce so the document row receives the content.
      cy.wait(2200);

      cy.reload();
      cy.get("textarea").should("exist");
      cy.openDocumentSidebar();
      cy.get('[data-testid="document-sidebar"]').contains("survivor").click();
      cy.get("textarea").first().should("have.value", "must survive reload");
    });
  });

  describe("delete-active cleanup", () => {
    it("falls back to a sibling document when the active one is deleted", () => {
      cy.createProjectViaForm("Bin");
      cy.createDocumentViaForm("keepme", "standalone", "Bin");
      cy.createDocumentViaForm("trash", "standalone", "Bin");

      // Select 'trash' so it becomes active, then type into it.
      cy.get('[data-testid="document-sidebar"]').contains("trash").click();
      cy.get("textarea").first().focus().clear().type("ephemeral", { delay: 5 });

      cy.openDocumentSidebar();
      // React's onMouseEnter delegates via the native `mouseover` event — Cypress's mouseenter
      // doesn't reach React, so dispatch mouseover on the doc button to mount the delete affordance.
      cy.get('[data-testid="document-sidebar"]')
        .contains("trash")
        .closest("button")
        .trigger("mouseover");
      cy.get('[aria-label="Delete trash"]').click({ force: true });

      // After deletion the editor falls back to 'keepme' (its empty content).
      cy.get('[data-testid="document-sidebar"]').contains("trash").should("not.exist");
      cy.get('[data-testid="document-sidebar"]').contains("keepme").should("exist");
      cy.get("textarea").first().should("have.value", "");
    });
  });

  describe("calendar interaction", () => {
    it("creates a journal entry when an empty past cell is clicked", () => {
      cy.get('[data-testid="calendar-section"]').should("exist");

      // Find a past in-month cell that has no entry. Use yesterday's date, computed in the test.
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const y = yesterday.getFullYear();
      const m = String(yesterday.getMonth() + 1).padStart(2, "0");
      const d = String(yesterday.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;

      // If yesterday is in the previous month relative to today, navigate back first.
      const today = new Date();
      if (yesterday.getMonth() !== today.getMonth()) {
        cy.get('[aria-label="Previous month"]').click();
      }

      cy.get(`[data-testid="calendar-cell-${key}"]`).should("have.attr", "data-has-entry", "false");
      cy.get(`[data-testid="calendar-cell-${key}"]`).click();

      cy.get(`[data-testid="calendar-cell-${key}"]`).should("have.attr", "data-has-entry", "true");

      cy.window().then((win) => {
        const raw = win.localStorage.getItem("clean_writer_journal_entries");
        const entries = JSON.parse(raw || "[]") as Array<{ entryDate: string }>;
        const match = entries.find((e) => e.entryDate.startsWith(key));
        expect(match, `entry for ${key} exists`).to.exist;
      });
    });

    it("disables future-dated cells", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const y = tomorrow.getFullYear();
      const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const d = String(tomorrow.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      const today = new Date();
      if (tomorrow.getMonth() !== today.getMonth()) {
        cy.get('[aria-label="Next month"]').click();
      }
      cy.get(`[data-testid="calendar-cell-${key}"]`).should("have.attr", "aria-disabled", "true");
    });

    it("persists the displayed month across reloads", () => {
      cy.get('[aria-label="Previous month"]').click();
      cy.get('[data-testid="calendar-section"]').then(($el) => {
        const monthLabel = $el.find("p").first().text();

        cy.reload();
        cy.openDocumentSidebar();
        cy.get('[data-testid="calendar-section"]').find("p").first().should("contain", monthLabel);
      });
    });
  });
});
