import { 
  createContext 
} from 'react';
 
export const AccountContext = createContext({
  active: false,
  canReset: false,
  alias: '',
  updateResetStatus: (_canReset: boolean) => {},
  updateAlias: (_alias: string) => {},
  create: () => {},
  reset: () => {},
});
