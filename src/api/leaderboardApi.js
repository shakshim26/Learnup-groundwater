import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

/* =========================================
   NORMAL LEADERBOARD (FOR PAGE LOAD)
========================================= */

export async function getLeaderboard(limitCount = 10) {
  try {
    const q = query(
      collection(db, "users"),
      orderBy("score", "desc"),
      limit(limitCount),
    );

    const snap = await getDocs(q);

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return [];
  }
}

/* =========================================
   LIVE LEADERBOARD (REAL TIME)
========================================= */

export function subscribeLeaderboard(callback, limitCount = 10) {
  try {
    const q = query(
      collection(db, "users"),
      orderBy("score", "desc"),
      limit(limitCount),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const leaderboard = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        callback(leaderboard);
      },
      (error) => {
        console.error("Realtime leaderboard error:", error);
      },
    );

    return unsubscribe;
  } catch (error) {
    console.error("Leaderboard subscribe error:", error);
  }
}
