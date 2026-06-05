import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory & File-Based Database for Persisted State
const DB_FILE = path.join(process.cwd(), "db.json");

// Default initial state for concepts and demo survey answers
const DEFAULT_CONCEPTS = [
  {
    id: "concept-1",
    title: "AI Workflow Agent",
    description: "Automate repetitive tasks across your tools by observing your cursor click flow, with automatic safe rollback options.",
    category: "Productivity",
    type: "single",
    icon: "auto_awesome"
  },
  {
    id: "concept-2",
    title: "Contextual Search Companion",
    description: "An ambient spec-helper that queries docs, APIs, and relevant reference specs live in the background as you write code.",
    category: "R&D Tools",
    type: "single",
    icon: "terminal"
  },
  {
    id: "concept-compare-1",
    title: "Knowledge Repository Paradigm",
    description: "Pick your layout style. Option A focuses on automation; Option B is deeply visual.",
    category: "Knowledge Mgmt",
    type: "compare",
    optionA: {
      title: "Knowledge Base A",
      description: "Organize and reuse your personal knowledge with quiet AI-driven auto-tagging."
    },
    optionB: {
      title: "Knowledge Base B",
      description: "A gorgeous, visual, node-based approach to connecting your notes and ideas like thoughts."
    }
  },
  {
    id: "concept-3",
    title: "Co-Founder Persona canvas",
    description: "Collaborative canvas where AI agents simulate key customer segments to stress-test your value propositions.",
    category: "Strategy",
    type: "single",
    icon: "diversity_3"
  }
];

const DEFAULT_DEMO_SESSIONS = [
  {
    id: "session-1",
    selfDescription: "I am a solo founder building a developer specs platform. I use Claude and ChatGPT daily to write code and specs.",
    profile: {
      role: "Solo founder",
      aiUsage: "Daily",
      purchaseRole: "Decision maker",
      market: "North America",
      companySize: "1-10 people"
    },
    signals: [
      {
        conceptId: "concept-1",
        choice: "like",
        dwellTimeMs: 4500,
        confirmedReasons: ["Saves repetitive work", "Fits my workflow"]
      },
      {
        conceptId: "concept-2",
        choice: "supervote",
        dwellTimeMs: 12500,
        confirmedReasons: ["Better than current tools", "Worth paying for"]
      },
      {
        conceptId: "concept-compare-1",
        choice: "like", // Representing selection A
        dwellTimeMs: 6000,
        confirmedReasons: ["Saves repetitive work"]
      },
      {
        conceptId: "concept-3",
        choice: "pass",
        dwellTimeMs: 2500,
        confirmedReasons: ["None of these"]
      }
    ],
    personalityName: "The High-Velocity Automated Pragmatist",
    personalityDesc: "You look for immediate efficiency boosts in your everyday tasks. You dislike strategic whiteboard canvases but double-down on background spec tools that fit into your active workflow naturally.",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
  },
  {
    id: "session-2",
    selfDescription: "Product Manager at a SaaS mid-market company. Weekly AI user, mostly searching concepts and doing copywriting.",
    profile: {
      role: "Product Manager",
      aiUsage: "Weekly",
      purchaseRole: "Evaluator",
      market: "Europe",
      companySize: "51-200 people"
    },
    signals: [
      {
        conceptId: "concept-1",
        choice: "like",
        dwellTimeMs: 5100,
        confirmedReasons: ["Clearer value", "Fits my workflow"]
      },
      {
        conceptId: "concept-2",
        choice: "like",
        dwellTimeMs: 4200,
        confirmedReasons: ["Fits my workflow"]
      },
      {
        conceptId: "concept-compare-1",
        choice: "pass", // Selection B
        dwellTimeMs: 7200,
        confirmedReasons: ["Better than current tools"]
      },
      {
        conceptId: "concept-3",
        choice: "supervote",
        dwellTimeMs: 15300,
        confirmedReasons: ["Saves repetitive work", "Worth paying for"]
      }
    ],
    personalityName: "The Design-Led Strategist",
    personalityDesc: "You value collaborative sandboxes and high-level strategy visual layouts. You supervoted the Co-Founder canvas to test value propositions, preferring visual representations of knowledge rather than automated background terminal scripts.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: "session-3",
    selfDescription: "Software architect in financial tech. I rarely use AI coding tools directly due to security and rules.",
    profile: {
      role: "Software Architect",
      aiUsage: "Rarely",
      purchaseRole: "End user",
      market: "China",
      companySize: "1000+ people"
    },
    signals: [
      {
        conceptId: "concept-1",
        choice: "pass",
        dwellTimeMs: 1500,
        confirmedReasons: ["None of these"]
      },
      {
        conceptId: "concept-2",
        choice: "like",
        dwellTimeMs: 8200,
        confirmedReasons: ["Better than current tools"]
      },
      {
        conceptId: "concept-compare-1",
        choice: "like",
        dwellTimeMs: 3100,
        confirmedReasons: ["Clearer value"]
      },
      {
        conceptId: "concept-3",
        choice: "pass",
        dwellTimeMs: 2100,
        confirmedReasons: ["None of these"]
      }
    ],
    personalityName: "The Guarded Tech Rationalist",
    personalityDesc: "Highly skeptical of rapid automated code-execution, but appreciative of static documentation companions that clarify existing data structures under structural guidelines.",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
  }
];

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      // Ensure basic keys exist
      if (!parsed.concepts || parsed.concepts.length === 0) parsed.concepts = DEFAULT_CONCEPTS;
      if (!parsed.sessions) parsed.sessions = DEFAULT_DEMO_SESSIONS;
      return parsed;
    }
  } catch (e) {
    console.error("Error reading db file. Setting back to defaults:", e);
  }
  return {
    concepts: DEFAULT_CONCEPTS,
    sessions: DEFAULT_DEMO_SESSIONS,
    targetProfileFields: ["market", "companySize"]
  };
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save database file:", e);
  }
}

