import { useEffect } from "react";

export default function useTheme(ageGroup) {
  useEffect(() => {
    const body = document.body;

    body.classList.remove("theme-child", "theme-teen", "theme-adult");

    if (ageGroup) {
      body.classList.add(`theme-${ageGroup}`);
    }
  }, [ageGroup]);
}
