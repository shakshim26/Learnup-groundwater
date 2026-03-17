import { useEffect, useRef } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";

/*
PROPS:
- level
- badge
- correct
- wrong
- xp
- xpNeeded
- onClose
*/

export default function LevelUpModal({
  level,
  badge,
  correct,
  wrong,
  xp,
  xpNeeded,
  onClose,
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    // 🎉 Confetti
    confetti({
      particleCount: 220,
      spread: 100,
      origin: { y: 0.6 },
    });

    // 🪄 Animation (ref-safe)
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        scale: 0.6,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.8)",
      });
    }
  }, []);

  const progressPercent =
    xpNeeded > 0 ? Math.min(Math.round((xp / xpNeeded) * 100), 100) : 0;

  const xpRemaining = Math.max(xpNeeded - xp, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div ref={cardRef} className="sea-card w-full max-w-md p-8 text-center">
        {/* 🚀 Header */}
        <div className="text-6xl mb-3">🚀</div>

        <h1 className="text-4xl font-extrabold text-sky-600 mb-1">LEVEL UP!</h1>

        <p className="text-lg text-slate-600 mb-5">
          You reached <span className="font-bold">Level {level}</span>
        </p>

        {/* 🏅 Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-semibold">
            🏅 {badge}
          </span>
        </div>

        {/* 📊 Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-green-100 rounded-lg p-3">
            <div className="text-green-700 font-medium">Correct</div>
            <div className="text-2xl font-bold text-green-600">{correct}</div>
          </div>

          <div className="bg-red-100 rounded-lg p-3">
            <div className="text-red-700 font-medium">Wrong</div>
            <div className="text-2xl font-bold text-red-600">{wrong}</div>
          </div>
        </div>

        {/* 📈 XP */}
        <div className="text-left mb-1 text-sm font-medium text-slate-600">
          XP Progress: {xp}/{xpNeeded}
        </div>

        <div className="h-3 w-full bg-slate-200 rounded overflow-hidden mb-2">
          <div
            className="h-full bg-sky-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 mb-6">
          {xpRemaining === 0
            ? "🎯 Ready for next challenge!"
            : `${xpRemaining} XP to next level`}
        </p>

        {/* ▶️ Continue */}
        <button
          onClick={onClose}
          className="sea-btn w-full text-lg font-semibold"
          autoFocus
        >
          Continue Playing 🎮
        </button>
      </div>
    </div>
  );
}
