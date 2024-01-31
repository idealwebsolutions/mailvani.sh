import SharedEnvironment from './env';
import { 
  ServerConfiguration, 
  createQueryExecutor 
} from '../../data/query';
import { 
  MailItem, 
  ParsedMail
} from '../../data/types';

export async function handleRequest(request: Request, env: SharedEnvironment): Promise<Response> {
  // const VALID_WEBHOOK_SOURCES: string[] = env.ALLOWED_HOSTNAMES || [];
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
  console.log(remoteAddress);
  /*if (VALID_WEBHOOK_SOURCES.indexOf(remoteAddress) === -1) {
    console.log('invalid hostname');
    return new Response('Not authorized', {
      status: 401
    });
  }*/
  // Parse incoming mail
  const mail: ParsedMail = await request.json();
  const to: string = mail.to.text;
  // Build executor object
  const queryExecutor = createQueryExecutor(env.QUERY_CLIENT_ACCESS_SECRET, env.GLOBAL_SALT, { 
    domains: env.DOMAINS,
    expiration: env.EXPIRATION,
    storageLimit: env.STORAGE_LIMIT_QUOTA
  } as ServerConfiguration);
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
  if (currentUsage >= queryExecutor.currentStorageLimit) {
    console.log('mailbox has exceeded storage limit quota');
    return new Response('Mailbox has exceeded storage limit quota', {
      status: 403
    });
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
    return new Response('Internal server error', {
      status: 500
    });
  }
  return new Response('Success', {
    status: 200
  });
}
