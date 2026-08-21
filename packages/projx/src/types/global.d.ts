// Minimal ambient typing for the Web Crypto global used by this package.
// Declared locally (rather than via Node or DOM lib types) so the package
// stays host/runtime-neutral: it only types the subset actually used, and is
// available in both Node and browser/WebView2 runtimes at execution time.
declare const crypto: {
  randomUUID(): string;
};
