import { NextApiRequest, NextApiResponse } from 'next';

import queryExecutor from '../../../data/query';
import { 
  MailItem, 
  ParsedMail 
} from '../../../data/types';

import { reverse } from 'dns';
import { promisify } from 'util';

const reverseIp: Function = promisify(reverse);

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
    res.status(500).end('Internal server error');
    return;
  }
  let hostnames: string[] = [];
  try {
    hostnames = await reverseIp(remoteAddress as string);
  } catch (err) {
    console.error(err);
  }
  // Authorize the forwarding service to trigger this webhook
  if (!hostnames || !hostnames.some((hostname) => /forwardemail\.net$/g.test(hostname))) {
    res.status(403).end();
    return;
  }
  // Parse incoming mail
  const mail: ParsedMail = req.body;
  const to: string = mail.to.text;
  console.log(mail);
  // Process mail
  try {
    await queryExecutor.processMail(Object.freeze({
      to,
      from: mail.from.text,
      date: new Date(mail.date),
      subject: mail.subject,
      body: mail.text,
      attachments: mail.attachments
    }) as MailItem);
  } catch (err) {
    console.error(err);
    res.status(500).end();
    return;
  }
  res.status(200).end();
}
