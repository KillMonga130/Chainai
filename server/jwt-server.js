/**
 * Minimal JWT server for IBM watsonx Orchestrate embedded chat
 * - Signs RS256 JWTs with your client private key
 * - Encrypts user_payload with IBM public key (RSA-OAEP-SHA256)
 * - Exposes GET /createJWT?user_id=... to return a token as text/plain
 *
 * Prerequisites (from the guide):
 * 1) Generate and configure keys in your Orchestrate instance
 * 2) Place the following PEM files under ./wxo_security_config:
 *    - client_private_key.pem (your signing key)
 *    - ibm_public_key.pem     (IBM encryption key returned by API)
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.JWT_SERVER_PORT ? Number(process.env.JWT_SERVER_PORT) : 3003;
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
]);

// Load keys from wxo_security_config directory (next to project root)
const KEYS_DIR = path.resolve(process.cwd(), 'wxo_security_config');
const CLIENT_PRIVATE_KEY_PATH = process.env.CLIENT_PRIVATE_KEY_PATH || path.join(KEYS_DIR, 'client_private_key.pem');
const IBM_PUBLIC_KEY_PATH = process.env.IBM_PUBLIC_KEY_PATH || path.join(KEYS_DIR, 'ibm_public_key.pem');

let CLIENT_PRIVATE_KEY = null;
let IBM_PUBLIC_KEY = null;

function tryLoadKeys() {
  try {
    CLIENT_PRIVATE_KEY = fs.readFileSync(CLIENT_PRIVATE_KEY_PATH, 'utf8');
  } catch (e) {
    CLIENT_PRIVATE_KEY = null;
  }
  try {
    IBM_PUBLIC_KEY = fs.readFileSync(IBM_PUBLIC_KEY_PATH, 'utf8');
  } catch (e) {
    IBM_PUBLIC_KEY = null;
  }
}

tryLoadKeys();

function base64url(input) {
  return input.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createJwt({ sub = 'anon-user', name = 'Anonymous', context = {} }) {
  if (!CLIENT_PRIVATE_KEY || !IBM_PUBLIC_KEY) {
    const missing = [];
    if (!CLIENT_PRIVATE_KEY) missing.push('client_private_key.pem');
    if (!IBM_PUBLIC_KEY) missing.push('ibm_public_key.pem');
    throw new Error(`Missing key files: ${missing.join(', ')} in ${KEYS_DIR}`);
  }

  // Header
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  // User payload (encrypted)
  const userPayloadObj = {
    custom_message: 'Encrypted message',
    name,
    ts: new Date().toISOString(),
  };

  // Encrypt with IBM public key using RSA-OAEP-SHA256
  const encrypted = crypto.publicEncrypt(
    {
      key: IBM_PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(JSON.stringify(userPayloadObj), 'utf8')
  );

  // Payload
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    sub,
    user_payload: encrypted.toString('base64'),
    context, // include any context variables (optional)
    iat: nowSec,
    exp: nowSec + 60 * 60, // 1 hour
  };

  const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(CLIENT_PRIVATE_KEY);
  const encodedSignature = base64url(signature);

  return `${signingInput}.${encodedSignature}`;
}

function send(res, status, body, origin) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // default to localhost:3000 to be helpful in dev
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(body);
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const parsed = url.parse(req.url, true);

  if (req.method === 'OPTIONS') {
    return send(res, 200, '', origin);
  }

  if (parsed.pathname === '/createJWT' && req.method === 'GET') {
    tryLoadKeys(); // hot-reload keys if replaced on disk

    const userId = parsed.query.user_id || `anon-${Math.floor(Math.random() * 1e6)}`;
    const name = parsed.query.name || 'Anonymous';

    // Optional: accept minimal context via query for testing
    const context = {};

    const token = createJwt({ sub: String(userId), name: String(name), context });
    return send(res, 200, token, origin);
  }

  if (parsed.pathname === '/healthz') {
    const ok = CLIENT_PRIVATE_KEY && IBM_PUBLIC_KEY;
    const status = ok ? 200 : 500;
    return send(res, status, ok ? 'ok' : 'missing-keys', origin);
  }

  return send(res, 404, 'Not Found', origin);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[JWT Server] listening on http://localhost:${PORT}`);
  if (!CLIENT_PRIVATE_KEY || !IBM_PUBLIC_KEY) {
    console.warn('[JWT Server] WARNING: missing key files in ./wxo_security_config');
    console.warn('[JWT Server] Expected files: client_private_key.pem, ibm_public_key.pem');
  }
});
