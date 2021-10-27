import { Client } from 'faunadb';
import ms from 'ms';
import isValidDomain from 'is-valid-domain';
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
import { pickFromArray } from '../utils/random';

declare var FAUNADB_SECRET: string;
declare var DOMAIN: string;
declare var EXPIRATION: string;
declare var STORAGE_LIMIT_QUOTA: string | number;

const SECRET: string = (typeof process !== 'undefined' ? process.env.FAUNADB_SECRET : FAUNADB_SECRET) || ''; // Require SECRET

if (!SECRET || !SECRET.length) {
  throw new Error('FAUNADB_SECRET is required and must be defined');
}

class QueryExecutor {
  private _client: Client;
  private _expiration: number;
  private _storageLimit: number;
  private _domains: string[];

  constructor (domains: string[], expiration: string = '30m', storageLimit: number = 10000000) {
    this._domains = domains;
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
    this._expiration = ms(expiration);
    this._storageLimit = storageLimit;
  }

  // Defined expiration for all mailboxes
  public get definedExpiration (): number {
    return this._expiration;
  }

  // Defined storage limit for all mailboxes
  public get currentStorageLimit (): number {
    return this._storageLimit;
  }

  // Mailbox specific queries
  public async createMailbox (publicKey: Uint8Array): Promise<Mailbox> {
    return await create(this._client, pickFromArray(this._domains), this._expiration, publicKey);
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
    await push(this._client, this._expiration, mail);
  }

  public async listMail (key: string): Promise<Array<MailItem>> {
    return await list(this._client, key);
  }

  // Combined queries
  public async destroyAll (key: string): Promise<void> {
    // await empty(this._client, key);
    await drop(this._client, key);
  }

  public static ValidateConfiguration (domains: string, expiration: string | undefined, limitQuota: string | number | undefined): QueryExecutor {
    const validated = domains.split(',').filter((domain) => domain.length && isValidDomain(domain));
    if (!validated.length) {
      throw new Error('No usable domains found');
    }
    if (typeof expiration === 'string') {
      try {
        ms(expiration);
      } catch (err) {
        throw new Error('Invalid expiration provided');
      }
    }
    if (typeof limitQuota === 'string') {
      try {
        limitQuota = parseInt(limitQuota, 10);
      } catch (err) {
        limitQuota = 0;
      }
      if (limitQuota <= 0) {
        throw new RangeError('Invalid limit quota provided');
      }
    }
    return new QueryExecutor(validated, expiration, limitQuota);
  }
};

const USABLE_DOMAINS: string = (typeof process !== 'undefined' ? process.env.DOMAIN : DOMAIN) || ''; // Require DOMAIN

if (!USABLE_DOMAINS || !USABLE_DOMAINS.length) {
  throw new Error('DOMAIN is required and must be defined');
}

const DEFINED_EXPIRATION: string | undefined = (typeof process !== 'undefined' ? process.env.EXPIRATION : undefined); // Require EXPIRATION

const DEFINED_STORAGE_LIMIT_QUOTA: string | number | undefined = (typeof process !== 'undefined' ? process.env.STORAGE_LIMIT_QUOTA : STORAGE_LIMIT_QUOTA) || undefined;

const queryExecutor: QueryExecutor = QueryExecutor.ValidateConfiguration(
  USABLE_DOMAINS,
  DEFINED_EXPIRATION,
  DEFINED_STORAGE_LIMIT_QUOTA
);

export default queryExecutor;
