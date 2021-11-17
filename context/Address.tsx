import { createContext } from 'react';

export const AddressContext = createContext({
  copied: false,
  updateCopied: (_copied: boolean) => {}
});
