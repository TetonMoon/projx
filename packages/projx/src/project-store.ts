import type { PersistedProjectV1 } from './serialization.js';

// Implemented outside the core (see @tetonmoon/projx-persistence-node) so the core stays free of I/O concerns.
export interface ProjectStore {
  save(data: PersistedProjectV1): Promise<void>;
  load(): Promise<PersistedProjectV1>;
}
