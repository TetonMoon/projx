import type { DocumentReference } from '@tetonmoon/projx';
import type { WordDocumentContext } from './word-document-context.js';

const DOCUMENT_ID_SETTING_KEY = 'projx.documentId';

// The document's own id is stored in its settings so it survives renames/moves,
// which the file name (used only for display) does not.
export async function getOrCreateWordDocumentReference(
  context: WordDocumentContext,
): Promise<DocumentReference> {
  let identifier = context.getSetting(DOCUMENT_ID_SETTING_KEY);

  if (!identifier) {
    identifier = crypto.randomUUID();
    context.setSetting(DOCUMENT_ID_SETTING_KEY, identifier);
    await context.saveSettingsAsync();
  }

  const displayName = await context.getFileName();
  return { scheme: 'word', identifier, displayName };
}
