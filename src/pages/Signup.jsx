import { useState, useEffect } from "react";
import { signupUser, googleLogin } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import gsap from "gsap";

const AVATARS = ["💧", "🌊", "🐳", "🐬", "🌱", "🚰"];

export default function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("💧");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    gsap.from(".auth-card", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  /* EMAIL SIGNUP */

  const signup = async () => {
    try {
      setError("");

      if (!name || !username || !email || !password) {
        setError("Please fill all fields");
        return;
      }

      const user = await signupUser(email, password);

      setUser(user);

      /* SAVE USER PROFILE IN FIRESTORE */

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        username: username,
        avatar: avatar,
        email: email,
        score: 0,
        globalLevel: 1,
        badge: "Explorer",
        createdAt: new Date(),
      });

      navigate("/age", { replace: true });
    } catch (err) {
      setError("Account already exists or invalid email");
    }
  };

  /* GOOGLE SIGNUP */

  const signupWithGoogle = async () => {
    try {
      setError("");

      const user = await googleLogin();

      setUser(user);

      /* SAVE GOOGLE USER */

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName || "Player",
        username: user.displayName || "Player",
        avatar: "💧",
        email: user.email,
        score: 0,
        globalLevel: 1,
        badge: "Explorer",
        createdAt: new Date(),
      });

      navigate("/age", { replace: true });
    } catch {
      setError("Google signup failed");
    }
  };

  return (
    <div className="sea-bg min-h-screen flex items-center justify-center px-4">
      <div className="auth-card sea-card w-full max-w-md p-10">
        <h1 className="text-4xl font-extrabold text-sky-600 text-center">
          Create Account
        </h1>

        <p className="text-slate-500 text-center mb-8">
          Begin your <span className="text-sky-600 font-bold">LearnUp</span>{" "}
          journey 🌊
        </p>

        {/* NAME */}

        <input
          className="sea-input mb-4 w-full border rounded-lg p-3"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* USERNAME */}

        <input
          className="sea-input mb-4 w-full border rounded-lg p-3"
          type="text"
          placeholder="Player Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* EMAIL */}

        <input
          className="sea-input mb-4 w-full border rounded-lg p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}

        <input
          className="sea-input mb-4 w-full border rounded-lg p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* AVATAR SELECTION */}

        <p className="text-sm text-slate-600 mb-2">Choose Avatar</p>

        <div className="flex gap-3 mb-4 flex-wrap">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              className={`text-2xl p-3 rounded-lg border transition
              ${avatar === a ? "bg-sky-100 border-sky-500" : "bg-white"}`}
            >
              {a}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {/* CREATE ACCOUNT */}

        <button onClick={signup} className="sea-btn w-full mb-3">
          Create Account
        </button>

        {/* GOOGLE SIGNUP */}

        <button
          onClick={signupWithGoogle}
          className="sea-btn w-full bg-white text-sky-600 border border-sky-200"
        >
          Sign up with Google
        </button>

        {/* LOGIN */}

        <p className="text-sm text-center text-sky-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
