// Firebase/Firestore köprüsü — app.js (klasik script) bu dosyanın
// oluşturduğu window.cloud nesnesini kullanarak buluta senkronize olur.
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

let db;
try {
  // Çevrimdışıyken de çalışabilsin diye yerel önbellek açık
  db = initializeFirestore(app, { localCache: persistentLocalCache() });
} catch (e) {
  console.error("Firestore başlatılamadı:", e);
}

if (db) {
  window.cloud = {
    onReservations(callback) {
      return onSnapshot(
        collection(db, "reservations"),
        (snap) => callback(snap.docs.map((d) => d.data())),
        (err) => console.error("Rezervasyon senkronizasyon hatası:", err)
      );
    },
    onPackages(callback) {
      return onSnapshot(
        collection(db, "packages"),
        (snap) => callback(snap.docs.map((d) => d.data())),
        (err) => console.error("Paket senkronizasyon hatası:", err)
      );
    },
    setReservation(data) {
      return setDoc(doc(db, "reservations", data.id), data).catch((e) =>
        console.error("Rezervasyon buluta yazılamadı:", e)
      );
    },
    deleteReservation(id) {
      return deleteDoc(doc(db, "reservations", id)).catch((e) =>
        console.error("Rezervasyon buluttan silinemedi:", e)
      );
    },
    setPackage(data) {
      return setDoc(doc(db, "packages", data.id), data).catch((e) =>
        console.error("Paket buluta yazılamadı:", e)
      );
    },
    deletePackage(id) {
      return deleteDoc(doc(db, "packages", id)).catch((e) =>
        console.error("Paket buluttan silinemedi:", e)
      );
    }
  };
  window.dispatchEvent(new Event("cloud-ready"));
}
