<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls, Grid, GLTF } from '@threlte/extras';
	import type { GLTF as GLTFType } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { AnimationMixer, Clock, Box3, Vector3 } from 'three';
	import { onMount, onDestroy } from 'svelte';
	import MaterialSymbolsPlayCircleOutline from '~icons/material-symbols/play-circle-outline';
	import MaterialSymbolsAndroidCameraOutline from '~icons/material-symbols/android-camera-outline';

	// Component props
	interface Props {
		modelUrl: string;
		animationDuration?: number; // Animation duration in milliseconds
		smoothingFactor?: number; // How much smoothing to apply (0.1-0.3)
		fitPadding?: number; // Padding around model bounds (1.2 = 20% padding)
		cameraAnimationDuration?: number; // How long camera refit animation takes
	}

	let {
		modelUrl,
		animationDuration = 1000,
		smoothingFactor = 0.15,
		fitPadding = 1.2,
		cameraAnimationDuration = 1000
	}: Props = $props();

	// State variables
	let gltf = $state<GLTFType | undefined>(undefined);
	let mixer = $state<AnimationMixer | undefined>(undefined);
	let hasAnalyzed = $state(false);
	let isExploded = $state(false);
	let isAnimating = $state(false);
	let isCameraAnimating = $state(false);
	let inheritedColor = $state('#ffffff'); // Default fallback color

	// Camera and scale variables
	let cameraPosition = $state<[number, number, number]>([-5, 6, 10]);
	let cameraTarget = $state<[number, number, number]>([0, 0, 0]);
	let gridCellSize = $state(2);
	let gridPosition = $state<[number, number, number]>([0, -0.001, 0]);
	let orbitControlsRef = $state<any>(null);

	// Fixed lighting positions
	let lightPositions = $state({
		directional1: [5, 10, 5] as [number, number, number],
		directional2: [-3, 5, -2] as [number, number, number],
		directional3: [-2, 2, 8] as [number, number, number]
	});

	// Camera animation variables
	let cameraAnimationStartTime = 0;
	let cameraStartPosition: [number, number, number] = [-5, 6, 10];
	let cameraTargetPosition: [number, number, number] = [-5, 6, 10];
	let cameraStartTarget: [number, number, number] = [0, 0, 0];
	let cameraTargetTarget: [number, number, number] = [0, 0, 0];

	// Animation variables
	let currentPosition = $state(0); // Current animation position (0-1)
	let smoothedPosition = $state(0); // Smoothed position for rendering
	let animationStartTime = 0;
	let animationStartPosition = 0;
	let animationTargetPosition = 0;

	const clock = new Clock();
	let animationFrameId: number;
	let containerRef: HTMLDivElement;

	// Function to read inherited color from parent elements
	function updateInheritedColor() {
		if (containerRef) {
			const computedStyle = getComputedStyle(containerRef);
			inheritedColor = computedStyle.color;
			console.log('Inherited color:', inheritedColor);
		}
	}

	// Main animation loop with smoothing and camera animation
	onMount(() => {
		// Read the inherited color when component mounts
		updateInheritedColor();

		const animate = () => {
			// Handle model explosion animation
			if (isAnimating && mixer && gltf?.animations?.[0]) {
				const elapsed = performance.now() - animationStartTime;
				const progress = Math.min(elapsed / animationDuration, 1);

				// Smooth easing function (ease-in-out)
				const easedProgress =
					progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

				// Calculate target position
				const targetPosition =
					animationStartPosition +
					(animationTargetPosition - animationStartPosition) * easedProgress;

				// Apply exponential smoothing to reduce choppiness
				currentPosition = targetPosition;
				smoothedPosition += (currentPosition - smoothedPosition) * smoothingFactor;

				// Apply smoothed position to animation
				const action = mixer.clipAction(gltf.animations[0]);
				action.paused = true;
				action.time = smoothedPosition * gltf.animations[0].duration;
				mixer.update(0);

				// Stop animation when complete
				if (progress >= 1) {
					isAnimating = false;
					smoothedPosition = animationTargetPosition;
					currentPosition = animationTargetPosition;
					isExploded = currentPosition > 0.5;

					// Final update to exact position
					action.time = smoothedPosition * gltf.animations[0].duration;
					mixer.update(0);
				}
			}

			// Handle camera animation
			if (isCameraAnimating) {
				const elapsed = performance.now() - cameraAnimationStartTime;
				const progress = Math.min(elapsed / cameraAnimationDuration, 1);

				// Smooth easing for camera movement
				const easedProgress =
					progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

				// Interpolate camera position
				const newCameraPos: [number, number, number] = [
					cameraStartPosition[0] +
						(cameraTargetPosition[0] - cameraStartPosition[0]) * easedProgress,
					cameraStartPosition[1] +
						(cameraTargetPosition[1] - cameraStartPosition[1]) * easedProgress,
					cameraStartPosition[2] +
						(cameraTargetPosition[2] - cameraStartPosition[2]) * easedProgress
				];

				// Interpolate camera target
				const newCameraTarget: [number, number, number] = [
					cameraStartTarget[0] + (cameraTargetTarget[0] - cameraStartTarget[0]) * easedProgress,
					cameraStartTarget[1] + (cameraTargetTarget[1] - cameraStartTarget[1]) * easedProgress,
					cameraStartTarget[2] + (cameraTargetTarget[2] - cameraStartTarget[2]) * easedProgress
				];

				// Update OrbitControls directly for smooth animation
				if (orbitControlsRef) {
					orbitControlsRef.object.position.set(...newCameraPos);
					orbitControlsRef.target.set(...newCameraTarget);
					orbitControlsRef.update();
				}

				// Also update our state for reactivity
				cameraPosition = newCameraPos;
				cameraTarget = newCameraTarget;

				// Stop camera animation when complete
				if (progress >= 1) {
					isCameraAnimating = false;
					cameraPosition = cameraTargetPosition;
					cameraTarget = cameraTargetTarget;
					if (orbitControlsRef) {
						orbitControlsRef.object.position.set(...cameraTargetPosition);
						orbitControlsRef.target.set(...cameraTargetTarget);
						orbitControlsRef.update();
					}
				}
			}

			animationFrameId = requestAnimationFrame(animate);
		};

		animate();
	});

	onDestroy(() => {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
		if (mixer) {
			mixer.stopAllAction();
			mixer.uncacheRoot(mixer.getRoot());
		}
	});

	// Set up initial grid and lighting (called once on model load)
	function setupInitialScene() {
		if (!gltf?.scene) return;

		// Get initial model bounds for grid setup
		const box = new Box3().setFromObject(gltf.scene);
		const size = box.getSize(new Vector3());
		const center = box.getCenter(new Vector3());
		const maxDimension = Math.max(size.x, size.y, size.z);

		// Set grid size once (never changes after this)
		gridCellSize = Math.max(0.5, maxDimension * 0.08);
		gridPosition = [center.x, center.y - size.y / 2 - 0.001, center.z];

		// Set fixed lighting positions (relative to initial model center, never changes)
		lightPositions = {
			directional1: [center.x + 5, center.y + 10, center.z + 5],
			directional2: [center.x - 3, center.y + 5, center.z - 2],
			directional3: [center.x - 2, center.y + 2, center.z + 8]
		};

		console.log('Initial scene setup:', {
			gridCellSize,
			gridPosition,
			lightPositions
		});
	}

	// Refit camera to current model bounds while preserving viewing angle
	function refitCamera() {
		if (!gltf?.scene || isCameraAnimating) return;

		// Get current bounding box of the model in its current state
		const box = new Box3().setFromObject(gltf.scene);
		const size = box.getSize(new Vector3());
		const center = box.getCenter(new Vector3());

		// Calculate the maximum dimension
		const maxDimension = Math.max(size.x, size.y, size.z);

		// Calculate optimal distance for fitting
		const fittingSize = maxDimension * fitPadding;
		const fov = 25 * (Math.PI / 180); // Convert to radians
		const distance = fittingSize / (2 * Math.tan(fov / 2));

		// Get current camera direction (preserve user's viewing angle)
		let currentCameraPos = new Vector3(...cameraPosition);
		let currentTarget = new Vector3(...cameraTarget);

		// If OrbitControls exist, get the real current position and target
		if (orbitControlsRef) {
			currentCameraPos = orbitControlsRef.object.position.clone();
			currentTarget = orbitControlsRef.target.clone();
		}

		// Calculate current viewing direction (from target to camera)
		const viewDirection = currentCameraPos.clone().sub(currentTarget).normalize();

		// Position camera at optimal distance in the same direction from new center
		const newCameraPosition: [number, number, number] = [
			center.x + viewDirection.x * distance,
			center.y + viewDirection.y * distance,
			center.z + viewDirection.z * distance
		];

		const newCameraTarget: [number, number, number] = [center.x, center.y, center.z];

		// Start smooth camera animation to new position (no grid/lighting changes)
		cameraAnimationStartTime = performance.now();
		cameraStartPosition = [currentCameraPos.x, currentCameraPos.y, currentCameraPos.z];
		cameraTargetPosition = newCameraPosition;
		cameraStartTarget = [currentTarget.x, currentTarget.y, currentTarget.z];
		cameraTargetTarget = newCameraTarget;
		isCameraAnimating = true;

		console.log('Camera refit (camera only):', {
			bounds: { size, center },
			currentViewDirection: viewDirection,
			distance,
			newCameraPosition
		});
	}
	// Analyze GLB when it loads
	$effect(() => {
		if (gltf && !hasAnalyzed) {
			hasAnalyzed = true;

			// Set up grid and lighting first (only happens once)
			setupInitialScene();

			if (gltf.animations.length > 0) {
				// Clean up any existing mixer
				if (mixer) {
					mixer.stopAllAction();
					mixer.uncacheRoot(mixer.getRoot());
				}

				// Create new mixer
				mixer = new AnimationMixer(gltf.scene);

				gltf.animations.forEach((clip) => {
					// Apply smooth interpolation to all tracks for better quality
					clip.tracks.forEach((track) => {
						if (track.setInterpolation) {
							track.setInterpolation(2301); // THREE.InterpolateSmooth
						}
					});

					const action = mixer!.clipAction(clip);
					action.paused = true;
					action.time = 0; // Start collapsed
					action.play();
				});

				// Initialize at collapsed state
				currentPosition = 0;
				smoothedPosition = 0;
				mixer.update(0);
			}

			// Auto-refit camera when model loads (after scene setup)
			setTimeout(() => refitCamera(), 100); // Small delay to ensure model is fully loaded
		}
	});

	// Start animation to target position
	function animateToPosition(targetPosition: number) {
		if (mixer && gltf?.animations?.[0] && !isAnimating) {
			animationStartTime = performance.now();
			animationStartPosition = smoothedPosition; // Use smoothed position as start
			animationTargetPosition = targetPosition;
			isAnimating = true;
		}
	}

	// Explode to 100%
	function explodeModel() {
		animateToPosition(1.0); // Go to 100% of animation
	}

	// Collapse to 0%
	function collapseModel() {
		animateToPosition(0.0); // Go to 0% of animation
	}

	// Toggle between exploded and collapsed
	function toggleExplode() {
		if (isExploded) {
			collapseModel();
		} else {
			explodeModel();
		}
	}
