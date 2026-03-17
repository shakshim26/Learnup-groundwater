import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Leaderboard from "./pages/Leaderboard";
import AgeSelect from "./pages/AgeSelect";
import ForgotPassword from "./pages/ForgetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { user, loading } = useAuth();

  // wait for Firebase auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sky-600 font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* 🌊 Public Pages */}
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
      />

      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/dashboard" replace />}
      />

      <Route path="/forgot" element={<ForgotPassword />} />

      {/* 👶 Age Selection */}
      <Route
        path="/age"
        element={
          <ProtectedRoute>
            <AgeSelect />
          </ProtectedRoute>
        }
      />

      {/* 📊 Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 🧠 Quiz */}
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />

      {/* 🏆 Leaderboard */}
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      {/* ❌ Unknown Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
