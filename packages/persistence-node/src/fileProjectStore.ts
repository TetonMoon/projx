import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { PersistedProjectV1, ProjectStore } from '@projx/core';

export class FileProjectStore implements ProjectStore {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async save(data: PersistedProjectV1): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async load(): Promise<PersistedProjectV1> {
    let contents: string;
    try {
      contents = await readFile(this.filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load project from "${this.filePath}": ${(error as Error).message}`);
    }
    return JSON.parse(contents) as PersistedProjectV1;
  }
}
