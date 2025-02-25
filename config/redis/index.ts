import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

try {
  console.log('[REDIS] Attempting to connect to Redis...');

  redis.ping().then(() => {
    console.log('[REDIS] PING successful');
  }).catch((err) => {
    console.error('[REDIS] PING failed:', err);
  });

} catch (error) {
  console.error('[REDIS] Failed to initialize Redis:', error);
  throw error;
}



