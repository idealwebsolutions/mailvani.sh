import { 
  Client, 
  query as q 
} from 'faunadb';
import { BoxKeyPair } from 'tweetnacl';
import dayjs from 'dayjs';

import {
  Response, 
  Mailbox 
} from '../types';

import {
  generateKeypair,
  computeSecret,
  createSafeIdentifier,
  computeAlias,
} from '../../utils/crypto';

const {
  Create,
  Update,
  Delete,
  Select,
  Exists,
  Get,
  Match,
  Collection,
  Index,
  ToTime
} = q;

// Creates a new mailbox with a given expiration date
// 1 TWO
export async function create (client: Client, domain: string, expiration: number, publicKey: Uint8Array) {
  if (!(publicKey instanceof Uint8Array) || publicKey.length !== 32) {
    throw new Error('Invalid key size');
  }
  const currentTimestamp: dayjs.Dayjs = dayjs().add(expiration, 'ms');
  const id: string = await createSafeIdentifier(10);
  const alias: string = `${id}@${domain}`;
  const keypair: BoxKeyPair = generateKeypair();
  const secret: Array<number> = Array.from(
    computeSecret(publicKey, keypair.secretKey) as Uint8Array
  );
  return async (salt: string): Promise<Mailbox> => {
    const computedAlias: string = await computeAlias(alias, salt);
    // Craft query to create new document in collection with ttl
    const response: Response<object> = await client.query(
      Create(
        Collection('mailboxes'),
        { 
          data: {
            alias: computedAlias,
            usage: 0,
            secret
          },
          ttl: ToTime(currentTimestamp.toDate().toISOString()) 
        }
      )
    );
    console.log(response);
    return Object.freeze({
      alias,
      publicKey: Array.from(keypair.publicKey as Uint8Array)
    }) as Mailbox;
  };
}
// Check to see if mailbox exists in store
// 1 TCO + 1 TRO
export function exists (client: Client, alias: string) {
  return async (salt: string): Promise<boolean> => {
    const computedAlias: string = await computeAlias(alias, salt);
    const response: Response<boolean> = await client.query(
      Exists(
        Match(Index('known_aliases'), computedAlias)
      )
    );
    console.log(response);
    return response;
  };
}
// Check mailbox data usage
export function usage (client: Client, alias: string) {
  return async (salt: string): Promise<number> => {
    const computedAlias: string = await computeAlias(alias, salt);
    const response: Response<number> = await client.query(
      Select('usage',
        Select('data',
          Get(
            Match(Index('known_aliases'), computedAlias)
          )
        )
      )
    );
    console.log(response);
    return response;
  };
}
// Extends mailbox ttl by expiration
// 1 TCO + 1 TWO
export function extend (client: Client, expiration: number, alias: string) {
  const currentTimestamp: dayjs.Dayjs = dayjs().add(expiration, 'ms');
  return async (salt: string): Promise<void> => {
    const computedAlias: string = await computeAlias(alias, salt);
    const response: Response<object> = await client.query(
      Update(
        Select('ref',
          Get(
            Match(Index('known_aliases'), computedAlias)
          )
        ),
        {
          ttl: ToTime(currentTimestamp.toDate().toISOString())
        }
      )
    );
    console.log(response);
  };
}
// Destroys an existing mailbox
// 1 TCO + ?
export function drop (client: Client, alias: string) {
  return async (salt: string): Promise<void> => {
    const computedAlias: string = await computeAlias(alias, salt);
    const response: Response<object> = await client.query(
      Delete(
        Select('ref', 
          Get(
            Match(Index('known_aliases'), computedAlias)
          )
        )
      )
    );
    console.log(response);
  };
}
