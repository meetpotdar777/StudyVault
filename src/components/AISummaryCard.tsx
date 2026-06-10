import React, { useState } from "react";
import { Sparkles, Brain, HelpCircle, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from "lucide-react";
import { Paper } from "../types";

interface AISummaryCardProps {
  paper: Paper;
}

export default function AISummaryCard({ paper }: AISummaryCardProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [revealedFlashcard, setRevealedFlashcard] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Generate AI Summary calling the server endpoint
  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary("");
    setRevealedFlashcard(null);
    setSelectedAnswers({});
    setQuizScore(null);

    try {
      const response = await fetch("/api/summarize-paper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: paper.title,
          subject: paper.subject,
          code: paper.subjectCode,
          year: paper.year,
          docType: paper.docType,
          textContent: paper.textContent,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch response from Gemini service.");
      }

      setSummary(data.summary || "");
      setIsSimulated(data.isSimulated || false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while communicating with the AI server.");
    } finally {
      setLoading(false);
    }
  };

  // Parsing the generated markdown to construct highly interactive elements (Flashcards & Quizzes)
  // Since we instructed the AI to provide them in specific formats, we can parse them elegantly or present the text directly if parsing fails.
  const parsedSections = React.useMemo(() => {
    if (!summary) return null;

    const sections = {
      executiveSummary: [] as string[],
      concepts: [] as string[],
      flashcards: [] as { question: string; answer: string }[],
      quiz: [] as { question: string; options: { letter: string; text: string }[]; answer: string; explanation: string }[],
      rawMarkdown: summary,
    };

    try {
      // Find Flashcards: format "* **Flashcard Q**: ... \n * **Flashcard A**: ..."
      const flashcardRegex = /\*\s+\*\*Flashcard Q\*\*:\s*([^\n]+)\s*\n\s*\*\s+\*\*Flashcard A\*\*:\s*([^\n]+)/gi;
      let fcMatch;
      while ((fcMatch = flashcardRegex.exec(summary)) !== null) {
        sections.flashcards.push({
          question: fcMatch[1].trim(),
          answer: fcMatch[2].trim(),
        });
      }

      // If no flashcards found via regex, attempt fallback parsing
      if (sections.flashcards.length === 0) {
        const fcSplit = summary.split("### **CONCEPTUAL FLASHCARDS**");
        if (fcSplit.length > 1) {
          const block = fcSplit[1].split("###")[0];
          const lines = block.split("\n").filter(l => l.trim().length > 0);
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes("Flashcard Q") || lines[i].includes("Q:")) {
              const qText = lines[i].replace(/[*-]\s*\*\*Flashcard Q\*\*:/i, "").replace(/[*-]\s*Q:/i, "").trim();
              const nextLine = lines[i + 1] || "";
              if (nextLine.includes("Flashcard A") || nextLine.includes("A:")) {
                const aText = nextLine.replace(/[*-]\s*\*\*Flashcard A\*\*:/i, "").replace(/[*-]\s*A:/i, "").trim();
                sections.flashcards.push({ question: qText, answer: aText });
                i++;
              }
            }
          }
        }
      }

      // Find Quiz Questions: Q1, Q2, Q3
      const quizBlockSplit = summary.split("### **MINI PRACTICE QUIZ**");
      if (quizBlockSplit.length > 1) {
        const quizBlock = quizBlockSplit[1].split("###")[0]; // keep only the quiz block
        // Parse individual questions
        const qMatches = quizBlock.split(/Q\d+:/gi);
        // Exclude the first split which is empty or header
        for (let j = 1; j < qMatches.length; j++) {
          const block = qMatches[j];
          const lines = block.split("\n").map(l => l.trim()).filter(l => l.length > 0);
          
          let questionText = lines[0]?.replace(/[*-]\s*/, "") || "";
          const options: { letter: string; text: string }[] = [];
          let answerLetter = "";
          let explanationText = "";

          lines.forEach(line => {
            if (line.match(/^[A-D]\)/i)) {
              const letter = line[0].toUpperCase();
              const text = line.substring(2).trim();
              options.push({ letter, text });
            } else if (line.toLowerCase().startsWith("answer:")) {
              answerLetter = line.replace(/answer:/i, "").replace(/[*_]/g, "").trim().toUpperCase();
            } else if (line.toLowerCase().startsWith("explanation:")) {
              explanationText = line.replace(/explanation:/i, "").trim();
            }
          }); // end lines.forEach

          // If no options parsed but contains bullet lists:
          if (options.length === 0) {
            lines.forEach(line => {
              if (line.startsWith("- A)") || line.startsWith("* A)")) {
                options.push({ letter: "A", text: line.substring(4).trim() });
              } else if (line.startsWith("- B)") || line.startsWith("* B)")) {
                options.push({ letter: "B", text: line.substring(4).trim() });
              } else if (line.startsWith("- C)") || line.startsWith("* C)")) {
                options.push({ letter: "C", text: line.substring(4).trim() });
              } else if (line.startsWith("- D)") || line.startsWith("* D)")) {
                options.push({ letter: "D", text: line.substring(4).trim() });
              }
            });
          }

          if (questionText) {
            sections.quiz.push({
              question: questionText,
              options,
              answer: answerLetter,
              explanation: explanationText || "Correct Answer verification confirmed."
            });
          }
        }
      }

      // Try extraction of summaries
      const summarySplit = summary.split("### **EXECUTIVE SUMMARY & KEY TOPICS**");
      if (summarySplit.length > 1) {
        const block = summarySplit[1].split("###")[0];
        sections.executiveSummary = block.split("\n").filter(l => l.trim().startsWith("*") || l.trim().startsWith("-")).map(l => l.replace(/^[*-]\s*/, "").trim());
      }
    } catch (ex) {
      console.warn("Failed to parse AI markdown sections", ex);
    }

    return sections;
  }, [summary]);

  const handleSelectAnswer = (qIdx: number, letter: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: letter }));
  };

  const handleGradeQuiz = (totalQs: number) => {
    let score = 0;
    if (!parsedSections) return;
    parsedSections.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        score++;
      }
    });
    setQuizScore(score);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="ai-summary-host">
      {/* Header Banner */}
      <div className="bg-indigo-950/40 px-6 py-5 border-b border-indigo-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              StudyVault AI Study Companion
            </h3>
            <p className="text-xs text-indigo-300">
              Generate interactive study guides, dynamic flashcards, and practice quizzes for this paper.
            </p>
          </div>
        </div>

        {!summary && !loading && (
          <button
            onClick={generateSummary}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2.5 rounded-xl font-semibold shadow-md transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            id="generate-ai-btn"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Study Guide</span>
          </button>
        )}

        {summary && (
          <button
            onClick={generateSummary}
            disabled={loading}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center" id="ai-loading-state">
          <div className="inline-block relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <h4 className="text-slate-200 font-semibold text-sm">Analyzing Exam Content...</h4>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
            Gemini is digesting definitions, finding key concepts, building practice quizzes, and authoring flashcards for you.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-6 bg-red-950/20 border border-red-900/50 m-6 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-red-400 text-sm font-semibold">Generation Failed</h4>
            <p className="text-xs text-slate-300 mt-1 font-mono">{error}</p>
            <button
              onClick={generateSummary}
              className="mt-3 text-xs bg-red-900/40 text-red-200 px-3 py-1.5 rounded-lg border border-red-800 hover:bg-red-900/60 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Showcase area */}
      {summary && !loading && (
        <div className="p-6 space-y-6">
          {/* Note if mock is served */}
          {isSimulated && (
            <div className="bg-amber-950/40 border border-amber-900/50 text-amber-200 text-[11px] px-3.5 py-2.5 rounded-xl flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              <span><strong>Sandbox Simulation Mode:</strong> Since your custom server is booting or the standard API threshold is met, we have loaded a high-fidelity curated exam package so you can test all features seamlessly.</span>
            </div>
          )}

          {/* Tab Options/Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left/Middle Column (Executive Summary & Key Concepts) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Summary Block */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl">
                <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  Executive Summary & Topics
                </h4>
                {parsedSections?.executiveSummary && parsedSections.executiveSummary.length > 0 ? (
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {parsedSections.executiveSummary.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // Fallback: If parsing failed, render directly using clean whitespace
                  <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text font-serif">
                    {summary.split("### **CORE CONCEPTS")[0]?.replace(/### \*\*EXECUTIVE SUMMARY & KEY TOPICS\*\*/i, "").trim()}
                  </div>
                )}
              </div>

              {/* Core Concepts Block */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl">
                <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Key Formulas & Theories
                </h4>
                {/* Find middle block from raw text to ensure math/expressions are displayed properly */}
                <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-mono select-text bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                  {summary.includes("### **CORE CONCEPTS") 
                    ? summary.split("### **CORE CONCEPTS")[1]?.split("### **CONCEPTUAL FLASHCARDS")[0]?.trim()
                    : "Review the full syllabus contents above for vital definitions."}
                </div>
              </div>

            </div>

            {/* Right Column (Flashcards & Practice Quiz) */}
            <div className="space-y-6">

              {/* Conceptual Flashcards */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl">
                <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Exam Flashcards
                </h4>
                {parsedSections?.flashcards && parsedSections.flashcards.length > 0 ? (
                  <div className="space-y-4">
                    {parsedSections.flashcards.slice(0, 4).map((fc, idx) => {
                      const isRevealed = revealedFlashcard === idx;
                      return (
                        <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 transition-all">
                          <p className="text-xs font-semibold text-slate-200">
                            Q: {fc.question}
                          </p>
                          
                          <button
                            onClick={() => setRevealedFlashcard(isRevealed ? null : idx)}
                            className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <span>{isRevealed ? "Hide Answer" : "Reveal Peer Answer"}</span>
                            {isRevealed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {isRevealed && (
                            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
                              A: {fc.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No structured flashcards generated for this paper.</p>
                )}
              </div>

              {/* Countdown / Smart Badge */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-900/40 rounded-xl flex items-center gap-3">
                <Brain className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-semibold text-indigo-200">AI Adaptive Memory Rating</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Attempt flashcards and quiz questions below to calibrate exam readiness metric.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Practice Quiz Section */}
          <div className="border border-slate-800/80 rounded-xl p-5 bg-slate-950/30 mt-6" id="practice-quiz-panel">
            <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Dynamic Mini-Practice Quiz
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-normal">3 Questions</span>
            </h4>

            {parsedSections?.quiz && parsedSections.quiz.length > 0 ? (
              <div className="space-y-6">
                {parsedSections.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-900/40 p-4 border border-slate-800/60 rounded-xl">
                    <p className="text-xs font-semibold text-slate-200 mb-3">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt) => {
                        const isSelected = selectedAnswers[qIdx] === opt.letter;
                        const isCorrect = q.answer === opt.letter;
                        const showReconciliation = quizScore !== null;
                        
                        let optionStyle = "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700";
                        if (isSelected) {
                          optionStyle = "bg-indigo-600/30 text-indigo-200 border-indigo-500";
                        }
                        if (showReconciliation) {
                          if (isCorrect) {
                            optionStyle = "bg-emerald-950/40 text-emerald-300 border-emerald-500 font-semibold";
                          } else if (isSelected) {
                            optionStyle = "bg-red-950/40 text-red-300 border-red-500";
                          }
                        }

                        return (
                          <button
                            key={opt.letter}
                            onClick={() => !showReconciliation && handleSelectAnswer(qIdx, opt.letter)}
                            disabled={showReconciliation}
                            className={`flex items-start text-xs text-left p-2.5 border rounded-lg transition-all cursor-pointer ${optionStyle}`}
                          >
                            <span className="font-mono font-bold pr-2">{opt.letter})</span>
                            <span className="leading-tight">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizScore !== null && (
                      <div className="mt-3.5 pt-3 border-t border-slate-800 text-[11px] space-y-1">
                        <p className={selectedAnswers[qIdx] === q.answer ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                          {selectedAnswers[qIdx] === q.answer ? "✓ Correct!" : `✗ Incorrect. Correct answer: ${q.answer}`}
                        </p>
                        <p className="text-slate-400 italic">
                          <strong>Rationale:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Score Calculation / Trigger Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div>
                    {quizScore !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-900/60 text-indigo-300 text-xs px-3 py-1.5 rounded-lg border border-indigo-500/20 font-bold">
                          Final Score: {quizScore} / {parsedSections.quiz.length}
                        </div>
                        <p className="text-xs text-slate-400">
                          {quizScore === parsedSections.quiz.length 
                            ? "Splendid work! You are fully locked & loaded for this segment." 
                            : "Good try! Consider reviewing the concept formulations on the left."}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Answer all questions above to test your logic retrieval efficiency.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {quizScore !== null && (
                      <button
                        onClick={() => {
                          setSelectedAnswers({});
                          setQuizScore(null);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-xl transition-all font-medium cursor-pointer"
                      >
                        Retake Quiz
                      </button>
                    )}
                    {quizScore === null && (
                      <button
                        onClick={() => handleGradeQuiz(parsedSections.quiz.length)}
                        disabled={Object.keys(selectedAnswers).length < parsedSections.quiz.length}
                        className="bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Submit & Check Answers
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No practice quiz generated for this document content yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Guide prompt */}
      {!summary && !loading && (
        <div className="p-8 text-center bg-slate-950/20">
          <Sparkles className="w-8 h-8 text-indigo-500/50 mx-auto mb-2" />
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Ready to enhance your memory? Click <strong>"Generate Study Guide"</strong> to summon Gemini AI-driven insights, formulas, flashcards, and a customized MCQ practice assessment.
          </p>
        </div>
      )}
    </div>
  );
}
