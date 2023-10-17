<script lang="ts">
	import { onMount } from 'svelte';
	import CutIcon from '../assets/svg/cut-icon.svelte';
	import SettingIcon from '../assets/svg/setting-icon.svelte';
	import VolumeIcon from '../assets/svg/volume-icon.svelte';
	import { storageDriver, type IStorage } from '../storage-driver';
	import AudioController from './pages/audio-controller.svelte';
	import ClipperPage from './pages/clipper-page.svelte';
	import { storage } from './stores/storage';
	import MoonIcon from '../assets/svg/moon-icon.svelte';
	import SunIcon from '../assets/svg/sun-icon.svelte';
	import { onAuthStateChanged } from 'firebase/auth';
	import { auth, db } from './utils/firebase';
	import { authUser } from './stores/user-store';
	import ExitIcon from '../assets/svg/exit-icon.svelte';
	import { DocumentReference, doc, getDoc, setDoc } from 'firebase/firestore';
	import type { IVideo } from '../interfaces/video';

	let init = false;
	let isLight: boolean = false;
	let isClipper = false;
	let loadingUser = true;

	const updateTheme = () => {
		if (!init) {
			return;
		}
		storage.update((prev) => {
			prev.isLight = isLight;
			return prev;
		});
		if (isLight) {
			document.body.classList.remove('dark');
		} else {
			document.body.classList.add('dark');
		}
	};

	const sync = async (newStorage: IStorage) => {
		if (!$authUser) {
			return;
		}
		try {
			const docRef = doc(db, 'clipper', $authUser.uid) as DocumentReference<IStorage>;
			await setDoc(docRef, newStorage);
		} catch (error) {
			console.log('ERROR', error);
		}
	};

	$: isLight, updateTheme();
	$: $storage,
		(async () => {
			if (!init) {
				return;
			}
			await storageDriver.set($storage);
			sync($storage);
		})();

	onMount(async () => {
		const res = await storageDriver.get();
		storage.set(res);
		isLight = res.isLight;
		init = true;
	});

	onAuthStateChanged(auth, async (user) => {
		loadingUser = false;
		console.log('USER', user);
		authUser.set(user);
		if (!user) {
			return;
		}
		try {
			const docRef = doc(db, 'clipper', user.uid) as DocumentReference<IStorage>;
			const docSnap = await getDoc(docRef);
			const synced = docSnap.data();
			if (!synced) {
				sync($storage);
				return;
			}
			if (synced.lastSync === $storage.lastSync) {
				return;
			}
			const videos: { [key: string]: IVideo } = {};
			for (let id of Object.keys(synced.videos)) {
				videos[id] = synced.videos[id];
			}
			for (let id of Object.keys($storage.videos)) {
				videos[id] = $storage.videos[id];
			}
			const cloudBehind = synced.lastSync! < $storage.lastSync!;
			storage.update((prev) => {
				return {
					videos,
					lastSync: new Date().getTime(),
					includedUrls: cloudBehind ? prev.includedUrls : synced.includedUrls,
					isLight: cloudBehind ? prev.isLight : synced.isLight,
					alwaysLoop: cloudBehind ? prev.alwaysLoop : synced.alwaysLoop,
					forwardTime: cloudBehind ? prev.forwardTime : synced.forwardTime,
					rewindTime: cloudBehind ? prev.rewindTime : synced.rewindTime,
				};
			});
		} catch (error) {
			console.log('ERROR', error);
		}
	});
</script>

<main class="min-w-[500px] p-2 bg-light dark:bg-dark flex flex-col items-center text-dark dark:text-light">
	<div class="flex items-center gap-2 w-full">
		<button
			on:click={() => {
				isLight = !isLight;
			}}
			class="fill-yellow-400 mr-1"
		>
			{#if isLight}
				<MoonIcon width={18} />
			{:else}
				<SunIcon width={18} />
			{/if}
		</button>
		<a href="../options/index.html" target="_blank" class="fill-orange-600 mr-4"> <SettingIcon width={18} /> </a>
		<button
			on:click={() => {
				isClipper = true;
			}}
			class={`fill-red-500 rounded py-1 w-full flex items-center justify-center gap-2 text-sm font-semibold ${
				isClipper ? 'bg-color0  dark:fill-white dark:text-white fill-dark text-dark' : 'bg-slate-300 text-dark'
			}`}
		>
			<CutIcon width={20} />
			<span>Youtube Clipper</span>
		</button>
		<button
			on:click={() => {
				isClipper = false;
			}}
			class={`fill-red-500 rounded py-1 w-full flex items-center justify-center gap-2 text-sm font-semibold ${
				isClipper ? 'bg-slate-300 text-dark' : 'bg-color0  dark:fill-white dark:text-white fill-dark text-dark'
			}`}
		>
			<VolumeIcon width={20} />
			<span>Media Control</span>
		</button>
		{#if $authUser || loadingUser}
			<button
				title="Logout"
				on:click={async () => {
					if (loadingUser) return;
					const yes = confirm('Are you sure to logout?');
					if (!yes) {
						return;
					}
					await auth.signOut();
				}}
				class="fill-red-500 mr-1"
			>
				<ExitIcon width={24} height={24} />
			</button>
		{/if}
	</div>
	<div class="h-[2px] bg-color0 w-full mt-2 mb-2" />
	{#if isClipper}
		<ClipperPage />
	{:else}
		<AudioController />
	{/if}
</main>
