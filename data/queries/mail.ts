import {
  Client, 
  query as q 
} from 'faunadb';
import dayjs from 'dayjs';

import {
  encryptMessage,
  computeAlias
} from '../../utils/crypto';

import {
  Response,
  QueryResult,
  MailItem
} from '../types';

const {
  Create,
  Delete,
  Map,
  Foreach,
  Collection,
  Paginate,
  Select,
  Index,
  Lambda,
  If,
  Get,
  Update,
  Exists,
  Match,
  Var,
  ToTime
} = q;

declare var GLOBAL_SALT: string;

const SALT: string = (typeof process !== 'undefined' ? process.env.GLOBAL_SALT : GLOBAL_SALT) || ''; // Require GLOBAL_SALT

if (!SALT) {
  throw new Error('GLOBAL_SALT must be defined');
}

// Lists all mail in the mailbox
// 2 TCO + 2 TRO
export async function list (client: Client, alias: string, size: number = 50): Promise<Array<MailItem>> {
  const computedAlias: string = await computeAlias(alias, SALT);
  const response: Response<object> = await client.query(
    Map(
      Paginate(
        Match(Index('get_associated'), Select('ref', Get(Match(Index('known_aliases'), computedAlias)))),
        { 
          size
        }
      ),
      Lambda('ref', Get(Var('ref')))
    )
  );
  console.log(response);
  return response.data.map((mail: QueryResult) => mail.data.body);
}
// Pushes mail to mailbox
// (1 TCO + 1 TRO) + (1 TWO per 1kb)
export async function push (client: Client, expiration: number, mail: MailItem): Promise<void> {
  const computedAlias: string = await computeAlias(mail.to, SALT);
  const currentTimestamp: dayjs.Dayjs = dayjs().add(expiration, 'ms');
  const secret: Response<string> = await client.query(
    Select('secret', 
      Select('data', 
        Get(
          Match(Index('known_aliases'), computedAlias)
        )
      )
    )
  );
  const currentUsage: Response<number> = await client.query(
    Select('usage',
      Select('data', 
        Get(
          Match(Index('known_aliases'), computedAlias)
        )
      )
    )
  );
  console.log('usage: ' + currentUsage);
  const encryptedMessage = encryptMessage(
    Uint8Array.from(secret as Array<number>), 
    {
      from: mail.from,
      to: mail.to,
      date: mail.date.toISOString(),
      subject: mail.subject,
      body: mail.body,
      attachments: mail.attachments,
      raw: mail.raw
    },
  );
  const updateUsageResponse: Response<object> = await client.query(
    Update(
      Select('ref',
        Get(
          Match(Index('known_aliases'), computedAlias)
        )
      ),
      {
        data: {
          usage: (currentUsage as number) + encryptedMessage.length
        }
      }
    )
  );
  console.log(updateUsageResponse);
  const response: Response<object> = await client.query(
    Create(
      Collection('mail'),
      {
        data: {
          header: {
            to: Select('ref', Get(Match(Index('known_aliases'), computedAlias))),
          },
          body: encryptedMessage
        },
        ttl: ToTime(currentTimestamp.toDate().toISOString())
      }
    )
  );
  console.log(response);
};
// Deletes all mail associated with alias
// 2 TCO + 2 TRO
export async function empty (client: Client, alias: string): Promise<void> {
  const computedAlias: string = await computeAlias(alias, SALT);
  const response: Response<object> = await client.query(
    Foreach(
      Paginate(
        Match(Index('get_associated'), Select('ref', Get(Match(Index('known_aliases', computedAlias)))))
      ),
      Lambda('ref', Delete(Var('ref')))
    )
  );
  console.log(response);
};
