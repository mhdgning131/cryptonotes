<script lang="ts">
    import { encrypt, generateBaseKey } from "$lib/crypto";
    import QRCode from "$lib/components/QRCode.svelte";

    let content = $state("");
    let password = $state("");
    let ttl = $state(24 * 60 * 60 * 1000); // Default 24h
    let burn = $state(false);

    let loading = $state(false);
    let noteUrl = $state("");
    let error = $state("");

    const ttlOptions = [
        { label: "1 Hour", value: 60 * 60 * 1000 },
        { label: "24 Hours", value: 24 * 60 * 60 * 1000 },
        { label: "7 Days", value: 7 * 24 * 60 * 60 * 1000 },
        { label: "30 Days", value: 30 * 24 * 60 * 60 * 1000 },
    ];

    async function createNote() {
        if (!content) return;
        loading = true;
        error = "";

        try {
            const baseKey = generateBaseKey();
            const encryptionPassword = baseKey + password;
            const { blob } = await encrypt(content, encryptionPassword);

            const response = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blob, ttl, burn }),
            });

            if (!response.ok) throw new Error("Failed to save note");

            const { id } = await response.json();
            noteUrl = `${window.location.origin}/n/${id}#${baseKey}`;
        } catch (e) {
            error = "Error creating note. Please try again.";
            console.error(e);
        } finally {
            loading = false;
        }
    }

    function copyUrl() {
        navigator.clipboard.writeText(noteUrl);
    }
</script>

<svelte:head>
    <title>CryptoNotes | Secure, E2E Encrypted Secret Sharing</title>
    <meta
        name="description"
        content="Securely share sensitive notes with military-grade AES-GCM 256-bit encryption. 100% private, zero-knowledge, and open-source. Create your encrypted note now."
    />
    <meta
        property="og:description"
        content="Securely share sensitive notes with military-grade AES-GCM 256-bit encryption. 100% private, zero-knowledge, and open-source. Create your encrypted note now."
    />
    <meta
        property="twitter:description"
        content="Securely share sensitive notes with military-grade AES-GCM 256-bit encryption. 100% private, zero-knowledge, and open-source. Create your encrypted note now."
    />
    <link rel="canonical" href="https://cryptonotes.pages.dev/" />

    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "CryptoNotes",
            "applicationCategory": "SecurityApplication",
            "operatingSystem": "Any",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "description": "Zero-knowledge, end-to-end encrypted secret sharing platform."
        }
    </script>

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
                }
            ]
        }
    </script>
</svelte:head>

<div
    class="flex-1 flex flex-col gap-10 py-12 max-w-[800px] mx-auto animate-fade"
