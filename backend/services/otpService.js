import crypto from "crypto";
import { getRedisClient } from "../config/redis.js";

// Config (env-driven, same defaults)
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY, 10) || 300;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5;
const OTP_RESEND_COOLDOWN = parseInt(process.env.OTP_RESEND_COOLDOWN, 10) || 60;

// Redis key helpers
const otpKey = (id) => `otp:${id}`;
const attemptsKey = (id) => `otp:attempts:${id}`;
const cooldownKey = (id) => `otp:cooldown:${id}`;

/**
 * Normalize an email/phone identifier so Redis keys are consistent
 * regardless of casing/whitespace the client sends.
 */
export function normalizeIdentifier(identifier) {
  return identifier.trim().toLowerCase();
}

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Cryptographically secure 6-digit OTP. Never use Math.random() here.
 */
function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Constant-time comparison of two equal-length hex hashes to avoid leaking timing information about how much of the OTP matched.
 */
function safeCompareHash(a, b) {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length != bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Whether this identifier is currently in the resend cooldown window.
 */
export async function isOnCooldown(identifier) {
  const redis = await getRedisClient();
  const id = normalizeIdentifier(identifier);
  const exists = await redis.exists(cooldownKey(id));
  return exists === 1;
}

/*
  Seconds remaining on the resend cooldown (or -1/-2 per Redis TTL semantics if the key doesn't exist / has no TTL).
 */
export async function getCooldownTTL(identifier) {
  const redis = await getRedisClient();
  const id = normalizeIdentifier(identifier);
  return redis.ttl(cooldownKey(id));
}

/**
 * Generate a new OTP, hash it, store the hash in Redis with a TTL,
 * start the resend cooldown, and reset any previous attempt counter.
 *
 * Returns the PLAINTEXT otp — callers must only use this to send the
 * email/SMS, never log it (outside dev mode) or return it via the API.
 */

export async function createAndStoreOTP(identifier) {
  const redis = await getRedisClient();
  const id = normalizeIdentifier(identifier);

  const otp = generateOTP();
  const hashed = hashOTP(otp);

  await redis.set(otpKey(id), hashed, { EX: OTP_EXPIRY });
  await redis.set(cooldownKey(id), "1", { EX: OTP_RESEND_COOLDOWN });
  await redis.del(attemptsKey(id));

  return otp;
}

/**
 * Verify a submitted OTP against the stored hash.
 *
 * Returns one of:
 *   { success: true }
 *   { success: false, reason: 'EXPIRED' }
 *   { success: false, reason: 'MAX_ATTEMPTS' }
 *   { success: false, reason: 'INVALID', attemptsLeft }
 */

export async function verifyOTP(identifier, submittedOtp) {
  const redis = await getRedisClient();
  const id = normalizeIdentifier(identifier);

  const storedHash = await redis.get(otpKey(id));
  if (!storedHash) {
    return {
      success: false,
      reason: "EXPIRED",
    };
  }

  // Atomically increment the attempt counter; tie its TTL to the OTP's remaining life so it never outlives the OTP it's protecting.
  const attempts = await redis.incr(attemptsKey(id));
  if (attempts === 1) {
    await redis.expire(attemptsKey(id), OTP_EXPIRY);
  }
  if (attempts > OTP_MAX_ATTEMPTS) {
    return {
      success: false,
      reason: "MAX_ATTEMPTS",
    };
  }
  const submittedHash = hashOTP(submittedOtp);
  if (!safeCompareHash(submittedHash, storedHash)) {
    return {
      success: false,
      reason: "INVALID",
      attemptsLeft: Math.max(OTP_MAX_ATTEMPTS - attempts, 0),
    };
  }
  // Success - delete immediately so the opt can never be replayed.
  await redis.del(otpKey(id));
  await redis.del(attemptsKey(id));
  return {
    success: true,
  };
}
