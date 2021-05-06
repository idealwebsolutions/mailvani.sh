// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';

import { reverse } from 'dns';
import { promisify } from 'util';

const reverseIp = promisify(reverse);

// Webhook should only be called from forwarding server
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }
  const connectingIp: string | string[] | undefined = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
  let hostnames: string[] = [];
  try {
    hostnames = await reverseIp(connectingIp as string);
  } catch (err) {
    console.error(err);
  }
  if (!hostnames || !hostnames.some((hostname) => /forwardemail\.net$/g.test(hostname))) {
    res.statusCode = 405;
    res.end();
    return;
  }
  console.log(req.body);
  res.statusCode = 200;
  res.end()
}
