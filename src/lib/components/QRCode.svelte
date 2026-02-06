<script lang="ts">
    import QRCode from "qrcode";
    import { onMount } from "svelte";

    let { value = "", size = 200 } = $props();
    let canvas: HTMLCanvasElement;
    let qrDataUrl = $state("");

    async function generateQR() {
        if (!value) return;
        try {
            qrDataUrl = await QRCode.toDataURL(value, {
                width: size * 2,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            });
        } catch (err) {
            console.error("QR Generation failed:", err);
        }
    }

    async function downloadPNG() {
        const link = document.createElement("a");
        link.download = "cryptonote-qr.png";
        link.href = qrDataUrl;
        link.click();
    }

    async function downloadSVG() {
        try {
            const svgString = await QRCode.toString(value, {
                type: "svg",
                width: size,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            });
            const blob = new Blob([svgString], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = "cryptonote-qr.svg";
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("SVG Generation failed:", err);
        }
    }

    $effect(() => {
        if (value) generateQR();
    });
</script>

<div class="qr-container">
    {#if qrDataUrl}
        <div class="qr-frame">
            <img src={qrDataUrl} alt="QR Code" class="qr-image" />
        </div>

        <div class="qr-actions">
            <button onclick={downloadPNG} class="qr-btn">
                <span>PNG</span>
            </button>
            <button onclick={downloadSVG} class="qr-btn">
                <span>SVG</span>
            </button>
        </div>
    {/if}
</div>

<style>
    .qr-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        background: var(--bg);
        padding: 1.5rem;
        border: 2px solid var(--border);
    }

    .qr-frame {
        background: white; /* Always white for QR contrast */
        padding: 0.75rem;
        border: 2px solid #000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .qr-image {
        display: block;
        width: 160px;
        height: 160px;
        image-rendering: pixelated;
    }

    .qr-actions {
        display: flex;
        gap: 0.5rem;
        width: 100%;
    }

    .qr-btn {
        flex: 1;
        padding: 0.5rem;
        background: transparent;
        color: var(--fg);
        border: 2px solid var(--border);
        font-size: 0.65rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        cursor: pointer;
        transition: all 0.1s ease;
    }

    .qr-btn:hover {
        background: var(--fg);
        color: var(--bg);
    }
</style>
