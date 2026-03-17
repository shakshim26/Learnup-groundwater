export function getDifficultyByLevel(level) {
  if (level <= 2) return "easy";
  if (level <= 4) return "medium";
  if (level <= 6) return "hard";
  return "expert";
}

export function getQuestionCount(level) {
  if (level === 1) return 5;
  if (level === 2) return 7;
  if (level === 3) return 9;
  if (level === 4) return 11;
  return 15;
}

export function getXpToNextLevel(level) {
  return level * 50;
}