>
    {#if !noteUrl}
        <section class="flex flex-col gap-8">
            <div class="header-group">
                <h1 class="m-0">New Secret.</h1>
            </div>

            <div class="two-column-layout">
                <!-- Left Column: Content (Widest) -->
                <div class="left-col">
                    <textarea
                        id="note-content"
                        bind:value={content}
                        placeholder="Start typing your secure message..."
                        disabled={loading}
                        class="main-textarea"
                    ></textarea>
                </div>

                <!-- Right Column: Options -->
                <div class="right-col side-panel">
                    <div class="flex flex-col gap-4">
                        <h2 class="label border-none mb-0">
                            Note Configuration
                        </h2>

                        <div class="flex flex-col gap-2">
                            <label for="note-password" class="label-sub"
                                >Access Password</label
                            >
                            <input
                                id="note-password"
                                type="password"
                                bind:value={password}
                                placeholder="Optional extra layer"
                                disabled={loading}
                                class="refined-input"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="note-ttl" class="label-sub"
                                >Expiration</label
                            >
                            <select
                                id="note-ttl"
                                bind:value={ttl}
                                disabled={loading}
                                class="refined-input"
                            >
                                {#each ttlOptions as option}
                                    <option value={option.value}
                                        >{option.label}</option
                                    >
                                {/each}
                            </select>
                        </div>

                        <div class="flex items-center pt-2">
                            <div
                                class="checkbox-container"
                                style="margin-right: 1.5rem;"
                            >
                                <input
                                    id="note-burn"
                                    type="checkbox"
                                    bind:checked={burn}
                                    disabled={loading}
                                    class="checkbox-custom"
                                />
                            </div>
                            <label
                                for="note-burn"
                                class="label-sub cursor-pointer mb-0"
                                >Burn after reading</label
                            >
                        </div>
                    </div>

                    <div class="mt-auto pt-6">
                        <button
                            onclick={createNote}
                            disabled={loading || !content}
                            class="secondary-btn w-full py-6 text-lg font-black"
                        >
                            {loading ? "Securing..." : "Encrypt"}
                        </button>
                    </div>

                    {#if error}
                        <div class="error-box">
                            {error}
                        </div>
                    {/if}
                </div>
            </div>
        </section>
    {:else}
        <section
            class="result-view flex flex-col gap-6 animate-fade w-full mx-auto"
        >
            <div class="header-group">
                <h1>Locked.</h1>
                <p
                    class="text-subtle font-bold uppercase tracking-[0.2em] text-[10px]"
                >
                    Decryption key stored in URL hash only.
                </p>
            </div>

            <div class="card result-card">
                <div class="result-grid">
                    <div class="result-details flex flex-col gap-6">
                        <div class="flex flex-col gap-3">
                            <label class="label" for="share-url"
                                >Secure Sharing Link</label
                            >
                            <div class="link-box">
                                <code id="share-url" class="mono"
                                    >{noteUrl}</code
                                >
                            </div>
                        </div>

                        <div class="result-actions">
                            <button
                                onclick={copyUrl}
                                class="primary-btn flex-1 py-5"
                                >Copy Link</button
                            >
                            <button
                                onclick={() => {
                                    noteUrl = "";
                                    content = "";
                                    password = "";
                                }}
                                class="secondary-btn py-5 px-8">New Note</button
                            >
                        </div>
                    </div>

                    <div class="result-qr-section">
                        <QRCode value={noteUrl} />
                    </div>
                </div>
            </div>

            <div class="info-banner card text-center border-dashed">
                <p
                    class="text-[10px] uppercase text-center font-black tracking-widest leading-relaxed"
                >
                    Encryption complete. Only those with this link can decrypt
                    the content.
                </p>
            </div>
        </section>
    {/if}
</div>

<style>
    .two-column-layout {
        display: flex;
        gap: 2rem;
        align-items: stretch;
    }

    .left-col {
        flex: 0 0 800px;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .right-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        min-width: 350px;
    }

    .side-panel {
        background: var(--bg-subtle);
        padding: 2rem;
        border: 1px solid var(--border);
    }

    @media (max-width: 1100px) {
        .left-col {
            flex: 1 1 auto;
        }
    }

    @media (max-width: 900px) {
        .two-column-layout {
            flex-direction: column;
        }
        .left-col {
            flex: none;
            width: 100%;
        }
        .side-panel {
            padding: 1.5rem;
        }
    }

    .main-textarea {
        min-height: 500px;
        font-size: 1.25rem;
        padding: 2rem;
        line-height: 1.6;
        flex: 1;
    }

    .refined-input {
        padding: 1rem;
        font-size: 0.95rem;
        background: var(--bg);
    }

    .label-sub {
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        opacity: 0.7;
    }

    .secondary-btn {
        background: transparent;
        color: var(--fg);
        border: 1px solid var(--border);
        transition: all 0.2s ease;
    }

    .secondary-btn:hover {
        background: var(--fg);
        color: var(--bg);
    }

    .link-box {
        padding: 1.5rem;
        background: var(--bg-subtle);
        border: 1px solid var(--border);
        white-space: nowrap;
        overflow-x: auto;
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }

    .link-box::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }

    .error-box {
        padding: 1.5rem;
        border-left: 4px solid var(--fg);
        background: var(--bg);
        font-size: 0.8rem;
        font-weight: 900;
        text-transform: uppercase;
        margin-top: 1rem;
    }

    .info-banner {
        padding: 1.5rem;
        opacity: 0.6;
    }

    .checkbox-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.5rem;
    }

    .checkbox-custom {
        width: 1.25rem;
        height: 1.25rem;
        accent-color: var(--fg);
        cursor: pointer;
    }

    .w-full {
        width: 100%;
    }
    .mx-auto {
        margin-left: auto;
        margin-right: auto;
    }

    .header-group h1 {
        margin-bottom: 0.5rem;
        font-size: 3rem;
    }
    .result-view {
        max-width: 900px;
    }

    .result-grid {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 3rem;
        align-items: center;
    }

    .result-details {
        flex: 1;
        min-width: 0;
    }

    @media (max-width: 800px) {
        .result-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
    }

    .result-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
    }
</style>
