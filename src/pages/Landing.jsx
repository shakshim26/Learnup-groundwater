import { useNavigate } from "react-router-dom";
import { getLeaderboard } from "../api/leaderboardApi";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

export default function Landing() {
  const navigate = useNavigate();

  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef(null);
  const cardsRef = useRef([]);

  /* LOAD LEADERBOARD */

  useEffect(() => {
    async function loadLeaders() {
      try {
        const data = await getLeaderboard(5);
        setLeaders(data || []);
      } catch (err) {
        console.error("Leaderboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLeaders();
  }, []);

  /* HERO ANIMATION */

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  /* CARD ANIMATION */

  useEffect(() => {
    if (!leaders.length) return;

    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, [leaders]);

  return (
    <div className="sea-bg min-h-screen flex flex-col items-center justify-center px-6">
      {/* HERO */}

      <div ref={heroRef} className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-sky-600 mb-4">
          LearnUp 🌊
        </h1>

        <p className="text-slate-600 text-lg mb-10 max-w-md mx-auto">
          Learn groundwater conservation through interactive gameplay
        </p>

        <button
          onClick={() => navigate("/login")}
          className="sea-btn px-12 py-4 text-lg hover:scale-105 transition"
        >
          Start Playing
        </button>
      </div>

      {/* LEADERBOARD */}

      <div className="w-full max-w-xl">
        <h2 className="text-xl font-bold text-slate-700 mb-5 text-center">
          🏆 Top Players
        </h2>

        {loading ? (
          <p className="text-center text-slate-500">Loading leaderboard...</p>
        ) : (
          <div className="space-y-4">
            {leaders.map((u, i) => (
              <div
                key={u.id || i}
                ref={(el) => (cardsRef.current[i] = el)}
                className="leader-card sea-card flex justify-between items-center px-6 py-4 hover:scale-[1.02] transition"
              >
                {/* LEFT */}

                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-sky-600">
                    #{i + 1}
                  </span>

                  <div>
                    <p className="text-slate-700 font-medium">
                      {u.name || "Player"}
                    </p>

                    <span className="text-xs bg-sky-100 text-sky-600 px-3 py-1 rounded-full">
                      {u.badge || "Beginner"}
                    </span>
                  </div>
                </div>

                {/* RIGHT */}

                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sky-600">
                    {u.score || 0} XP
                  </span>

                  <span className="text-xl">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
