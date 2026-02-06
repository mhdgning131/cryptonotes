import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getKV } from '$lib/server/kv';

export const GET: RequestHandler = async ({ params, platform }) => {
    const kv = await getKV(platform);
    const { id } = params;

    // Fetch blob and metadata (for burn-on-read logic)
    const { value: blob, metadata } = await kv.get(id as string);

    if (!blob) {
        return json({ error: 'Note not found or expired' }, { status: 404 });
    }

    // Handle self-destruction (Burn-on-read)
    if (metadata?.burn) {
        await kv.delete(id as string);
    }

    return json({ blob });
};
