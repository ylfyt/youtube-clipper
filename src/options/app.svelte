<script lang="ts">
	import { onMount } from 'svelte';
	import { storageDriver } from '../storage-driver';
	import { storage } from './stores/store';
	import Home from './pages/home.svelte';
	import Container from './components/container.svelte';
	import MoonIcon from '../assets/svg/moon-icon.svelte';
	import SunIcon from '../assets/svg/sun-icon.svelte';
	import Button from './components/button.svelte';
	import { auth } from './utils/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { authUser } from './stores/user-store';

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
	});

	onAuthStateChanged(auth, async (user) => {
		authUser.set(user);
	});

	const login = async () => {};
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
					<Button onClick={() => login()}>Login</Button>
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
