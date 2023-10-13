<script lang="ts">
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import Button from '../components/button.svelte';
	import Input from '../components/input.svelte';
	import { auth } from '../utils/firebase';

	let email = '';
	let password = '';
	let message = '';

	let buttonText: 'Login' | 'Please wait...' = 'Login';

	const register = async () => {
		buttonText = 'Please wait...';
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			if (error instanceof Error) {
				message = error.message;
			}
		}
		buttonText = 'Login';
	};
</script>

<form on:submit|preventDefault={() => register()} class="flex flex-col gap-4 items-center">
	<span class="text-lg font-medium">Login</span>
	<Input type="email" bind:value={email} required placeholder="Email" />
	<Input type="password" bind:value={password} required placeholder="Password" />
	<Button buttonType="submit">{buttonText}</Button>
	<span class="text-sm mt-2 text-red-500">{message}</span>
</form>
