# CryptoNotes

**Secure, E2E Encrypted Secret Sharing | Platform Agnostic | Blind Storage**

CryptoNotes is a pro-privacy platform for sharing encrypted secrets. The server never knows what you're sharing, who sent it, or how it's compressed.

## Security

| Feature | Specification |
|---------|---------------|
| **Encryption** | AES-GCM 256-bit (Authenticated Encryption) |
| **Key Derivation** | Argon2id (m=64MB, t=3, p=1) memory-hard |
| **Compression** | Gzip (fflate) for shorter Zero-DB URLs |
| **Invisible Keys** | Decryption keys stay in URL hash and never sent to server |

### Privacy Guarantees
- **Zero Logging**: No IP addresses, no timestamps, no request logs
- **Blind Storage**: Server stores encrypted blobs without metadata
- **Atomic Burn**: "Burn after reading" notes deleted *before* response

## Architecture

### Storage Modes
| Mode | Description | Features |
|------|-------------|----------|
| **Cloud/Self Storage** | Blobs stored in KV or SQLite | Short links, TTL, Burn-on-read |
| **Zero-DB** | Encrypted payload lives *only* in URL | Max privacy, no server record |

> Note  that Zero-DB is suitable for short notes, since the URL length limitt is not an unified standard, many clients, mailers, and browsers have different limits. if you need to share a long note, use Cloud/Self Storage instead to prevent link corruption/truncation.

### Limits
- **Zero-DB**: 50,000 chars (URL compatibility)
- **Cloud (Cloudflare)**: 10MB
- **Self-Hosted**: 100MB

## Deployment

### Local Development
```bash
npm install && npm run dev
```

### Self-Hosting (Node/Docker)
```bash
# Node
DB_PATH=./notes.db npm run build && node build

# Docker
docker run -e DB_PATH=/data/notes.db -v ./data:/data cryptonotes
```

### Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare
```
