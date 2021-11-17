import { createContext } from 'react';

// TODO: rename
export const MailPropertiesContext = createContext({
  currentOpened: -1,
  changeOpened: (_mailIndex: number) => {},
  allRead: [],
  updateAllRead: (_mailIndex: number) => {},
});
