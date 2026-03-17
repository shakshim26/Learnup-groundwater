import questions from "../data/demoQuestions.json";

export function getQuestion(category, level) {
  const cat = questions[category];
  if (!cat) return null;

  const lvlKey = `level${level}`;
  const levelQs = cat[lvlKey];
  if (!levelQs || levelQs.length === 0) return null;

  return levelQs[0]; // one question per level
}
