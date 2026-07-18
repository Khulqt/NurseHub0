// =========================================================
// NurseHub — Firebase configuration & shared SDK exports
// =========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp,
  increment, runTransaction, startAfter
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqdRQTxIjhVcmprfHMYbmMPxlSobsxo7w",
  authDomain: "students-699de.firebaseapp.com",
  projectId: "students-699de",
  storageBucket: "students-699de.firebasestorage.app",
  messagingSenderId: "347273410609",
  appId: "1:347273410609:web:e2e17f6a150bd90153bd10",
  measurementId: "G-LPTBSCQJDX"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment,
  runTransaction, startAfter,
  signInWithEmailAndPassword, onAuthStateChanged, signOut
};

// =========================================================
// Photo helper — replaces Firebase Storage.
// Storage isn't available/working for this project, so nurse
// profile photos are compressed client-side into a small JPEG
// and stored directly as a base64 data URL inside the Firestore
// "nurses" document (field: photoURL). No Storage bucket needed.
// =========================================================
export function compressImageToDataURL(file, { maxSize = 480, quality = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذرت قراءة الملف'));
    reader.onload = () => {
      img.onerror = () => reject(new Error('الملف ليس صورة صالحة'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; }
        else if (height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Cloud Messaging is optional (requires HTTPS + service worker + VAPID key).
// Loaded lazily only on pages that request notification permission.
export async function getMessagingIfSupported() {
  try {
    const { getMessaging, isSupported } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js");
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch (e) {
    console.warn("FCM not available:", e);
    return null;
  }
}
