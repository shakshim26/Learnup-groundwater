import { useState, useEffect } from "react";
import { resetPassword } from "../api/authApi";
import { Link } from "react-router-dom";
import gsap from "gsap";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.from(".auth-card", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  const sendReset = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      await resetPassword(email);

      setSuccess("Password reset email sent! Check your inbox 📩");
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sea-bg min-h-screen flex items-center justify-center px-4">
      <div className="auth-card sea-card w-full max-w-md p-10">
        <h1 className="text-3xl font-extrabold text-sky-600 text-center">
          Forgot Password
        </h1>

        <p className="text-slate-500 text-center mb-6">
          Enter your email to reset your password
        </p>

        <input
          className="sea-input mb-4"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm text-center mb-3">{success}</p>
        )}

        <button
          onClick={sendReset}
          disabled={loading}
          className="sea-btn w-full mb-4"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="text-sm text-center text-sky-600">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
