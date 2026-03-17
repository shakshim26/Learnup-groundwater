import Navbar from "../components/Navbar";
import { useQuiz } from "../context/QuizContext";
import { useAuth } from "../context/AuthContext";
import { generateAIQuizSet } from "../api/aiQuizApi";
import { updateProgress, getUserProfile } from "../api/userApi";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import LevelUpModal from "../components/LevelUpModal";
import QuizResult from "../components/QuizResult";
import useTheme from "../hooks/useTheme";
import XPGain from "../components/XPGain";
import confetti from "canvas-confetti";
import WaterBackground from "../components/WaterBackground";

const QUESTION_TIME = 30;
const shuffle = (arr = []) => [...arr].sort(() => Math.random() - 0.5);

export default function Quiz() {
  const { category } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(QUESTION_TIME);

  const [selected, setSelected] = useState(null);
  const [answerState, setAnswerState] = useState(null);

  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  const [xpGain, setXpGain] = useState(null);
  const [ageGroup, setAgeGroup] = useState("teen");

  const timerRef = useRef(null);
  const prevLevelRef = useRef(1);

  useTheme(ageGroup);

  /* SAFETY */

  useEffect(() => {
    if (!category) {
      navigate("/dashboard");
    }
  }, [category, navigate]);

  /* INIT QUIZ */

  useEffect(() => {
    let active = true;

    async function initQuiz() {
      try {
        setLoading(true);

        const profile = await getUserProfile(user.uid);
        if (!profile) return;

        setAgeGroup(profile.ageGroup || "teen");

        const level = profile.progress?.[category]?.level || 1;
        const used = profile.progress?.[category]?.usedQuestions || [];
        const age = profile.ageGroup || "teen";

        prevLevelRef.current = level;

        /* LIMIT QUESTION COUNT */

        const count = Math.min(5 + level, 10);

        /* AI REQUEST WITH TIMEOUT */

        const quiz = await Promise.race([
          generateAIQuizSet(category, level, age, used, count),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("AI timeout")), 8000),
          ),
        ]);

        if (!quiz || quiz.length === 0) {
          throw new Error("No questions available");
        }

        setQuestions(
          quiz.map((q) => ({
            ...q,
            options: shuffle(q.options),
          })),
        );
      } catch (err) {
        console.error("Quiz init failed:", err);
        setQuestions([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    initQuiz();

    return () => {
      active = false;
      clearInterval(timerRef.current);
    };
  }, [category, user.uid]);

  /* TIMER */

  useEffect(() => {
    if (loading || finished || !questions.length) return;

    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [index, loading, finished, questions.length]);

  /* ANSWER */

  const handleAnswer = async (ans) => {
    if (answerState || finished) return;

    const q = questions?.[index];
    if (!q) return;

    setSelected(ans);

    setAnswerState({
      selectedAnswer: ans,
      correctAnswer: q.answer,
    });

    clearInterval(timerRef.current);

    let nextCorrect = correct;
    let nextWrong = wrong;

    if (ans === q.answer) {
      nextCorrect++;
      setCorrect(nextCorrect);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const gainedXP = q.xp || 10;

      setXpGain(gainedXP);

      setTimeout(() => setXpGain(null), 1000);

      await updateProgress(user.uid, category, gainedXP, q.question);

      const updated = await getUserProfile(user.uid);
      const newLevel = updated.progress?.[category]?.level || 1;

      if (newLevel > prevLevelRef.current) {
        setLevelUpData({
          level: newLevel,
          badge: updated.badge,
          correct: nextCorrect,
          wrong: nextWrong,
          xp: updated.progress[category].xp,
          xpNeeded: newLevel * 50,
        });

        prevLevelRef.current = newLevel;

        setTimeout(() => setShowLevelUp(true), 900);
        return;
      }
    } else {
      nextWrong++;
      setWrong(nextWrong);
    }

    setTimeout(nextStep, 900);
  };

  const nextStep = () => {
    setSelected(null);
    setAnswerState(null);
    setTime(QUESTION_TIME);

    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  /* LOADING */

  if (loading) {
    return (
      <div className="min-h-screen sea-bg flex items-center justify-center">
        <span className="text-sky-600 font-semibold">Generating quiz…</span>
      </div>
    );
  }

  /* EMPTY QUIZ PROTECTION */

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen sea-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500 mb-4">
            Failed to load questions
          </p>

          <button onClick={() => navigate("/dashboard")} className="sea-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <QuizResult
        correct={correct}
        wrong={wrong}
        total={questions.length}
        level={prevLevelRef.current}
      />
    );
  }

  const q = questions?.[index];

  if (!q) {
    return (
      <div className="min-h-screen sea-bg flex items-center justify-center">
        <span className="text-sky-600 font-semibold">Loading question...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen sea-bg relative overflow-hidden">
      <WaterBackground />

      <Navbar />

      {xpGain && <XPGain xp={xpGain} />}

      <div className="max-w-xl w-full mx-auto px-4 mt-8 p-6 sea-card">
        <div className="flex justify-between mb-3 text-sm">
          <span>
            {category} • Level {prevLevelRef.current}
          </span>

          <span>
            Q {index + 1}/{questions.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 h-2 rounded mb-4 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-1000"
            style={{ width: `${(time / QUESTION_TIME) * 100}%` }}
          />
        </div>

        <div className="text-sm mb-4">⏱ {time}s</div>

        <h2 className="text-xl font-bold mb-6 text-blue-600">{q.question}</h2>

        {q.options.map((o) => {
          let cls = "sea-btn w-full mb-3";

          if (answerState) {
            if (o === answerState.correctAnswer) {
              cls += " bg-green-500";
            } else if (o === answerState.selectedAnswer) {
              cls += " bg-red-500";
            } else {
              cls += " opacity-60";
            }
          }

          return (
            <button
              key={o}
              disabled={!!answerState}
              onClick={() => handleAnswer(o)}
              className={cls}
            >
              {o}
            </button>
          );
        })}
      </div>

      {showLevelUp && levelUpData && (
        <LevelUpModal
          {...levelUpData}
          onClose={() => {
            setShowLevelUp(false);
            nextStep();
          }}
        />
      )}
    </div>
  );
}
