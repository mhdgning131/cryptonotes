<script lang="ts">
    import { onMount } from "svelte";
    import { decrypt } from "$lib/crypto";

    let baseKey = $state("");
    let password = $state("");
    let blob = $state("");
    let content = $state("");
    let loading = $state(true);
    let error = $state("");
    let passwordRequired = $state(false);

    async function attemptDecryption() {
        error = "";
        loading = true;
        const fullPassword = baseKey + password;
        try {
            content = await decrypt(blob, fullPassword, true);
            loading = false;
            passwordRequired = false;
        } catch (e) {
            passwordRequired = true;
            loading = false;
            if (password) error = "Incorrect password. Please try again.";
        }
    }

    onMount(() => {
        try {
            const hash = window.location.hash.substring(1);
            if (!hash || hash.length < 44) {
                throw new Error("Invalid or corrupt link: missing data.");
            }

            // Zero-DB format: #<43-char-key><blob>
            baseKey = hash.substring(0, 43);
            blob = hash.substring(43);

            attemptDecryption();
        } catch (e: any) {
            error = e.message;
            loading = false;
        }
    });
</script>

<svelte:head>
    <title>Secure Note | CryptoNotes</title>
    <meta name="robots" content="noindex, nofollow" />
    <meta
        property="og:description"
        content="You've received a secure, end-to-end encrypted note. Open the link to decrypt and read it."
    />
    <meta
        property="twitter:description"
        content="You've received a secure, end-to-end encrypted note. Open the link to decrypt and read it."
    />
</svelte:head>

<div class="flex-1 flex flex-col gap-8 py-8 max-w-[800px] mx-auto animate-fade">
    {#if loading && !passwordRequired}
        <div
            class="flex-1 flex flex-col items-center justify-center gap-8 py-20"
        >
            <div class="loading-spinner"></div>
            <div
                class="font-black uppercase tracking-[0.4em] text-subtle text-[10px]"
            >
                Securely Decrypting
            </div>
        </div>
    {:else if error && !passwordRequired}
        <section class="flex flex-col gap-8">
            <h1>Access Error.</h1>
            <div class="card error-card">
                <p class="font-bold uppercase text-[10px] tracking-widest">
                    {error}
                </p>
            </div>
            <a href="/" class="primary-btn text-center py-5 no-underline"
                >Back to Home</a
            >
        </section>
    {:else if passwordRequired}
        <section class="flex flex-col gap-8">
            <h1>LOCKED.</h1>
            <div class="card flex flex-col gap-8">
                <p class="text-subtle font-medium">
                    This note is protected. A decryption password is required to
                    reveal the content.
                </p>
                <div class="flex flex-col gap-3">
                    <label class="label" for="viewer-password"
                        >Enter Password</label
                    >
                    <input
                        id="viewer-password"
                        type="password"
                        bind:value={password}
                        placeholder="••••••••"
                        onkeydown={(e) =>
                            e.key === "Enter" && attemptDecryption()}
                        class="refined-input"
                    />
                </div>
                {#if error}
                    <p
                        class="text-[10px] uppercase tracking-widest bg-bg-subtle p-3 border-l-2 border-red-500"
                        style="color: #ef4444;"
                    >
                        {error}
                    </p>
                {/if}
                <button onclick={attemptDecryption} class="primary-btn py-4"
                    >Unlock Note</button
                >
            </div>
        </section>
    {:else}
        <section class="flex flex-col gap-10">
            <div
                class="flex items-end justify-between border-b-2 border-fg pb-4"
            >
                <div class="header-group">
                    <h2 class="m-0 text-3xl font-black">Message.</h2>
                </div>
            </div>

            <div
                class="card bg-bg-subtle/30 mono whitespace-pre-wrap min-h-[400px] border-dashed text-lg leading-relaxed"
            >
                {content}
            </div>

            <div class="viewer-actions">
                <button
                    onclick={() => (window.location.href = "/")}
                    class="primary-btn py-5"
                >
                    Create Your Own Secure Note
                </button>
                <p
                    class="text-center text-[10px] uppercase font-bold tracking-widest opacity-40"
                >
                    This message was decrypted in your browser. It exists only
                    in your memory.
                </p>
            </div>
        </section>
    {/if}
</div>

<style>
    .loading-spinner {
        width: 48px;
        height: 48px;
        border: 2px solid var(--fg);
        border-top-width: 6px;
        animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .error-card {
        background: var(--bg-subtle);
        border-left: 8px solid var(--fg);
    }

    .refined-input {
        padding: 1rem;
        font-size: 1.1rem;
    }

    .no-underline {
        text-decoration: none;
    }
    .viewer-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }
</style>
