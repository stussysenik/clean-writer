// utils/cljsInterop.ts

export function logFromClojureScript(message: string): void {
  console.log(`[TypeScript Interop]: Message from ClojureScript: ${message}`);
}

export function getCurrentTimestamp(): number {
  console.log("[TypeScript Interop]: ClojureScript requested timestamp.");
  return Date.now();
}
