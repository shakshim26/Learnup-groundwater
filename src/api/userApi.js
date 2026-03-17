import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

/* ======================================================
   👤 CREATE / UPDATE USER PROFILE
   - Email / Google safe
   - Progress is NEVER overwritten
====================================================== */
export async function saveUserProfile(user) {
  if (!user?.uid) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || "",
      name: user.displayName || "Player",
      photoURL: user.photoURL || null,

      /* 🌟 GLOBAL GAME STATS */
      globalLevel: 1,
      score: 0,
      badge: "Beginner 🐣",
      ageGroup: null,

      /* 📚 CATEGORY PROGRESS */
      progress: {},

      createdAt: serverTimestamp(),
    });
  } else {
    // 🔁 SAFE PROFILE SYNC ONLY
    await updateDoc(ref, {
      email: user.email || snap.data().email,
      name: user.displayName || snap.data().name,
      photoURL: user.photoURL || snap.data().photoURL,
    });
  }
}

/* ======================================================
   📥 GET USER PROFILE
====================================================== */
export async function getUserProfile(uid) {
  if (!uid) return null;

  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/* ======================================================
   🎂 SET AGE GROUP
====================================================== */
export async function setAgeGroup(uid, ageGroup) {
  if (!uid || !ageGroup) return;
  await updateDoc(doc(db, "users", uid), { ageGroup });
}

/* ======================================================
   🧠 UPDATE PROGRESS (ATOMIC, SAFE, NO REPEAT)
====================================================== */
export async function updateProgress(uid, category, xp = 0, questionText) {
  if (!uid || !category || xp <= 0) return;

  const ref = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    const progress = typeof data.progress === "object" ? data.progress : {};

    /* 🧠 CATEGORY STATE (HARD SAFE) */
    const currentCat = progress[category] || {};
    const catLevel = Number(currentCat.level) || 1;
    const catXP = Number(currentCat.xp) || 0;

    /* 🔒 QUESTION HISTORY (DEDUPLICATED) */
    const usedSet = new Set(
      Array.isArray(currentCat.usedQuestions) ? currentCat.usedQuestions : [],
    );

    if (typeof questionText === "string" && questionText.trim()) {
      usedSet.add(questionText);
    }

    const usedQuestions = Array.from(usedSet).slice(-40); // Firestore safe

    /* 🔥 XP + LEVEL SYSTEM */
    let remainingXP = catXP + xp;
    let newCategoryLevel = catLevel;
    let newGlobalLevel = Number(data.globalLevel) || 1;

    while (remainingXP >= newCategoryLevel * 50) {
      remainingXP -= newCategoryLevel * 50;
      newCategoryLevel += 1;
      newGlobalLevel += 1;
    }

    progress[category] = {
      level: newCategoryLevel,
      xp: remainingXP,
      usedQuestions,
    };

    transaction.update(ref, {
      progress,
      score: (Number(data.score) || 0) + xp,
      globalLevel: newGlobalLevel,
      badge: getBadge(newGlobalLevel),
    });
  });
}

/* ======================================================
   🏅 BADGE SYSTEM (STABLE)
====================================================== */
function getBadge(level) {
  if (level >= 10) return "Water Guardian 💧";
  if (level >= 6) return "Aqua Protector 🌊";
  if (level >= 3) return "Groundwater Explorer 🌱";
  return "Beginner 🐣";
}
