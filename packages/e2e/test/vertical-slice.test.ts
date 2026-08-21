import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { addFileReference, createProject, deserializeProject, serializeProject } from '@projx/core';
import type { DocumentReference } from '@projx/core';
import { FileProjectStore } from '@projx/persistence-node';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'projx-e2e-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('vertical slice: create, add reference, persist, reload', () => {
  it('reloads a project that is structurally and identically equal to the original', async () => {
    const wordDocument: DocumentReference = {
      scheme: 'word',
      identifier: 'doc-abc-123',
      displayName: 'Quarterly Report.docx',
    };

    const original = addFileReference(createProject('Quarterly Report Project'), null, 'Quarterly Report.docx', wordDocument);

    const store = new FileProjectStore(join(dir, 'project.json'));
    await store.save(serializeProject(original));

    const reloadedData = await new FileProjectStore(join(dir, 'project.json')).load();
    const reloaded = deserializeProject(reloadedData);

    expect(reloaded).toEqual(original);
  });
});
