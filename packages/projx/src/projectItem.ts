import type { ItemId } from './identity.js';
import type { DocumentReference } from './reference.js';

interface ProjectItemBase {
  readonly id: ItemId;
  readonly name: string;
  readonly parentId: ItemId | null;
}

export interface ContainerItem extends ProjectItemBase {
  readonly kind: 'container';
}

export interface FileReferenceItem extends ProjectItemBase {
  readonly kind: 'file-reference';
  readonly reference: DocumentReference;
}

export type ProjectItem = ContainerItem | FileReferenceItem;
