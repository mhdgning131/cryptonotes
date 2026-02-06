import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { initStorage } from '$lib/server/storage';

export const POST: RequestHandler = async ({ request, platform }) => {
    try {
        const { blob, ttl, burn } = await request.json();

        // Input validation
        if (!blob) return json({ error: 'Missing content' }, { status: 400 });

        const storage = initStorage(platform);
        const id = crypto.randomUUID();

        // 100% Blind Storage: No IP, No timestamps, No logs.
        await storage.put(id, blob, {
            expirationTtl: ttl ? Math.floor(ttl / 1000) : 24 * 60 * 60,
            metadata: { burn: !!burn }
        });

        return json({ id });
    } catch (e) {
        // Blind error: No leakage of what failed
        return json({ error: 'Storage failure' }, { status: 500 });
    }
};

export const GET: RequestHandler = async ({ params, platform }) => {
    // This file will handle /api/notes (POST)
    // For /api/notes/[id] (GET), we need another file or use a dynamic route
    return json({ error: 'Method not allowed' }, { status: 405 });
};
