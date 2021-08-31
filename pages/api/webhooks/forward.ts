import { NextApiRequest, NextApiResponse } from 'next';
import { reverse } from 'dns';
import { promisify } from 'util';

import queryExecutor from '../../../data/query';
import { 
  MailItem, 
  ParsedMail 
} from '../../../data/types';

const reverseIp: Function = promisify(reverse);

const STORAGE_LIMIT_QUOTA: number = parseInt(process.env.STORAGE_LIMIT_QUOTA, 10) || 10000000; // defaults to q10mb

// Webhook should only be called from forwarding server
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
    return;
  }
  // Reveal remote address of webhook source 
  const remoteAddress: string | string[] | undefined = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
  if (!remoteAddress) {
    console.log('unable to find real remote address');
    res.status(500).end('Internal server error');
    return;
  }
  // Parse the hostname from the remote address provided
  let hostnames: string[] = [];
  try {
    hostnames = await reverseIp(remoteAddress as string);
  } catch (err) {
    console.error(err);
  }
  // Only authorize the forwarding service to trigger this webhook
  if (!hostnames || !hostnames.some((hostname) => /forwardemail\.net$/g.test(hostname))) {
    console.log('invalid hostname');
    res.status(403).end();
    return;
  }
  // Parse incoming mail
  const mail: ParsedMail = req.body;
  console.log(mail);
  const to: string = mail.to.text;
  // Check mailbox exists
  const mailboxExists = await queryExecutor.checkMailboxExists(to);
  if (!mailboxExists) {
    console.log('mailbox does not exist');
    res.status(404).json({
      error: 'Mailbox does not exist'
    });
    return;
  }
  // Check if mailbox has exceeded usage limit
  const currentUsage = await queryExecutor.checkMailboxUsage(to);
  if (currentUsage >= STORAGE_LIMIT_QUOTA) {
    console.log('mailbox has exceeded storage limit quota');
    res.status(403).json({
      error: 'Mailbox has exceeded storage limit quota'
    });
    return;
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
      attachments: mail.attachments
    }) as MailItem);
  } catch (err) {
    console.error(err);
    res.status(500).end();
    return;
  }
  res.status(200).end();
}
