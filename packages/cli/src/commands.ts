import type { ItemId, Project } from '@projx/core';
import { getChildren } from '@projx/core';

export function resolveParentId(raw: string | undefined): ItemId | null {
  return raw ? (raw as ItemId) : null;
}

export function formatProjectTree(project: Project): string {
  const lines: string[] = [`${project.name} (${project.id})`];

  const render = (parentId: ItemId | null, depth: number): void => {
    for (const item of getChildren(project, parentId)) {
      lines.push(`${'  '.repeat(depth)}- [${item.kind}] ${item.name} (${item.id})`);
      render(item.id, depth + 1);
    }
  };

  render(null, 1);
  return lines.join('\n');
}

// addContainer/addFileReference return a whole new Project rather than the created
// item's id, so the CLI diffs before/after to report what it just created.
export function findAddedItemId(before: Project, after: Project): ItemId {
  for (const id of after.items.keys()) {
    if (!before.items.has(id)) {
      return id;
    }
  }
  throw new Error('No new item was added.');
}
