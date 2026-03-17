import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    gsap.from(".nav-glass", {
      y: -40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true }); // ✅ Landing page
  };

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="logo-drop">💧</div>
          <h1 className="text-xl font-extrabold text-sky-600">LearnUp</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="user-avatar">{user?.email?.[0]?.toUpperCase()}</div>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
