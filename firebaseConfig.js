import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCfMfN_GX99bxXY_Zk0fkXRHo8VroBXejo",
  authDomain: "to-do-app-22eed.firebaseapp.com",
  projectId: "to-do-app-22eed",
  storageBucket: "to-do-app-22eed.firebasestorage.app",
  messagingSenderId: "521335236564",
  appId: "1:521335236564:web:6e22d120db3101d8999841",
  measurementId: "G-86N9CKEK07"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);

export { db, auth };
