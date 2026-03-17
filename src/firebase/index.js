const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.generateQuestion = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const { category, level, ageGroup } = req.body;

  const difficulty = level <= 2 ? "easy" : level <= 4 ? "medium" : "hard";

  const prompt = `
Create ONE ${difficulty} MCQ for ${ageGroup} about "${category}"

Return JSON ONLY:
{
 "question": "...",
 "options": ["A","B","C","D"],
 "answer": "A"
}
`;

  try {
    const aiRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${functions.config().groq.key}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await aiRes.json();
    const text = data.choices?.[0]?.message?.content;
    const json = JSON.parse(text);
    json.xp = level * 10;

    res.json(json);
  } catch (e) {
    res.status(500).json({ error: "AI failed" });
  }
});
