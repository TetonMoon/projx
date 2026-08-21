import { describe, expect, it } from 'vitest';
import {
  addContainer,
  addFileReference,
  createProject,
  getChildren,
  removeItem,
} from '../src/project.js';
import type { DocumentReference } from '../src/reference.js';

const reference: DocumentReference = {
  scheme: 'word',
  identifier: 'doc-123',
  displayName: 'Report.docx',
};

describe('createProject', () => {
  it('creates a project with a generated id, the given name, and no items', () => {
    const project = createProject('My Project');

    expect(project.id).toBeTruthy();
    expect(project.name).toBe('My Project');
    expect(project.items.size).toBe(0);
  });

  it('generates a different id for each project', () => {
    const a = createProject('A');
    const b = createProject('B');

    expect(a.id).not.toBe(b.id);
  });
});

describe('addContainer', () => {
  it('adds a root-level container without mutating the original project', () => {
    const original = createProject('Project');

    const updated = addContainer(original, null, 'Folder');

    expect(original.items.size).toBe(0);
    const children = getChildren(updated, null);
    expect(children).toHaveLength(1);
    expect(children[0]).toMatchObject({ kind: 'container', name: 'Folder', parentId: null });
  });

  it('nests a container under an existing container', () => {
    let project = createProject('Project');
    project = addContainer(project, null, 'Parent');
    const parentId = getChildren(project, null)[0]!.id;

    project = addContainer(project, parentId, 'Child');

    const children = getChildren(project, parentId);
    expect(children).toHaveLength(1);
    expect(children[0]).toMatchObject({ kind: 'container', name: 'Child', parentId });
  });

  it('throws when the parent does not exist', () => {
    const project = createProject('Project');

    expect(() => addContainer(project, 'missing-id' as never, 'Folder')).toThrow();
  });
});

describe('addFileReference', () => {
  it('preserves the reference fields on the resulting item', () => {
    const project = createProject('Project');

    const updated = addFileReference(project, null, 'Report', reference);

    const [item] = getChildren(updated, null);
    expect(item).toMatchObject({
      kind: 'file-reference',
      name: 'Report',
      reference,
    });
  });

  it('allows the same reference to back two distinct items', () => {
    let project = createProject('Project');
    project = addFileReference(project, null, 'Report A', reference);
    project = addFileReference(project, null, 'Report B', reference);

    const children = getChildren(project, null);
    expect(children).toHaveLength(2);
    expect(children[0]!.id).not.toBe(children[1]!.id);
  });

  it('throws when the parent does not exist', () => {
    const project = createProject('Project');

    expect(() => addFileReference(project, 'missing-id' as never, 'Report', reference)).toThrow();
  });
});

describe('removeItem', () => {
  it('removes the item and its descendants', () => {
    let project = createProject('Project');
    project = addContainer(project, null, 'Parent');
    const parentId = getChildren(project, null)[0]!.id;
    project = addContainer(project, parentId, 'Child');

    project = removeItem(project, parentId);

    expect(getChildren(project, null)).toHaveLength(0);
    expect(project.items.size).toBe(0);
  });
});
