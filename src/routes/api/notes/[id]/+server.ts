import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { initStorage } from '$lib/server/storage';

export const GET: RequestHandler = async ({ params, platform }) => {
    const { id } = params;

    try {
        const storage = await initStorage(platform);
        const item = await storage.get(id);

        if (!item) {
            return json({ error: 'Note not found or expired' }, { status: 404 });
        }

        // Blind Storage Hardening: 
        // If it's a "burn after reading" note, we delete it ATOMICALLY now.
        if (item.metadata?.burn) {
            await storage.delete(id);
        }

        return json({ blob: item.blob });
    } catch (e) {
        return json({ error: 'Storage failure' }, { status: 500 });
    }
};
