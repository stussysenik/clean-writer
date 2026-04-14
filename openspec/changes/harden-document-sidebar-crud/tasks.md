# Implementation Tasks

Apply order: 1 → 2 → 3 → 4. Each capability lands as its own commit. Verify with `npx tsc --noEmit` after every implementation step and `npm run build` at the end of each capability.

## 1. Cap-1 · document-crud-integrity

- [x] 1.1 Add functional-update positions to `createProject` and `createDocument` in `hooks/useDocumentManager.ts`. Compute `position` inside the `setProjects`/`setDocuments` updater. Confirm dependency arrays no longer reference closure-captured arrays.
- [x] 1.2 Coerce falsy `projectId` to `undefined` in `createDocument`. Update the local + Supabase insert paths.
- [x] 1.3 Extend `useAutoSave.save(content, documentId, counts)` in `hooks/useAutoSave.ts` to accept a `{ wordCount, charCount }` tuple. When `documentId` is set, the debounced timeout SHALL invoke an injected `updateDocument` function instead of (or in addition to) the global localStorage write.
- [x] 1.4 Wire the injection in `App.tsx`: pass `updateDocument` from `useDocumentManager` into `useAutoSave` (via hook arg or ref). Pass the live `wordCount`/`totalCharCount` into `autoSave(content, activeDocumentId, { wordCount, charCount })` inside the existing autosave effect.
- [x] 1.5 Wrap the existing `onSelectDocument` inline callback in `App.tsx` with a save-before-switch flush: synchronously call `updateDocument(activeDocumentId, { content, wordCount, charCount })` before changing `activeDocumentId` and `content`. Skip the flush when `activeDocumentId === newId`.
- [x] 1.6 Wrap the existing `onDeleteDocument` callback in `App.tsx` with delete-active cleanup: if `id === activeDocumentId`, find the next sensible doc (same project → any → none), then update editor state accordingly before calling `deleteDocument(id)`.
- [x] 1.7 Verify with `npx tsc --noEmit`. Verify with `npm run build`.
- [x] 1.8 Manual smoke (write up findings inline in commit body): create a project, create a doc, type, switch to a second doc, switch back, confirm content preserved; delete active doc, confirm fallback.
- [x] 1.9 Commit: `feat(sidebar): harden document CRUD integrity (save-before-switch, monotonic positions, count sync)`.

## 2. Cap-2 · document-creation-form

- [x] 2.1 Create `components/DocumentSidebar/CreationForm.tsx`. Two modes: `project` (single title field) and `document` (title + doc-type select + project select). Submit handler is async; pending state disables submit; failure surfaces inline error.
- [x] 2.2 Replace the bare "New Project" and "New Doc" pills in `DocumentSidebar/index.tsx` with collapsible buttons that toggle the corresponding CreationForm variant. Keep "New Entry", "Guide", "Leave Note" untouched.
- [x] 2.3 Implement keyboard handling: Enter submits, Escape collapses + clears, autofocus on the title input when the form opens.
- [x] 2.4 Style the submit button as an accent-coloured Carbon-style pill using existing Tailwind tokens (no new dependency). Hover lift + active depress.
- [x] 2.5 Verify with `npx tsc --noEmit`. Verify with `npm run build`.
- [x] 2.6 Manual smoke: open form, create project, open form, create document with all fields, attempt double-submit, verify no duplicates.
- [x] 2.7 Commit: `feat(sidebar): add inline creation forms for projects and documents`.

## 3. Cap-3 · document-calendar-view

- [x] 3.1 Create `components/DocumentSidebar/CalendarSection.tsx`. Local state: `viewMonth: Date` (initialized from `localStorage.getItem("clean_writer_calendar_view_month")` or current month). Render a 7-column header (Mo Tu We Th Fr Sa Su) and a 6-row body of cells.
- [x] 3.2 Build the 42-cell grid: pad with previous-month tail and next-month head so the grid is always rectangular. Mark in-month vs out-of-month visually.
- [x] 3.3 Compute per-cell entry presence by indexing `journalEntries` by `entryDate` (YYYY-MM-DD). Mark today's cell with a ring; mark cells with entries with a dot or accent fill; mark the active entry's cell with a strong accent.
- [x] 3.4 Wire click handlers: existing entry → `onSelectEntry(entry.id)`; empty past/today cell → `onCreateJournalEntry(date)` then immediately `onSelectEntry(newEntry.id)`; future cells are `aria-disabled` and ignore clicks.
- [x] 3.5 Add prev/next month arrows and a "Today" jump button. Persist `viewMonth` to `localStorage` on every change.
- [x] 3.6 Render `CalendarSection` inside `DocumentSidebar/index.tsx` between `JournalSection` and `WritingLog`.
- [x] 3.7 Extend `useDocumentManager.createJournalEntry` callsite in `App.tsx` to support an optional date arg (the function already accepts one — verify wiring in the new sidebar prop).
- [x] 3.8 Verify with `npx tsc --noEmit`. Verify with `npm run build`.
- [x] 3.9 Manual smoke: open sidebar, navigate to previous month, click an empty past cell, confirm entry created, navigate forward, confirm "Today" works, reload, confirm view month preserved.
- [x] 3.10 Commit: `feat(sidebar): add month-grid calendar view for journal entries`.

## 4. Cap-4 · document-crud-tests

- [ ] 4.1 Create `tests/cypress/specs/document-sidebar-crud.cy.ts` with skeleton `describe` and `it.skip()` blocks for all five test groups (rapid creation, switch persistence, delete-active, calendar interaction, reload persistence).
- [ ] 4.2 Add helper Cypress commands in `tests/cypress/support/commands.ts`: `cy.openDocumentSidebar()`, `cy.createProjectViaForm(title)`, `cy.createDocumentViaForm(title, type, projectTitle)`. Type their declarations in `cypress/support/index.d.ts` (or inline).
- [ ] 4.3 Implement and enable the rapid creation tests. Run them: `npm test -- --spec tests/cypress/specs/document-sidebar-crud.cy.ts`.
- [ ] 4.4 Implement and enable the switch persistence test.
- [ ] 4.5 Implement and enable the delete-active test.
- [ ] 4.6 Implement and enable the calendar interaction test.
- [ ] 4.7 Implement and enable the reload persistence test.
- [ ] 4.8 Run the full spec end-to-end and confirm green.
- [ ] 4.9 Commit: `test(sidebar): add document CRUD regression spec`.

## 5. Final verification

- [ ] 5.1 `npx tsc --noEmit` — zero new errors versus pre-change baseline.
- [ ] 5.2 `npm run build` — clean production build.
- [ ] 5.3 `npm test -- --spec tests/cypress/specs/document-sidebar-crud.cy.ts` — green.
- [ ] 5.4 `git push origin main` once everything above is green.
