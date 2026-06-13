const express = require("express");
const cors = require("cors");
const { runMatch } = require("./matchService");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// POST /api/match
// body: { mood: "I'm feeling calm and creative" }
// returns: { mood, theme, matches: [...] }
app.post("/api/match", async (req, res) => {
  const { mood } = req.body;

  if (!mood || !mood.trim()) {
    return res.status(400).json({ error: "mood text is required" });
  }

  try {
    const result = await runMatch(mood);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "matching failed" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`neuramatch server running on http://localhost:${PORT}`);
});
