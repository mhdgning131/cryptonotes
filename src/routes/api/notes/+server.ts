import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { v4 as uuidv4 } from 'uuid';
import { getKV } from '$lib/server/kv';

export const POST: RequestHandler = async ({ request, platform }) => {
    const kv = await getKV(platform);
    const { blob, ttl, burn = false } = await request.json();

    if (!blob) return json({ error: 'Blob required' }, { status: 400 });

    const id = uuidv4();

    // Cloudflare KV expirationTtl must be at least 60 seconds
    const ttlSeconds = Math.max(60, Math.floor((ttl || 24 * 60 * 60 * 1000) / 1000));

    await kv.put(id, blob, {
        expirationTtl: ttlSeconds,
        metadata: { burn }
    });

    return json({ id });
};

export const GET: RequestHandler = async () => {
    return json({ error: 'Use /api/notes/[id] instead' }, { status: 400 });
};
