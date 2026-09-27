import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { BadmintonSessionData } from "@/types/badminton";

const COLLECTION_NAME = "badminton_sessions";
const DEFAULT_DOC_ID = "default_session";
const LOCAL_STORAGE_KEY = "badminton_manager_saved_session";

/**
 * Saves session data to Firestore and mirrors in localStorage.
 */
export async function saveSessionData(data: BadmintonSessionData): Promise<{ success: boolean; error?: string }> {
  // Mirror to localStorage immediately
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        ...data,
        updatedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  // Save to Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error: unknown) {
    console.error("Firestore save error:", error);
    const msg = (error as Error)?.message || "Failed to save to cloud";
    return { success: false, error: msg };
  }
}

/**
 * Loads session data: attempts Firestore first, falls back to localStorage.
 */
export async function loadSessionData(): Promise<BadmintonSessionData | null> {
  // 1. Try Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const cloudData = snap.data() as BadmintonSessionData;
      // Update local storage cache
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
      }
      return cloudData;
    }
  } catch (error) {
    console.warn("Firestore fetch failed, checking localStorage fallback:", error);
  }

  // 2. Fallback to localStorage
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        return JSON.parse(local) as BadmintonSessionData;
      }
    } catch (e) {
      console.warn("Could not read from localStorage", e);
    }
  }

  return null;
}

/**
 * Listens to realtime updates from Firestore
 */
export function subscribeToSession(onData: (data: BadmintonSessionData) => void): () => void {
  try {
    const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onData(snap.data() as BadmintonSessionData);
        }
      },
      (error) => {
        console.warn("Firestore realtime sync subscription error:", error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Could not establish Firestore listener:", err);
    return () => {};
  }
}
