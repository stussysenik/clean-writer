## Why

The DocumentSidebar surfaces projects, documents, journal entries, sessions, and writing stats — but the CRUD layer underneath is brittle in ways that a writer hits within minutes of real use. Walking the code top-down found eight concrete defects:

1. **Document switch silently loses unsaved edits.** `App.tsx:1169-1174` runs `setActiveDocumentId(id) → setContent(doc.content)` but never writes the *outgoing* document's content first. `useAutoSave.save` (`hooks/useAutoSave.ts:18-48`) is debounced 2000 ms and only writes a global `riso_flow_content` localStorage key — it never calls `useDocumentManager.updateDocument`. The `documents` array therefore never receives the editor's latest content; if the writer switches docs within 2 s of typing, that work is gone on the next reload.
2. **Per-document `wordCount` / `charCount` are permanently 0.** `createDocument` (`hooks/useDocumentManager.ts:111-150`) seeds them at 0 and nothing on the autosave path writes them back. The "12w" badge in `ProjectTree.tsx:120` is a lie for every document the user has ever opened.
3. **`position` collisions on rapid create.** `createProject:74` reads `projects.length` from the closure with `[]` dependencies; same for `createDocument:119`. Two clicks within the same render frame produce duplicate positions, breaking the sort order in `ProjectTree.tsx:67-69`.
4. **Deleting the active document strands the editor.** `App.tsx:1178` `onDeleteDocument={(id) => deleteDocument(id)}` never resets `activeDocumentId` or `content`. The deleted doc keeps rendering in the editor surface and the next `autoSave` recreates an orphan row.
5. **`Untitled` name collisions.** `DocumentSidebar/index.tsx:122-125` always names new docs `"Untitled"` — two clicks make two `"Untitled"` rows. There is no naming form, no doc-type picker, no project picker.
6. **Empty-string `projectId` orphans.** When no projects exist, `handleCreateDocument` passes `""` as `projectId`. `createDocument` inserts that string into the row. `ProjectTree.tsx:73` filters with `!d.projectId` (truthy check), which technically catches `""`, but Supabase persists the empty string and the unfiled view becomes inconsistent across reloads.
7. **No calendar surface for journal entries.** `WritingLog.tsx` shows aggregate stats (streak, weekly/monthly word counts, recent sessions) but there is no way to browse, create, or maintain entries by date. A writer has to scroll a flat list to find last Tuesday.
8. **No protection against rapid-fire interaction.** Creation buttons have no debounce, no pending state, and no failure feedback. Clicking "New Doc" five times spawns five rows; if Supabase write fails, the optimistic row stays forever.

