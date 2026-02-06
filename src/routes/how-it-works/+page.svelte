<svelte:head>
    <title>How it Works | CryptoNotes Security Architecture</title>
    <meta
        name="description"
        content="Deep dive into CryptoNotes security: AES-GCM 256-bit encryption, zero-knowledge architecture, and open-source transparency. Learn how we protect your data."
    />
    <meta
        property="og:description"
        content="Deep dive into CryptoNotes security: AES-GCM 256-bit encryption, zero-knowledge architecture, and open-source transparency. Learn how we protect your data."
    />
    <meta
        property="twitter:description"
        content="Deep dive into CryptoNotes security: AES-GCM 256-bit encryption, zero-knowledge architecture, and open-source transparency. Learn how we protect your data."
    />
    <link rel="canonical" href="https://cryptonotes.pages.dev/how-it-works" />

    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://cryptonotes.pages.dev/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "How it Works",
                    "item": "https://cryptonotes.pages.dev/how-it-works"
                }
            ]
        }
    </script>
</svelte:head>

<div
    class="flex-1 flex flex-col gap-12 py-8 max-w-[800px] mx-auto animate-fade"
>
    <header class="flex flex-col gap-6">
        <a
            href="/"
            class="secondary-btn w-fit py-2 px-6 flex items-center gap-2 text-[10px] mb-4"
        >
            ← Back to Home
        </a>
        <div class="flex flex-col">
            <h1 class="text-4xl">Security Architecture</h1>
            <p class="text-subtle">
                A deep dive into how CryptoNotes protects your privacy with 100%
                mathematical certainty.
            </p>
        </div>
    </header>

    <div class="flex flex-col gap-16">
        <!-- E2E Section -->
        <section id="e2e" class="flex flex-col scroll-mt-24">
            <div class="section-header">
                <span
                    class="text-bg font-black text-[10px] border border-bg/30 px-1"
                    >01</span
                >
                <h2 class="m-0 text-[12px] tracking-tight uppercase font-black">
                    E2E Encryption
                </h2>
            </div>

            <div class="card flex flex-col gap-6 bg-bg-subtle">
                <p class="leading-relaxed">
                    Encryption happens <strong
                        >entirely inside your browser</strong
                    >. Before any message is sent to our servers, it is
                    processed through the <strong>AES-GCM 256-bit</strong> algorithm
                    via the standard Web Crypto API.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="flex flex-col gap-2">
                        <h4 class="text-[10px] uppercase font-black opacity-50">
                            Local Processing
                        </h4>
                        <p class="text-sm">
                            Your raw text is never available in RAM outside of
                            your own device's controlled environment.
                        </p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <h4 class="text-[10px] uppercase font-black opacity-50">
                            Military Grade
                        </h4>
                        <p class="text-sm">
                            AES-GCM is the industry standard for secure,
                            authenticated data encryption.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Zero Knowledge Section -->
        <section id="zero-knowledge" class="flex flex-col scroll-mt-24">
            <div class="section-header">
                <span
                    class="text-bg font-black text-[10px] border border-bg/30 px-1"
                    >02</span
                >
                <h2 class="m-0 text-[12px] tracking-tight uppercase font-black">
                    Zero Knowledge
                </h2>
            </div>

            <div class="card flex flex-col gap-6">
                <p class="leading-relaxed">
                    The decryption key is generated randomly on your device and
                    appended to the URL as a <strong>hash fragment</strong>
                    (everything after the <code>#</code>).
                </p>

                <div class="border-l-4 border-fg pl-6 py-2 my-2">
                    <p class="text-sm font-bold italic">
                        Technical Fact: Browsers never send the hash fragment to
                        the server.
                    </p>
                </div>

                <p class="text-sm opacity-80 leading-relaxed">
                    Because we never receive the key, we have <strong
                        >Zero Knowledge</strong
                    > of your content. If a government or hacker compromised our
                    database, they would only see a wall of encrypted "blobs" that
                    are impossible to crack without your unique URL.
                </p>
            </div>
        </section>

        <!-- Open Source Section -->
        <section id="open-source" class="flex flex-col scroll-mt-24">
            <div class="section-header">
                <span
                    class="text-bg font-black text-[10px] border border-bg/30 px-1"
                    >03</span
                >
                <h2 class="m-0 text-[12px] tracking-tight uppercase font-black">
                    Open Source Transparency
                </h2>
            </div>

            <div class="card flex flex-col gap-6 bg-bg-subtle">
                <p class="leading-relaxed">
                    Trust should be verified, not assumed. Every line of code
                    running on this platform is open for public audit.
                </p>

                <ul class="flex flex-col gap-4 list-none p-0">
                    <li class="flex gap-4">
                        <span class="text-fg-subtle">●</span>
                        <div class="flex flex-col gap-1">
                            <span class="font-bold text-sm"
                                >Frontend Transparency</span
                            >
                            <span class="text-xs opacity-70"
                                >Inspect the exact encryption logic in your
                                browser console at any time.</span
                            >
                        </div>
                    </li>
                    <li class="flex gap-4">
                        <span class="text-fg-subtle">●</span>
                        <div class="flex flex-col gap-1">
                            <span class="font-bold text-sm"
                                >Independent Hosting</span
                            >
                            <span class="text-xs opacity-70"
                                >The system is designed to be easily deployable
                                on your own infrastructure.</span
                            >
                        </div>
                    </li>
                </ul>
            </div>
        </section>
    </div>

    <footer class="py-12 border-t border-border mt-32 flex justify-center">
        <a href="/" class="primary-btn py-4 px-12"> Create Your Secure Note </a>
    </footer>
</div>

<style>
    .section-header {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border: 2px solid var(--border);
        border-bottom: none;
        padding: 0.35rem 1rem;
        width: fit-content;
        background: var(--fg);
        color: var(--bg);
        margin-bottom: -2px;
        z-index: 1;
        margin-left: 2rem;
    }

    section h2 {
        border: none;
        padding: 0;
    }

    code {
        background: var(--bg-subtle);
        padding: 0.2rem 0.4rem;
        font-family: var(--font-mono);
        color: var(--fg);
    }
</style>
