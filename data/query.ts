import { Client } from 'faunadb';
import ms from 'ms';

import {
  MailItem,
  Mailbox
} from './types';

import {
  create,
  extend,
  exists,
  usage,
  drop
} from './queries/mailbox';

import {
  list,
  push,
  empty
} from './queries/mail';

declare var FAUNADB_SECRET: string;
declare var DOMAIN: string;
declare var EXPIRATION: string;

const SECRET: string = (typeof process !== 'undefined' ? process.env.FAUNADB_SECRET : FAUNADB_SECRET) || ''; // Require SECRET

if (!SECRET) {
  throw new Error('FaunaDB secret required');
}

class QueryExecutor {
  private _client: Client;
  private _expiration: number;
  private _domain: string;

  constructor (domain: string = 'mailvani.sh', expiration: string = '10m') {
    this._domain = domain;
    this._client = new Client({ 
      secret: SECRET,
      // @ts-expect-error
      fetch: (url: RequestInfo, params: RequestInit | undefined) => {
        if (!params) {
          return;
        }
        const signal = params.signal;
        delete params.signal;
        const abortPromise = new Promise(resolve => {
          if (signal) {
            signal.onabort = resolve;
          }
        });
        return Promise.race([abortPromise, fetch(url, params)]);
      },
    });
    this._expiration = ms(expiration) || 6000000;
  }

  // Mailbox specific queries
  public async createMailbox (publicKey: Uint8Array): Promise<Mailbox> {
    return await create(this._client, this._domain, this._expiration, publicKey);
  }

  public async checkMailboxExists (alias: string): Promise<boolean> {
    return await exists(this._client, alias);
  }

  public async checkMailboxUsage (alias: string): Promise<number> {
    return await usage(this._client, alias);
  }

  public async renewMailbox (key: string): Promise<void> {
    await extend(this._client, this._expiration, key);
  }

  // Mail-specific queries
  public async processMail (mail: MailItem): Promise<void> {
    await push(this._client, mail);
  }

  public async listMail (key: string): Promise<Array<MailItem>> {
    return await list(this._client, key);
  }

  // Combined queries
  public async destroyAll (key: string): Promise<void> {
    // await empty(this._client, key);
    await drop(this._client, key);
  }
};

const queryExecutor: QueryExecutor = new QueryExecutor(
  typeof process !== 'undefined' ? process.env.DOMAIN : DOMAIN,
  typeof process !== 'undefined' ? process.env.EXPIRATION : EXPIRATION
);

export default queryExecutor;
