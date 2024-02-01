import { NextApiRequest, NextApiResponse } from 'next';
import {
  ServerConfiguration, 
  createQueryExecutor
} from '../../data/query';
import { 
  MailItem, 
  ParsedMail
} from '../../data/types';

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
  // Reveal remote address of webhook source 
  const remoteAddress: string | string[] = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
  if (!remoteAddress) {
    return res.status(500).send('Internal server error');
  }
  console.log(req.headers);
  console.log(remoteAddress);
  /*if (VALID_WEBHOOK_SOURCES.indexOf(remoteAddress) === -1) {
    console.log('invalid hostname');
    return new Response('Not authorized', {
      status: 401
    });
  }*/
  // Parse incoming mail
  const mail: ParsedMail = req.body;
  const to: string = mail.to.text;
  // Check mailbox exists
  const mailboxExists = await queryExecutor.checkMailboxExists(to);
  if (!mailboxExists) {
    return res.status(404).send('Mailbox does not exist');
  }
  // Check if mailbox has exceeded usage limit
  const currentUsage = await queryExecutor.checkMailboxUsage(to);
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
