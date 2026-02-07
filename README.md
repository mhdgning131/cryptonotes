# CryptoNotes

**Secure, E2E Encrypted Secret Sharing | Platform Agnostic | Blind Storage**

CryptoNotes is a pro-privacy platform for sharing encrypted secrets. Designed with a "Dumb Server" philosophy—the server never knows what you're sharing, who sent it, or how it's compressed.

## Architecture

Our architecture treats the server as a liability, prioritizing your privacy at every layer.

### 01. Storage Hub (Dual Modes)
Users can choose their preferred balance of convenience and privacy:
- **Cloud Storage (Blind)**: Blobs are stored in our backend (KV or SQLite). Enables **short links**, **TTL**, and **Burn-after-reading**.
- **Zero-DB (Max Privacy)**: The standard for anonymity. The entire encrypted payload lives *only* in the URL hash. No record hits the server disk.

### 02. Security Parameters
We follow world-class privacy standards:
- **Encryption**: AES-GCM 256-bit (Authenticated Encryption).
- **Key Derivation**: PBKDF2 with **100,000 iterations** of SHA-256.
- **Gzip Compression**: Zero-DB notes are compressed with **Gzip (fflate)** to keep links as short as possible.
- **Local Compatibility**: Configured for Cloudflare via `adapter-cloudflare` for manual manual deployments, but easily switchable to any other Svelte adapter.
- **Invisible Keys**: Decryption keys stay in the URL hash fragment. Browsers **never** send this to the server.

### 03. Platform Agnostic
Powered by `adapter-auto`, deployable anywhere:
- **Cloud Native**: Optimized for **Cloudflare Pages + KV**.
- **Self-Hostable**: Runs on any Node/Docker environment with **SQLite** persistence via `DB_PATH`.

## Getting Started

### Prerequisites
- Node.js (Latest LTS)
- SQLite (Bundled, no setup required)

### Local Development
```bash
npm install
npm run dev
```

### Self-Hosting (Node/Docker)
To persist notes locally:
```bash
# Node
DB_PATH=./notes.db npm run build && node build

# Docker
docker run -e DB_PATH=/data/notes.db -v ./data:/data cryptonotes
```

### Deployment
This project is configured with **adapter-cloudflare** for easy manual deployment.
```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare
```
