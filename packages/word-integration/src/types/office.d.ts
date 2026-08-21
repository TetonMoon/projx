// Minimal ambient typings for the subset of Office.js used by this package.
// Intentionally not a substitute for the full `@types/office-js` package;
// add to this as more of the Office.js surface is needed.
declare namespace Office {
  interface AsyncResult<T> {
    readonly status: 'succeeded' | 'failed';
    readonly value: T;
    readonly error?: { readonly message: string };
  }

  interface Settings {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
    saveAsync(callback: (result: AsyncResult<void>) => void): void;
  }

  interface FileProperties {
    readonly url: string;
  }

  interface Document {
    readonly settings: Settings;
    getFilePropertiesAsync(callback: (result: AsyncResult<FileProperties>) => void): void;
  }

  interface Context {
    readonly document: Document;
  }

  const context: Context;
}