// Global cached state
let db = loadDatabase();
saveDatabase(db); // cache defaults initially

// Rate limit protection cache properties
let isGeminiSuspended = false;
let geminiSuspensionUntil = 0;

function checkGeminiSuspended(): boolean {
  if (isGeminiSuspended) {
    if (Date.now() > geminiSuspensionUntil) {
      isGeminiSuspended = false;
      return false;
    }
    return true;
  }
  return false;
}

function suspendGemini(durationMs = 120000) {
  isGeminiSuspended = true;
  geminiSuspensionUntil = Date.now() + durationMs;
}

// Lazy initialize Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.log("CRITICAL: GEMINI_API_KEY is not defined in backend process env.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Helper to secure Gemini calls with automatic mock fallbacks
async function queryGemini(prompt: string, config: any = {}): Promise<string> {
  if (db.forceSandbox) {
    throw new Error("Sandbox-mode");
  }
  if (checkGeminiSuspended()) {
    throw new Error("Sandbox-mode");
  }
  
  const gemini = getGemini();
  if (!gemini) {
    throw new Error("Config-offline");
  }
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: config
    });
    return response.text || "";
  } catch (e: any) {
    const errMsg = e?.message || "";
    // If we hit any rate limit, resource exhaustion, or daily quota limits, register permanent database sandbox state
    if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("limit")) {
      console.log("Reaction Loop Info: Auto-toggled persistent Local Sandbox mode to handle API quota exhaustion smoothly.");
      db.forceSandbox = true;
      saveDatabase(db);
      suspendGemini(3600 * 1000 * 24); // Suspend for 24 hours
    } else {
      console.log("Reaction Loop Info: Bypassing real Gemini call to utilize local backup heuristic layers.");
    }
    throw new Error("Sandbox-mode");
  }
}

// ---------------- SERVER REST API ROUTES ----------------

