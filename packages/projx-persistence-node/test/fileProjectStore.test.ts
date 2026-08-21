import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PersistedProjectV1 } from '@tetonmoon/projx';
import { FileProjectStore } from '../src/fileProjectStore.js';

const sample: PersistedProjectV1 = {
  schemaVersion: 1,
  id: 'project-1',
  name: 'Sample',
  items: [
    { id: 'item-1', name: 'Folder', parentId: null, kind: 'container' },
    {
      id: 'item-2',
      name: 'Report',
      parentId: 'item-1',
      kind: 'file-reference',
      reference: { scheme: 'word', identifier: 'doc-123', displayName: 'Report.docx' },
    },
  ],
};

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'projx-store-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('FileProjectStore', () => {
  it('writes save() data as JSON matching the given payload', async () => {
    const store = new FileProjectStore(join(dir, 'project.json'));

    await store.save(sample);
    const loaded = await store.load();

    expect(loaded).toEqual(sample);
  });

  it('load() returns exactly what a prior save() wrote', async () => {
    const path = join(dir, 'project.json');
    const store = new FileProjectStore(path);
    await store.save(sample);

    const reloaded = await new FileProjectStore(path).load();

    expect(reloaded).toEqual(sample);
  });

  it('load() throws a clear error when the file does not exist', async () => {
    const store = new FileProjectStore(join(dir, 'missing.json'));

    await expect(store.load()).rejects.toThrow();
  });
});
