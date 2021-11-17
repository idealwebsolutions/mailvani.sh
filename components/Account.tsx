import {
  session,
  StoreAPI 
} from 'store2';
import {
  useState 
} from 'react';
import { BoxKeyPair } from 'tweetnacl';
import {
  generateKeypair
} from '../utils/crypto';

import { AccountContext } from '../context/Account';
import { MailPropertiesContext } from '../context/MailProperties';
import { useEffect } from 'react';
import Alert from '@material-ui/lab/Alert';

type InitializedMailboxResponse = {
  readonly alias: string
};

const keyring: StoreAPI = session.namespace('keyring');

const bootstrap = () => {
  // Check if keyring can persist through session
  if (keyring.isFake()) {
    console.log('Warning: Unable to persist keypair through session. Falling back to in-memory');
  }
  keyring.clear();
  // Generate new keypair
  const keypair: BoxKeyPair = generateKeypair();
  // console.log('generating keypair');
  const publicKey: Array<number> = Array.from(keypair.publicKey);
  const secretKey: Array<number> = Array.from(keypair.secretKey);
  // Add keypair to keyring
  keyring.add('keys', {
    publicKey,
    secretKey,
  });
  return publicKey;
};

// Creates mailbox
const initializeMailbox = async (updateAlias: Function) => {
  const publicKey = bootstrap();
  const response = await fetch('/api/mailbox', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      publicKey
    })
  });
  const mailboxCreationResponse: InitializedMailboxResponse = await response.json();
  if (response.status !== 201) {
    // TODO: do something
    return;
  }
  updateAlias(mailboxCreationResponse.alias);
};

// Destroys mailbox
const destroyMailbox = async () => {
  const response = await fetch('/api/mailbox', {
    method: 'DELETE',
  });
  if (response.status !== 204) {
    throw new Error('Failed to delete');
  }
}

// Extends mailbox
/*const extendMailbox = async () => {
  const response = await fetch('/api/mailbox', {
    method: 'PATCH',
  });
  if (response.status !== 200) {
    // TODO: resetExpiration
  }
};*/

interface Props {
  readonly ready: boolean,
  readonly throttled: boolean,
  readonly setReady: Function,
  readonly children: any
}

export default function Account (props: Props) {
  const [allRead, setAllRead] = useState<Array<number>>([]);
  const [alias, setAlias] = useState<string>(null);
  const [currentOpened, setCurrentOpened] = useState<number>(-1);
  const [canReset, setCanReset] = useState<boolean>(false);
  // Fn to share with context provider
  const updateAlias = (nextAlias: string | null) => {
    setAlias(nextAlias);
    props.setReady(true);
  };
  const updateResetStatus = (canReset: boolean) => setCanReset(canReset);
  // Updates mail read
  const updateAllRead = (itemIndex: number) => {
    const opened = new Set(allRead);
    opened.add(itemIndex);
    setAllRead(Array.from(opened.values()));
  };
  // Reset mail opened view state
  // const resetView = () => setCurrentOpened(-1);
  // Handle all opened mail state
  const handleMailOpened = (item: number) => {
    setCurrentOpened(item);
    // Update global state
    if (item >= 0) {
      updateAllRead(item);
    }
  };
  // create
  const create = async () => await initializeMailbox(updateAlias);
  // reset
  const reset = async () => {
    if (props.ready) {
      try {
        await destroyMailbox();
      } catch (err) {
        console.error(err);
        return;
      }
      props.setReady(false);
    }
    await create();
  };

  // Should only run account creation once 
  useEffect(() => {
    if (!alias) { 
      create();
    }
    return () => {
      setAlias(null);
    };
  }, []);

  if (!props.ready && props.throttled) {
    // TODO: add hcaptcha here
    // setTimeout(() => window.location.reload(), 2500);
    return (<Alert>You have been throttled for making too many attempts. Restarting session...</Alert>);
  }
  return (
    <AccountContext.Provider value={{
      active: props.ready,
      alias,
      canReset,
      updateResetStatus,
      updateAlias,
      create,
      reset
    }}>
      <MailPropertiesContext.Provider value={{
        changeOpened: handleMailOpened,
        currentOpened, 
        allRead, 
        updateAllRead
      }}>
        {props.children}
      </MailPropertiesContext.Provider>
    </AccountContext.Provider>
  );
};