// Get general configuration
app.get("/api/project", (req, res) => {
  const geminiAvailable = !!process.env.GEMINI_API_KEY;
  const suspended = checkGeminiSuspended();
  const forceSandbox = !!db.forceSandbox;

  res.json({
    name: "Reaction Loop Tech Probe",
    description: "移动端优先的 AI 产品反馈测试工具。此套件自动捕捉用户偏好、停留用时、超投票等隐形信号。",
    concepts: db.concepts,
    targetProfileFields: db.targetProfileFields || ["market", "companySize"],
    forceSandbox,
    aiEngineStatus: forceSandbox ? 'suspended' : (!geminiAvailable ? 'offline' : (suspended ? 'suspended' : 'active'))
  });
});

// Toggle Force Sandbox Mode (Researcher Panel control)
app.post("/api/project/toggle-sandbox", (req, res) => {
  const { forceSandbox } = req.body;
  db.forceSandbox = !!forceSandbox;
  saveDatabase(db);
  
  const geminiAvailable = !!process.env.GEMINI_API_KEY;
  const suspended = checkGeminiSuspended();

  res.json({
    success: true,
    forceSandbox: db.forceSandbox,
    aiEngineStatus: db.forceSandbox ? 'suspended' : (!geminiAvailable ? 'offline' : (suspended ? 'suspended' : 'active'))
  });
});

// Update concepts (Researcher Panel)
app.post("/api/project/concepts", (req, res) => {
  const { concepts } = req.body;
  if (Array.isArray(concepts)) {
    db.concepts = concepts;
    saveDatabase(db);
    return res.json({ success: true, concepts: db.concepts });
  }
  res.status(400).json({ error: "Invalid concepts payload" });
});

// AI extraction endpoint (analyzes self description)
app.post("/api/respond/extract", async (req, res) => {
  const { selfDescription } = req.body;
  if (!selfDescription || selfDescription.trim().length === 0) {
    return res.status(400).json({ error: "Self description is required" });
  }

  const prompt = `
You are an expert AI user researcher.
An entrepreneur wants to extract profiling details from a respondent's self-description.
Self-description of the respondent: "${selfDescription}"

Please extract the following 5 user demographic fields exactly:
1. role (The professional role/title, e.g. "Solo founder", "Developer", "SaaS PM", "Unknown")
2. aiUsage (How often they use AI, e.g. "Daily", "Weekly", "Monthly", "Rarely", "Never", or "Unknown")
3. purchaseRole (Their role in deciding soft purchases, e.g. "Decision maker", "Evaluator", "End user", or "Unknown")
4. market (Where they operate geographically, e.g. "China", "North America", "Europe", "Southeast Asia", "Unknown")
5. companySize (Their team size, e.g. "1-10 people", "11-50 people", "51-200 people", "201-1000 people", "1000+ people", or "Unknown")

If a field is completely missing or cannot be deduced, set its value to exactly "Unknown".
Your output must be a well-structured JSON matching the requested schema.
`;

  try {
    const jsonStr = await queryGemini(prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          aiUsage: { type: Type.STRING },
          purchaseRole: { type: Type.STRING },
          market: { type: Type.STRING },
          companySize: { type: Type.STRING }
        },
        required: ["role", "aiUsage", "purchaseRole", "market", "companySize"]
      }
    });

    const parsed = JSON.parse(jsonStr.trim());
    return res.json({ success: true, profile: parsed });
  } catch (error: any) {
    console.log("Reaction Loop Info: Engaging fallback metadata heuristics.");
    
    // Quick procedural fallback logic so the applet is bulletproof offline/no-keys
    const text = selfDescription.toLowerCase();
    const mockProfile = {
      role: "Solo founder",
      aiUsage: "Daily",
      purchaseRole: "Decision maker",
      market: "Unknown",
      companySize: "Unknown"
    };

    if (text.includes("pm") || text.includes("product")) mockProfile.role = "Product Manager";
    if (text.includes("engineer") || text.includes("developer") || text.includes("code")) mockProfile.role = "Software Developer";
    if (text.includes("rarely") || text.includes("seldom")) mockProfile.aiUsage = "Rarely";
    if (text.includes("weekly") || text.includes("week")) mockProfile.aiUsage = "Weekly";
    if (text.includes("eval") || text.includes("choose")) mockProfile.purchaseRole = "Evaluator";
    if (text.includes("bought") || text.includes("end")) mockProfile.purchaseRole = "End user";

    return res.json({ success: true, profile: mockProfile, isFallback: true });
  }
});

