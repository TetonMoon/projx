export type ItemId = string & { readonly __brand: unique symbol };

// crypto.randomUUID() is a global available in both Node and browser/WebView2 runtimes,
// so this stays free of Node-specific imports.
export function createItemId(): ItemId {
  return crypto.randomUUID() as ItemId;
}