These compound: a writer creates two projects rapidly (#3), creates a doc inside the wrong one because there's no picker (#5), types for 30 s, switches to another doc, loses everything (#1), then tries to delete the empty original which strands the editor (#4). The sidebar is the project-management surface for this app — it has to be flawless.

This proposal also adds a calendar view because the user explicitly scoped it into the same conversation thread, and because journal entries are date-keyed and naturally render as a grid.

## What Changes

### `document-crud-integrity` — load-bearing fixes
- **Save before switch.** `onSelectDocument` flushes the current editor content into the outgoing document via `updateDocument({ content, wordCount, charCount })` before swapping `activeDocumentId`/`content`. The flush also runs on `beforeunload`/`visibilitychange` and inside the autosave debounce so background saves go to the right row.
- **Editor counts feed back into the document row.** `useAutoSave.save` is extended to accept the count tuple and call `updateDocument` instead of only writing a global localStorage slot. The `riso_flow_content` global slot is kept as a single-source fallback for the no-document path.
- **Monotonic positions via functional updates.** `createProject` and `createDocument` compute `position` inside the `setProjects`/`setDocuments` updater so concurrent calls always see the latest length. The dependency arrays are corrected so the callbacks don't capture stale state.
- **Delete-active cleanup.** When `deleteDocument(id)` runs and `id === activeDocumentId`, the editor falls back to the next document in the same project (or any unfiled doc, or empty content) and `activeDocumentId` updates accordingly.
- **Normalize empty `projectId` to `undefined`.** `createDocument` coerces falsy strings to `undefined`; the type already allows it.

### `document-creation-form` — replace the pill with a real form
- Inline expandable form below the quick-actions row. Fields: title (autofocus), doc-type select (`chapter` / `standalone` / `scratchpad`), project select (defaults to first project, "Unfiled" option). Submit button uses an accent-coloured Carbon-style pill.
- Async-aware: submit disables while pending, surfaces an inline error if `createDocument` returns `null`, and dismisses on success.
- Same form pattern (collapsed by default) for "New Project" — single title field plus submit.
- Keyboard: `Enter` submits, `Escape` cancels and collapses.

### `document-calendar-view` — month grid for journal entries
- New `CalendarSection` rendered between `JournalSection` and `WritingLog`. Compact 7-column month grid with arrow nav for ± month and a "Today" jump.
- Cell states: empty (clickable to create entry on that date), has-entry (clickable to select), today (always ringed), active (filled with accent).
- Click-to-create calls `createJournalEntry(date)` (already supports a date arg, see `useDocumentManager.ts:197`) and immediately selects the new entry. Click-to-select calls `onSelectEntry(entry.id)`.
- Persisted view state: the currently-displayed month is stored in `localStorage` so the user returns to where they left off.

### `document-crud-tests` — Cypress coverage for the regression set
- Spec file `document-sidebar-crud.cy.ts` under `tests/cypress/specs/`.
- **Inverse-law scenarios** (clicking the negative path during navigation):
  - Create two projects in the same animation frame → both rendered, distinct positions.
  - Create five docs back-to-back via the form → titles preserved, no collisions.
  - Type, switch doc, switch back → original content intact.
  - Delete the active document → editor falls back gracefully, no crash.
  - Create journal entry from a calendar cell → entry appears, cell shows has-entry state.
- **Persistence verification:** reload between assertions to confirm localStorage writes survived.
- **Failing-first:** specs land disabled in commit 1 of cap-4, then enabled commit-by-commit as the implementation lands.

## Capabilities

### New Capabilities
- `document-crud-integrity` — Guarantees that document mutations preserve user content, maintain monotonic ordering, and never strand the editor on a deleted row.
- `document-creation-form` — Inline form-based creation flow for projects and documents with naming, type/project selection, and async-aware submission.
- `document-calendar-view` — Month-grid calendar surface inside the DocumentSidebar for browsing, creating, and selecting journal entries by date.
- `document-crud-tests` — Cypress regression coverage for rapid interaction, persistence, and navigation against the CRUD layer.

## Impact

- `hooks/useDocumentManager.ts` — Functional-update positions; coerce empty `projectId`; corrected dep arrays; `updateDocument` reachable from autosave path.
- `hooks/useAutoSave.ts` — Accept count tuple, call back into `updateDocument`, expose a synchronous flush for `beforeunload`.
- `App.tsx` — Save-before-switch wrapping `onSelectDocument`; delete-active cleanup wrapping `onDeleteDocument`; pass count tuple into `autoSave`.
- `components/DocumentSidebar/index.tsx` — Replace pill quick-actions with collapsible creation forms; render new `CalendarSection`.
- `components/DocumentSidebar/CreationForm.tsx` — **new** component (project + doc forms).
- `components/DocumentSidebar/CalendarSection.tsx` — **new** month-grid component.
- `components/DocumentSidebar/ProjectTree.tsx` — Read live `wordCount`/`charCount` (no behaviour change once the count feedback lands; only the badge value updates).
- `tests/cypress/specs/document-sidebar-crud.cy.ts` — **new** spec file.
- `tests/cypress/support/commands.ts` — small helpers if needed (`cy.openSidebar()`, `cy.createDocument(title)`).

## Open Questions

Raise before apply if any default needs to change:

- **OQ1 — Form vs modal.** Default: inline expanding form below the quick-actions row, no modal/dialog. Override if the user wants a centred modal.
- **OQ2 — Calendar placement.** Default: between `JournalSection` and `WritingLog`. Override if it should sit at the top of the sidebar or replace `JournalSection`'s "other entries" list entirely.
- **OQ3 — Test runner.** Default: extend the existing Cypress suite under `tests/cypress/specs/`. Override if the user wants Vitest unit coverage on `useDocumentManager` instead of (or in addition to) e2e.
- **OQ4 — Scope of save-before-switch.** Default: flush only when switching to a *different* document. Override if it should also flush on every blur of the editor.
- **OQ5 — Delete fallback target.** Default: next doc in the same project, then any unfiled doc, then empty content. Override if it should always go to empty.
