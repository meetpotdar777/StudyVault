export enum DocType {
  QUESTION_PAPER = "Question Paper",
  NOTES = "Notes",
  SOLUTION = "Solution",
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface Paper {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  year: string;
  docType: DocType;
  upvotes: number;
  upvotedByUser?: boolean;
  bookmarkedByUser?: boolean;
  fileUrl?: string; // Simulator file path or display
  uploaderName: string;
  uploaderRep: number;
  uploadedDate: string;
  textContent: string; // Used for AI analysis & simulator viewing
  comments: Comment[];
  downloadCount: number;
}

export interface SubjectCategory {
  id: string;
  name: string;
  code: string;
  iconName: string;
  description: string;
}

export interface Countdown {
  id: string;
  subjectName: string;
  examDate: string; // ISO string or simple date YYYY-MM-DD
  note?: string;
}

export interface Contributor {
  id: string;
  name: string;
  score: number;
  badge: "Novice" | "Bronze Scholar" | "Silver Contributor" | "Gold Savior" | "Study Legend";
  uploadsCount: number;
  rank: number;
}
