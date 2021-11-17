import {
  createContext 
} from 'react';
 
export const MailContext = createContext({
  currentUsage: 0,
  maxAllocated: 0,
  expiration: 0,
  mail: []
});
