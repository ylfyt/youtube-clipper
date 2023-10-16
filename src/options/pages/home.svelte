<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../components/button.svelte';
	import Input from '../components/input.svelte';
	import { storage } from '../stores/store';
	import Switch from '../components/switch.svelte';
	import { authUser } from '../stores/user-store';
	import { DocumentReference, doc, getDoc, setDoc } from 'firebase/firestore';
	import { db } from '../utils/firebase';
	import type { IStorage } from '../../storage-driver';

	let included = '';
	let message = '';
	let loop = false;
	let rewindTime: string = '';
	let forwardTime: string = '';
	let syncedStorage: IStorage | undefined = undefined;

	onMount(() => {
		included = $storage.includedUrls.join(', ');
		rewindTime = $storage.rewindTime!.toString();
		forwardTime = $storage.forwardTime!.toString();
		loop = $storage.alwaysLoop!;
	});

	const getUserDoc = async () => {
		if (!$authUser) {
			return;
		}
		const docRef = doc(db, 'clipper', $authUser.uid) as DocumentReference<IStorage>;
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			return;
		}
		syncedStorage = docSnap.data();
		console.log('SYNC', syncedStorage);
	};

	$: $authUser, getUserDoc();

	const sync = async () => {
		if (!$authUser) {
			return;
		}
		try {
			if (!syncedStorage) {
				syncedStorage = $storage;
			}
			for (let key of Object.keys($storage.videos)) {
				const val = $storage.videos[key];
				syncedStorage.videos[key] = val;
			}

			const docRef = doc(db, 'clipper', $authUser.uid) as DocumentReference<IStorage>;
			await setDoc(docRef, syncedStorage);
			message = 'Saved';
		} catch (error) {
			console.log('ERROR', error);
			if (error instanceof Error) {
				message = error.message;
			}
		}
	};

	const save = async () => {
		const rewind = parseInt(rewindTime);
		const forward = parseInt(forwardTime);
		if (isNaN(rewind) || rewind < 0) {
			message = 'Rewind time must be > 0';
			return;
		}
		if (isNaN(forward) || forward < 0) {
			message = 'Forward time must be > 0';
			return;
		}

		const stringWithoutSpaces = included
			.split('')
			.filter((char) => !/\s/.test(char))
			.join('');

		storage.update((prev) => {
			if (stringWithoutSpaces == '') {
				prev.includedUrls = [];
			} else {
				prev.includedUrls = stringWithoutSpaces.split(',');
			}
			prev.rewindTime = rewind;
			prev.forwardTime = forward;
			prev.alwaysLoop = loop;
			return prev;
		});
		if (!$authUser) {
			message = 'Saved';
			return;
		}
		sync();
	};
</script>

<div class="flex flex-col items-center gap-4">
	<div class="w-full">
		<label for="included" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Included URLs for Tab Control</label>
		<Input bind:value={included} placeholder="youtube.com, zoom.com" />
	</div>
	<div class="flex gap-2 w-full">
		<div class="w-full">
			<label for="included" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rewind Time (s)</label>
			<Input bind:value={rewindTime} placeholder="10" />
		</div>
		<div class="w-full">
			<label for="included" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Forward Time (s)</label>
			<Input bind:value={forwardTime} placeholder="10" />
		</div>
	</div>
	<div class="flex items-center justify-between w-full">
		<span class="text-sm font-medium">Always loop Youtube (except playlist)</span>
		<Switch bind:isChecked={loop} />
	</div>
	<Button onClick={() => save()}>Save</Button>
	{#if message.length !== 0}
		<div>{message}</div>
	{/if}
</div>
