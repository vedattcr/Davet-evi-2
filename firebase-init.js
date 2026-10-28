
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  initializeFirestore,
  persistentLocalCache,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAG4LJqF4EGgIt0J19TWAgFchiK7cCqJJU",
  authDomain: "davet-evi-1e86f.firebaseapp.com",
  projectId: "davet-evi-1e86f",
  storageBucket: "davet-evi-1e86f.firebasestorage.app",
  messagingSenderId: "880120724916",
  appId: "1:880120724916:web:5e9f6a3ff693d18af906e1",
  measurementId: "G-YQPQ36BN9T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.authUI = {
  signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },
  signOut() {
    return signOut(auth);
  }
};

let db;

try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache()
  });
} catch (error) {
  console.error("Firestore başlatma hatası:", error);
}

function createCloud() {
  if (!db) return null;

  return {
    onReservations(callback) {
      return onSnapshot(
        collection(db, "reservations"),
        snapshot => callback(snapshot.docs.map(d => d.data())),
        error => console.error("Rezervasyon senkronizasyon hatası:", error)
      );
    },

    onPackages(callback) {
      return onSnapshot(
        collection(db, "packages"),
        snapshot => callback(snapshot.docs.map(d => d.data())),
        error => console.error("Paket senkronizasyon hatası:", error)
      );
    },

    setReservation(data) {
      return setDoc(doc(db, "reservations", data.id), data)
        .catch(error => console.error("Rezervasyon kaydedilemedi:", error));
    },

    deleteReservation(id) {
      return deleteDoc(doc(db, "reservations", id))
        .catch(error => console.error("Rezervasyon silinemedi:", error));
    },

    setPackage(data) {
      return setDoc(doc(db, "packages", data.id), data)
        .catch(error => console.error("Paket kaydedilemedi:", error));
    },

    deletePackage(id) {
      return deleteDoc(doc(db, "packages", id))
        .catch(error => console.error("Paket silinemedi:", error));
    }
  };
}

window.cloud = null;

onAuthStateChanged(auth, user => {
  if (user && db) {
    window.cloud = createCloud();
    window.dispatchEvent(new Event("cloud-ready"));
  } else {
    window.cloud = null;
  }

  window.dispatchEvent(
    new CustomEvent("auth-state-changed", {
      detail: {
        signedIn: Boolean(user),
        email: user ? user.email : null
      }
    })
  );
});
