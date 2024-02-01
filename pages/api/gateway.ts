import { NextApiRequest, NextApiResponse } from 'next';

import {
  ServerConfiguration, 
  createQueryExecutor
} from '../../data/query';

import { 
  MailItem, 
  ParsedMail
} from '../../data/types';

import {
  sourceMatchesHostname
} from '../../utils/security';

const ALLOWED_SOURCE_HOSTS: string | string[] = process.env.ALLOWED_SOURCE_HOSTS;

const queryExecutor = createQueryExecutor(process.env.QUERY_CLIENT_ACCESS_SECRET, process.env.GLOBAL_SALT, {
  domains: process.env.DOMAINS,
  expiration: process.env.EXPIRATION,
  storageLimit: process.env.STORAGE_LIMIT_QUOTA
} as ServerConfiguration);

// Mail delivery gateway - /api/gateway
const gatewayHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send(`Method ${req.method} not allowed`);
  }
  return await handleIncomingMail(req, res);
};

async function handleIncomingMail (req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Reveal remote address invoking this route
  const remoteAddress: string | string[] = req.headers['x-real-ip'] || req.headers['x-vercel-forwarded-for'];
  if (!remoteAddress) {
    return res.status(500).send('Internal server error');
  }
  const matches: boolean = await sourceMatchesHostname(remoteAddress, ALLOWED_SOURCE_HOSTS.split(','));
  if (!matches) {
    return res.status(401).send('Not authorized');
  }
  // Parse incoming mail
  const mail: ParsedMail = req.body;
  const to: string = mail.to.text;
  // Check mailbox exists
  const mailboxExists: boolean = await queryExecutor.checkMailboxExists(to);
  if (!mailboxExists) {
    return res.status(404).send('Mailbox does not exist');
  }
  // Check if mailbox has exceeded usage limit
  const currentUsage: number = await queryExecutor.checkMailboxUsage(to);
  if (currentUsage >= queryExecutor.currentStorageLimit) {
    return res.status(403).send('Mailbox has exceeded storage limit quota');
  }
  // Process mail
  try {
    await queryExecutor.processMail(Object.freeze({
      to,
      from: mail.from.value,
      date: new Date(mail.date),
      subject: mail.subject,
      body: {
        plain: mail.text,
        html: mail.html,
      },
      attachments: mail.attachments,
      raw: mail.raw
    }) as MailItem);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Internal server error');
  }
  return res.status(200).send('OK');
}

export default gatewayHandler;
