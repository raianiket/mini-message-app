import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyAe7DplDxb8E5brZ3pXXx9iUTvZnIC72qU",
    authDomain: "whatsapp-mern-1ae85.firebaseapp.com",
    databaseURL: "https://whatsapp-mern-1ae85.firebaseio.com",
    projectId: "whatsapp-mern-1ae85",
    storageBucket: "whatsapp-mern-1ae85.appspot.com",
    messagingSenderId: "556316793534",
    appId: "1:556316793534:web:f0707e4c1cfb206c9d9cef"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();


export { auth, provider }
export default db
