// Abstraction over the Word document APIs this package needs, so the mapping
// logic in getOrCreateWordDocumentReference can be tested without Office.js.
export interface WordDocumentContext {
  getSetting(key: string): string | undefined;
  setSetting(key: string, value: string): void;
  saveSettingsAsync(): Promise<void>;
  getFileName(): Promise<string>;
}
