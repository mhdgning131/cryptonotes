<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";

	let { children } = $props();
	let theme = $state("light");

	function toggleTheme() {
		theme = theme === "light" ? "dark" : "light";
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}

	onMount(() => {
		theme = document.documentElement.getAttribute("data-theme") || "light";
	});
</script>

<div class="app-wrap">
	<header class="main-header">
		<div class="header-inner">
			<a href="/" class="brand">
				<img src="/logo.svg" alt="CryptoNotes Logo" class="logo-img" />
				<span class="brand-text"
					>Crypto<span class="brand-thin">Notes</span></span
				>
			</a>
			<button onclick={toggleTheme} class="theme-btn">
				<span class="theme-icon">{theme === "light" ? "●" : "○"}</span>
				{theme === "light" ? "Dark" : "Light"}
			</button>
		</div>
	</header>

	<main class="content-area">
		{@render children()}
	</main>

	<footer class="main-footer">
		<div class="footer-content">
			<a href="/how-it-works" class="footer-tag">E2E Encryption</a>
			<a href="/how-it-works" class="footer-tag">Zero Knowledge</a>
			<a href="/how-it-works" class="footer-tag">Open Source</a>
		</div>
		<p class="copyright">
			&copy; {new Date().getFullYear()} CRYPTONOTES
		</p>
	</footer>
</div>

<style>
	.app-wrap {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-header {
		padding: 1rem 2rem;
		border-bottom: 1px solid var(--border);
	}

	.header-inner {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.brand {
		text-decoration: none;
		color: var(--fg);
		font-weight: 900;
		font-size: 1.5rem;
		letter-spacing: -0.05em;
		text-transform: uppercase;
		display: flex;
		align-items: center;
	}

	.brand-thin {
		font-weight: 300;
		opacity: 0.5;
	}

	.theme-btn {
		padding: 0.5rem 1rem;
		font-size: 0.7rem;
		border: 1px solid var(--border);
		box-shadow: none;
	}

	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.main-footer {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		opacity: 0.5;
	}

	.footer-content {
		display: flex;
		gap: 2rem;
	}

	.footer-tag {
		font-size: 0.55rem;
		font-weight: 900;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		text-decoration: underline;
		color: inherit;
	}

	.copyright {
		font-size: 0.5rem;
		font-weight: 700;
		letter-spacing: 0.3em;
	}

	@media (max-width: 640px) {
		.main-header {
			padding: 1rem;
		}
		.footer-content {
			gap: 1rem;
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>
