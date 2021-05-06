// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';

/*import { reverse } from 'dns';
import { promisify } from 'util';

const reverseIp = promisify(reverse);*/

export default function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return
  }
  console.log(req.headers)
  console.log(req.body)
  res.statusCode = 200;
  res.end()
}
