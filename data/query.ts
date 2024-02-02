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

export interface ServerConfiguration {
  domains: string | string[];
  expiration: string | number | undefined;
  storageLimit: string | number | undefined;
}

class QueryExecutor {
  private _salt: string;
  private _client: Client;
  private _expiration: number;
  private _storageLimit: number;
  private _domains: string[];

  constructor (queryClientSecret: string, salt: string, parsedConfig: ServerConfiguration) {
    this._client = new Client({ 
      secret: queryClientSecret,
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
    this._salt = salt;
    this._domains = parsedConfig.domains as string[];
    this._expiration = parsedConfig.expiration as number;
    this._storageLimit = parsedConfig.storageLimit as number;
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
    const setup = await create(this._client, pickFromArray(this._domains), this._expiration, publicKey);
    return await setup(this._salt);
  }

  public async checkMailboxExists (alias: string): Promise<boolean> {
    return await exists(this._client, alias)(this._salt);
  }

  public async checkMailboxUsage (alias: string): Promise<number> {
    return await usage(this._client, alias)(this._salt);
  }

  public async renewMailbox (key: string): Promise<void> {
    await extend(this._client, this._expiration, key)(this._salt);
  }

  // Mail-specific queries
  public async processMail (mail: MailItem): Promise<void> {
    await push(this._client, this._expiration, mail)(this._salt);
  }

  public async listMail (key: string): Promise<Array<MailItem>> {
    return await list(this._client, key)(this._salt);
  }

  // Combined queries
  public async destroyAll (key: string): Promise<void> {
    // await empty(this._client, key);
    await drop(this._client, key)(this._salt);
  }

  public static ParseConfiguration (serverConfiguration: ServerConfiguration): ServerConfiguration {
    serverConfiguration.domains = (serverConfiguration.domains as string || '').split(',').filter((domain: string) => domain.length && isValidDomain(domain));
    
    if (!serverConfiguration.domains.length) {
      throw new Error('No usable domains found');
    }
    
    if (typeof serverConfiguration.expiration === 'string') {
      try {
        serverConfiguration.expiration = ms(serverConfiguration.expiration as string);
      } catch (err) {
        serverConfiguration.expiration = ms('30m');
      }
    } else if (typeof serverConfiguration.expiration === 'number') {
      if (serverConfiguration.expiration <= 0) {
        serverConfiguration.expiration = ms('30m');
      }
    } else if (typeof serverConfiguration.expiration === 'undefined') {
      serverConfiguration.expiration = ms('30m');
    }
    
    if (typeof serverConfiguration.storageLimit === 'string') {
      try {
        serverConfiguration.storageLimit = parseInt(serverConfiguration.storageLimit as string, 10);
      } catch (err) {
        serverConfiguration.storageLimit = 10000000;
      }
      if (serverConfiguration.storageLimit <= 0) {
        serverConfiguration.storageLimit = 10000000;
      }
    } else if (typeof serverConfiguration.storageLimit === 'number') { 
      if (serverConfiguration.storageLimit <= 0) {
        serverConfiguration.storageLimit = 10000000;
      }
    } else if (typeof serverConfiguration.storageLimit === 'undefined') {
      serverConfiguration.storageLimit = 10000000;
    }
    
    return serverConfiguration;
  }
};

export function createQueryExecutor (queryClientSecret: string | undefined, salt: string | undefined, serverConfig: ServerConfiguration): QueryExecutor {
  if (!queryClientSecret) {
    throw new Error('Query Client Secret must be defined');
  }
  if (!salt) {
    throw new Error('Salt must be defined');
  }
  const parsedConfig: ServerConfiguration = QueryExecutor.ParseConfiguration(serverConfig);
  return new QueryExecutor(queryClientSecret, salt, parsedConfig);
};
