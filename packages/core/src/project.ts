import { createItemId } from './identity.js';
import type { ItemId } from './identity.js';
import type { ContainerItem, FileReferenceItem, ProjectItem } from './projectItem.js';
import type { DocumentReference } from './reference.js';

export interface Project {
  readonly id: ItemId;
  readonly name: string;
  readonly items: ReadonlyMap<ItemId, ProjectItem>;
}

export function createProject(name: string): Project {
  return {
    id: createItemId(),
    name,
    items: new Map(),
  };
}

function assertParentExists(project: Project, parentId: ItemId | null): void {
  if (parentId !== null && !project.items.has(parentId)) {
    throw new Error(`Parent item "${parentId}" does not exist in project "${project.id}".`);
  }
}

function withItem(project: Project, item: ProjectItem): Project {
  const items = new Map(project.items);
  items.set(item.id, item);
  return { ...project, items };
}

export function addContainer(project: Project, parentId: ItemId | null, name: string): Project {
  assertParentExists(project, parentId);
  const item: ContainerItem = { id: createItemId(), name, parentId, kind: 'container' };
  return withItem(project, item);
}

export function addFileReference(
  project: Project,
  parentId: ItemId | null,
  name: string,
  reference: DocumentReference,
): Project {
  assertParentExists(project, parentId);
  const item: FileReferenceItem = {
    id: createItemId(),
    name,
    parentId,
    kind: 'file-reference',
    reference,
  };
  return withItem(project, item);
}

export function getChildren(project: Project, parentId: ItemId | null): readonly ProjectItem[] {
  return [...project.items.values()].filter((item) => item.parentId === parentId);
}

// Removes an item and cascades to its descendants (see docs/analysis.md for the alternative considered).
export function removeItem(project: Project, itemId: ItemId): Project {
  const items = new Map(project.items);
  const pending: ItemId[] = [itemId];

  while (pending.length > 0) {
    const currentId = pending.pop()!;
    if (!items.delete(currentId)) continue;
    for (const item of items.values()) {
      if (item.parentId === currentId) {
        pending.push(item.id);
      }
    }
  }

  return { ...project, items };
}
