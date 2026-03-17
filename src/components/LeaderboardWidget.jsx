import { useEffect, useState } from "react";
import { subscribeLeaderboard } from "../api/leaderboardApi";
import { useNavigate } from "react-router-dom";

export default function LeaderboardWidget() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((data) => {
      setPlayers(data || []);
      setLoading(false);
    }, 5);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="sea-card p-6">
      <h3 className="text-xl font-bold text-sky-600 mb-4">
        🏆 Live Leaderboard
      </h3>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : players.length === 0 ? (
        <p className="text-slate-500 text-sm">No players yet</p>
      ) : (
        <div className="space-y-2">
          {players.map((p, i) => (
            <div
              key={p.id}
              className="flex justify-between items-center text-sm"
            >
              <span className="flex items-center gap-2">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}

                {p.name || p.email || "Player"}
              </span>

              <span className="font-semibold text-sky-600">
                {p.score || 0} XP
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate("/leaderboard")}
        className="sea-btn mt-4 w-full"
      >
        View Full Leaderboard
      </button>
    </div>
  );
}
