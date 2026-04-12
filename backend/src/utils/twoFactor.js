import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;

const encodeBase32 = (buffer) => {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
};

const decodeBase32 = (input = '') => {
  const normalized = input
    .toString()
    .toUpperCase()
    .replace(/[^A-Z2-7]/g, '');

  let bits = 0;
  let value = 0;
  const bytes = [];

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);

    if (index === -1) {
      continue;
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
};

export const generateTwoFactorSecret = (size = 20) =>
  encodeBase32(crypto.randomBytes(size));

export const formatManualKey = (secret = '') =>
  secret.match(/.{1,4}/g)?.join(' ') || secret;

export const buildOtpAuthUri = ({
  secret,
  accountName,
  issuer = 'CoopEocala',
}) => {
  const label = `${issuer}:${accountName}`;

  return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD_SECONDS}`;
};

export const generateTotpToken = (secret, timestamp = Date.now()) => {
  const key = decodeBase32(secret);
  const counter = Math.floor(timestamp / 1000 / TOTP_PERIOD_SECONDS);
  const counterBuffer = Buffer.alloc(8);

  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = crypto
    .createHmac('sha1', key)
    .update(counterBuffer)
    .digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 10 ** TOTP_DIGITS;

  return code.toString().padStart(TOTP_DIGITS, '0');
};

export const verifyTotpToken = ({
  secret,
  token,
  window = 1,
  timestamp = Date.now(),
}) => {
  const normalizedToken = token?.toString().replace(/\D/g, '') || '';

  if (normalizedToken.length !== TOTP_DIGITS) {
    return false;
  }

  for (let step = -window; step <= window; step += 1) {
    const candidate = generateTotpToken(
      secret,
      timestamp + step * TOTP_PERIOD_SECONDS * 1000
    );

    if (candidate === normalizedToken) {
      return true;
    }
  }

  return false;
};

export const normalizeRecoveryCode = (value = '') =>
  value
    .toString()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

export const hashRecoveryCode = (value = '') =>
  crypto
    .createHash('sha256')
    .update(normalizeRecoveryCode(value))
    .digest('hex');

const createRecoveryCodeChunk = (size) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let output = '';

  while (output.length < size) {
    const index = crypto.randomInt(0, alphabet.length);
    output += alphabet[index];
  }

  return output;
};

export const generateRecoveryCodes = (count = 8) =>
  Array.from({ length: count }, () =>
    `${createRecoveryCodeChunk(4)}-${createRecoveryCodeChunk(4)}-${createRecoveryCodeChunk(4)}`
  );
