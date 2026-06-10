import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Bookmark, 
  Award, 
  Clock, 
  Upload, 
  ThumbsUp, 
  Flame, 
  ChevronRight, 
  Calendar, 
  Sparkles, 
  GraduationCap, 
  MessageSquare, 
  Filter, 
  Eye, 
  Download,
  AlertTriangle,
  FileText,
  User,
  Heart,
  HelpCircle,
  Binary,
  Cpu,
  Zap,
  BarChart3,
  CheckCircle,
  BookMarked,
  Info,
  Trophy,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DocType, Paper, SubjectCategory, Contributor, Countdown } from "./types";
import { INITIAL_CATEGORIES, INITIAL_PAPERS, INITIAL_LEADERBOARD, INITIAL_COUNTDOWNS } from "./initialData";
import PDFViewer from "./components/PDFViewer";
import AISummaryCard from "./components/AISummaryCard";
import { DashboardStats } from "./components/DashboardStats";
import { StudyTimer } from "./components/StudyTimer";
import { AchievementList, ACHIEVEMENTS } from "./components/AchievementList";
import { PersonalNotes } from "./components/PersonalNotes";

export default function App() {
  // --- Persistent & Core States ---
  const [papers, setPapers] = useState<Paper[]>(() => {
    const local = localStorage.getItem("studyvault_papers");
    return local ? JSON.parse(local) : INITIAL_PAPERS;
  });

  const [leaderboard, setLeaderboard] = useState<Contributor[]>(() => {
    const local = localStorage.getItem("studyvault_leaderboard");
    return local ? JSON.parse(local) : INITIAL_LEADERBOARD;
  });

  const [countdowns, setCountdowns] = useState<Countdown[]>(() => {
    const local = localStorage.getItem("studyvault_countdowns");
    return local ? JSON.parse(local) : INITIAL_COUNTDOWNS;
  });

  // --- Active Session States ---
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const local = localStorage.getItem("studyvault_recent_searches");
    return local ? JSON.parse(local) : [];
  });
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "popular">("newest");
  const [viewBookmarksOnly, setViewBookmarksOnly] = useState(false);
  const [recentlyViewedPapers, setRecentlyViewedPapers] = useState<Paper[]>(() => {
    const local = localStorage.getItem("studyvault_recently_viewed");
    return local ? JSON.parse(local) : [];
  });

  // --- Interaction / Modal States ---
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddCountdown, setShowAddCountdown] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"papers" | "leaderboard" | "countdowns" | "stats">("papers");
  const [dailyChallengeId, setDailyChallengeId] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(() => {
    const local = localStorage.getItem("studyvault_session_count");
    return local ? parseInt(local) : 0;
  });
  const [personalNotes, setPersonalNotes] = useState<{ [key: string]: string }>(() => {
    const local = localStorage.getItem("studyvault_personal_notes");
    return local ? JSON.parse(local) : {};
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    const local = localStorage.getItem("studyvault_achievements");
    return local ? JSON.parse(local) : [];
  });
  const [viewCount, setViewCount] = useState(() => {
    const local = localStorage.getItem("studyvault_view_count");
    return local ? parseInt(local) : 0;
  });

  // --- New Paper Upload Form ---
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Computer Science & IT");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newYear, setNewYear] = useState("2026");
  const [newDocType, setNewDocType] = useState<DocType>(DocType.QUESTION_PAPER);
  const [newContent, setNewContent] = useState("");
  const [formError, setFormError] = useState("");

  // --- New Countdown Form ---
  const [countdownSubject, setCountdownSubject] = useState("");
  const [countdownDate, setCountdownDate] = useState("");
  const [countdownNote, setCountdownNote] = useState("");

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s !== searchQuery.trim());
        return [searchQuery.trim(), ...filtered].slice(0, 3);
      });
    }
  };

  // --- New Comment ---
  const [commentText, setCommentText] = useState("");

  // --- Drag & Drop state for Form ---
  const [dragActive, setDragActive] = useState(false);

  // --- Toast/Notification State ---
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning"; id: string } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type, id: Date.now().toString() });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Computed Variables ---
  const currentUser = leaderboard.find(p => p.id === "ldr-self") || { score: 0, rank: 0, badge: "Novice" as const };
  const userScore = currentUser.score;
  
  // Level Calculation Logic: 
  // Lvl 1: 0-250, Lvl 2: 250-750, Lvl 3: 750-1500, Lvl 4: 1500-3000, Lvl 5: 3000+
  const getLevelInfo = (score: number) => {
    if (score < 250) return { level: 1, next: 250, label: "Freshman Scholar" };
    if (score < 750) return { level: 2, next: 750, label: "Sophomore Researcher" };
    if (score < 1500) return { level: 3, next: 1500, label: "Junior Contributor" };
    if (score < 3000) return { level: 4, next: 3000, label: "Senior Librarian" };
    return { level: 5, next: 10000, label: "Dean of StudyVault" }; // Cap
  };
  const { level, next, label } = getLevelInfo(userScore);
  const progress = Math.min(100, (userScore / next) * 100);

  const activePaper = papers.find(p => p.id === selectedPaperId) || null;
  const challengePaper = papers.find(p => p.id === dailyChallengeId) || null;

  const uniqueYears = Array.from(new Set(papers.map(p => p.year))).sort((a,b) => (b as string).localeCompare(a as string));

  const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
    if (!query.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-indigo-500/30 text-white rounded-xs px-0.5">{part}</span> 
            : part
        )}
      </>
    );
  };

  // --- Local Persistence Effects ---
  useEffect(() => {
    localStorage.setItem("studyvault_papers", JSON.stringify(papers));
  }, [papers]);

  useEffect(() => {
    localStorage.setItem("studyvault_leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem("studyvault_countdowns", JSON.stringify(countdowns));
  }, [countdowns]);

  useEffect(() => {
    localStorage.setItem("studyvault_recently_viewed", JSON.stringify(recentlyViewedPapers));
  }, [recentlyViewedPapers]);

  useEffect(() => {
    localStorage.setItem("studyvault_session_count", sessionCount.toString());
  }, [sessionCount]);

  useEffect(() => {
    localStorage.setItem("studyvault_personal_notes", JSON.stringify(personalNotes));
  }, [personalNotes]);

  useEffect(() => {
    localStorage.setItem("studyvault_achievements", JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  useEffect(() => {
    localStorage.setItem("studyvault_view_count", viewCount.toString());
  }, [viewCount]);

  useEffect(() => {
    localStorage.setItem("studyvault_recent_searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    if (selectedPaperId) {
      const paper = papers.find(p => p.id === selectedPaperId);
      if (paper) {
        setRecentlyViewedPapers(prev => {
          const filtered = prev.filter(p => p.id !== paper.id);
          return [paper, ...filtered].slice(0, 5);
        });
        setViewCount(prev => prev + 1);
      }
    }
  }, [selectedPaperId, papers]);

  useEffect(() => {
    const bookmarkCount = papers.filter(p => p.bookmarkedByUser).length;
    const stats = {
      viewCount,
      bookmarkCount,
      sessionCount,
      level
    };

    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.requirement(stats)) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        showToast(`🏆 Achievement Unlocked: ${achievement.title}`, "success");
        // Award XP for achievement
        setLeaderboard(prev => prev.map(p => {
          if (p.id === "ldr-self") return { ...p, score: p.score + 100 };
          return p;
        }));
      }
    });
  }, [viewCount, papers, sessionCount, level, unlockedAchievements]);

  useEffect(() => {
    if (papers.length > 0 && !dailyChallengeId) {
      // Pick a "random" paper based on the current date to keep it consistent for the day
      const seed = new Date().toDateString();
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % papers.length;
      setDailyChallengeId(papers[index].id);
    }
  }, [papers, dailyChallengeId]);

  const filteredPapers = papers.filter(paper => {
    const matchesCategory = selectedCategory ? (paper.subject === selectedCategory) : true;
    const matchesDocType = selectedDocType ? (paper.docType === selectedDocType) : true;
    const matchesYear = selectedYear ? paper.year === selectedYear : true;
    const matchesBookmarks = viewBookmarksOnly ? paper.bookmarkedByUser : true;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query 
      ? paper.title.toLowerCase().includes(query) || 
        paper.subjectCode.toLowerCase().includes(query) ||
        paper.textContent.toLowerCase().includes(query) || 
        paper.uploaderName.toLowerCase().includes(query)
      : true;

    return matchesCategory && matchesDocType && matchesSearch && matchesBookmarks && matchesYear;
  }).sort((a,b) => {
    if (sortOrder === 'popular') return b.upvotes - a.upvotes;
    return 0; // Already sorted newest to oldest due to state pre-pending logic
  });

  // --- Action Handlers ---

  const handleUpvote = (paperId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setPapers(prev => prev.map(paper => {
      if (paper.id === paperId) {
        const hasUpvoted = paper.upvotedByUser;
        const newUpvotes = hasUpvoted ? paper.upvotes - 1 : paper.upvotes + 1;
        
        // Dynamic Reputation award for the original uploader
        adjustUploaderReputation(paper.uploaderName, hasUpvoted ? -10 : 10);
        
        showToast(
          hasUpvoted 
            ? `Removed upvote for "${paper.title}".` 
            : `Upvoted! +10 reputation score awarded to uploader ${paper.uploaderName}!`, 
          hasUpvoted ? "info" : "success"
        );

        return {
          ...paper,
          upvotes: newUpvotes,
          upvotedByUser: !hasUpvoted
        };
      }
      return paper;
    }));
  };

  const handleBookmark = (paperId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setPapers(prev => prev.map(paper => {
      if (paper.id === paperId) {
        const isBookmarking = !paper.bookmarkedByUser;
        showToast(
          isBookmarking 
            ? `Saved "${paper.title}" to your offline library bookmarks.` 
            : `Removed "${paper.title}" from bookmarks.`,
          "info"
        );
        return {
          ...paper,
          bookmarkedByUser: isBookmarking
        };
      }
      return paper;
    }));
  };

  const adjustUploaderReputation = (uploaderName: string, points: number) => {
    setLeaderboard(prev => {
      const updated = prev.map(member => {
        if (member.name === uploaderName) {
          const newScore = Math.max(0, member.score + points);
          let rawBadge: "Novice" | "Bronze Scholar" | "Silver Contributor" | "Gold Savior" | "Study Legend" = "Novice";

          if (newScore > 2000) rawBadge = "Study Legend";
          else if (newScore > 1000) rawBadge = "Gold Savior";
          else if (newScore > 500) rawBadge = "Silver Contributor";
          else if (newScore > 200) rawBadge = "Bronze Scholar";

          return {
            ...member,
            score: newScore,
            badge: rawBadge
          };
        }
        return member;
      });

      // Sort leaderboard rank
      return updated
        .sort((a, b) => b.score - a.score)
        .map((player, idx) => ({ ...player, rank: idx + 1 }));
    });
  };

  const handleDownloadStub = (paperId: string) => {
    setPapers(prev => prev.map(paper => {
      if (paper.id === paperId) {
        showToast(`📥 Downloading "${paper.title}" layout stub! Sourcing local offline content...`, "success");
        return { ...paper, downloadCount: paper.downloadCount + 1 };
      }
      return paper;
    }));
  };

  const handleSubmitComment = (paperId: string) => {
    if (!commentText.trim()) return;

    const newCommentObj = {
      id: "comment-" + Date.now(),
      author: "Me (You)",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      text: commentText.trim(),
      timestamp: "Just now"
    };

    setPapers(prev => prev.map(paper => {
      if (paper.id === paperId) {
        showToast("Discussion reply posted safely!", "success");
        return {
          ...paper,
          comments: [...paper.comments, newCommentObj]
        };
      }
      return paper;
    }));

    setCommentText("");
  };

  // --- Real-Time Exam Countdown Clock helper ---
  const calculateDaysRemaining = (examDateStr: string) => {
    const diff = new Date(examDateStr).getTime() - new Date().getTime();
    if (diff <= 0) return { days: 0, hours: 0, prefix: "Overdue/Live" };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, prefix: `${days}d ${hours}h left` };
  };

  // --- New Exam Countdown Registration ---
  const handleCreateCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countdownSubject.trim() || !countdownDate) return;

    const newCounter: Countdown = {
      id: "cnt-" + Date.now(),
      subjectName: countdownSubject.trim(),
      examDate: countdownDate + "T09:00:00",
      note: countdownNote.trim() || "Do past papers on StudyVault!"
    };

    setCountdowns(prev => [newCounter, ...prev]);
    showToast(`Registered new exam countdown: ${newCounter.subjectName}!`, "success");
    setCountdownSubject("");
    setCountdownDate("");
    setCountdownNote("");
    setShowAddCountdown(false);
  };

  const handleDeleteCountdown = (id: string) => {
    setCountdowns(prev => {
      const match = prev.find(c => c.id === id);
      if (match) {
        showToast(`Cleared exam countdown for ${match.subjectName}.`, "info");
      }
      return prev.filter(c => c.id !== id);
    });
  };

  // --- New Resource Upload handler ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Simulated reader: Read raw text contents of draft exam paper
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewContent(event.target.result as string);
          setNewTitle(file.name.replace(/\.[^/.]+$/, "") + " Draft");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadPaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newTitle.trim() || !newSubjectCode.trim() || !newContent.trim()) {
      setFormError("Title, Subject Code, and Document Content are strictly required.");
      return;
    }
    
    setIsSaving(true);
    // Simulate API delay for save
    await new Promise(resolve => setTimeout(resolve, 800));

    const paperId = "paper-" + Date.now();
    const newPaperItem: Paper = {
      id: paperId,
      title: newTitle.trim(),
      subject: newSubject,
      subjectCode: newSubjectCode.trim().toUpperCase(),
      year: newYear,
      docType: newDocType,
      upvotes: 1,
      upvotedByUser: true,
      bookmarkedByUser: false,
      uploaderName: "You (Student Builder)",
      uploaderRep: 50,
      uploadedDate: new Date().toISOString().split("T")[0],
      textContent: newContent,
      downloadCount: 0,
      comments: []
    };

    // Add to papers
    setPapers(prev => [newPaperItem, ...prev]);

    // Update contributor leaderboard score for self!
    setLeaderboard(prev => {
      const existingYou = prev.find(p => p.id === "ldr-self");
      if (existingYou) {
        const newScore = existingYou.score + 100; // Large boost for uploading!
        let badge: any = "Novice";
        if (newScore > 500) badge = "Silver Contributor";
        else if (newScore > 200) badge = "Bronze Scholar";

        return prev.map(p => p.id === "ldr-self" ? { ...p, score: newScore, uploadsCount: p.uploadsCount + 1, badge } : p)
          .sort((a,b) => b.score - a.score)
          .map((p, idx) => ({ ...p, rank: idx + 1 }));
      } else {
        // Create uploader self profile first time
        const newLdr: Contributor = {
          id: "ldr-self",
          name: "You (Student Builder)",
          score: 100,
          badge: "Novice",
          uploadsCount: 1,
          rank: prev.length + 1
        };
        return [...prev, newLdr]
          .sort((a,b) => b.score - a.score)
          .map((p, idx) => ({ ...p, rank: idx + 1 }));
      }
    });

    // Reset Form & Close
    setNewTitle("");
    setNewSubject("Computer Science & IT");
    setNewSubjectCode("");
    setNewYear("2026");
    setNewDocType(DocType.QUESTION_PAPER);
    setNewContent("");
    setIsSaving(false);
    setShowUploadModal(false);

    // Open uploaded paper immediately
    setSelectedPaperId(paperId);
    showToast(`Successfully published "${newPaperItem.title}"! +100 Reputation awarded to you.`, "success");
  };

  // Helper function to return visual icons for categories
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Binary": return <Binary className="w-4 h-4 text-indigo-400" />;
      case "Cpu": return <Cpu className="w-4 h-4 text-emerald-400" />;
      case "Zap": return <Zap className="w-4 h-4 text-amber-500" />;
      case "BarChart3": return <BarChart3 className="w-4 h-4 text-indigo-400" />;
      default: return <BookOpen className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white" id="studyvault-main-root">
      
      {/* Decorative Header Spark Layer */}
      <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

      {/* Main Top Navigation Head */}
      <header className="bg-slate-950/80 border-b border-slate-900 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo Name */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/10 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/20 shadow-xs flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                StudyVault
              </span>
              <span className="block text-[11px] text-slate-400 font-medium font-mono uppercase tracking-wider">
                Previous Year Paper Co-op
              </span>
            </div>
          </div>

          {/* Quick Stats Banner inside header */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400 pr-10 border-r border-slate-900">
            <div className="text-left">
              <span className="block font-bold text-slate-200 font-mono text-sm">{papers.length}</span>
              <span className="text-[10px] uppercase text-slate-500">Shared Documents</span>
            </div>
            <div className="text-left">
              <span className="block font-bold text-emerald-400 font-mono text-sm">
                {leaderboard.reduce((a, b) => a + b.uploadsCount, 0)}
              </span>
              <span className="text-[10px] uppercase text-slate-500">Contributions</span>
            </div>
            <div className="text-left">
              <span className="block font-bold text-indigo-400 font-mono text-sm">
                {leaderboard.reduce((a, b) => a + b.score, 0)} pts
              </span>
              <span className="text-[10px] uppercase text-slate-500">Total Reputation</span>
            </div>
            <div className="text-left">
              <span className="block font-bold text-amber-500 font-mono text-sm">7 Days</span>
              <span className="text-[10px] uppercase text-slate-500">Study Streak</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-3">
            {/* Toggle bookmarks view option */}
            <button
              onClick={() => {
                setViewBookmarksOnly(prev => !prev);
                setSelectedPaperId(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                viewBookmarksOnly 
                  ? "bg-indigo-900/40 text-indigo-300 border-indigo-500/40 shadow-inner" 
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${viewBookmarksOnly ? "fill-indigo-400 text-indigo-400" : ""}`} />
              <span className="hidden sm:inline">{viewBookmarksOnly ? "Showing Bookmarks" : "My Bookmarks"}</span>
            </button>

            {/* Main Contribute Action */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold font-sans shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              id="header-contribute-btn"
            >
              <Upload className="w-4 h-4" />
              <span>Contribute Paper</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Welcome banner (for lists view context) */}
      {!selectedPaperId && (
        <div className="bg-slate-950 border-b border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative bg-slate-900/40 rounded-3xl p-6 md:p-8 border border-slate-800 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Abs decoration grids */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="max-w-xl text-left">
                <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[11px] font-bold font-mono mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PREVIOUS YEAR PAPERS & SCHOLAR ENGINE</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  Stop scrambling. Share papers. Ace exams together.
                </h1>
                <p className="text-slate-400 text-xs md:text-sm mt-2 leading-relaxed">
                  StudyVault operates on standard student solidarity. Submit past papers, solutions or midterm guides. Read PDFs with built-in page logic, and spin up Gemini AI summaries to review flashcards and challenge quizzes!
                </p>
              </div>

              {/* Quick stats board */}
              <div className="flex flex-wrap gap-4 justify-start md:justify-end w-full md:w-auto">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl min-w-[120px] text-center">
                  <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <span className="block text-lg font-bold font-mono text-slate-100">7 Days</span>
                  <span className="text-[10px] text-slate-500">Study Streak 🔥</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl min-w-[120px] text-center">
                  <Award className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <span className="block text-lg font-bold font-mono text-slate-100">{leaderboard[0]?.name.split(" ")[0]}</span>
                  <span className="text-[10px] text-slate-500">Leader 🏆</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl min-w-[120px] text-center">
                  <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <span className="block text-lg font-bold font-mono text-slate-100">
                    {countdowns.length > 0 ? calculateDaysRemaining(countdowns[0].examDate).prefix : "None"}
                  </span>
                  <span className="text-[10px] text-slate-500">Next Final clock</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* If a paper is selected for intense Workspace view */}
        {selectedPaperId && activePaper ? (
          <div className="space-y-6 text-left" id="selected-workspace-wrapper">
            
            {/* Back action / Title bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPaperId(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl flex items-center gap-1 font-medium transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Back to Study Directory</span>
                </button>
                <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {activePaper.subject} • {activePaper.subjectCode}
                </span>
              </div>

              {/* Upvote / Bookmark count block */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpvote(activePaper.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    activePaper.upvotedByUser
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/35"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title="Upvote Paper"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${activePaper.upvotedByUser ? "fill-amber-400" : ""}`} />
                  <span>{activePaper.upvotes} Upvotes</span>
                </button>

                <button
                  onClick={() => handleBookmark(activePaper.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    activePaper.bookmarkedByUser
                      ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/40"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${activePaper.bookmarkedByUser ? "fill-indigo-400 text-indigo-400" : ""}`} />
                  <span>{activePaper.bookmarkedByUser ? "Bookmarked" : "Bookmark"}</span>
                </button>
              </div>
            </div>

            {/* Main Header Descriptor */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-bl-xl text-xs font-mono uppercase font-bold">
                {activePaper.docType}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2.5 py-1 rounded-md font-mono tracking-wider font-bold">
                    {activePaper.subjectCode}
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-md font-mono font-bold">
                    YEAR {activePaper.year}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold text-white">
                  {activePaper.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-slate-800 text-slate-400 p-1 rounded-full">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span>Contributor: <strong className="text-slate-300">{activePaper.uploaderName}</strong> ({activePaper.uploaderRep} rep score)</span>
                  </div>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span>Uploaded on {activePaper.uploadedDate}</span>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span>{activePaper.comments.length} Discussion comments</span>
                </div>
              </div>
            </div>

            {/* Split layout: PDF View simulator & AI summaries */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Main Column */}
              <div className="xl:col-span-8 space-y-6">
                {/* Main PDF view element */}
                <PDFViewer 
                  paper={activePaper} 
                  onDownload={() => handleDownloadStub(activePaper.id)} 
                />

                {/* AI study guide companion element */}
                <AISummaryCard paper={activePaper} />
              </div>

              {/* Sidebar Column */}
              <div className="xl:col-span-4 h-full">
                <PersonalNotes 
                  paperId={activePaper.id}
                  notes={personalNotes[activePaper.id] || ""}
                  onSave={(note) => {
                    setPersonalNotes(prev => ({ ...prev, [activePaper.id]: note }));
                    showToast("Study note saved successfully", "success");
                  }}
                  onDelete={() => {
                    const next = { ...personalNotes };
                    delete next[activePaper.id];
                    setPersonalNotes(next);
                    showToast("Study note deleted", "info");
                  }}
                />
              </div>

            </div>

            {/* Campus Dialogue Comments Area */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8" id="peer-comments-segment">
              <h3 className="text-base font-bold text-slate-200 mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Student Discussion & Solution Dialogue
              </h3>

              {/* Form Input */}
              <div className="flex gap-3 mb-8">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" 
                  alt="My Avatar" 
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 shrink-0" 
                />
                <div className="flex-1">
                  <textarea
                    placeholder="Solve a question together or ask for peer guidance on Section B..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-4 py-3 rounded-2xl text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none min-h-[80px]"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[10px] text-slate-500">
                      Keep dialogue supportive and academically minded.
                    </p>
                    <button
                      onClick={() => handleSubmitComment(activePaper.id)}
                      disabled={!commentText.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments list */}
              {activePaper.comments.length > 0 ? (
                <div className="space-y-4">
                  {activePaper.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                      <img 
                        src={comment.avatar} 
                        alt={comment.author} 
                        className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 shrink-0" 
                      />
                      <div className="text-left flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-300">{comment.author}</h5>
                          <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed bg-slate-950/20 p-2.5 rounded-lg border border-slate-900/55 select-text">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-slate-800/60 rounded-2xl bg-slate-950/20">
                  <MessageSquare className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500">No student solution guide comments posted yet. Take lead and ask a question!</p>
                </div>
              )}

            </div>

          </div>
        ) : (
          /* General Dashboard with Sideboards and List Search */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            
            {/* Left Column - Navigation, Categories & Clock Countdown */}
            <div className="lg:col-span-4 space-y-6">

              {/* Study Timer Component */}
              <StudyTimer 
                onSessionComplete={(type) => {
                  if (type === 'study') {
                    setSessionCount(prev => prev + 1);
                    adjustUploaderReputation("You (Student Builder)", 50);
                    showToast("🏆 Study goal reached! +50 XP awarded for focused concentration.", "success");
                  }
                }}
              />

              {/* Developed By Credit */}
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Developed by <span className="text-slate-300 font-bold group-hover:text-indigo-400 transition-colors">Meet Potdar</span>
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              </div>

              {/* User XP Rank / Level Progress */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs overflow-hidden relative group">
                <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Award className="w-24 h-24 text-indigo-400 rotate-12" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-lg shadow-lg shadow-indigo-500/20">
                      {level}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{label}</h4>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{userScore} / {next} XP</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-linear-to-r from-indigo-600 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium">Next Milestone: {next - userScore} XP remaining</p>
                  </div>
                </div>
              </div>

              {/* Achievements Sidebar Section */}
              <AchievementList 
                achievements={unlockedAchievements} 
                stats={{
                  viewCount,
                  bookmarkCount: papers.filter(p => p.bookmarkedByUser).length,
                  sessionCount,
                  level
                }}
              />

              {/* Subject Categorizations */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-400 mb-4 flex items-center justify-between">
                  <span>Subject Categories</span>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-[10px] text-indigo-400 normal-case hover:underline cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  )}
                </h3>
                
                <div className="space-y-2">
                  {INITIAL_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                        className={`w-full text-left p-3.5 border rounded-xl flex items-start gap-3.5 transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-indigo-900/20 text-white border-indigo-500/40" 
                            : "bg-slate-950/50 text-slate-300 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-indigo-600/20 text-indigo-400" : "bg-slate-900 text-slate-400"}`}>
                          {getCategoryIcon(cat.iconName)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{cat.name}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{cat.code}</span>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Exam Countdowns Clock Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-teal-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-400 animate-pulse" />
                    <span>Exam Countdown Clock</span>
                  </h3>
                  <button
                    onClick={() => setShowAddCountdown(prev => !prev)}
                    className="text-slate-400 hover:text-white p-1 bg-slate-950/50 rounded-md border border-slate-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add new countdown form option */}
                <AnimatePresence>
                  {showAddCountdown && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 mb-4 overflow-hidden space-y-3"
                      onSubmit={handleCreateCountdown}
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Course Term Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CS201 Algorithms Final"
                          value={countdownSubject}
                          onChange={(e) => setCountdownSubject(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 w-36 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Due Date</label>
                          <input
                            type="date"
                            required
                            value={countdownDate}
                            onChange={(e) => setCountdownDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 w-36 text-slate-100 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quick Note</label>
                          <input
                            type="text"
                            placeholder="e.g. Review graphs"
                            value={countdownNote}
                            onChange={(e) => setCountdownNote(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 w-36 text-slate-100 placeholder:text-slate-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Register Countdown Link
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {countdowns.length > 0 ? (
                  <div className="space-y-3">
                    {countdowns.map((cnt) => {
                      const clockInfo = calculateDaysRemaining(cnt.examDate);
                      const isDanger = clockInfo.days <= 3;
                      return (
                        <div key={cnt.id} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between gap-3 relative group">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{cnt.subjectName}</h4>
                            <p className="text-[10px] text-slate-400 font-medium font-mono">{cnt.examDate.split("T")[0]}</p>
                            {cnt.note && <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{cnt.note}</p>}
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`block text-xs font-extrabold font-mono px-2 py-1 rounded-md ${
                              isDanger ? "bg-red-950/30 text-red-400 border border-red-900/30" : "bg-emerald-950/30 text-emerald-400 border border-emerald-900/30"
                            }`}>
                              {clockInfo.days} Days Left
                            </span>
                            <button
                              onClick={() => handleDeleteCountdown(cnt.id)}
                              className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 hover:underline transition-opacity mt-1 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic inline-block py-2">No exam countdowns defined. Use "+" to track a schedule.</p>
                )}
              </div>

              {/* Contributors Wall & Reward System */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-amber-400 mb-4 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Elite Contributor Leaderboard</span>
                </h3>
                
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((member) => (
                    <div 
                      key={member.id} 
                      className={`flex items-center justify-between p-3.5 rounded-xl border ${
                        member.id === "ldr-self" 
                          ? "bg-indigo-950/20 border-indigo-500/30" 
                          : "bg-slate-950/30 border-slate-850"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-500 w-4">
                          #{member.rank}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{member.name} {member.id === "ldr-self" && "⭐"}</h4>
                          <span className="text-[10px] bg-slate-900 text-amber-300 font-semibold px-2 py-0.5 rounded-md border border-slate-800">
                            {member.badge}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-xs font-mono font-bold text-slate-200">{member.score} pts</span>
                        <span className="text-[9px] text-slate-500 font-medium">{member.uploadsCount} papers</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-850 mt-4">
                  <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                    📢 Submit verified papers (+100 pts) and earn peer upvotes (+10 pts) to unlock titles. High contributors gain access to the restricted moderator circles.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column - Directory and Document Listings */}
            <div className="lg:col-span-8 space-y-6">

              {/* Application Level Tabs System Nav */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveTab("papers")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "papers" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Papers
                </button>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "leaderboard" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "stats" ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  My Stats
                </button>
              </div>

              {activeTab === "stats" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600/10 rounded-lg">
                          <Zap className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase font-mono">Current XP</span>
                      </div>
                      <div className="text-3xl font-bold text-white font-mono">{userScore}</div>
                      <div className="mt-1 text-[10px] text-slate-500 font-medium">Rank Level {level}</div>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <Flame className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase font-mono">Focus Time</span>
                      </div>
                      <div className="text-3xl font-bold text-white font-mono">{sessionCount}</div>
                      <div className="mt-1 text-[10px] text-slate-500 font-medium">Sessions fixed</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <Bookmark className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase font-mono">Resources</span>
                      </div>
                      <div className="text-3xl font-bold text-white font-mono">{papers.filter(p => p.bookmarkedByUser).length}</div>
                      <div className="mt-1 text-[10px] text-slate-500 font-medium">Bookmarked total</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                          <Award className="w-5 h-5 text-pink-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase font-mono">Views</span>
                      </div>
                      <div className="text-3xl font-bold text-white font-mono">{viewCount}</div>
                      <div className="mt-1 text-[10px] text-slate-500 font-medium">Papers inspected</div>
                    </div>
                  </div>

                  <DashboardStats papers={papers} />
                </motion.div>
              )}

              {activeTab === "leaderboard" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
                >
                   <h3 className="text-base font-bold text-white mb-6">Community Elite: All Contributors</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {leaderboard.map((member) => (
                        <div key={member.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-500 w-4">#{member.rank}</span>
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} className="w-8 h-8 rounded-lg" alt="" />
                              <div>
                                 <div className="text-xs font-bold text-slate-100">{member.name}</div>
                                 <div className="text-[10px] text-indigo-400 font-medium">{member.badge}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-xs font-bold text-white">{member.score} XP</div>
                              <div className="text-[9px] text-slate-500">{member.uploadsCount} papers</div>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}

              {activeTab === "papers" && (
                <div className="space-y-6">
                  {/* Statistics Dashboard */}
                  <DashboardStats papers={papers} />

              {/* Daily Flash Challenge */}
              {challengePaper && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-linear-to-br from-slate-900 to-indigo-950/20 border border-indigo-500/20 rounded-2xl p-5 shadow-xl shadow-indigo-500/5 relative overflow-hidden group"
                >
                  <div className="absolute right-4 top-4 p-2 bg-indigo-500/10 rounded-full text-indigo-400 group-hover:rotate-12 transition-transform duration-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  
                  <div className="relative z-10 max-w-md space-y-3">
                    <div className="flex items-center gap-2">
                       <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-tighter">Daily Scholar Challenge</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                      Quick Review: {challengePaper.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Complete a 5-minute study session of this trending {challengePaper.docType.toLowerCase()} to earn a <strong>+25 XP bonus</strong> today.
                    </p>
                    <button 
                      onClick={() => setSelectedPaperId(challengePaper.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                      Start Challenge
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Recently Viewed Papers */}
              {recentlyViewedPapers.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-indigo-400 mb-4 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span>Recently Viewed</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentlyViewedPapers.map(paper => (
                      <button
                        key={paper.id}
                        onClick={() => setSelectedPaperId(paper.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                      >
                        {paper.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Control Header Dashboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                
                {/* Search Text input and type filter row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search papers, subject codes (e.g. CS201), topics, or uploaders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl pl-9 pr-10 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 rotate-45" />
                      </button>
                    )}
                  </div>

                  {/* Added Sorter Dropdown */}
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "newest" | "popular")}
                    className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-3 text-slate-300 focus:outline-hidden cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>

                  {/* Document Type Selector Quick Filter */}
                  <div className="flex gap-1.5 h-10 select-none">
                    <button
                      onClick={() => setSelectedDocType(null)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        !selectedDocType 
                          ? "bg-slate-950 text-white border-slate-700" 
                          : "bg-slate-950/30 text-slate-400 border-slate-850 hover:text-white"
                      }`}
                    >
                      All Types
                    </button>
                    {Object.values(DocType).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedDocType(selectedDocType === type ? null : type)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                          selectedDocType === type
                            ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 font-semibold"
                            : "bg-slate-950/30 text-slate-400 border-slate-850 hover:text-white"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search History Chips */}
                {recentSearches.length > 0 && !searchQuery && (
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Recent:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((s, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setSearchQuery(s)}
                          className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg border border-slate-800 transition cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                      <button 
                        onClick={() => setRecentSearches([])}
                        className="text-[10px] text-slate-600 hover:text-red-400 transition cursor-pointer ml-1"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Year Filter Pills */}
                <div className="flex items-center gap-2 px-1 py-1 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest shrink-0">Year:</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setSelectedYear(null)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer whitespace-nowrap ${!selectedYear ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                    >
                      All Years
                    </button>
                    {uniqueYears.map(year => (
                      <button 
                        key={year}
                        onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer whitespace-nowrap ${selectedYear === year ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                  <div className="ml-auto text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-900 italic">
                    {filteredPapers.length} results
                  </div>
                </div>

                {/* Sub info category filters row if category is selected */}
                {(selectedCategory || selectedDocType || searchQuery || viewBookmarksOnly || selectedYear) && (
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/50 px-3.5 py-2 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active filters:</span>
                    {selectedCategory && (
                      <span className="text-[10px] bg-indigo-950/50 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-800 flex items-center gap-1">
                        Category: {selectedCategory}
                        <button onClick={() => setSelectedCategory(null)} className="hover:text-white cursor-pointer font-bold">×</button>
                      </span>
                    )}
                    {selectedYear && (
                      <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                        Year: {selectedYear}
                        <button onClick={() => setSelectedYear(null)} className="hover:text-white cursor-pointer font-bold">×</button>
                      </span>
                    )}
                    {selectedDocType && (
                      <span className="text-[10px] bg-emerald-950/50 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-800 flex items-center gap-1">
                        Type: {selectedDocType}
                        <button onClick={() => setSelectedDocType(null)} className="hover:text-white cursor-pointer font-bold">×</button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="text-[10px] bg-slate-850 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1 max-w-[200px] truncate">
                        Query: "{searchQuery}"
                        <button onClick={() => setSearchQuery("")} className="hover:text-white cursor-pointer font-bold">×</button>
                      </span>
                    )}
                    {viewBookmarksOnly && (
                      <span className="text-[10px] bg-purple-950/50 text-purple-300 px-2 py-0.5 rounded-md border border-purple-800 flex items-center gap-1">
                        Bookmarks only
                        <button onClick={() => setViewBookmarksOnly(false)} className="hover:text-white cursor-pointer font-bold">×</button>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedDocType(null);
                        setSearchQuery("");
                        setViewBookmarksOnly(false);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white ml-auto"
                    >
                      Clear All
                    </button>
                  </div>
                )}

              </div>

              {/* Main Papers Directory Grid */}
              {filteredPapers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPapers.map((paper) => {
                    return (
                      <div
                        key={paper.id}
                        onClick={() => setSelectedPaperId(paper.id)}
                        className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-900/60 cursor-pointer shadow-xs transition-all duration-200 group flex flex-col justify-between"
                      >
                        <div>
                          {/* Upper Header Metadata */}
                          <div className="flex items-center justify-between mb-3 text-[11px] text-slate-400 font-mono">
                            <span className="bg-indigo-600/10 text-indigo-400 px-2 py-0.5 rounded-md font-bold tracking-wide">
                              <HighlightMatch text={paper.subjectCode} query={searchQuery} />
                            </span>
                            {paper.upvotes > 45 && (
                              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold">
                                <Flame className="w-3 h-3" /> Trending
                              </span>
                            )}
                            <span className="bg-slate-950 text-slate-400 px-2 py-0.5 rounded-lg border border-slate-800 font-medium">
                              Year {paper.year}
                            </span>
                          </div>

                          {/* Paper Title */}
                          <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2">
                            <HighlightMatch text={paper.title} query={searchQuery} />
                          </h4>

                          {/* Paper Doc Details */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 min-h-[1.5rem]">
                            <span className="text-[10px] font-sans font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                              {paper.docType}
                            </span>
                            <div className="h-1 w-1 bg-slate-800 rounded-full" />
                            <span className="text-[10px] text-slate-500 truncate max-w-[150px] font-medium">{paper.subject}</span>
                          </div>
                        </div>

                        {/* Lower Action Row - Metadata & Contributor Info */}
                        <div className="mt-5 pt-3.5 border-t border-slate-950 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${paper.uploaderName}`} 
                              alt="uploader shadow"
                              className="w-5 h-5 rounded-md bg-slate-950 border border-slate-800 shrink-0"
                            />
                            <span className="truncate max-w-[90px] font-medium">
                              <HighlightMatch text={paper.uploaderName} query={searchQuery} />
                            </span>
                          </div>

                          {/* Interactivity indicators */}
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <button
                              onClick={(e) => handleUpvote(paper.id, e)}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                                paper.upvotedByUser ? "text-amber-400 font-medium bg-amber-500/5 border border-amber-500/10" : "hover:text-slate-200"
                              }`}
                              title="Upvote"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{paper.upvotes}</span>
                            </button>

                            <button
                              onClick={(e) => handleBookmark(paper.id, e)}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                paper.bookmarkedByUser ? "text-indigo-400 bg-indigo-505/5 border border-indigo-500/10" : "hover:text-slate-200"
                              }`}
                              title="Bookmark"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${paper.bookmarkedByUser ? "fill-indigo-400 text-indigo-400" : ""}`} />
                            </button>

                            <div className="text-[10px] text-slate-500 whitespace-nowrap">
                              {paper.downloadCount} downloads
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                  <div className="inline-block p-4 bg-slate-950 border border-slate-800 rounded-2xl mb-3 text-slate-500">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-slate-200 font-bold text-sm">No Papers Listed matching Search Criteria</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Consider widening your filters, searching for alternate subject codes, or contributing a paper yourself to reward others!
                  </p>
                  <button
                    onClick={() => {
                      setSelectedDocType(null);
                      setSelectedCategory(null);
                      setViewBookmarksOnly(false);
                      setSearchQuery("");
                    }}
                    className="mt-4 bg-slate-800 text-xs text-slate-200 px-4 py-2 rounded-xl hover:bg-slate-700 transition"
                  >
                    Clear Filter Scope
                  </button>
                </div>
              )}

                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Contribute Document Upload Modal Flow */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-left"
              id="upload-papers-modal"
            >
              
              {/* Header */}
              <div className="bg-indigo-950/30 px-6 py-5 border-b border-indigo-950/60 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-indigo-400" />
                    Contribute Past Paper or Solutions
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Reward the college student body. Instantly gains 100 reputation score milestones!</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form container */}
              <form onSubmit={handleUploadPaperSubmit} className="p-6 space-y-4">
                
                {formError && (
                  <div className="bg-red-950/30 text-red-400 font-medium text-xs p-3.5 rounded-xl border border-red-900/40 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category select block */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Subject Stream Category</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      {INITIAL_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Doc type selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Document Classification</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as DocType)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      {Object.values(DocType).map(classification => (
                        <option key={classification} value={classification}>{classification}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Subject Code (e.g. CS201) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Course Code / ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS201, ME101, EE102"
                      value={newSubjectCode}
                      onChange={(e) => setNewSubjectCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Collection Year</label>
                    <select
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      {["2026", "2025", "2024", "2023", "2022", "2021"].map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resource Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Resource Study Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures - Mid Semester Solutions Sheet"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Interactive Drag Drop Simulator file input & text area */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                    Question Paper / Notes Content Input 
                    <span className="normal-case font-normal text-slate-500 text-[11px] block sm:inline sm:ml-2">
                       (Paste questions, markdown or drop raw drafts)
                    </span>
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                      dragActive ? "border-indigo-500 bg-indigo-950/20" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                    }`}
                  >
                    <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">
                      Drag & Drop raw text drafts here, or write/paste contents below
                    </p>
                  </div>

                  <textarea
                    required
                    rows={6}
                    placeholder="Provide full paper questions or outline, e.g.:&#10;Q1. Elaborate on Binary tree rotations with logic details...&#10;Q2. Compare and calculate performance efficiency..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs mt-3.5 p-3.5 rounded-2xl text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono resize-none"
                  />
                </div>

                {/* Submit action */}
                <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-xl font-medium transition cursor-pointer"
                  >
                    Cancel Draft
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Publishing to StudyVault..." : "Publish to StudyVault (+100 XP)"}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom informational margin */}
      <footer className="bg-slate-950/45 py-8 mt-12 border-t border-slate-900 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-slate-400">StudyVault Community Platform • Built for Students</p>
          <div className="flex justify-center gap-4 pt-2 text-[11px] text-slate-600 select-none">
            <button 
              onClick={() => setShowAboutModal(true)}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              About StudyVault
            </button>
            <span>•</span>
            <span>Locked Under Peer-Review Standards</span>
            <span>•</span>
            <span>2026 Exam Cycles</span>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAboutModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">About StudyVault</h2>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                StudyVault is a community-driven platform designed to simplify academic resource management. 
                Share papers, track exam schedules, and collaborate with peers to achieve academic success.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                <p className="text-xs text-slate-400">Project developed by:</p>
                <p className="text-lg font-bold text-indigo-400">Meet Potdar</p>
              </div>
              <button 
                onClick={() => setShowAboutModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast Notification System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl shadow-2xl p-4 border flex items-start gap-3.5 backdrop-blur-md ${
              toast.type === "success" 
                ? "bg-slate-900/90 border-emerald-500/20 text-slate-100" 
                : toast.type === "warning"
                ? "bg-slate-900/90 border-amber-500/20 text-slate-100"
                : "bg-slate-900/90 border-indigo-500/20 text-slate-100"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === "success" 
                ? "bg-emerald-500/10 text-emerald-400" 
                : toast.type === "warning"
                ? "bg-amber-500/10 text-amber-400"
                : "bg-indigo-500/10 text-indigo-400"
            }`}>
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : toast.type === "warning" ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <h5 className="text-xs font-bold text-white">
                {toast.type === "success" ? "Success" : toast.type === "warning" ? "Notice" : "System Update"}
              </h5>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-slate-100 text-xs px-1 hover:bg-slate-800 rounded transition"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
