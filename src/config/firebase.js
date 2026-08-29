import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyAe7DplDxb8E5brZ3pXXx9iUTvZnIC72qU",
    authDomain: "whatsapp-mern-1ae85.firebaseapp.com",
    databaseURL: "https://whatsapp-mern-1ae85.firebaseio.com",
    projectId: "whatsapp-mern-1ae85",
    storageBucket: "whatsapp-mern-1ae85.appspot.com",
    messagingSenderId: "556316793534",
    appId: "1:556316793534:web:f0707e4c1cfb206c9d9cef"
};

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)
const provider = new GoogleAuthProvider()

export { auth, provider }
export default db
