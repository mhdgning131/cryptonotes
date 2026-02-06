export let localStore = new Map<string, { value: string, metadata: { burn: boolean }, expires: number }>();

export async function getKV(platform: App.Platform | undefined) {
    if (platform?.env?.NOTES_KV) {
        return {
            get: async (id: string) => {
                const { value, metadata } = await platform.env.NOTES_KV.getWithMetadata<{ burn: boolean }>(id);
                return { value, metadata };
            },
            put: async (id: string, value: string, { expirationTtl, metadata }: { expirationTtl: number, metadata: { burn: boolean } }) => {
                await platform.env.NOTES_KV.put(id, value, { expirationTtl, metadata });
            },
            delete: async (id: string) => {
                await platform.env.NOTES_KV.delete(id);
            }
        };
    }

    // Fallback for local development (npm run dev)
    console.warn("⚠️ Using local in-memory store (Cloudflare KV not found)");
    return {
        get: async (id: string) => {
            const item = localStore.get(id);
            if (item && Date.now() > item.expires) {
                localStore.delete(id);
                return { value: null, metadata: null };
            }
            return { value: item?.value || null, metadata: item?.metadata || null };
        },
        put: async (id: string, value: string, { expirationTtl, metadata }: { expirationTtl: number, metadata: { burn: boolean } }) => {
            localStore.set(id, {
                value,
                metadata,
                expires: Date.now() + (expirationTtl * 1000)
            });
        },
        delete: async (id: string) => {
            localStore.delete(id);
        }
    };
}