</script>

<div bind:this={containerRef} class="relative w-full h-full">
	<Canvas renderMode="always">
		<!-- Camera with mouse controls -->
		<T.PerspectiveCamera makeDefault position={cameraPosition} fov={25}>
			<OrbitControls enableDamping target={cameraTarget} bind:ref={orbitControlsRef} />
		</T.PerspectiveCamera>

		<!-- Fixed lighting -->
		<T.DirectionalLight
			intensity={2.5}
			position={lightPositions.directional1}
			castShadow
			shadow.bias={-0.0001}
			shadow.camera.left={-10}
			shadow.camera.right={10}
			shadow.camera.top={10}
			shadow.camera.bottom={-10}
		/>

		<T.DirectionalLight intensity={0.8} position={lightPositions.directional2} color="#ffffff" />

		<T.DirectionalLight intensity={0.6} position={lightPositions.directional3} color="#e6f3ff" />

		<T.AmbientLight intensity={0.5} />

		<!-- 3D Model -->
		<GLTF url={modelUrl} bind:gltf />

		<!-- Grid background -->
		<Grid
			position={gridPosition}
			cellColor={inheritedColor}
			sectionColor={inheritedColor}
			sectionThickness={0}
			fadeDistance={25}
			cellSize={gridCellSize}
		/>
	</Canvas>

	<!-- Control Buttons -->
	{#if gltf?.animations && gltf.animations.length > 0}
		<div class="absolute top-4 right-4 z-5 flex gap-2">
			<!-- Explode/Collapse Button -->
			<button
				class="
		relative h-12 w-12 cursor-pointer rounded-lg
		bg-white/10 shadow-lg
		backdrop-blur-md transition-all duration-200 ease-out
		before:pointer-events-none before:absolute
		before:inset-0 before:rounded-lg before:border
		hover:-translate-y-0.5 hover:shadow-xl
		disabled:cursor-not-allowed
		disabled:opacity-50 disabled:hover:translate-y-0
		{isAnimating ? 'cursor-not-allowed opacity-50' : ''}
		"
				style="
		--inherited-color: {inheritedColor};
		"
				onclick={toggleExplode}
				disabled={isAnimating}
			>
				<MaterialSymbolsPlayCircleOutline class="w-full h-full p-2"/>
			</button>
			<!-- Refit Camera Button -->
			<button
				class="
		relative h-12 w-12 cursor-pointer rounded-lg
		bg-white/10 shadow-lg
		backdrop-blur-md transition-all duration-200 ease-out
		before:pointer-events-none before:absolute
		before:inset-0 before:rounded-lg before:border
		hover:-translate-y-0.5 hover:shadow-xl
		disabled:cursor-not-allowed
		disabled:opacity-50 disabled:hover:translate-y-0
		{isCameraAnimating ? 'cursor-not-allowed opacity-50' : ''}
		"
				style="
		--inherited-color: {inheritedColor};
		"
				onclick={refitCamera}
				disabled={isCameraAnimating}
			>
				<MaterialSymbolsAndroidCameraOutline class="w-full h-full p-2" />
			</button>
		</div>

		<style>
			button::before {
				border-color: color-mix(in srgb, var(--inherited-color) 40%, transparent) !important;
			}
			button:hover::before {
				background-color: color-mix(in srgb, var(--inherited-color) 30%, transparent) !important;
			}
		</style>
	{/if}
</div>
