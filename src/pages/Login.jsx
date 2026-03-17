import { useState, useEffect } from "react";
import { loginUser, googleLogin } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../api/userApi";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  /* 🎨 ENTRY ANIMATION */

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".auth-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  /* 🔁 REDIRECT AFTER LOGIN */

  useEffect(() => {
    if (!user) return;

    const redirectUser = async () => {
      try {
        const profile = await getUserProfile(user.uid);

        if (!profile?.ageGroup) {
          navigate("/age", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    redirectUser();
  }, [user, navigate]);

  /* 🔐 EMAIL LOGIN */

  const login = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const loggedUser = await loginUser(email, password);

      setUser(loggedUser);
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* 🔐 GOOGLE LOGIN */

  const loginWithGoogle = async () => {
    try {
      setError("");
      setLoading(true);

      const loggedUser = await googleLogin();

      setUser(loggedUser);
    } catch (err) {
      console.error(err);
      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sea-bg min-h-screen flex items-center justify-center px-4">
      <div className="auth-card sea-card w-full max-w-md p-10">
        <h1 className="text-4xl font-extrabold text-sky-600 text-center">
          LearnUp
        </h1>

        <p className="text-slate-500 text-center mb-8">Learn through play 🌊</p>

        {/* EMAIL */}

        <input
          className="sea-input mb-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}

        <input
          className="sea-input mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ERROR */}

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {/* LOGIN BUTTON */}

        <button
          onClick={login}
          disabled={loading}
          className="sea-btn w-full mb-3"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* GOOGLE LOGIN */}

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="sea-btn w-full bg-white text-sky-600 border border-sky-200 mb-3"
        >
          Continue with Google
        </button>

        {/* LINKS */}

        <div className="flex justify-between text-sm text-sky-600 mt-6">
          <Link to="/forgot" className="hover:underline">
            Forgot password?
          </Link>

          <Link to="/signup" className="hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
