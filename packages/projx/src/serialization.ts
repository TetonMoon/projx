import type { ItemId } from './identity.js';
import type { Project } from './project.js';
import type { ProjectItem } from './projectItem.js';
import type { DocumentReference } from './reference.js';

export interface PersistedItemV1 {
  readonly id: string;
  readonly name: string;
  readonly parentId: string | null;
  readonly kind: 'container' | 'file-reference';
  readonly reference?: DocumentReference;
}

export interface PersistedProjectV1 {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly name: string;
  readonly items: readonly PersistedItemV1[];
}

export function serializeProject(project: Project): PersistedProjectV1 {
  const items: PersistedItemV1[] = [...project.items.values()].map((item) =>
    item.kind === 'file-reference'
      ? { id: item.id, name: item.name, parentId: item.parentId, kind: item.kind, reference: item.reference }
      : { id: item.id, name: item.name, parentId: item.parentId, kind: item.kind },
  );

  return {
    schemaVersion: 1,
    id: project.id,
    name: project.name,
    items,
  };
}

export function deserializeProject(data: PersistedProjectV1): Project {
  if (data.schemaVersion !== 1) {
    throw new Error(`Unsupported project schema version: ${String(data.schemaVersion)}`);
  }

  const items = new Map<ItemId, ProjectItem>();
  for (const persistedItem of data.items) {
    const id = persistedItem.id as ItemId;
    const parentId = persistedItem.parentId as ItemId | null;
    const item: ProjectItem =
      persistedItem.kind === 'file-reference'
        ? { id, name: persistedItem.name, parentId, kind: 'file-reference', reference: persistedItem.reference! }
        : { id, name: persistedItem.name, parentId, kind: 'container' };
    items.set(id, item);
  }

  return {
    id: data.id as ItemId,
    name: data.name,
    items,
  };
}
