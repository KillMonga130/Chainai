
  # Glassmorphic Design Implementation

  This is a code bundle for Glassmorphic Design Implementation. The original project is available at https://www.figma.com/design/OC2eHIxAZD8DTRXPVWIJ6V/Glassmorphic-Design-Implementation.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
 
## IBM watsonx Orchestrate – JWT token server

The embedded IBM chat requires an auth token. This repo includes a minimal local server that issues RS256-signed JWTs as described in the included security guide.

1. Create a folder at the project root named `wxo_security_config` and place these files inside:

- `client_private_key.pem` – your client private key for signing
- `ibm_public_key.pem` – the IBM public key used to encrypt `user_payload`

1. Start the JWT server:

- `npm run start:jwt`
- It listens on <http://localhost:3003> and exposes `GET /createJWT?user_id=...`

1. Run the app with `npm run dev` and open <http://localhost:3000>. The frontend will fetch a JWT from the local server before initializing the chat. If the local server is unavailable, it will fall back to IAM if configured by env vars.

Notes:

- Keys are hot-loaded; replacing the PEM files does not require a server restart.
- CORS allows <http://localhost:3000> and <http://localhost:3001> by default.
  