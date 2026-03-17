import { createContext, useContext, useState, useMemo } from "react";

/* ======================================================
   🎮 QUIZ CONTEXT
====================================================== */

const QuizContext = createContext(undefined);

/* ======================================================
   🧠 PROVIDER
====================================================== */

export const QuizProvider = ({ children }) => {
  const [category, setCategory] = useState(() => {
    return localStorage.getItem("quiz_category") || null;
  });

  /* SET CATEGORY */

  const selectCategory = (cat) => {
    if (!cat) return;

    setCategory(cat);
    localStorage.setItem("quiz_category", cat);
  };

  /* RESET QUIZ */

  const resetQuiz = () => {
    setCategory(null);
    localStorage.removeItem("quiz_category");
  };

  /* CONTEXT VALUE */

  const value = useMemo(
    () => ({
      category,
      setCategory: selectCategory,
      resetQuiz,
    }),
    [category],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

/* ======================================================
   CUSTOM HOOK
====================================================== */

export const useQuiz = () => {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error("useQuiz must be used inside <QuizProvider>");
  }

  return context;
};
