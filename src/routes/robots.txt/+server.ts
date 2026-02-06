export const GET = () => {
    const robots = `User-agent: *
Allow: /
Allow: /how-it-works
Disallow: /n/*
Disallow: /api/*

Sitemap: https://cryptonotes.pages.dev/sitemap.xml
`;

    return new Response(robots, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'max-age=0, s-maxage=3600'
        }
    });
};
