import { describe, expect, it } from 'vitest';
import { addContainer, addFileReference, createProject } from '../src/project.js';
import { deserializeProject, serializeProject } from '../src/serialization.js';
import type { DocumentReference } from '../src/reference.js';
import type { PersistedProjectV1 } from '../src/serialization.js';

const reference: DocumentReference = {
  scheme: 'word',
  identifier: 'doc-123',
  displayName: 'Report.docx',
};

function buildSampleProject() {
  let project = createProject('Sample');
  project = addContainer(project, null, 'Folder');
  const folderId = [...project.items.values()].find((item) => item.name === 'Folder')!.id;
  project = addFileReference(project, folderId, 'Report', reference);
  return project;
}

describe('serializeProject', () => {
  it('produces schemaVersion 1 with one entry per item', () => {
    const project = buildSampleProject();

    const persisted = serializeProject(project);

    expect(persisted.schemaVersion).toBe(1);
    expect(persisted.id).toBe(project.id);
    expect(persisted.name).toBe(project.name);
    expect(persisted.items).toHaveLength(2);

    const folder = persisted.items.find((item) => item.kind === 'container')!;
    expect(folder).toMatchObject({ name: 'Folder', parentId: null, kind: 'container' });

    const file = persisted.items.find((item) => item.kind === 'file-reference')!;
    expect(file).toMatchObject({
      name: 'Report',
      parentId: folder.id,
      kind: 'file-reference',
      reference,
    });
  });
});

describe('deserializeProject', () => {
  it('round-trips to a deep-equal project preserving ids, hierarchy, and references', () => {
    const project = buildSampleProject();

    const roundTripped = deserializeProject(serializeProject(project));

    expect(roundTripped).toEqual(project);
  });

  it('throws on an unknown schema version', () => {
    const data = { ...serializeProject(buildSampleProject()), schemaVersion: 2 } as unknown as PersistedProjectV1;

    expect(() => deserializeProject(data)).toThrow();
  });
});
