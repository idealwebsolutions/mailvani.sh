import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import Cookies from 'cookies';

import {
  Mailbox
} from '../data/types';

interface DecodedJwt {
  readonly data: Mailbox,
  readonly iss: number,
  readonly exp: number,
}

interface TokenOptions {
  readonly jwtSecret: string,
  readonly expiration: number,
};

export function create (options: TokenOptions) {
  return (req, res, next) => {
    const cookies = new Cookies(req, res);
    // Create token to authenticate requests
    const token = jwt.sign({
      data: req.locals.data || req.locals.token // mailbox
    }, options.jwtSecret, { 
      expiresIn: ms(options.expiration) // EXPIRATION 
    });
    // httpOnly is on by default, secure is on with https enabled
    cookies.set('mv_token', token, {
      maxAge: options.expiration,
      sameSite: true,
      overwrite: true
    });
    next();
  }
};

export function expire () {
  return (req, res, next) => {
    const cookies = new Cookies(req, res);
    // Get bearer token
    const bearerToken = cookies.get('mv_token');
    // Check token is valid
    if (!bearerToken || !bearerToken.length) {
      res.status(404).end('Mailbox does not exist'); // TODO: is 404 the best response for an expired cookie?
      return;
    }
    console.log(bearerToken)
    // Expire cookie with token
    cookies.set('mv_token', null, {
      expires: new Date(1),
    });
    next();
  }
};

export function parse (options: TokenOptions) { 
  return (req, res, next) => {
    // Skip on POST method
    if (req.method === 'POST') {
      next();
      return;
    }
    const cookies = new Cookies(req, res);
    // Get bearer token
    const bearerToken = cookies.get('mv_token');
    // Check token is valid
    if (!bearerToken || !bearerToken.length) {
      res.status(404).end('No such mailbox exists'); // TODO: is 404 the best response for an expired cookie?
      return;
    }
    // Decoded token
    let token: DecodedJwt;
    // Verify token
    try {
      token = (jwt.verify(bearerToken, options.jwtSecret) as unknown) as DecodedJwt;
    } catch (err) {
      console.error(err);
      res.status(401).end('Mailbox has expired'); // Invalid token
      return;
    }
    // Save token to locals
    req.locals = {
      token
    };
    // Invoke next fn
    next();
  }
}
