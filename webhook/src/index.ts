import { ExecutionContext } from 'cloudflare-workers-types-esm';

import SharedEnvironment from './env';
import { handleRequest } from './handler';

export default {
  async fetch (request: Request, env: SharedEnvironment, ctx: ExecutionContext) {
    return await handleRequest(request, env);
  }
}
