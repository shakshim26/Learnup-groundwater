const functions = require("firebase-functions");

exports.generateQuestion = functions
  .runWith({ timeoutSeconds: 30, memory: "256MB" })
  .https.onRequest(async (req, res) => {
    // ✅ CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const { category, level, ageGroup, usedQuestions = [] } = req.body || {};

      if (!category || !level || !ageGroup) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const prompt = `
You are an environmental science expert.

Create ONE high-quality multiple-choice question.

CATEGORY: ${category}
DIFFICULTY LEVEL: ${level}
TARGET AUDIENCE: ${ageGroup}

STRICT RULES:
- Question must be realistic and practical
- Exactly 4 options
- Only ONE correct answer
- Avoid repeating these questions:
${usedQuestions.slice(-25).join(" || ")}

RETURN ONLY VALID JSON (NO EXTRA TEXT):

{
  "question": "string",
  "options": ["A","B","C","D"],
  "answer": "exact option text"
}
`;

      const groqKey = functions.config().groq.key;

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        },
      );

      const raw = await response.text();

      let parsed;
      try {
        const data = JSON.parse(raw);
        const content = data?.choices?.[0]?.message?.content;
        parsed = JSON.parse(content);
      } catch {
        throw new Error("Invalid AI JSON");
      }

      // ✅ HARD VALIDATION
      if (
        !parsed.question ||
        !Array.isArray(parsed.options) ||
        parsed.options.length !== 4 ||
        !parsed.options.includes(parsed.answer)
      ) {
        throw new Error("AI response validation failed");
      }

      res.json({
        ...parsed,
        xp: level * 10,
      });
    } catch (err) {
      console.error("Groq AI error:", err.message);
      res.status(500).json({ error: "AI generation failed" });
    }
  });
