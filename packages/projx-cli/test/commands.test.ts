import { describe, expect, it } from 'vitest';
import { addContainer, addFileReference, createProject } from '@tetonmoon/projx';
import { findAddedItemId, formatProjectTree, resolveParentId } from '../src/commands.js';

describe('resolveParentId', () => {
  it('returns null when no value is given', () => {
    expect(resolveParentId(undefined)).toBeNull();
  });

  it('returns the id when a value is given', () => {
    expect(resolveParentId('some-id')).toBe('some-id');
  });
});

describe('formatProjectTree', () => {
  it('renders an empty project as just the header line', () => {
    const project = createProject('Empty');

    expect(formatProjectTree(project)).toBe(`Empty (${project.id})`);
  });

  it('renders nested items indented under their parent', () => {
    let project = createProject('Demo');
    project = addContainer(project, null, 'Folder');
    const folderId = [...project.items.values()][0]!.id;
    project = addFileReference(project, folderId, 'Report', {
      scheme: 'word',
      identifier: 'doc-1',
      displayName: 'Report.docx',
    });

    const tree = formatProjectTree(project);

    expect(tree).toBe(
      [
        `Demo (${project.id})`,
        `  - [container] Folder (${folderId})`,
        `    - [file-reference] Report (${[...project.items.values()][1]!.id})`,
      ].join('\n'),
    );
  });
});

describe('findAddedItemId', () => {
  it('returns the id present in "after" but not in "before"', () => {
    const before = createProject('Demo');
    const after = addContainer(before, null, 'Folder');

    const addedId = findAddedItemId(before, after);

    expect(addedId).toBe([...after.items.values()][0]!.id);
  });

  it('throws when no new item was added', () => {
    const project = createProject('Demo');

    expect(() => findAddedItemId(project, project)).toThrow();
  });
});