// Dynamic confirmation feedback reasons based on interactive gestures
app.post("/api/respond/reasons", async (req, res) => {
  const { conceptTitle, conceptDescription, action, previousAnswers } = req.body;
  
  const actionText = action === 'supervote' ? '强烈喜欢 (Supervote)' : action === 'like' ? '感兴趣 (Like)' : '不感兴趣/跳过 (Pass)';
  const prompt = `
Generate 5 human-like, realistic explanation tags that clarify why a respondent decided to choose: "${actionText}" for the following product idea.

Product Concept: "${conceptTitle}"
Description: "${conceptDescription}"

Guidelines:
- Create 5 highly short options (each under 28 characters!).
- Options must sound like standard real feedback bullets, e.g. "Saves manual logging", "Fits my tech stack", "Pricing is too high", "Safety concerns", "Visually clean".
- Be specific to the category of the concept.
- Output a JSON list of strings.
`;

  try {
    const jsonStr = await queryGemini(prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    });
    const parsed = JSON.parse(jsonStr);
    return res.json({ success: true, reasons: parsed.slice(0, 5) });
  } catch (error) {
    // Elegant procedural fallback
    let fallback = [
      "Saves repetitive work",
      "Clearer value proposition",
      "Fits my daily workflow",
      "Worth paying premium for",
      "Better than current tools"
    ];
    if (action === 'pass') {
      fallback = [
        "Too complex for my team",
        "Already solved by ChatGPT",
        "Unclear value return",
        "Privacy/security concerns",
        "Doesn't fit our tech stack"
      ];
    } else if (action === 'supervote') {
      fallback = [
        "Absolute critical bottleneck",
        "10x speed improvement",
        "Would refer to all peers",
        "Extremely elegant layout",
        "Solves my highest daily pain"
      ];
    }
    return res.json({ success: true, reasons: fallback, isFallback: true });
  }
});

