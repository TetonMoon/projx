# Vision

## Goal

Build a framework for defining a hierarchical project made up of arbitrary documents and files, with operations that can be performed against project items.

Microsoft Word will be the first host/integration, but the core project model must not depend on Word.

## Domain Concepts

### Project
A logical container representing a user-defined body of work.

A project owns a hierarchy of project items and provides the context in which operations against those items occur.

### Project Item
A node in the project hierarchy.

A project item may represent:
- a logical container/folder;
- a reference to an external file or document;
- potentially other item types introduced later.

### Project Hierarchy
The parent/child structure that organizes project items independently of the physical filesystem.

### File/Document Reference
A reference from a project item to an external resource.

The project structure should not require that the physical filesystem mirror the logical project hierarchy.

### Project Operation
An action performed against one or more project items.

Examples may include opening, organizing, moving, removing, or invoking host-specific operations.

### Host
An application that presents or manipulates project content.

Microsoft Word is the first host.

### Host Integration
An adapter between the host application and the host-independent project framework.

### Persistence
The mechanism used to save and restore project structure and metadata.

Persistence details are intentionally undecided at this stage.

Additional concepts surfaced during analysis, not yet confirmed (see [analysis.md](analysis.md)):

- **Reference resolution / broken reference** — whether an unresolvable file reference (moved, renamed, deleted) is an explicit model state or purely a runtime error.
- **Item type extensibility** — whether item types are a fixed closed set or a registrable/extensible taxonomy.
- **Change notification** — how a consumer (e.g. a UI) observes mutations to the project model.

## Major Use Cases

Initial use cases include:

- Create a project.
- Open an existing project.
- Add logical folders/containers to a project.
- Add an arbitrary file or document to a project.
- Organize items into a hierarchy.
- Move items within the hierarchy.
- Remove items from a project without necessarily deleting the underlying file.
- Inspect project items and their metadata.
- Persist and reload the project structure.
- Open or act on a referenced document from a host integration.
- Use Microsoft Word as the first interface for interacting with project content.

Likely further use cases, not yet confirmed as in-scope for the MVP (see [analysis.md](analysis.md)):

- Rename a project item.
- Detect and report a broken file/document reference (moved, renamed, or deleted externally).
- Search or filter project items across the hierarchy.
- Perform an operation against multiple selected items at once.
- Undo/redo a project operation.
- Validate hierarchy integrity (e.g. no cycles, no duplicate identity).
- Export or share a project independent of the authoring host.

## MVP Direction

The MVP should prove that:

1. A host-independent project hierarchy can be created and persisted.
2. Arbitrary files/documents can be referenced by that hierarchy.
3. A Word integration can consume the project model without the core model depending on Word.
4. Basic operations against project items can be performed through that integration.

The MVP should avoid solving future editor integrations, synchronization, collaboration, cloud storage, or AI-assisted content features unless they become necessary to prove the core model.
