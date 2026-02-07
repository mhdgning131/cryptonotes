import { gzipSync, gunzipSync, strFromU8 } from 'fflate';
import { argon2id } from 'hash-wasm';

/**
 * Crypto utilities for CryptoNotes
 * Security Specs:
 * - Algorithm: AES-GCM 256-bit
 * - Key Derivation: Argon2id (v2) or PBKDF2 (legacy)
 * - Argon2id Params: m=65536, t=3, p=1 (OWASP recommended)
 * - PBKDF2 Params: 100,000 iterations, SHA-256 (legacy fallback)
 * - Compression: Gzip (fflate)
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_SIZE = 16;
const IV_SIZE = 12;

// Argon2id parameters (OWASP recommended for browser)
const ARGON2_MEMORY = 65536; // 64 MB
const ARGON2_ITERATIONS = 3;
const ARGON2_PARALLELISM = 1;

// Version prefix for new Argon2id payloads
const VERSION_PREFIX = 'v2$';

function toSafeBase64(u8: Uint8Array): string {
    return btoa(String.fromCharCode(...u8))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function fromSafeBase64(base64: string): Uint8Array {
    // Structural check: Base64 strings cannot have length 4n+1
    if (base64.length % 4 === 1) {
        throw new Error("STRICT_CORRUPTION");
    }

    // Strict Bit-Alignment Check: 
    // If the length is 4n+2 or 4n+3, it means the last character contains padding bits.
    // Those bits MUST be zero. If not, the string was likely truncated mid-character.
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const lastChar = base64[base64.length - 1];
    const lastIdx = alphabet.indexOf(lastChar);

    if (lastIdx !== -1) {
        if (base64.length % 4 === 2) {
            // 2 characters = 12 bits = 8 data + 4 padding. last 4 bits must be 0.
            if ((lastIdx & 0b001111) !== 0) throw new Error("STRICT_CORRUPTION");
        } else if (base64.length % 4 === 3) {
            // 3 characters = 18 bits = 16 data + 2 padding. last 2 bits must be 0.
            if ((lastIdx & 0b000011) !== 0) throw new Error("STRICT_CORRUPTION");
        }
    }

    const b64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    try {
        const bin = atob(b64);
        const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
            u8[i] = bin.charCodeAt(i);
        }
        return u8;
    } catch (e) {
        throw new Error("STRICT_CORRUPTION");
    }
}

/**
 * Derive key using Argon2id (recommended for new encryptions)
 */
export async function deriveKeyArgon2(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyBytes = await argon2id({
        password: password,
        salt: salt,
        parallelism: ARGON2_PARALLELISM,
        iterations: ARGON2_ITERATIONS,
        memorySize: ARGON2_MEMORY,
        hashLength: 32,
        outputType: 'binary'
    });

    return crypto.subtle.importKey(
        'raw',
        new Uint8Array(keyBytes),
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Derive key using PBKDF2 (legacy fallback for old links)
 */
export async function deriveKeyPBKDF2(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as any,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt text using AES-GCM with Argon2id key derivation
 * Output format: v2$<base64(salt|iv|ciphertext)>
 */
export async function encrypt(text: string, password: string, compress = false): Promise<{ blob: string }> {
    const enc = new TextEncoder();
    let data: Uint8Array = enc.encode(text);

    if (compress) {
        data = new Uint8Array(gzipSync(data));
    }

    const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
    const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
    const key = await deriveKeyArgon2(password, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data as any
    );

    const combined = new Uint8Array(SALT_SIZE + IV_SIZE + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, SALT_SIZE);
    combined.set(new Uint8Array(encrypted), SALT_SIZE + IV_SIZE);

    return {
        blob: VERSION_PREFIX + toSafeBase64(combined)
    };
}

/**
 * Decrypt blob using appropriate KDF based on version prefix
 * - v2$... → Argon2id
 * - (no prefix) → PBKDF2 (legacy)
 */
export async function decrypt(blob: string, password: string, decompress = false): Promise<string> {
    let combined: Uint8Array;
    let useArgon2 = false;
    let payload = blob;

    // Check for version prefix
    if (blob.startsWith(VERSION_PREFIX)) {
        useArgon2 = true;
        payload = blob.slice(VERSION_PREFIX.length);
    }

    try {
        combined = fromSafeBase64(payload);
    } catch (e) {
        throw new Error("CORRUPT_LINK");
    }

    // Minimum structural length: Salt (16) + IV (12) + GCM Tag (16)
    if (combined.length < SALT_SIZE + IV_SIZE + 16) {
        throw new Error("CORRUPT_LINK");
    }

    const salt = combined.slice(0, SALT_SIZE);
    const iv = combined.slice(SALT_SIZE, SALT_SIZE + IV_SIZE);
    const data = combined.slice(SALT_SIZE + IV_SIZE);

    // Use appropriate KDF based on version
    const key = useArgon2
        ? await deriveKeyArgon2(password, salt)
        : await deriveKeyPBKDF2(password, salt);

    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        if (decompress) {
            try {
                return strFromU8(gunzipSync(new Uint8Array(decrypted)));
            } catch (e) {
                // If decryption worked but Gzip failed, it's definitely corrupt
                throw new Error("CORRUPT_LINK");
            }
        }

        return new TextDecoder().decode(decrypted);
    } catch (e: any) {
        // If it's already a CORRUPT_LINK from gunzip, rethrow it
        if (e.message === "CORRUPT_LINK") throw e;

        // SubtleCrypto throws on wrong password/integrity failure
        // We catch it and surface it as a WRONG_PASSWORD
        throw new Error("WRONG_PASSWORD");
    }
}

/**
 * Generates a strong random string to be used as a base key in the URL
 */
export function generateBaseKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return toSafeBase64(array);
}
