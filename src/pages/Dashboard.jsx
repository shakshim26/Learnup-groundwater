import Lottie from "lottie-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LeaderboardWidget from "../components/LeaderboardWidget";
import WaterBackground from "../components/WaterBackground";

import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { getUserProfile } from "../api/userApi";

import { useNavigate, Navigate } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import gsap from "gsap";
import useTheme from "../hooks/useTheme";

/* LOTTIE ICONS */

import waterIcon from "../assets/icons/water drop.json";
import rainIcon from "../assets/icons/Rainy.json";
import dryIcon from "../assets/icons/nodata.json";
import plantIcon from "../assets/icons/recolor plant.json";
import pollutionIcon from "../assets/icons/water waste.json";
import recycleIcon from "../assets/icons/Recycle.json";

/* QUIZ CATEGORIES */

const CATEGORIES = [
  { name: "Basics of Groundwater", icon: waterIcon },
  { name: "Groundwater Recharge", icon: rainIcon },
  { name: "Groundwater Depletion", icon: dryIcon },
  { name: "Groundwater Conservation", icon: plantIcon },
  { name: "Groundwater Pollution", icon: pollutionIcon },
  { name: "Sustainable Management", icon: recycleIcon },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { setCategory } = useQuiz();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const cardsRef = useRef([]);

  if (!user) return <Navigate to="/login" replace />;

  /* LOAD USER PROFILE */

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const data = await getUserProfile(user.uid);

        if (active && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user.uid]);

  /* APPLY AGE THEME */

  useTheme(profile?.ageGroup);

  /* CATEGORY ANIMATION */

  useLayoutEffect(() => {
    if (!profile) return;

    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, [profile]);

  /* START QUIZ */

  const startQuiz = (category) => {
    setCategory(category);

    gsap.to(".sea-card", {
      scale: 0.95,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
    });

    setTimeout(() => navigate("/quiz"), 150);
  };

  /* LOADING */

  if (!profile) {
    return (
      <div className="sea-bg min-h-screen flex items-center justify-center">
        <p className="text-sky-600 font-semibold animate-pulse">
          Loading dashboard…
        </p>
      </div>
    );
  }

  /* USER DATA */

  const level = profile.globalLevel ?? 1;
  const score = profile.score ?? 0;
  const badge = profile.badge ?? "Explorer";

  const xpNeeded = level * 50;
  const currentXP = score % xpNeeded;
  const xpPercent = Math.min((currentXP / xpNeeded) * 100, 100);

  return (
    <div className="sea-bg min-h-screen relative overflow-hidden">
      <WaterBackground />

      {/* FLOATING BUBBLES */}
      <div className="bubble left-10">💧</div>
      <div className="bubble left-1/2">🌊</div>
      <div className="bubble right-10">💧</div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* PROFILE CARD */}

        <div className="sea-card p-6 flex items-center gap-6 mb-10 hover:scale-[1.02] transition">
          {/* AVATAR FROM FIRESTORE */}

          <div className="text-5xl">{profile.avatar || "💧"}</div>

          <div>
            {/* USERNAME */}

            <h2 className="text-2xl font-bold text-slate-800">
              {profile.username || "Player"}
            </h2>

            {/* EMAIL */}

            <p className="text-slate-500 text-sm">{profile.email}</p>

            {/* BADGE */}

            <span className="inline-block mt-2 bg-sky-100 text-sky-600 px-4 py-1 rounded-full text-sm font-semibold">
              {badge}
            </span>
          </div>
        </div>

        {/* USER STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* LEVEL */}

          <div className="sea-card p-6 text-center hover:scale-105 transition">
            <p className="text-slate-500">LEVEL</p>

            <h2 className="text-4xl font-bold text-sky-600">{level}</h2>

            <div className="mt-3 w-full bg-sky-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-700"
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 mt-1">
              {xpNeeded - currentXP} XP to next level
            </p>
          </div>

          {/* SCORE */}

          <div className="sea-card p-6 text-center hover:scale-105 transition">
            <p className="text-slate-500">SCORE</p>

            <h2 className="text-4xl font-bold text-sky-600">{score}</h2>
          </div>

          {/* BADGE */}

          <div className="sea-card p-6 text-center hover:scale-105 transition">
            <p className="text-slate-500">BADGE</p>

            <h2 className="text-xl font-semibold text-sky-600">{badge}</h2>
          </div>
        </div>

        {/* CATEGORY TITLE */}

        <h3 className="text-2xl font-bold text-slate-700 mb-6">
          Choose a Topic
        </h3>

        {/* LEADERBOARD */}

        <div className="mb-12">
          <LeaderboardWidget />
        </div>

        {/* CATEGORY GRID */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.name}
              ref={(el) => (cardsRef.current[i] = el)}
              onClick={() => startQuiz(cat.name)}
              className="sea-card p-8 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 text-center flex flex-col items-center"
            >
              <div className="w-24 h-24 mb-5 flex items-center justify-center bg-sky-50 rounded-2xl shadow-inner hover:bg-sky-100 transition">
                <Lottie
                  animationData={cat.icon}
                  loop={true}
                  autoplay={true}
                  style={{ width: 70, height: 70 }}
                />
              </div>

              <h3 className="text-xl font-bold text-sky-600 mb-2">
                {cat.name}
              </h3>

              <p className="text-slate-500 text-sm">
                Adaptive difficulty • XP rewards
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
