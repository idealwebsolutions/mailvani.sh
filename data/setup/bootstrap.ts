import { 
  Client,
  query as q
} from 'faunadb';

import {
  createCollectionWithIndex as createMailboxCollection,
  dropCollection as dropMailboxCollection
} from './mailbox';
import {
  createCollectionWithIndex as createMailCollection,
  dropCollection as dropMailCollection,
} from './mail';

export default async function resetAll(client: Client): Promise<void> {
  await Promise.all([
    resetMailboxes(client), 
    resetMail(client)
  ]);
}

async function resetMail (client: Client): Promise<void> {
  await dropMailCollection(client, 'mail');
  await createMailCollection(client, 'mail');
}

async function resetMailboxes (client: Client): Promise<void> {
  await dropMailboxCollection(client, 'mailboxes');
  await createMailboxCollection(client, 'mailboxes');
}