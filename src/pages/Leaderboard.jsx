import { useEffect, useRef, useState } from "react";
import { subscribeLeaderboard } from "../api/leaderboardApi";
import { getUserProfile } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import useTheme from "../hooks/useTheme";
import gsap from "gsap";
import WaterBackground from "../components/WaterBackground";

export default function Leaderboard() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ageGroup, setAgeGroup] = useState("teen");

  const cardsRef = useRef([]);

  /* APPLY THEME */
  useTheme(ageGroup);

  /* LOAD USER AGE GROUP */
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        setAgeGroup(profile?.ageGroup || "teen");
      } catch (err) {
        console.error("Profile error:", err);
      }
    };

    loadProfile();
  }, [user]);

  /* REALTIME LEADERBOARD */
  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((data) => {
      setUsers(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /* CARD ANIMATION */
  useEffect(() => {
    if (!users.length) return;

    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, [users]);

  /* LOADING SCREEN */
  if (loading) {
    return (
      <div className="sea-bg min-h-screen flex items-center justify-center">
        <p className="text-sky-600 font-semibold animate-pulse">
          Loading leaderboard...
        </p>
      </div>
    );
  }

  return (
    <div className="sea-bg min-h-screen px-4 sm:px-6 lg:px-8 py-6 relative overflow-hidden">
      <WaterBackground />

      {/* Floating bubbles */}
      <div className="bubble left-10">💧</div>
      <div className="bubble left-1/2">💧</div>
      <div className="bubble right-10">💧</div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
          🏆 Leaderboard
        </h1>

        {users.length === 0 ? (
          <p className="text-center text-slate-500">No players yet.</p>
        ) : (
          <div className="space-y-4">
            {users.map((u, i) => (
              <div
                key={u.id}
                ref={(el) => (cardsRef.current[i] = el)}
                className="sea-card flex justify-between items-center p-5 hover:scale-[1.02] transition"
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-sky-600">
                    #{i + 1}
                  </span>

                  <div>
                    <p className="font-semibold text-slate-700">
                      {u.name || u.email || "Player"}
                    </p>

                    <span className="text-xs px-3 py-1 rounded-full bg-sky-100 text-sky-600">
                      Level {u.globalLevel || 1}
                    </span>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sky-600">
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
