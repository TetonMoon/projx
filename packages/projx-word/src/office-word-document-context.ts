import type { WordDocumentContext } from './word-document-context.js';

// Thin adapter over the real Office.js APIs. Requires running inside a Word add-in,
// so it is intentionally left untested here — getOrCreateWordDocumentReference is
// where the testable logic lives, exercised against a fake WordDocumentContext.
export class OfficeWordDocumentContext implements WordDocumentContext {
  getSetting(key: string): string | undefined {
    const value = Office.context.document.settings.get(key);
    return typeof value === 'string' ? value : undefined;
  }

  setSetting(key: string, value: string): void {
    Office.context.document.settings.set(key, value);
  }

  saveSettingsAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
      Office.context.document.settings.saveAsync((result) => {
        if (result.status === 'succeeded') {
          resolve();
        } else {
          reject(new Error(result.error?.message ?? 'Failed to save Word document settings.'));
        }
      });
    });
  }

  getFileName(): Promise<string> {
    return new Promise((resolve, reject) => {
      Office.context.document.getFilePropertiesAsync((result) => {
        if (result.status === 'succeeded') {
          const { url } = result.value;
          resolve(url ? (url.split('/').pop() ?? url) : 'Untitled');
        } else {
          reject(new Error(result.error?.message ?? 'Failed to read Word document properties.'));
        }
      });
    });
  }
}
