# CryptoNotes

**Secure, E2E Encrypted Secret Sharing**

CryptoNotes is a minimalistic web application designed for sharing private and secure notes. All notes are encrypted client-side, ensuring that the server and storage have zero knowledge of the content.

## Security Architecture

Our security model protects your privacy with mathematical certainty through a multi-layered approach as detailed below.

### 01. E2E Encryption
Encryption happens **entirely inside your browser**. Before any message is sent to our servers, it is processed through the **AES-GCM 256-bit** algorithm via the standard Web Crypto API.

*   **Local Processing**: Your raw text is never available in RAM outside of your own device's controlled environment.
*   **Military Grade**: AES-GCM is the industry standard for secure, authenticated data encryption.

### 02. Zero Knowledge
The decryption key is generated randomly on your device and appended to the URL as a **hash fragment** (everything after the `#`).

> **Technical Fact**: Browsers never send the hash fragment to the server.

Because we never receive the key, we have **Zero Knowledge** of your content. If a government or hacker compromised our database, they would only see a wall of encrypted "blobs" that are impossible to crack without your unique URL.

## Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- Cloudflare Account (for KV storage and Pages deployment) This is optional tho if you want to deploy it yourself anywhere else it should work fine (just edit the code cuz actually its made for cloudflare)

### Development
```bash
npm install
npm run dev
```

### Deployment
This project is optimized for **Cloudflare Pages**.
```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare
```