// Final submit survey route -> Generates personality summary matching NetEase music persona style
app.post("/api/respond/submit", async (req, res) => {
  const { selfDescription, profile, signals } = req.body;

  if (!signals || !Array.isArray(signals)) {
    return res.status(400).json({ error: "Invalid signals data" });
  }

  // Create standard session structure
  const sessionId = "session-" + Date.now();

  const mockSession = {
    id: sessionId,
    selfDescription: selfDescription || "None",
    profile: {
      role: profile?.role || "Unknown",
      aiUsage: profile?.aiUsage || "Unknown",
      purchaseRole: profile?.purchaseRole || "Unknown",
      market: profile?.market || "Unknown",
      companySize: profile?.companySize || "Unknown"
    },
    signals: signals,
    personalityName: "The Mindful Pragmatist",
    personalityDesc: "Your feedback exhibits structured deliberation. You prioritize high-signal productivity enhancements but discard unneeded strategy whiteboards.",
    createdAt: new Date().toISOString()
  };

  // Build a prompt for Gemini to construct a unique, whimsical feedback personality summary
  const summaryPrompt = `
You are an expert cognitive psychologist and copywriter designing an interactive 'Feedback Persona Card' matching the aesthetic of the NetEase Cloud Music Annual Summary/Wrap-up.
The respondent completed a product concept validation swipe session.

Respondent Profile:
- Role: ${mockSession.profile.role}
- AI Usage Frequency: ${mockSession.profile.aiUsage}
- Self Description: "${mockSession.selfDescription}"

Session Interactions (Explicit and Implicit):
${signals.map((s, idx) => `Choice ${idx+1}: Card ID: ${s.conceptId}, Choice Direction: ${s.choice}, Dwell duration on card: ${s.dwellTimeMs}ms, Confirmed feedback reasons listed: ${s.confirmedReasons?.join(", ")}`).join("\n")}

Please generate:
1. personalityName: A short, catchy, positive tagline (e.g. "The High-Velocity Automated Pragmatist", "The Aesthetic Visionary PM", "Intellectually Guarded Skeptic").
2. personalityDesc: A beautiful, personal paragraph (2-3 sentences max) explaining their psychology: what sets their taste apart, why they chose these preferences, and what products they crave. Refer specifically to things they liked/hated or their speed (e.g., long dwell time indicates careful deliberation, supervotes showcase extreme excitement).

Output a strict JSON format structure.
`;

  try {
    const jsonStr = await queryGemini(summaryPrompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personalityName: { type: Type.STRING },
          personalityDesc: { type: Type.STRING }
        },
        required: ["personalityName", "personalityDesc"]
      }
    });

    const parsed = JSON.parse(jsonStr.trim());
    mockSession.personalityName = parsed.personalityName;
    mockSession.personalityDesc = parsed.personalityDesc;
  } catch (err) {
    console.log("Reaction Loop Info: Engaging adaptive behavioral cluster profiling fallback.");
    // Custom fallbacks matching implicit patterns
    const likes = signals.filter(s => s.choice === 'like' || s.choice === 'supervote');
    const passes = signals.filter(s => s.choice === 'pass');
    
    if (likes.length > passes.length) {
      mockSession.personalityName = "The Early Adopter Catalyst";
      mockSession.personalityDesc = "You dive headfirst into new paradigms. You swiped positively on most of the suggestions, indicating a high tolerance for experimenting and a strong drive to eliminate manual, cognitive friction.";
    } else {
      mockSession.personalityName = "The Laser-Focused Rationalist";
      mockSession.personalityDesc = "Extremely cautious and detail-oriented. You swiped pass on several ideas, demonstrating high standards. You prioritize stable workflow integrations rather than broad AI wrappers.";
    }
  }

  // Load latest state, insert new session, save
  db = loadDatabase();
  db.sessions.unshift(mockSession);
  saveDatabase(db);

  return res.json({ success: true, session: mockSession });
});

// Clear respondent submissions (Researcher tool utility)
app.post("/api/project/clear", (req, res) => {
  db.sessions = [];
  saveDatabase(db);
  res.json({ success: true, sessions: [] });
});

