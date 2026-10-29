import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
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

const ADMIN_UID = "ulqv1ilJRxWp6ZsZt8RiK5H6XMN2";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.authUI = {
  signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },
  signOut() {
    return signOut(auth);
  }
};

function staffSafeData(data) {
  return {
    id: data.id,
    brideName: data.brideName || "",
    groomName: data.groomName || "",
    eventType: data.eventType || "",
    eventDate: data.eventDate || "",
    eventTime: data.eventTime || "",
    status: data.status || "tentative"
  };
}

function createAdminCloud() {
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
    async setReservation(data) {
      await setDoc(doc(db, "reservations", data.id), data);
      await setDoc(doc(db, "staffReservations", data.id), staffSafeData(data));
    },
    async deleteReservation(id) {
      await deleteDoc(doc(db, "reservations", id));
      await deleteDoc(doc(db, "staffReservations", id));
    },
    setPackage(data) {
      return setDoc(doc(db, "packages", data.id), data);
    },
    deletePackage(id) {
      return deleteDoc(doc(db, "packages", id));
    },
    async syncStaffReservations() {
      const snapshot = await getDocs(collection(db, "reservations"));
      for (const item of snapshot.docs) {
        const data = item.data();
        await setDoc(doc(db, "staffReservations", item.id), staffSafeData({ ...data, id: item.id }));
      }
      return snapshot.size;
    }
  };
}

function createStaffCloud() {
  return {
    onReservations(callback) {
      return onSnapshot(
        collection(db, "staffReservations"),
        snapshot => callback(snapshot.docs.map(d => d.data())),
        error => console.error("Personel rezervasyonları yüklenemedi:", error)
      );
    }
  };
}

window.cloud = null;
window.staffCloud = null;

window.authState = { ready: false, signedIn: false, email: null, role: null };

onAuthStateChanged(auth, async user => {
  window.cloud = null;
  window.staffCloud = null;

  if (!user) {
    window.authState = { ready: true, signedIn: false, email: null, role: null };
    window.dispatchEvent(new Event("auth-state-changed"));
    return;
  }

  try {
    if (user.uid === ADMIN_UID) {
      window.cloud = createAdminCloud();
      window.authState = { ready: true, signedIn: true, email: user.email, role: "admin" };
      window.dispatchEvent(new Event("auth-state-changed"));
      window.dispatchEvent(new Event("cloud-ready"));
      try {
        const count = await window.cloud.syncStaffReservations();
        console.log("Personel kayıtları eşitlendi:", count);
      } catch (error) {
        console.error("Personel kayıtları eşitlenemedi:", error);
      }
      return;
    }

    const staffDoc = await getDoc(doc(db, "staff", user.uid));
    if (staffDoc.exists() && staffDoc.data().role === "staff") {
      window.staffCloud = createStaffCloud();
      window.authState = { ready: true, signedIn: true, email: user.email, role: "staff" };
    } else {
      await signOut(auth);
      window.authState = { ready: true, signedIn: false, email: null, role: null };
    }
  } catch (error) {
    console.error("Kullanıcı yetkisi kontrol edilemedi:", error);
    window.cloud = null;
    window.staffCloud = null;
    window.authState = { ready: true, signedIn: false, email: null, role: null };
  }

  window.dispatchEvent(new Event("auth-state-changed"));
  if (window.staffCloud) {
    window.dispatchEvent(new Event("staff-cloud-ready"));
  }
});
