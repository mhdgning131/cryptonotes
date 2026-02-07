import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
    // Detect if we are running on Cloudflare by checking for the platform object
    // and its environment variables.
    const isCloudflare = !!(platform?.env?.NOTES_KV);

    return {
        isCloudflare
    };
};
