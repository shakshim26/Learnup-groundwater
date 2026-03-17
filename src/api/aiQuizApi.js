import { QUESTION_SEEDS } from "../data/questionSeeds";

/* ======================================================
   BACKEND URL (AUTO SWITCH LOCAL / PRODUCTION)
====================================================== */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ======================================================
   LEVEL → DIFFICULTY
====================================================== */

function getDifficulty(level) {
  if (level <= 2) return "easy";
  if (level <= 4) return "medium";
  if (level <= 6) return "hard";
  return "expert";
}

/* ======================================================
   SINGLE QUESTION (AI BACKEND)
====================================================== */

export async function generateAIQuestion(
  category,
  level,
  ageGroup,
  usedQuestions = [],
) {
  try {
    const res = await fetch(`${API_URL}/api/generate-question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category,
        level,
        ageGroup,
        usedQuestions,
        difficulty: getDifficulty(level),
      }),
    });

    if (!res.ok) throw new Error("Backend failed");

    const data = await res.json();

    if (
      !data?.question ||
      !Array.isArray(data.options) ||
      !data.options.includes(data.answer)
    ) {
      throw new Error("Invalid backend structure");
    }

    return {
      ...data,
      xp: data.xp || level * 10,
    };
  } catch (err) {
    console.warn("⚠️ Backend AI failed");
    return null;
  }
}

/* ======================================================
   QUIZ SET GENERATOR
====================================================== */

export async function generateAIQuizSet(
  category,
  level,
  ageGroup,
  usedQuestions = [],
  count = 10,
) {
  const finalQuestions = [];
  const seen = new Set(usedQuestions);

  /* TRY AI QUESTIONS */

  for (let i = 0; i < count; i++) {
    const q = await generateAIQuestion(
      category,
      level,
      ageGroup,
      Array.from(seen),
    );

    if (q && !seen.has(q.question)) {
      seen.add(q.question);
      finalQuestions.push(q);
    }
  }

  /* FALLBACK TO SEED QUESTIONS */

  const seeds = [...(QUESTION_SEEDS[category] || [])].sort(
    () => Math.random() - 0.5,
  );

  for (const s of seeds) {
    if (finalQuestions.length >= count) break;

    if (!seen.has(s.question)) {
      seen.add(s.question);

      finalQuestions.push({
        question: s.question,
        options: [...s.options].sort(() => Math.random() - 0.5),
        answer: s.answer,
        xp: level * 10,
        fallback: true,
      });
    }
  }

  /* HARD GUARANTEE */

  if (finalQuestions.length === 0) {
    throw new Error("No questions available");
  }

  return finalQuestions.slice(0, count);
}
