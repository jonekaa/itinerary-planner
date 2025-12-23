import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, or, arrayUnion, arrayRemove, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
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
        this.guestCode = localStorage.getItem('wanderlust_guest_code'); // Restore code if logged in as guest
        this.collectionRef = null;
        this.unsubscribers = [];

        this.initAuth();
    }

    initAuth() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.userId = user.uid;
                window.currentUser = user; // Expose for UI checks
                this.setupListener();
                updateNavbar(user);
                switchView('list');
                switchView('list');
            } else {
                this.cleanupListeners();
                this.userId = null;
                window.currentUser = null;
                this.collectionRef = null;
                updateNavbar(null);
                switchView('login');
            }
        });
    }

    cleanupListeners() {
        if (this.unsubscribers) {
            this.unsubscribers.forEach(unsub => unsub());
            this.unsubscribers = [];
        }
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(this.auth, provider);
    }

    async loginAsGuest(code) {
        this.guestCode = code;
        localStorage.setItem('wanderlust_guest_code', code);

        if (this.auth.currentUser && this.auth.currentUser.isAnonymous) {
            // Already logged in as guest, just refresh listener with new code
            this.setupListener();
        } else {
            await signInAnonymously(this.auth);
        }
    }



    async logout() {
        this.guestCode = null;
        localStorage.removeItem('wanderlust_guest_code');
        await signOut(this.auth);
    }

    setupListener() {
        this.cleanupListeners();
        if (!this.userId) return;
        const path = `holiday`;
        this.collectionRef = collection(this.db, path);

        // GUEST MODE
        if (this.auth.currentUser.isAnonymous && this.guestCode) {
            const qGuest = query(this.collectionRef, where("accessCode", "==", this.guestCode));

            const unsubGuest = onSnapshot(qGuest, (snapshot) => {
                const holidays = [];
                snapshot.forEach(doc => {
                    holidays.push({ id: doc.id, ...doc.data() });
                });
                this.notify(holidays);
            }, (error) => {
                console.error("Guest access error:", error);
                alert("Invalid Access Code or Permissions.");
            });
            this.unsubscribers.push(unsubGuest);
            return;
        }

        // USER MODE
        const userEmail = this.auth.currentUser.email;

        // We use two separate listeners to avoid needing a composite index for the 'OR' query
        // Listener 1: Owned holidays
        const qOwned = query(this.collectionRef, where("ownerId", "==", this.userId));

        // Listener 2: Shared holidays
        const qShared = query(this.collectionRef, where("sharedEmails", "array-contains", userEmail));

        let ownedHolidays = [];
        let sharedHolidays = [];

        const updateState = () => {
            // Merge and deduplicate (though they should be unique sets typically)
            const allHolidays = [...ownedHolidays];
            const ownedIds = new Set(ownedHolidays.map(h => h.id));

            sharedHolidays.forEach(h => {
                if (!ownedIds.has(h.id)) {
                    allHolidays.push(h);
                }
            });

            this.notify(allHolidays);
        };

        // Subscribe to Owned
        const unsubOwned = onSnapshot(qOwned, (snapshot) => {
            ownedHolidays = [];
            snapshot.forEach(doc => {
                ownedHolidays.push({ id: doc.id, ...doc.data() });
            });
            updateState();
        }, (error) => {
            console.error("Error fetching owned holidays:", error);
        });

        // Subscribe to Shared
        const unsubShared = onSnapshot(qShared, (snapshot) => {
            sharedHolidays = [];
            snapshot.forEach(doc => {
                sharedHolidays.push({ id: doc.id, ...doc.data() });
            });
            updateState();
        }, (error) => {
            console.error("Error fetching shared holidays:", error);
        });

        this.unsubscribers.push(unsubOwned, unsubShared);
    }

    async addHoliday(name) {
        if (!this.collectionRef) throw new Error("Not connected");
        await addDoc(this.collectionRef, {
            name: name,
            ownerId: this.userId,
            ownerEmail: this.auth.currentUser.email, // storing email for display purposes
            createdAt: new Date().toISOString(),
            itinerary: [],
            sharedEmails: [], // Array of strings for easy querying
            collaborators: [] // Array of objects { email, role }
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

    async generateAccessCode(holidayId) {
        if (!this.collectionRef) throw new Error("Not connected");

        // Simple 6-char random code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars (I/1, O/0)
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        await updateDoc(doc(this.collectionRef, holidayId), {
            accessCode: code
        });
        return code;
    }

    async shareHoliday(holidayId, email, role) {
        if (!this.collectionRef) throw new Error("Not connected");

        // Normalize email
        email = email.toLowerCase();

        // 1. Add to sharedEmails array for querying
        // 2. Add/Update detailed collaborator info

        // We need to handle the array of objects manually or use a specific approach. 
        // Firestore arrayUnion works for primitives or exact object matches.
        // To update a specific collaborator's role, we might need to read-modify-write or use a map structure if we redesign, 
        // but for now let's use a simple read-modify-write for the collaborators array to avoid complexity.

        const holidayRef = doc(this.collectionRef, holidayId);
        const snapshot = await getDoc(holidayRef);
        if (!snapshot.exists()) throw new Error("Holiday not found");

        const data = snapshot.data();
        let collaborators = data.collaborators || [];

        // Remove existing entry for this email if any
        collaborators = collaborators.filter(c => c.email !== email);

        // Add new entry
        collaborators.push({ email, role });

        await updateDoc(holidayRef, {
            sharedEmails: arrayUnion(email),
            collaborators: collaborators
        });
    }

    async removeCollaborator(holidayId, email) {
        if (!this.collectionRef) throw new Error("Not connected");

        email = email.toLowerCase();

        const holidayRef = doc(this.collectionRef, holidayId);
        const snapshot = await getDoc(holidayRef);
        if (!snapshot.exists()) throw new Error("Holiday not found");

        const data = snapshot.data();
        let collaborators = data.collaborators || [];

        // Filter out the email
        collaborators = collaborators.filter(c => c.email !== email);

        await updateDoc(holidayRef, {
            sharedEmails: arrayRemove(email),
            collaborators: collaborators
        });
    }
}
