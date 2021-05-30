import {
  Client, 
  query as q 
} from 'faunadb';
import dayjs from 'dayjs';
import ms from 'ms';
import { JSDOM, DOMWindow } from 'jsdom';
import createDOMPurify from 'dompurify';

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

const window: DOMWindow = new JSDOM('').window;
// @ts-expect-error
const DOMPurify = createDOMPurify(window);

// Lists all mail in the mailbox
// 2 TCO + 2 TRO
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
// (1 TCO + 1 TRO) + (1 TWO per 1kb)
export async function push (client: Client, mail: MailItem): Promise<void> {
  // Sanitize html body
  const html: string = DOMPurify.sanitize(mail.body.html as string);
  console.log(html);
  // Overwrite existing html body
  const body = Object.assign({}, mail.body, {
    html,
  });
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
              body,
              attachments: mail.attachments,
            }
          )
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
