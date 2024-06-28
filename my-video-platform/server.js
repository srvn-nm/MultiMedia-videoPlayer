const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const toxicity = require("@tensorflow-models/toxicity");
const tf = require("@tensorflow/tfjs-node");

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Load the toxicity model
let toxicityModel;
toxicity.load(0.9).then((model) => {
  toxicityModel = model;
});

// Function to analyze comments
const analyzeComments = async (comments) => {
  if (!toxicityModel) {
    throw new Error("Model is not loaded yet.");
  }
  const results = await toxicityModel.classify(comments);
  return comments.map((comment, index) => {
    const result = results.map((category) => ({
      label: category.label,
      match: category.results[index].match,
    }));
    const isToxic = result.some((res) => res.match);
    return {
      text: comment,
      sentiment: isToxic ? "negative" : "positive",
    };
  });
};


// Endpoint for summarization
app.post("/summarize", async (req, res) => {
  const { text } = req.body;
  // Simple summarization: return the first 2 sentences
  const summary = text.split(".").slice(0, 2).join(".") + ".";
  res.json({ summary });
});

// Endpoint for sentiment analysis
app.post("/analyze", async (req, res) => {
  const { comments } = req.body;
    try {
      const results = await analyzeComments(comments);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
