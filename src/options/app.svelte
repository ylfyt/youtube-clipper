<script lang="ts">
	import { onMount } from 'svelte';
	import { storageDriver } from '../storage-driver';
	import { storage } from './stores/store';
	import Home from './pages/home.svelte';
	import Container from './components/container.svelte';
	import MoonIcon from '../assets/svg/moon-icon.svelte';
	import SunIcon from '../assets/svg/sun-icon.svelte';
	import Button from './components/button.svelte';
	import { auth, db } from './utils/firebase';
	import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
	import { authUser } from './stores/user-store';
	import { doc, getDoc, getDocs, query } from 'firebase/firestore';

	let init = false;
	let isLight = true;

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

	$: isLight, updateTheme();
	$: $storage,
		(async () => {
			if (!init) {
				return;
			}
			await storageDriver.set($storage);
		})();

	onMount(async () => {
		const res = await storageDriver.get();
		init = true;
		storage.set(res);

		isLight = res.isLight;

		const ref = doc(db, 'clipper', '1');
		getDoc(ref).then((res) => {
      const data = res.data()
			console.log('RES', data);
		});
	});

	onAuthStateChanged(auth, async (user) => {
		authUser.set(user);
	});

	const loginWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider)
			.then(() => {})
			.catch((error) => {
				console.log(error);
			});
	};

	const logout = async () => {
		auth.currentUser && (await auth.signOut());
	};
</script>

<div class="h-screen bg-light dark:bg-dark text-dark dark:text-light flex justify-center">
	<Container>
		<div class="flex justify-between items-center px-2 my-2 lg:my-4">
			<h1 class="text-lg">Options</h1>
			<div class="flex gap-4">
				{#if $authUser}
					<Button onClick={() => logout()}>Logout</Button>
				{:else}
					<Button onClick={() => loginWithGoogle()}>Login</Button>
				{/if}
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
			</div>
		</div>
		{#if !init}
			<div>Please wait...</div>
		{:else}
			<Home />
		{/if}
	</Container>
</div>
