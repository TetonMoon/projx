# Architecture

See [analysis.md](analysis.md) for the rationale behind items added below and a broader review of gaps in this design.

## Architectural Constraints

### Host Independence
The core project model must not depend on Microsoft Word, Office.js, or any other editor/host API.

Word-specific behavior belongs in a Word integration layer.

### Technology Stack
The core framework is TypeScript, using Node/npm tooling. The Word integration uses Office.js.

The core model must remain free of Word/Office.js dependencies. It should also avoid Node-specific runtime dependencies (e.g. `fs`, `path`, Node-only APIs) unless isolated behind an adapter, since Office.js add-ins run in a browser/WebView2 JavaScript runtime, not Node.

### Host Sandbox Constraints
Office.js add-ins execute inside a sandboxed browser/WebView2 context with restricted local filesystem access. They generally cannot open or resolve arbitrary local file paths directly; access typically goes through file pickers, OneDrive/SharePoint, or the host document itself.

This constrains how file/document references are represented and resolved: the core model should treat a reference as an opaque, host-resolvable identifier rather than assuming a directly addressable local path.

### Logical vs. Physical Structure
The project hierarchy is logical.

It may reference arbitrary files whose physical locations do not correspond to the project's hierarchy.

### Explicit Boundaries
Keep separate concerns for:

- domain/project model;
- project persistence;
- filesystem/resource access;
- host integration;
- presentation/UI.

### Testability
Core behavior should be executable without launching Word.

Host integration should be isolated behind interfaces/adapters where practical so that core behavior can be tested independently.

### Incremental Design
Avoid designing for every future host or storage mechanism up front.

Introduce abstractions when they protect a known boundary or support a current use case.

## Likely Component Boundaries

### Core Project Model
Responsible for:
- projects;
- project items;
- hierarchy rules;
- item identity;
- domain operations;
- domain invariants.

Must have no Word dependency.

### Project Persistence
Responsible for:
- saving project metadata and hierarchy;
- loading projects;
- translating persisted data to/from the core model.

The storage format is not yet decided.

### Resource / File Access
Responsible for interacting with referenced files or external resources where filesystem behavior is required.

This boundary prevents filesystem mechanics from leaking unnecessarily into the domain model.

### Operation / Command Layer
Responsible for:
- declaring what operations exist and against which item types they apply;
- dispatching an operation to the correct handler;
- letting a host contribute host-specific operations without the core model knowing about them.

This is kept distinct from the Core Project Model so that core domain behavior (hierarchy, identity, invariants) is not coupled to a growing, host-influenced set of verbs. Whether this ends up as a separate module or a thin convention within the core model is undecided (see Decisions to Make Before Implementation).

### Word Integration
Responsible for:
- Office.js interaction;
- obtaining the current Word document/context;
- mapping user actions in Word to project operations;
- invoking Word-specific behavior.

The Word layer consumes the core model; the core model does not know about Word.

### UI / Presentation
Responsible for displaying project structure and commands to the user.

For the Word MVP this may live within the add-in, but presentation concerns should remain separate from domain behavior.

## Unclear Requirements

The following should be resolved as implementation approaches them:

- What uniquely identifies a project item?
- Can the same physical file appear more than once in one project?
- Can the same file belong to multiple projects?
- Are logical containers and file-backed items represented by one common type or distinct types?
- What happens when a referenced file is moved, renamed, or deleted outside the application?
- Are file references stored as absolute paths, relative paths, URIs, or another identifier?
- Does removing an item from a project ever delete the underlying file?
- Are project operations synchronous or asynchronous at the domain boundary?
- What metadata belongs to every item versus only specific item types?
- Where is project metadata persisted?
- Does the Word add-in operate only on the currently open document, or can it manage arbitrary project files?
- How is a Word document associated with a project item?
- Is the project hierarchy mutable while documents are open?
- What behavior is required when multiple hosts/processes access the same project?
- Is there a fixed, closed set of item types, or does the model need a type-registration/extensibility mechanism?
- Is "broken reference" (moved/deleted/inaccessible file) an explicit model state, or purely a runtime error surfaced when resolution is attempted?
- Is project metadata schema fixed per item type, or arbitrary/open-ended key-value data?
- Does the persisted format carry a schema version for future migration?
- How does a UI or other consumer observe changes to the project model (events, snapshots, polling)?
- Are operations expected to support undo/redo, or is that out of scope for MVP?
- What is the error/result convention for an operation that fails (thrown exception vs. a result/outcome value)?

These are open questions, not requirements to solve immediately.

## Decisions to Make Before Implementation

The first implementation slice should establish only the decisions necessary for a minimal vertical capability.

At minimum, decide:

1. The representation of `Project` and `ProjectItem`.
2. How project items are identified.
3. How parent/child hierarchy is represented.
4. How file-backed items reference external files.
5. The minimum persistence format needed to save and reload a project.
6. The boundary between the core project model and Word integration.
7. How a file/document reference is represented, given that Office.js cannot assume direct local filesystem access (see Host Sandbox Constraints above).
8. Whether operations are modeled as a distinct extensible layer or as methods on the core model directly.
9. The first end-to-end behavior to implement.

A good first vertical capability is likely:

> Create or load a project, add a reference to the current Word document into a logical project hierarchy, persist the project, and reload it without losing structure or identity.

Anything beyond what is required for that capability should remain deferred unless a discovered constraint makes it necessary.
