import { NextApiRequest, NextApiResponse } from 'next';
import { use, NextMiddleware } from 'next-api-middleware';
import Cors from 'cors';
import dayjs, { Dayjs } from 'dayjs';
import {
  parse,
  create as createToken,
  expire
} from '../../middleware/token';
import rateLimit from '../../middleware/limit';
import checkSupported from '../../middleware/supported';
import queryExecutor from '../../data/query';

import {
  MailItem,
  Mailbox
} from '../../data/types';

const JWT_SECRET: string = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

const EXPIRATION: number = queryExecutor.definedExpiration;
const STORAGE_LIMIT: number = queryExecutor.currentStorageLimit;
const ALLOWED_METHODS: Array<string> = ['GET', 'POST', 'DELETE', 'OPTIONS'];

const cors = Cors({
  origin: process.env.NODE_ENV === 'production' ? /mailvani\.sh$/ : false,
  methods: ALLOWED_METHODS
});

// Middleware on all requests
const withGlobalMiddleware = use(
  // Invoke rate limit
  rateLimit({
    maxConcurrent: 10, // max 10 users per second
    interval: 1000 // 200, // 5 requests per second
  }),
  // Invoke check for supported HTTP methods
  checkSupported({
    supportedMethods: ALLOWED_METHODS
  }),
  // Invoke token parsing
  parse({
    jwtSecret: JWT_SECRET,
    expiration: EXPIRATION,
  }),
  // Invoke cors
  cors
);

// Mailbox alias resource - /api/mailbox
const apiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return use(exists)(read)(req, res);
    case 'POST':
      return use(
        // TODO: check session for existing mailbox
        create,
        createToken({
          jwtSecret: JWT_SECRET,
          expiration: EXPIRATION,
        }),
      )(finishCreate)(req, res);
    case 'DELETE':
      return use(
        exists, 
        canExpire,
        expire()
      )(destroy)(req, res);
  }
};

export default withGlobalMiddleware(apiHandler);

// Check mailbox exists middleware
async function exists (req, res, next) {
  const { token } = req.locals;
  let exists: boolean;
  // Check mailbox exists
  try {
    exists = await queryExecutor.checkMailboxExists(token.data.alias);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to check mailbox exists: Internal server error'
    });
    return
  }
  if (!exists) {
    res.status(404).json({
      error: 'Mailbox not found'
    });
    return;
  }
  next();
}

// Create mailbox middleware
async function create (req, res, next) {
  // TODO: Add captcha middleware?
  const { publicKey } = req.body;
  // Return bad request if invalid type is provided
  if (!publicKey || !publicKey.length || !Array.isArray(publicKey) || publicKey.length !== 32 || publicKey.some(ele => !Number.isInteger(ele))) {
    res.status(400).json({
      error: 'Invalid key provided'
    });
    return;
  }
  let mailbox: Mailbox;
  // Create and encrypt mailbox based on client's public key
  try {
    mailbox = await queryExecutor.createMailbox(
      // Convert input to Uint8Array
      Uint8Array.from(publicKey as Array<number>)
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to create maibox: Internal server error'
    });
    return;
  }
  // Prepare saving to token
  req.locals = {
    data: mailbox
  };
  await next();
}

// Renew mailbox
/*async function extend (req, res) {
  const { token } = req.locals;
  // Renew mailbox
  try {
    await queryExecutor.renewMailbox(token.data.alias);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to renew mailbox: Internal server error'
    });
    return;
  }
  res.status(200).end();
}*/

// Destroy mailbox
async function destroy (req, res) {
  const { token } = req.locals;
  try { // decodedToken.data.alias
    await queryExecutor.destroyAll(token.data.alias);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Internal server error'
    });
    return;
  }
  res.status(204).end();
}

// Check to allow a mailbox to expire
async function canExpire (req, res, next) {
  const { token } = req.locals;
  const allowedReset: Dayjs = dayjs.unix(token.exp);
  const now: Dayjs = dayjs();
  
  // Allow ability to reset after 20% of time has passed
  if (allowedReset.diff(now, 'minute') > (((EXPIRATION / 60000) * .8))) {
    res.status(403).json({
      message: 'Unable to expire at this time',
      allowedReset,
      now
    });
    return;
  }

  next();
}

// Read mailbox
async function read (req, res) {
  const { token } = req.locals;
  let mail: Array<MailItem>;
  try {
    mail = await queryExecutor.listMail(token.data.alias);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Internal server error'
    });
    return;
  }
  let current: number;
  try {
    current = await queryExecutor.checkMailboxUsage(token.data.alias);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Internal server error'
    })
    return;
  }
  const usage: object = {
    current,
    max: STORAGE_LIMIT
  };
  // Display public key if mail is found
  let key: Array<number> | undefined = undefined;
  if (mail.length) {
    key = token.data?.publicKey;
  }
  res.status(200).json({
    mail,
    key,
    usage,
    expires: token.exp
  });
}

// Display alias from created mailbox
function finishCreate (req, res) {
  res.status(201).json({
    alias: req.locals.data.alias
  });
}
