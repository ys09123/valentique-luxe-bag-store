import { createClient } from "redis";

// Lazy singleton redis client 

let client = null;
let connectPromise = null;

/**
 * Get a connected Redis client, connecting on first use.
 * Safe to call concurrently — all callers await the same connection promise.
 */

export async function getRedisClient() {
  if(client && client.isOpen) return client;

  if(connectPromise) return connectPromise;

  connectPromise = (async () => {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
    const usesTLS = redisUrl.startsWith("rediss://");

    client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 10000,
        ...(usesTLS && { tls: true, rejectUnauthorized: false }),
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error("Redis: max reconnect attempts reached, giving up.");
            return new Error("Redis max retries reached");
          }
          return Math.min(retries * 500, 3000);
        },
      },
    });

    client.on("error", (err) => {
      console.error("Redis client error: ", err.message);
    });

    try {
      await client.connect();
      console.log(`Redis connected at ${redisUrl}`);
      return client;
    } catch(err) {
      console.error("Redis connection failed: ", err.message);
      console.error("  Make sure Redis is running: docker run -p 6379:6379 redis:latest");
      connectPromise = null;
      throw err;
    }
  }) ();

  return connectPromise;
}

export default getRedisClient;