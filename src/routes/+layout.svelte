<script lang="ts">
	import '../app.css';
	import type { SiteConfig } from '$lib/types';
	import NavBar from '$lib/components/nav-bar.svelte';
	let { children, data }: { children: import('svelte').Snippet; data: SiteConfig } = $props();
</script>

<div class="flex w-screen h-screen flex-col overflow-x-hidden">
	<NavBar {data} />
	<div class="mt-15 flex flex-1 pb-12 sm:p-0">{@render children()}</div>
</div>
