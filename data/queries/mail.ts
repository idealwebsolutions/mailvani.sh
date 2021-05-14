import {
  Client, 
  query as q 
} from 'faunadb';
import dayjs from 'dayjs';
import ms from 'ms';

import {
  encryptMessage,
  computeShasum
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
  Exists,
  Match,
  Var,
  ToTime
} = q;

const SALT: string = process.env.GLOBAL_SALT || ''; // Require GLOBAL_SALT

if (!SALT) {
  throw new Error('GLOBAL_SALT is required');
}

// Lists all mail in the mailbox
export async function list (client: Client, alias: string, size: number = 50): Promise<Array<MailItem>> {
  const computedAlias = computeShasum(alias, SALT);
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
export async function pushIfExists (client: Client, mail: MailItem): Promise<void> {
  const computedAlias: string = computeShasum(mail.to, SALT);
  const currentTimestamp: dayjs.Dayjs = dayjs().add(ms('30m'), 'ms'); // default to 30m mail item expiration
  const secret = await client.query(
    Select('secret', 
      Select('data', 
        Get(
          Match(Index('known_aliases'), computedAlias)
        )
      )
    )
  );
  const response: Response<object> = await client.query(
    If(
      Exists(
        Match(Index('known_aliases'), computedAlias)
      ),
      Create(
        Collection('mail'),
        {
          data: {
            header: {
              to: Select('ref', Get(Match(Index('known_aliases'), computedAlias))),
            },
            body: encryptMessage(
              Uint8Array.from(secret as Array<number>), 
              {
                from: mail.from,
                to: mail.to,
                date: mail.date.toISOString(),
                subject: mail.subject,
                body: mail.body,
                attachments: mail.attachments,
              }
            )
          },
          ttl: ToTime(currentTimestamp.toDate().toISOString())
        }
      ),
      null,
    )
  );
  console.log(response);
};
// Deletes all mail associated with alias
export async function empty (client: Client, alias: string): Promise<void> {
  const response: Response<object> = await client.query(
    Foreach(
      Paginate(
        Match(Index('get_associated'), Select('ref', Get(Match(Index('known_aliases', alias)))))
      ),
      Lambda('ref', Delete(Var('ref')))
    )
  );
  console.log(response);
};
