export function createFakeSession(initial: Record<string, unknown> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    get: (key: string) => store.get(key),
    set: (key: string, value: unknown) => store.set(key, value),
    unset: (key: string) => store.delete(key),
    has: (key: string) => store.has(key),
    flash: () => {},
    commit: async () => 'mock-cookie',
  };
}
