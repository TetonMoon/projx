# AGENTS.md

## Project

This repository contains a framework for defining and working with hierarchical projects made up of arbitrary files and documents.

Microsoft Word is the first host/integration, but the core project model must remain independent of Word and Office.js.

## Current Phase

The project is in early design and MVP development.

Prefer simple, explicit designs over speculative abstraction. Do not build functionality that has not been requested.

## Engineering Principles

- Keep the core project model host-agnostic.
- Keep Word/Office.js dependencies out of the core project layer.
- Treat project hierarchy as a logical structure that may reference arbitrary external files/documents.
- Preserve clear boundaries between domain logic, persistence, host integrations, and UI.
- Favor testable components with explicit contracts.
- Prefer incremental vertical capabilities over broad up-front implementation.
- Do not change approved tests merely to make implementation pass.
- When a requirement is ambiguous and materially affects architecture or behavior, surface the ambiguity rather than silently choosing a consequential interpretation.

## Agent Working Style

Before implementing a non-trivial change:

1. Inspect relevant repository context and tests.
2. State the intended approach briefly.
3. Keep the change within the requested scope.
4. Run relevant tests, type checking, and linting when available.
5. Report assumptions, design choices, and unresolved issues.

Do not implement speculative future integrations unless explicitly requested.
