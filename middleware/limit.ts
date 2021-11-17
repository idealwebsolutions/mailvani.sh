import { NextMiddleware } from 'next-api-middleware';
import Bottleneck from 'bottleneck';
import ms from 'ms';

interface RateLimitOptions {
  readonly maxConcurrent: number,
  readonly interval: number
};

// https://github.com/vercel/next.js/pull/19509/commits/2bd58c9c7f499b2059191ae83581d2041ae65d45

export default function rateLimit(options: RateLimitOptions) {
  // Limit to a max of 10 jobs per second (default)
  const limiter = new Bottleneck({
    maxConcurrent: options.maxConcurrent || 100, // default: 100 concurrent jobs
    // minTime: 333, // options.interval,
    highWater: 0,
    strategy: Bottleneck.strategy.BLOCK,
    reservoir: 5,
    reservoirRefreshAmount: 5,
    reservoirRefreshInterval: ms('10s')
  });
  return async (req, res, next) => { 
    try {
      await limiter.schedule(next)
    } catch (err) {
      console.error(err);
      // TODO: add session to list requiring captcha
      res.status(429).json({
        error: 'Too many requests. Rate limit exceeded'
      });
    }
  }
}
