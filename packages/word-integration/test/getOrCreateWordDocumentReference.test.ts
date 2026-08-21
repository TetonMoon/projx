import { describe, expect, it } from 'vitest';
import { getOrCreateWordDocumentReference } from '../src/getOrCreateWordDocumentReference.js';
import type { WordDocumentContext } from '../src/wordDocumentContext.js';

class FakeWordDocumentContext implements WordDocumentContext {
  private readonly settings: Map<string, string>;
  saveCount = 0;

  constructor(
    private readonly fileName: string,
    initialSettings: Record<string, string> = {},
  ) {
    this.settings = new Map(Object.entries(initialSettings));
  }

  getSetting(key: string): string | undefined {
    return this.settings.get(key);
  }

  setSetting(key: string, value: string): void {
    this.settings.set(key, value);
  }

  async saveSettingsAsync(): Promise<void> {
    this.saveCount += 1;
  }

  async getFileName(): Promise<string> {
    return this.fileName;
  }
}

describe('getOrCreateWordDocumentReference', () => {
  it('generates and persists a new id when none exists yet', async () => {
    const context = new FakeWordDocumentContext('Report.docx');

    const reference = await getOrCreateWordDocumentReference(context);

    expect(reference.scheme).toBe('word');
    expect(reference.identifier).toBeTruthy();
    expect(context.getSetting('projx.documentId')).toBe(reference.identifier);
    expect(context.saveCount).toBe(1);
  });

  it('reuses an existing id instead of generating a new one', async () => {
    const context = new FakeWordDocumentContext('Report.docx', { 'projx.documentId': 'existing-id' });

    const reference = await getOrCreateWordDocumentReference(context);

    expect(reference.identifier).toBe('existing-id');
    expect(context.saveCount).toBe(0);
  });

  it('uses the current file name as displayName', async () => {
    const context = new FakeWordDocumentContext('Budget.docx');

    const reference = await getOrCreateWordDocumentReference(context);

    expect(reference.displayName).toBe('Budget.docx');
  });

  it('generates a different id for two different documents', async () => {
    const a = await getOrCreateWordDocumentReference(new FakeWordDocumentContext('A.docx'));
    const b = await getOrCreateWordDocumentReference(new FakeWordDocumentContext('B.docx'));

    expect(a.identifier).not.toBe(b.identifier);
  });
});
