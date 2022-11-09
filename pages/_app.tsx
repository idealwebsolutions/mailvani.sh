import { AppProps } from 'next/app';
import Head from 'next/head';
import {
  useState,
  useEffect,
} from 'react';
import useSWR from 'swr';
import {
  session,
  StoreAPI 
} from 'store2';
import {
  ThemeProvider,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { 
  lightTheme,
  darkTheme
} from '../components/Theme';
import Account from '../components/Account';
import Layout from '../components/Layout';

import { MailContext } from '../context/Mail';
import { ThemeSettingsContext } from '../context/Theme';
import {
  decryptMessage,
  computeSecret,
} from '../utils/crypto';
import {
  ExpiredMailboxError,
  RateLimitError,
  MailItem 
} from '../data/types';

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

interface Keypair {
  readonly publicKey: Uint8Array,
  readonly secretKey: Uint8Array,
};

interface EncryptedMailResponse {
  readonly mail: Array<string>,
  readonly key: Array<number>,
  readonly usage: {
    current: number,
    max: number
  },
  readonly expires: number
};

const keyring: StoreAPI = session.namespace('keyring');
const prefs: StoreAPI = session.namespace('preferences');

// TODO: get type of r
const fetcher = (url: string) => fetch(url).then((r) => {
  // TODO: create custom error types
  if (r.status === 401 || r.status === 404) {
    throw new ExpiredMailboxError('Session expired');
  } else if (r.status === 429) {
    throw new RateLimitError('Too many requests');
  } else if (r.status >= 400) {
    throw new Error('Bad request');
  }
  return r.json();
});

// Top state:
// alias: for app: Current mailbox alias used
//
function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false);
  const [isDarkTheme, setDarkTheme] = useState(prefs.has('dark-theme') ? prefs.get('dark-theme') : false);
  // TODO: check for 429 
  const toggleTheme = () => {
    const newTheme = !isDarkTheme ? true : false;
    setDarkTheme(newTheme);
    prefs.set('dark-theme', newTheme);
  };
  const toggleReadyState = (isReady: boolean) => setReady(isReady);
  // Handles incoming data
  const { data, error } = useSWR(ready ? '/api/mailbox' : null, fetcher);
  let mail: Array<MailItem> = [];
  let expiration: number = 0;
  let maxAllocated: number = 0;
  let currentUsage: number = 0;
  let throttled: boolean = false;
  // Stop fetching on error
  if (error instanceof ExpiredMailboxError) {
    setReady(false);
    expiration = 0;
    currentUsage = 0;
  } else if (error instanceof RateLimitError) {
    setReady(false);
    expiration = 0;
    currentUsage = 0;
    throttled = true;
  } else {
    // Set expected response type
    const encryptedMailResponse: EncryptedMailResponse | null = data;
    if (encryptedMailResponse) {
      if (encryptedMailResponse.mail.length) {
        const { _publicKey, secretKey } = keyring.get('keys');
        mail = decryptMail(encryptedMailResponse.mail, {
          publicKey: Uint8Array.from(encryptedMailResponse.key),
          secretKey: Uint8Array.from(secretKey),
        });
      }
      if (encryptedMailResponse.expires > 0) {
        expiration = encryptedMailResponse.expires;
      }
      if (encryptedMailResponse.usage.current > 0) {
        currentUsage = encryptedMailResponse.usage.current;
      }
      if (encryptedMailResponse.usage.max > 0) {
        maxAllocated = encryptedMailResponse.usage.max;
      }
    }
  }
  // Run first time only
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);
  return (
    <>
      <Head>
        <title>mailvani.sh - Disposable mailbox with encryption</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta property="og:title" content="mailvani.sh - Disposable mailbox with encryption" />
      </Head>
      <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
        <CssBaseline />
        <MailContext.Provider value={{
          mail,
          currentUsage,
          maxAllocated,
          expiration
        }}>
          <ThemeSettingsContext.Provider value={{
            isDarkTheme,
            toggleTheme
          }}>
            <Account throttled={throttled} ready={ready} setReady={toggleReadyState}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </Account>
          </ThemeSettingsContext.Provider>
        </MailContext.Provider>
      </ThemeProvider>
    </>
  );
}

function decryptMail (mail: Array<string>, keypair: Keypair): Array<MailItem> {
  const secret: Uint8Array = computeSecret(keypair.publicKey, keypair.secretKey);
  const decrypted: Set<MailItem> = new Set([]);
  for (const encrypted of mail) {
    let mailItem: MailItem;
    try {
      mailItem = decryptMessage(secret, encrypted);
    } catch (err) {
      console.error(err);
      continue;
    }
    decrypted.add(mailItem);
  }
  return Array.from(decrypted);
}

export default App
