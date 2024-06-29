const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const tf = require("@tensorflow/tfjs-node");
const toxicity = require("@tensorflow-models/toxicity");

const app = express();
const port = 3000;

// Database setup
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

const Comment = sequelize.define(
  "Comment",
  {
    videoTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sentiment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

// sequelize.sync();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Load the toxicity model
let toxicityModel = null;
toxicity.load(0.9).then((model) => {
  toxicityModel = model;
  console.log("Toxicity model loaded.");
}).catch((err) => {
  console.error("Failed to load the toxicity model:", err);
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

// Endpoint to add a new comment
app.post("/addComment", async (req, res) => {
  const { videoTitle, commentText } = req.body;

  if (!commentText) {
    return res.status(400).json({ error: "Comment text is required" });
  }

  try {
    const sentimentResults = await analyzeComments([commentText]);
    const newComment = await Comment.create({
      videoTitle,
      text: commentText,
      sentiment: sentimentResults[0].sentiment,
    });

    res.json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get comments for a video
app.get("/comments", async (req, res) => {
  const { videoTitle } = req.query;

  try {
    const comments = await Comment.findAll({
      where: { videoTitle },
      order: [['createdAt', 'DESC']],
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
