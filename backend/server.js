const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { v4: uuid } = require('uuid');
const crypto = require('crypto');

const app = express();
const PORT = 3003;

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Generate RSA key pair (in production, load from secure files)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('='.repeat(80));
console.log('IMPORTANT: Copy this public key to watsonx Orchestrate Security settings');
console.log('='.repeat(80));
console.log(publicKey);
console.log('='.repeat(80));

/**
 * Creates a JWT token for watsonx Orchestrate authentication
 */
function createJWTToken(userId, context = {}) {
  const jwtContent = {
    // User ID (sub claim)
    sub: userId || `anon-${uuid().substr(0, 8)}`,
    
    // User payload (can be encrypted in production)
    user_payload: {
      name: 'Chain AI User',
      custom_message: 'Emergency Response System',
    },
    
    // Context variables accessible to agents
    context: {
      app_name: 'Chain AI',
      session_id: uuid(),
      ...context
    }
  };

  // Sign the JWT with private key
  const token = jwt.sign(jwtContent, privateKey, {
    algorithm: 'RS256',
    expiresIn: '24h'
  });

  return token;
}

/**
 * Endpoint to generate JWT tokens
 */
app.get('/createJWT', (req, res) => {
  try {
    const userId = req.query.user_id || `chainai-${Date.now()}`;
    
    // Optional context from query params
    const context = {
      crisis_type: req.query.crisis_type,
      region: req.query.region,
      severity: req.query.severity
    };

    const token = createJWTToken(userId, context);
    
    console.log(`[${new Date().toISOString()}] Generated JWT for user: ${userId}`);
    
    // Return plain text token
    res.type('text/plain');
    res.send(token);
  } catch (error) {
    console.error('Error generating JWT:', error);
    res.status(500).json({ error: 'Failed to generate JWT' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'chainai-jwt-server',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get public key endpoint (for debugging)
 */
app.get('/publicKey', (req, res) => {
  res.type('text/plain');
  res.send(publicKey);
});

app.listen(PORT, () => {
  console.log(`\n✅ JWT Server running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  - GET /createJWT?user_id=<id>  - Generate JWT token`);
  console.log(`  - GET /health                  - Health check`);
  console.log(`  - GET /publicKey               - Get public key`);
  console.log(`\n⚠️  IMPORTANT SETUP STEPS:`);
  console.log(`\n1. Copy the public key above`);
  console.log(`2. Log into watsonx Orchestrate: https://us-south.watson-orchestrate.cloud.ibm.com`);
  console.log(`3. Go to: Settings → Security → Embedded Chat → Public Key`);
  console.log(`4. Paste the public key and save`);
  console.log(`5. Update your .env.local:`);
  console.log(`   - Remove: VITE_WXO_SECURITY_DISABLED=true`);
  console.log(`   - Add: VITE_WXO_USE_JWT_SERVER=true`);
  console.log(`6. Restart your React dev server\n`);
});
