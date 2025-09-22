export const TokenManager = (() => {
  let current: string | undefined;
  return {
    set(token?: string) { current = token; },
    get(): string | undefined { return current; },
  };
})();
