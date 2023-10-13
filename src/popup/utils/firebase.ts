import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
	apiKey: 'AIzaSyBRl0r-ZwEISGOMelE8VjUSioaY-FHn5zs',
	authDomain: 'clips-88ad5.firebaseapp.com',
	projectId: 'clips-88ad5',
	storageBucket: 'clips-88ad5.appspot.com',
	messagingSenderId: '298998233112',
	appId: '1:298998233112:web:84faf36022a69b750f2b6d',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
