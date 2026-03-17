import gsap from "gsap";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function QuizResult({
  correct = 0,
  wrong = 0,
  total = 0,
  level = 1,
}) {
  const navigate = useNavigate();

  /* XP SYSTEM */
  const xpPerQuestion = 10;
  const xpGained = correct * xpPerQuestion;

  /* BADGE SYSTEM (same as userApi.js) */

  function getBadge(level) {
    if (level >= 10) return "Water Guardian 💧";
    if (level >= 6) return "Aqua Protector 🌊";
    if (level >= 3) return "Groundwater Explorer 🌱";
    return "Beginner 🐣";
  }

  const badge = getBadge(level);

  /* RESULT ANIMATION */

  useEffect(() => {
    gsap.from(".result-card", {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      ease: "back.out(1.7)",
    });

    /* CONFETTI CELEBRATION */

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="result-card sea-card p-10 w-full max-w-md text-center">
        {/* TITLE */}

        <h2 className="text-3xl font-bold text-sky-600 mb-6">
          Quiz Completed 🎉
        </h2>

        {/* SCORE */}

        <div className="space-y-2 mb-6">
          <p className="text-green-600 text-lg font-semibold">
            ✅ Correct Answers: {correct}
          </p>

          <p className="text-red-500 text-lg font-semibold">
            ❌ Wrong Answers: {wrong}
          </p>

          <p className="text-slate-600">📊 Total Questions: {total}</p>
        </div>

        {/* XP CARD */}

        <div className="bg-sky-50 rounded-xl p-4 mb-6">
          <p className="text-xl font-bold text-sky-600">
            ⭐ XP Gained: +{xpGained}
          </p>
        </div>

        {/* LEVEL */}

        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-700">
            🏅 Level Reached: {level}
          </p>
        </div>

        {/* BADGE */}

        <div className="mb-6">
          <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
            {badge}
          </span>
        </div>

        {/* BUTTONS */}

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="sea-btn flex-1"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="sea-btn flex-1"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
