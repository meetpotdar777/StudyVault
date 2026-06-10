import { DocType, Paper, SubjectCategory, Contributor, Countdown } from "./types";

export const INITIAL_CATEGORIES: SubjectCategory[] = [
  {
    id: "cs",
    name: "Computer Science & IT",
    code: "CS / IT",
    iconName: "Binary",
    description: "Data Structures, Operating Systems, Networks, Algorithms, DBMS, and Web Tech."
  },
  {
    id: "me",
    name: "Mechanical Engineering",
    code: "MECH",
    iconName: "Cpu",
    description: "Thermodynamics, Fluid Mechanics, Strength of Materials, and Machine Design."
  },
  {
    id: "ee",
    name: "Electrical & Electronics",
    code: "EEE / ECE",
    iconName: "Zap",
    description: "Circuit Systems, Digital Logic Design, Signals & Systems, and Microprocessors."
  },
  {
    id: "bm",
    name: "Business Administration & Econ",
    code: "BBA / ECON",
    iconName: "BarChart3",
    description: "Financial Accounting, Marketing Principles, Microeconomics, and Business Law."
  }
];

export const INITIAL_PAPERS: Paper[] = [
  {
    id: "paper-1",
    title: "Data Structures & Algorithms - Final Exam (2025)",
    subject: "Computer Science & IT",
    subjectCode: "CS201",
    year: "2025",
    docType: DocType.QUESTION_PAPER,
    upvotes: 42,
    upvotedByUser: false,
    bookmarkedByUser: true,
    uploaderName: "Alex Mercer",
    uploaderRep: 1250,
    uploadedDate: "2026-02-12",
    downloadCount: 148,
    textContent: `UNIVERSITY FACULTY OF COMPUTER SCIENCE
CS201: DATA STRUCTURES & ALGORITHMS - FINAL SEMESTER EXAMINATION
Time Allowed: 3 Hours | Max Marks: 100

SECTION A (COMPULSORY - 20 Marks)
Q1. Explain the difference between an Array and a Linked List with respect to storage efficiency, insertion complexity at the beginning, and access time. Support with neat diagram representation.
Q2. What is the average and worst-case time complexity of Lookup, Insertion, and Deletion in a self-balancing Binary Search Tree (such as an AVL Tree) versus a standard Binary Search Tree?

SECTION B (ATTEMPT ANY FOUR - 80 Marks)
Q3. (a) Illustrate the step-by-step Dry Run of Dijkstra's Single Source Shortest Path Algorithm on the following adjacency-weighted graph G = (V,E), starting from vertex 'A'. Vertex list: A, B, C, D, E. Edge weights: (A-B): 4, (A-C): 2, (B-C): 1, (B-D): 5, (C-D): 8, (C-E): 10, (D-E): 2.
(b) Discuss the properties and importance of DAG (Directed Acyclic Graphs) and topological sorting in compiler scheduling.

Q4. Explain Graph Traversal algorithms: Depth-First Search (DFS) and Breadth-First Search (BFS) in detail. Include pseudo-code and analysis of Space & Time complexities using adjacency lists. Include an application where BFS is strictly preferred over DFS.

Q5. (a) Define a Hash Collision. Evaluate the relative performance of Linear Probing, Quadratic Probing, and Chaining with linked lists under load factors exceeding 0.75.
(b) Design a customized hashing function for storing alphanumeric student IDs of length 10. Show how the distribution behaves.

Q6. Explain the concept of Dynamic Programming. Differentiate it from Divide and Conquer. Provide a complete recursive formulations and memoized matrix chain multiplication algorithm to prove your claims.
`,
    comments: [
      {
        id: "c1",
        author: "Siddharth S.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sid",
        text: "This graph question in Q3 was identical to our mid-term practice sheet. Huge thanks for uploading!",
        timestamp: "3 days ago"
      },
      {
        id: "c2",
        author: "Emily Watson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
        text: "Are there official answer keys uploaded for Section B Q6? Dynamic Programming proof is tricky.",
        timestamp: "1 day ago"
      }
    ]
  },
  {
    id: "paper-2",
    title: "Thermodynamics - Entropy & Cycles Summary Notes",
    subject: "Mechanical Engineering",
    subjectCode: "ME201",
    year: "2026",
    docType: DocType.NOTES,
    upvotes: 27,
    upvotedByUser: false,
    bookmarkedByUser: false,
    uploaderName: "Devin Gears",
    uploaderRep: 840,
    uploadedDate: "2026-04-05",
    downloadCount: 79,
    textContent: `STUDENT STUDY CO-OP: THERMODYNAMICS EXAM REVIEW GUIDE
MODULE 4: ENTROPY, CLAUDE THEOREM, AND IDEAL GAS CYCLES
Author: Devin Gears | Mechanical Eng. Cohort

1. UNDERSTANDING ENTROPY (S)
Entropy is a measure of molecular randomness or disorder within a closed thermodynamic system.
- Clausius Inequality: For any cyclic process, the integral of dQ/T is always less than or equal to zero:
  ∮ (dQ / T) ≤ 0
- For a reversible process, the integral is exactly zero. For an irreversible process, entropy increases in an isolated system:
  dS = dQ_rev / T
  dS_total = dS_system + dS_surrounding ≥ 0 (Second Law of Thermodynamics)

2. THE CARNOT CYCLE
The Carnot cycle is an ideal reversible thermodynamic cycle consisting of four highly efficient steps:
- Step 1: Reversible Isothermal Expansion (Heat absorption Q_H at T_H)
- Step 2: Reversible Adiabatic Expansion (Temperature drops from T_H to T_L, Work done by system)
- Step 3: Reversible Isothermal Compression (Heat rejection Q_L at T_L, Work done on system)
- Step 4: Reversible Adiabatic Compression (Temperature increases back to T_H)

Carnot Efficiency Formula:
  η_Carnot = 1 - (T_L / T_H)
No heat engine operating between two temperatures can be more efficient than a Carnot engine!

3. OTTO CYCLE VS. DIESEL CYCLE
The standard gasoline engine (Otto cycle) relies on constant volume (isochoric) heat addition.
The standard diesel engine relies on constant pressure (isobaric) heat addition.
- Compression ratio (r) dictates efficiency heavily:
  η_Otto = 1 - (1 / r^(k-1)) where k is the specific heat ratio (Cp/Cv ≈ 1.4 for air).
`,
    comments: [
      {
        id: "c3",
        author: "Marcus Aurelius",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
        text: "Clean definitions! The Carnot cycle visual diagrams are neat. Thanks!",
        timestamp: "5 days ago"
      }
    ]
  },
  {
    id: "paper-3",
    title: "Digital Logic Design Midterm Solved Solutions",
    subject: "Electrical & Electronics",
    subjectCode: "EE102",
    year: "2025",
    docType: DocType.SOLUTION,
    upvotes: 56,
    upvotedByUser: false,
    bookmarkedByUser: false,
    uploaderName: "Amara Volt",
    uploaderRep: 2310,
    uploadedDate: "2025-10-18",
    downloadCount: 221,
    textContent: `DEPARTMENT OF ELECTRICAL & ELECTRONICS ENGINEERING
EE102: DIGITAL LOGIC DESIGN - MIDTERM EXAM DETAILED SOLUTIONS
Compiled by Peer-Tutors (Volt Research Group)

PROBLEM 1: Karnaugh Map Minimization
Minimize the following Boolean function F(A, B, C, D) = ∑m(0, 2, 5, 7, 8, 10, 13, 15) using a 4-variable K-Map.

SOLUTION DISCLOSURE:
1. Plot the minterms on the 4x4 coordinate logic grid where rows represent AB (00, 01, 11, 10) and columns represent CD (00, 01, 11, 10).
2. Grouping the minterms:
   - Group 1 (Corners: m0, m2, m8, m10): These four simplify to B'D'.
   - Group 2 (Center columns: m5, m7, m13, m15): These four simplify to BD.
3. Combining the terms:
   F(A, B, C, D) = B'D' + BD = B ⊙ D (Equivalence XNOR Gate)
Output circuit can be designed using just one standard XNOR gate instead of 8 AND/OR gates!

PROBLEM 2: Sequential Circuits - Flip Flops
Convert a standard D Flip-Flop to a JK Flip-Flop. Show excitation equations.

SOLUTION:
A JK flip flop has State Transition Table:
  J K Q_next
  0 0 Q
  0 1 0
  1 0 1
  1 1 Q'
To map this to a D input (since Q_next = D in a D Flip Hop):
  D = J Q' + K' Q
Design: Feed J ANDed with Q' and K' ANDed with Q into an OR gate, then feed the result directly into the D input pin.
`,
    comments: [
      {
        id: "c4",
        author: "Zainab Al-Hasan",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zain",
        text: "Lifesaver! The XNOR simplification on K-Map saved me so much time. Unravelled my entire logic block.",
        timestamp: "12 days ago"
      }
    ]
  },
  {
    id: "paper-4",
    title: "Microeconomics Principles Past Final Paper (2024)",
    subject: "Business Administration & Econ",
    subjectCode: "EC101",
    year: "2024",
    docType: DocType.QUESTION_PAPER,
    upvotes: 18,
    upvotedByUser: false,
    bookmarkedByUser: false,
    uploaderName: "Clara Ledger",
    uploaderRep: 140,
    uploadedDate: "2024-12-05",
    downloadCount: 45,
    textContent: `FACULTY OF SOCIAL AND ECONOMIC SCIENCES
EC101: INTRODUCTORY MICROECONOMICS FINAL EXAM
Term: Autumn | Max Weight: 40% of grade

QUESTION 1 (Demand Elasticity - 25 Marks)
The market demand function for student transit passes is given by Q_d = 1200 - 40P, and the supply of transit slots is Q_s = 200 + 10P.
- (a) Estimate the equilibrium Price (P*) and Quantity (Q*) of student passes sold.
- (b) At the equilibrium point, compute the Price Elasticity of Demand. Categorize the elasticity coefficient (Elastic, Inelastic, or Unitary).
- (c) If the municipality levies a price floor of $24 per pass, analyze the market imbalance. Calculate the resulting deadweight loss (DWL).

QUESTION 2 (Consumer Surplus & Utility Theory - 25 Marks)
Suppose a student gains utility U(X, Y) = X^0.5 * Y^0.5 from consuming textbooks (X) and campus meals (Y).
- (a) Set up the Lagrangian function given textbook price P_x = $50, meal price P_y = $10, and a spending budget constraint of I = $500.
- (b) Solve for the optimal bundle of (X*, Y*) to maximize student academic satisfaction.
`,
    comments: []
  }
];

