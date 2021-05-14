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
  drop
} from './queries/mailbox';

import {
  list,
  push,
  empty
} from './queries/mail';

class QueryExecutor {
  private _client: Client;
  private _expiration: number;
  private _domain: string;

  constructor (domain: string = 'mailvani.sh', expiration: string = '10m') {
    this._domain = domain;
    this._client = new Client({ secret: process.env.FAUNADB_SECRET || '' });
    this._expiration = ms(expiration) || 6000000;
  }

  // Mailbox specific queries
  public async createMailbox (publicKey: Uint8Array): Promise<Mailbox> {
    return await create(this._client, this._domain, this._expiration, publicKey);
  }

  public async checkMailboxExists (alias: string): Promise<boolean> {
    return await exists(this._client, alias);
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
    await empty(this._client, key);
    await drop(this._client, key);
  }
};

const queryExecutor: QueryExecutor = new QueryExecutor(
  process.env.DOMAIN,
  process.env.EXPIRATION
);

export default queryExecutor;
