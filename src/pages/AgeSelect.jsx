import { setAgeGroup } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import useTheme from "../hooks/useTheme";
import gsap from "gsap";

const AGE_OPTIONS = [
  {
    key: "child",
    title: "Child",
    icon: "👶",
    desc: "Simple & fun questions",
    bg: "from-pink-400 to-pink-600",
  },
  {
    key: "teen",
    title: "Teen",
    icon: "🧑",
    desc: "Concept + application based",
    bg: "from-sky-400 to-sky-600",
  },
  {
    key: "adult",
    title: "Adult",
    icon: "🧑‍🎓",
    desc: "Real-world & decision making",
    bg: "from-emerald-400 to-emerald-600",
  },
];

export default function AgeSelect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const cardsRef = useRef([]);

  /* Default theme before selection */
  useTheme("teen");

  /* WAIT FOR AUTH */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sky-600">
        Loading...
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  /* ENTRY ANIMATION */

  useEffect(() => {
    if (!cardsRef.current.length) return;

    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  /* SELECT AGE */

  const selectAge = async (age) => {
    try {
      await setAgeGroup(user.uid, age);

      /* Apply theme instantly */
      document.body.classList.remove(
        "theme-child",
        "theme-teen",
        "theme-adult",
      );

      document.body.classList.add(`theme-${age}`);

      /* Click animation */

      gsap.to(".age-card", {
        scale: 0.95,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 200);
    } catch (err) {
      console.error("Error setting age:", err);
    }
  };

  return (
    <div className="sea-bg min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Floating bubbles */}

      <div className="bubble left-10">💧</div>
      <div className="bubble left-1/2">💧</div>
      <div className="bubble right-10">💧</div>

      {/* HEADER */}

      <h1 className="text-3xl md:text-4xl font-extrabold text-sky-700 mb-3 text-center">
        Choose Your Learning Level
      </h1>

      <p className="text-slate-600 mb-10 text-center max-w-md">
        This helps us generate questions that match your understanding and
        difficulty level.
      </p>

      {/* AGE CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {AGE_OPTIONS.map((age, i) => (
          <div
            key={age.key}
            ref={(el) => (cardsRef.current[i] = el)}
            onClick={() => selectAge(age.key)}
            className={`age-card cursor-pointer rounded-3xl p-8 text-white shadow-xl
            bg-gradient-to-br ${age.bg}
            transform transition-all duration-300
            hover:scale-105 hover:shadow-2xl
            active:scale-95`}
          >
            <div className="text-6xl mb-4">{age.icon}</div>

            <h2 className="text-2xl font-bold mb-2">{age.title}</h2>

            <p className="text-white/90 text-sm">{age.desc}</p>

            <div className="mt-6 inline-block bg-white/20 px-4 py-1 rounded-full text-xs font-semibold">
              Tap to continue →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
