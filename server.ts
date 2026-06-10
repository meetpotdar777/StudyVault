import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// REST API endpoint: AI study helper & summarizer
app.post("/api/summarize-paper", async (req, res) => {
  try {
    const { title, subject, code, year, docType, textContent } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ error: "Title and Subject are required fields." });
    }

    const docContent = textContent || `This is a academic document titled "${title}" for the subject "${subject}" (Code: ${code || 'N/A'}) from the year ${year || 'N/A'}. It is categorized as a ${docType || 'Document'}.`;

    // Prompt construction to generate clean structured response
    const prompt = `
      You are an expert academic tutor and assistant for college students.
      The student needs a high-quality, comprehensive, and engaging study guide for a resource in StudyVault.
      
      Resource Details:
      - Title: ${title}
      - Subject: ${subject} ${code ? `(${code})` : ""}
      - Document Type: ${docType}
      - Year: ${year || "Recent"}
      
      Resource text contents (or descriptor):
      """
      ${docContent.substring(0, 4000)}
      """

      Please structure your output using clean, elegant Markdown. Make sure it contains:
      1. **EXECUTIVE SUMMARY & KEY TOPICS**: A deep yet concise overview of the core topics of this resource and what the student must know (approx 150-250 words). Break it down with clear bullet points.
      2. **CORE CONCEPTS & FORMULAS**: Highlight the absolute most important formulas, definitions, code blocks, or theorems covered in this resource. Use LaTeX style code blocks if applicable or clear math formatting.
      3. **CONCEPTUAL FLASHCARDS (3-5)**: Create short question-and-answer flashcards that are highly testable. Format them clearly:
         * **Flashcard Q**: [Question]
         * **Flashcard A**: [Answer]
      4. **MINI PRACTICE QUIZ (3 Questions)**: Create exactly 3 highly relevant multiple choice questions based on the document. Provide the correct answer and a brief explanation for each. Use the following format precisely:
         * **Q1**: [Question text]
           * A) [Option A]
           * B) [Option B]
           * C) [Option C]
           * D) [Option D]
         * **Answer**: [Correct option letter (e.g. A)]
         * **Explanation**: [Short explanation of why it is correct]
         and do the same for Q2 and Q3.

      Make the tone encouraging, highly academic yet perfectly accessible for a college student cramming for exams. Set headings using bold markdown. Do not include random preamble text. Start directly with the summary.
    `;

    if (!ai) {
      // Graceful fallback for demo purposes if API key is not set
      console.warn("GEMINI_API_KEY is not defined. Returning a high-fidelity simulation.");
      const mockResult = generateMockSummary(title, subject, code, year, docType);
      return res.json({ summary: mockResult, isSimulated: true });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const summaryText = response.text;
    res.json({
      summary: summaryText,
      isSimulated: false,
    });
  } catch (error: any) {
    console.error("Error communicating with Gemini service:", error);
    res.status(500).json({
      error: "Failed to generate summary.",
      details: error.message || String(error),
      isSimulated: true, // Will allow UI to fall back gracefully rather than crashing
    });
  }
});

// Mock summary generator for graceful fallback (if GEMINI_API_KEY is not configured yet)
function generateMockSummary(title: string, subject: string, code: string, year: string, docType: string) {
  return `### **EXECUTIVE SUMMARY & KEY TOPICS**
This is a simulated high-fidelity study guide for **${title}** in **${subject}** (${code || 'No Code'}). Since the AI backend is currently initializing, we have populated this with a curated study guide.

* **Main Objective**: This document provides students with a detailed understanding of the foundational principles of the course curriculum, focusing on typical exam structures, theoretical questions, and standard problems.
* **Core Topics Include**:
  * Foundations of ${subject} theory.
  * Practical application workflows and common pitfalls.
  * Standard numerical problems/analysis frequently encountered in past finals.
  * Key methodologies and standard definitions required for full scoring.

---

### **CORE CONCEPTS & FORMULAS**
Here are the essential definitions and concepts you should commit to memory:

1. **Fundamental Definition**:
   $$\\text{Success Score} = \\frac{\\text{Rigorous Study Hours} \\times \\text{Quality Notes}}{\\text{Exam Stress Level}}$$
2. **Key Theorem**:
   * *The Review Effect*: Reviewing previous years' papers increases performance by up to 40% due to pattern recognition and cognitive familiarity with test layout.
3. **Core Concept**:
   * Study with intent. Analyze where maximum weight is assigned (usually sections involving system analysis or algorithmic application).

---

### **CONCEPTUAL FLASHCARDS**
* **Flashcard Q**: What is the most effective way to utilize previous year papers?
* **Flashcard A**: Attempt them under timed conditions, self-grade using official solutions, and identify weak modules to revise.
* **Flashcard Q**: What is the reputation milestone reward in StudyVault?
* **Flashcard A**: Contributing high-quality papers increments your peer standing, unlocking badges such as Savior, Scholar, or Legend, while helping your classmates.

---

### **MINI PRACTICE QUIZ**
* **Q1**: Which study methodology produces the best retention rates according to pedagogical research?
  * A) Rereading notes 5 times in a row passively
  * B) Active recall combined with spaced repetition and trial questions
  * C) Pulling an all-nighter with energy drinks
  * D) Highlighting 90% of the textbook page
* **Answer**: B
* **Explanation**: Active recall forces the brain to retrieve information, which strengthens neural pathways far more than passive reading.

* **Q2**: In StudyVault, which action rewards you the highest contributor reputation points?
  * A) Deleting old files
  * B) Spamming empty comments
  * C) Uploading rare, verified exam solutions or high-quality textbook notes
  * D) Refreshing the homepage
* **Answer**: C
* **Explanation**: Contributing verified solution sets and notes adds immense value to the community, resulting in upvotes and rapid reputation level-ups.

* **Q3**: What does the StudyVault exam countdown timer help a student avoid?
  * A) Waking up early
  * B) Poor time management and cramming surprises
  * C) Attending university lectures
  * D) Group study sessions
* **Answer**: B
* **Explanation**: Countdowns keep you acutely aware of impending exam deadlines so you can pace your study schedules effectively.`;
}

// Setup Vite Dev Server / Static files handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyVault backend server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