export const INITIAL_LEADERBOARD: Contributor[] = [
  { id: "ldr-1", name: "Amara Volt", score: 2310, badge: "Study Legend", uploadsCount: 24, rank: 1 },
  { id: "ldr-2", name: "Alex Mercer", score: 1250, badge: "Gold Savior", uploadsCount: 15, rank: 2 },
  { id: "ldr-3", name: "Devin Gears", score: 840, badge: "Silver Contributor", uploadsCount: 9, rank: 3 },
  { id: "ldr-4", name: "Clara Ledger", score: 380, badge: "Bronze Scholar", uploadsCount: 4, rank: 4 },
  { id: "ldr-5", name: "Siddharth S.", score: 190, badge: "Novice", uploadsCount: 2, rank: 5 }
];

export const INITIAL_COUNTDOWNS: Countdown[] = [
  {
    id: "cnt-1",
    subjectName: "CS201: Data Structures Final Paper",
    examDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      return d.toISOString().split("T")[0] + "T09:00:00";
    })(),
    note: "Prepare Dijkstra graph proof & AVL AVL balance formulas!"
  },
  {
    id: "cnt-2",
    subjectName: "ME201: Thermodynamics Test II",
    examDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 11);
      return d.toISOString().split("T")[0] + "T14:30:00";
    })(),
    note: "Focus on Otto and Diesel cycle comparative efficiencies."
  },
  {
    id: "cnt-3",
    subjectName: "EE102: Digital Logic Design Final",
    examDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split("T")[0] + "T10:00:00";
    })(),
    note: "Solve past 3 years' K-Map and sequential logic tasks!"
  }
];
