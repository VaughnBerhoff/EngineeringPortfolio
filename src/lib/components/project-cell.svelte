<script lang="ts">
	import type { ContentType } from '$lib/types';
	import ModelViewer from './model-viewer.svelte';
	let { type, content }: { type: ContentType; content: string } = $props();
</script>

{#if type == 'title'}
	<div class="m-4 flex flex-1 items-center justify-center text-3xl font-bold">{content}</div>
{:else if type == 'text'}
	<div class="m-4 overflow-y-auto">{content}</div>
{:else if type == 'image'}
	<div class="m-4 flex max-h-full justify-center">
		<img src={content} alt={content} class="object-contain" />
	</div>
{:else if type == 'model'}
	<div class="flex aspect-square w-full md:aspect-auto">
		<ModelViewer modelUrl={content} />
	</div>
{:else if type == 'video'}
	{@const videoId = (() => {
		const regexes = [
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
			/youtube\.com\/watch\?.*v=([^&\n?#]+)/
		];
		for (const regex of regexes) {
			const match = content.match(regex);
			if (match) return match[1];
		}
		return content;
	})()}
	<iframe
		class="h-full w-full border-0"
		src="https://www.youtube.com/embed/{videoId}"
		title="YouTube video player"
		frameborder=0
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
		allowfullscreen
	></iframe>
{:else}
	<div>Invalid Content Type</div>
{/if}
