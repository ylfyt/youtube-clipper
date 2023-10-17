<script lang="ts">
	import { onMount } from 'svelte';
	import { storageDriver, type IStorage } from '../storage-driver';
	import { storage } from './stores/store';
	import Home from './pages/home.svelte';
	import Container from './components/container.svelte';
	import MoonIcon from '../assets/svg/moon-icon.svelte';
	import SunIcon from '../assets/svg/sun-icon.svelte';
	import Button from './components/button.svelte';
	import { auth, db } from './utils/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { authUser } from './stores/user-store';
	import Register from './pages/register.svelte';
	import Login from './pages/login.svelte';
	import { DocumentReference, doc, getDoc, setDoc } from 'firebase/firestore';
	import type { IVideo } from '../interfaces/video';

	let init = false;
	let isLight = true;
	let path: '' | 'register' | 'login' = '';
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
		init = true;
		storage.set(res);

		isLight = res.isLight;
	});

	onAuthStateChanged(auth, async (user) => {
		loadingUser = false;
		console.log('USER', user);
		authUser.set(user);
		if (!user) {
			return;
		}
		path = '';
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

	const logout = async () => {
		if (loadingUser) return;
		const yes = confirm('Are you sure to logout?');
		if (!yes) return;
		auth.currentUser && (await auth.signOut());
	};
</script>

<div class="h-screen bg-light dark:bg-dark text-dark dark:text-light flex justify-center">
	<Container>
		<div class="flex justify-between items-center my-2 lg:my-4">
			{#if $authUser}
				<span class="text-sm"> Hey, {$authUser.email} 👋</span>
			{:else}
				<span class="text-lg">Options</span>
			{/if}
			<div class="flex gap-4">
				<button
					class="fill-yellow-400"
					on:click={() => {
						isLight = !isLight;
					}}
				>
					{#if isLight}
						<MoonIcon width={18} />
					{:else}
						<SunIcon width={18} />
					{/if}
				</button>
				{#if $authUser || loadingUser}
					<Button className="bg-red-500" onClick={() => logout()}>Logout</Button>
				{:else if path !== ''}
					<Button onClick={() => (path = '')}>Back</Button>
				{:else}
					<Button onClick={() => (path = 'register')}>Register</Button>
					<Button onClick={() => (path = 'login')}>Login</Button>
				{/if}
			</div>
		</div>
		<div class="py-[1px] w-full bg-color0 mb-4" />
		{#if !init}
			<div>Please wait...</div>
		{:else if path === ''}
			<Home />
		{:else if path === 'register'}
			<Register />
		{:else if path === 'login'}
			<Login />
		{/if}
	</Container>
</div>
