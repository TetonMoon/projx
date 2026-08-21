# Design Analysis

This document is a review of [vision.md](vision.md) and [architecture.md](architecture.md): what's already well covered, and gaps identified during analysis. It is notes to inform decisions, not a spec. Items here are not automatically in scope — they should be pulled into vision.md/architecture.md deliberately as decisions are made.

## Confirmed Technology Constraint

The core framework is TypeScript, using Node/npm tooling. The Word integration uses Office.js.

- The core model must stay free of Word/Office.js dependencies.
- The core model should also avoid Node-specific runtime dependencies (e.g. `fs`, `path`) unless isolated behind an adapter, since Office.js add-ins run in a browser/WebView2 JavaScript runtime rather than Node. This keeps the core model portable to other future hosts/runtimes.

## Domain Concepts — Gaps

- **Item type extensibility.** Is there a fixed closed set of item types (container, file-reference), or does the model need a type-registration mechanism for future item types?
- **Operation as a first-class concept.** `vision.md` describes operations only by example. Given Word will contribute host-specific operations, it may be worth defining explicitly: how an operation is declared, what it applies to, how it's dispatched, and how a host extends the set without the core model knowing about Word.
- **Reference resolution / broken-reference state.** A file reference can become invalid (moved/deleted/renamed externally). Is "broken" an explicit state the model tracks, or purely a runtime error raised when resolution is attempted?
- **Metadata schema.** Are there common fields on every item, plus arbitrary/open-ended metadata per type, or a fixed typed schema per item type?
- **Persistence schema versioning.** No mention yet of a version field/migration strategy for the persisted format.
- **Change notification.** Nothing describes how a UI or other consumer observes model mutations (events, snapshots, polling).

## Major Use Cases — Gaps

- Rename an item.
- Detect, report, and repair a broken reference.
- Search or filter items across the hierarchy.
- Bulk operations across multiple selected items.
- Undo/redo an operation.
- Validate hierarchy integrity (no cycles, no duplicate identity, no orphaned nodes).
- Export/share a project independent of the authoring host.

## Unclear Requirements — Beyond the Existing List

The most architecturally significant one:

> **Office.js add-ins run inside a sandboxed browser/WebView2 context with restricted local filesystem access.** They generally can't open or resolve arbitrary local file paths directly — access typically goes through file pickers, OneDrive/SharePoint, or the host document itself. This can conflict with an assumption that "arbitrary file/document" references are freely resolvable local paths.

This has been added as a constraint in architecture.md (Host Sandbox Constraints) because it isn't really "open" — it's an external fact about the Office.js platform — but its *implications* for the reference/identifier design are still open:

- Is a file/document reference an opaque host-resolvable identifier rather than a literal path?
- Who resolves a reference — core model, resource-access layer, or host integration — given the host is the one with sandboxed access?

Other open questions worth tracking alongside the existing list in architecture.md:

- Is the operation dispatch model synchronous, or does it need an async/result contract (Office.js APIs are largely promise-based)?
- Is there any concurrency/multi-writer concern for the MVP, or is single-process/single-user assumed?
- What is the error/result convention for a failed operation (thrown exception vs. a result/outcome value)?
- Is undo/redo in scope for MVP, or explicitly deferred?

## Component Boundaries — Addition

**Operation / Command Layer**, distinct from the Core Project Model: declares what operations exist and against which item types, dispatches an operation to a handler, and lets a host register host-specific operations without the core model depending on the host. This has been added to architecture.md as a likely boundary; whether it becomes a separate module or a lightweight convention inside the core model is still a decision to make.

## Decisions Before Implementation — Additions

Folded into the numbered list in architecture.md:

- How a file/document reference is represented, given Office.js's sandboxed file access.
- Whether operations are a distinct extensible layer or methods on the core model directly.

Still open, not yet added anywhere as a decision (raise before committing to an operation/event API):

- The error/result convention for failed operations.
- Whether change notification (eventing) is needed for the first vertical slice, or can wait.

## Suggested Next Step

The first vertical capability described in architecture.md (create/load a project, add a reference to the current Word document, persist, reload) still looks like the right MVP slice. Before starting it, the decisions most likely to force a rewrite if deferred are:

1. The shape of a file/document reference (path vs. opaque identifier) — directly affected by the Office.js sandbox constraint.
2. Item identity scheme.
3. Whether "operation" needs to be modeled explicitly even in slice one, or can be a plain function call for now.

Everything else in this document can reasonably wait until it blocks a concrete use case.
