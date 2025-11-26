import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { DataStore } from './DataStore.js';
import { switchView } from '../ui/views.js';
import { updateNavbar } from '../ui/navbar.js';

// Firebase/Firestore implementation of DataStore
export class FirebaseStore extends DataStore {
    constructor(config, appId) {
        super();
        this.app = initializeApp(config);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
        this.appId = appId;
        this.userId = null;
        this.collectionRef = null;

        this.initAuth();
    }

    initAuth() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.userId = user.uid;
                this.setupListener();
                updateNavbar(user);
                switchView('list');
            } else {
                this.userId = null;
                this.collectionRef = null;
                updateNavbar(null);
                switchView('login');
            }
        });
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(this.auth, provider);
    }

    async loginWithEmail(email, password) {
        await signInWithEmailAndPassword(this.auth, email, password);
    }

    async registerWithEmail(email, password) {
        await createUserWithEmailAndPassword(this.auth, email, password);
    }

    async logout() {
        await signOut(this.auth);
    }

    setupListener() {
        if (!this.userId) return;
        const path = `holiday`;
        this.collectionRef = collection(this.db, path);

        // Filter by ownerId to only show current user's holidays
        const q = query(this.collectionRef, where("ownerId", "==", this.userId));

        onSnapshot(q, (snapshot) => {
            const holidays = [];
            snapshot.forEach(doc => {
                holidays.push({ id: doc.id, ...doc.data() });
            });
            this.notify(holidays);
        });
    }

    async addHoliday(name) {
        if (!this.collectionRef) throw new Error("Not connected");
        await addDoc(this.collectionRef, {
            name: name,
            ownerId: this.userId,
            createdAt: new Date().toISOString(),
            itinerary: []
        });
    }

    async deleteHoliday(id) {
        if (!this.collectionRef) throw new Error("Not connected");
        await deleteDoc(doc(this.collectionRef, id));
    }

    async updateItinerary(holidayId, itinerary) {
        if (!this.collectionRef) throw new Error("Not connected");
        await updateDoc(doc(this.collectionRef, holidayId), { itinerary });
    }
}