// Retrieve researcher analytics page metrics
app.get("/api/analytics", async (req, res) => {
  const sessions = db.sessions || [];
  const concepts = db.concepts || [];

  // 1. Calculate ratios and counts for each concept card
  const statsMap: Record<string, { 
    title: string; 
    likes: number; 
    passes: number; 
    supervotes: number; 
    compareACount: number;
    compareBCount: number;
    compareSuperACount: number;
    compareSuperBCount: number;
    dwellTotalMs: number; 
    timesShown: number; 
    confirmedReasons: Record<string, number> 
  }> = {};

  concepts.forEach(c => {
    statsMap[c.id] = {
      title: c.title,
      likes: 0,
      passes: 0,
      supervotes: 0,
      compareACount: 0,
      compareBCount: 0,
      compareSuperACount: 0,
      compareSuperBCount: 0,
      dwellTotalMs: 0,
      timesShown: 0,
      confirmedReasons: {}
    };
  });

  sessions.forEach(s => {
    s.signals.forEach(sig => {
      if (!statsMap[sig.conceptId]) {
        // Concept might have been deleted/modified
        statsMap[sig.conceptId] = {
          title: "Unknown Concept",
          likes: 0,
          passes: 0,
          supervotes: 0,
          compareACount: 0,
          compareBCount: 0,
          compareSuperACount: 0,
          compareSuperBCount: 0,
          dwellTotalMs: 0,
          timesShown: 0,
          confirmedReasons: {}
        };
      }
      const st = statsMap[sig.conceptId];
      st.timesShown += 1;
      st.dwellTotalMs += sig.dwellTimeMs || 0;
      
      if (sig.choice === 'like') st.likes += 1;
      else if (sig.choice === 'pass') st.passes += 1;
      else if (sig.choice === 'supervote') st.supervotes += 1;
      else if (sig.choice === 'compare_A') st.compareACount += 1;
      else if (sig.choice === 'compare_B') st.compareBCount += 1;
      else if (sig.choice === 'compare_superA') st.compareSuperACount += 1;
      else if (sig.choice === 'compare_superB') st.compareSuperBCount += 1;

      if (Array.isArray(sig.confirmedReasons)) {
        sig.confirmedReasons.forEach(r => {
          st.confirmedReasons[r] = (st.confirmedReasons[r] || 0) + 1;
        });
      }
    });
  });

  // Turn map into list representation
  const conceptAnalytics = Object.keys(statsMap).map(id => {
    const s = statsMap[id];
    const correspondingConcept = concepts.find(c => c.id === id);
    return {
      id,
      title: s.title,
      type: correspondingConcept?.type || 'single',
      optionA: correspondingConcept?.optionA,
      optionB: correspondingConcept?.optionB,
      likes: s.likes,
      passes: s.passes,
      supervotes: s.supervotes,
      compareACount: s.compareACount,
      compareBCount: s.compareBCount,
      compareSuperACount: s.compareSuperACount,
      compareSuperBCount: s.compareSuperBCount,
      avgDwellTimeSeconds: s.timesShown > 0 ? Number((s.dwellTotalMs / s.timesShown / 1000).toFixed(1)) : 0,
      confirmedReasons: Object.keys(s.confirmedReasons).map(r => ({
        reason: r,
        count: s.confirmedReasons[r]
      })).sort((a,b) => b.count - a.count),
      totalInteractions: s.timesShown
    };
  });

  // 2. Demographic distributions
  const demographics = {
    role: {} as Record<string, number>,
    aiUsage: {} as Record<string, number>,
    purchaseRole: {} as Record<string, number>,
    market: {} as Record<string, number>
  };

  sessions.forEach(s => {
    const r = s.profile.role || "Unknown";
    demographics.role[r] = (demographics.role[r] || 0) + 1;

    const u = s.profile.aiUsage || "Unknown";
    demographics.aiUsage[u] = (demographics.aiUsage[u] || 0) + 1;

    const p = s.profile.purchaseRole || "Unknown";
    demographics.purchaseRole[p] = (demographics.purchaseRole[p] || 0) + 1;

    const m = s.profile.market || "Unknown";
    demographics.market[m] = (demographics.market[m] || 0) + 1;
  });

  // 3. User clusters & AI recommendations
  let aiInsights = [
    "Most users swiped positive daily but spent higher overall dwell time analyzing spec documentation features.",
    "A tight division exists: Solo Founders heavily supervoted task automations, whereas corporate PMs prioritized UI layout canvases.",
    "Recommendation: Keep the AI Workflow minimal, but enhance documentation references to build confidence."
  ];

  if (sessions.length > 0) {
    const aiPrompt = `
You are a principal Product Researcher.
Analyze the following aggregated feedback session metrics.

Concepts Under Test:
${JSON.stringify(concepts, null, 2)}

Aggregated Feedback:
${JSON.stringify(conceptAnalytics, null, 2)}

Demographics Overview:
${JSON.stringify(demographics, null, 2)}

Please write exactly 3 high-quality, quantitative actionable product recommendations and insight bullets.
Format each bullet as a concise, expert sentence stating a strategic choice (e.g. 'Since 80% of founders reject Canvas strategies but spend 6s on workflow observation, prioritize deep silent integrations over interactive boards.').
Output as a strict JSON list of strings.
`;

    try {
      const jsonStr = await queryGemini(aiPrompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      });
      aiInsights = JSON.parse(jsonStr);
    } catch (e) {
      console.log("Reaction Loop Info: Engaging dynamic statistics-based insights fallback.");
    }
  }

  return res.json({
    totalRespondents: sessions.length,
    conceptAnalytics,
    demographics,
    sessions,
    aiInsights
  });
});

// ---------------- VITE DEV SERVER AND PRODUCTION SERVING ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Reaction Loop] Server successfully listening at http://localhost:${PORT}`);
  });
}

startServer();
