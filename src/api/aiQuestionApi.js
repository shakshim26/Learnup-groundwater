const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function generateAIQuestion(
  category,
  level,
  ageGroup,
  usedQuestions = [],
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(`${BACKEND_URL}/api/generate-question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category,
        level,
        ageGroup,
        usedQuestions,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();

    // 🛡️ Final safety check
    if (
      !data?.question ||
      !Array.isArray(data.options) ||
      !data.options.includes(data.answer)
    ) {
      throw new Error("Invalid question format");
    }

    return data;
  } catch (err) {
    console.warn("⚠️ Backend AI failed:", err.message);
    return null; // Seed questions will be used
  } finally {
    clearTimeout(timeout);
  }
}
