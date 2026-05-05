/** Module-scoped in-memory AES session key. Never written to disk or IndexedDB. */
let sessionKey: CryptoKey | undefined;

export const keyStore = {
  setKey: (key: CryptoKey): void => {
    sessionKey = key;
  },
  getKey: (): CryptoKey | undefined => sessionKey,
  clearKey: (): void => {
    sessionKey = undefined;
  },
  hasKey: (): boolean => sessionKey !== undefined,
};
