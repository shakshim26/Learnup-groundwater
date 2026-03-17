import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../api/userApi";
import { useEffect, useState } from "react";
import useTheme from "../hooks/useTheme";

export default function Footer() {
  const { user } = useAuth();
  const [ageGroup, setAgeGroup] = useState("teen");

  useTheme(ageGroup);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const profile = await getUserProfile(user.uid);

      setAgeGroup(profile?.ageGroup || "teen");
    }

    loadProfile();
  }, [user]);

  /* AGE THEMES */

  let footerStyle = "bg-sky-100 text-sky-700";
  let icon = "💧";

  if (ageGroup === "child") {
    footerStyle = "bg-pink-200 text-pink-700";
    icon = "🧸";
  }

  if (ageGroup === "teen") {
    footerStyle = "bg-blue-100 text-blue-700";
    icon = "🎮";
  }

  if (ageGroup === "adult") {
    footerStyle = "bg-green-100 text-green-700";
    icon = "🍀";
  }

  return (
    <footer className={`${footerStyle} w-full mt-20 relative overflow-hidden`}>
      {/* Animated Icons */}

      <div className="absolute left-10 animate-bounce text-2xl">{icon}</div>

      <div className="absolute right-10 animate-pulse text-2xl">{icon}</div>

      <div className="container mx-auto py-6 text-center">
        <h3 className="font-bold text-lg">LearnUp 🌊</h3>

        <p className="text-sm mt-1">Gamified Groundwater Learning Platform</p>

        <p className="text-xs mt-3 opacity-70">
          © {new Date().getFullYear()} LearnUp • Built with React + Firebase
        </p>
      </div>
    </footer>
  );
}
