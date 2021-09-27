// import { Readable } from 'stream';
// import { streamToBuffer } from '@jorgeferrero/stream-to-buffer';

import queryExecutor from '../../data/query';
import { 
  MailItem, 
  ParsedMail 
} from '../../data/types';

declare var STORAGE_LIMIT_QUOTA: string;
declare var VALID_SOURCE_ADDRESSES: string;

const VALID_WEBHOOK_SOURCES: string[] = VALID_SOURCE_ADDRESSES.split(',') || [];
const LIMIT_QUOTA: number = parseInt(STORAGE_LIMIT_QUOTA || '10000000', 10); // defaults to 10mb

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(`Method ${request.method} not allowed`, {
      status: 405,
      headers: {
        'Allow': 'POST'
      }
    });
  }
  // Reveal remote address of webhook source 
  const remoteAddress: string | null = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  if (!remoteAddress) {
    console.log('unable to find real remote address');
    return new Response('Internal server error', {
      status: 500
    });
  }
  if (VALID_WEBHOOK_SOURCES.indexOf(remoteAddress) === -1) {
    console.log('invalid hostname');
    return new Response('Not authorized', {
      status: 401
    });
  }
  // Parse incoming mail
  const mail: ParsedMail = await request.json();
  // console.log(mail);
  const to: string = mail.to.text;
  // Check mailbox exists
  const mailboxExists = await queryExecutor.checkMailboxExists(to);
  if (!mailboxExists) {
    console.log('mailbox does not exist');
    return new Response('Mailbox does not exist', {
      status: 404
    });
  }
  // Check if mailbox has exceeded usage limit
  const currentUsage = await queryExecutor.checkMailboxUsage(to);
  if (currentUsage >= LIMIT_QUOTA) {
    console.log('mailbox has exceeded storage limit quota');
    return new Response('Mailbox has exceeded storage limit quota', {
      status: 403
    });
  }
  const attachments = await preprocessAttachments(mail.attachments);
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
      attachments
    }) as MailItem);
  } catch (err) {
    console.error(err);
    return new Response('Internal server error', {
      status: 500
    });
  }
  return new Response('Success', {
    status: 200
  });
}

// Pre-process attachment (streams)
async function preprocessAttachments (attachments: object[]) {
  const processed = [];
  // console.log(attachments[0].content.data)
  for (const attachment of attachments) {
    console.log(attachment);
    // const stream = Readable.from(Buffer.from(attachment.content.data));
    // console.log(stream)
    // const data = await streamToBuffer(stream);
    processed.push(attachment);
    // processed.push(Object.assign({}, attachment, {
    //  data
    //}));
  }
  return processed;
}
