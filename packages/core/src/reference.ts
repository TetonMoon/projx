// An opaque, host-resolvable reference to an external file/document.
// The core model never interprets `scheme` or `identifier`; only the owning host can resolve them.
export interface DocumentReference {
  readonly scheme: string;
  readonly identifier: string;
  readonly displayName?: string;
}
