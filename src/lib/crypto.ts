import { gzipSync, gunzipSync, strFromU8 } from 'fflate';

/**
 * Crypto utilities for CryptoNotes
 * Security Specs:
 * - Algorithm: AES-GCM 256-bit
 * - Key Derivation: PBKDF2 with SHA-256
 * - Iterations: 100,000
 * - Compression: Gzip (fflate)
 */

const ITERATIONS = 100000;
const SALT_SIZE = 16;
const IV_SIZE = 12;

function toSafeBase64(u8: Uint8Array): string {
    return btoa(String.fromCharCode(...u8))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function fromSafeBase64(base64: string): Uint8Array {
    const b64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        u8[i] = bin.charCodeAt(i);
    }
    return u8;
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
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
            iterations: ITERATIONS,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encrypt(text: string, password: string, compress = false): Promise<{ blob: string }> {
    const enc = new TextEncoder();
    let data: Uint8Array = enc.encode(text);

    if (compress) {
        data = new Uint8Array(gzipSync(data));
    }

    const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
    const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
    const key = await deriveKey(password, salt);

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
        blob: toSafeBase64(combined)
    };
}

export async function decrypt(blob: string, password: string, decompress = false): Promise<string> {
    const combined = fromSafeBase64(blob);

    const salt = combined.slice(0, SALT_SIZE);
    const iv = combined.slice(SALT_SIZE, SALT_SIZE + IV_SIZE);
    const data = combined.slice(SALT_SIZE + IV_SIZE);

    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    if (decompress) {
        try {
            return strFromU8(gunzipSync(new Uint8Array(decrypted)));
        } catch (e) {
            console.error("Decompression failed, falling back to raw decode");
            return new TextDecoder().decode(decrypted);
        }
    }

    return new TextDecoder().decode(decrypted);
}

/**
 * Generates a strong random string to be used as a base key in the URL
 */
export function generateBaseKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return toSafeBase64(array);
}
