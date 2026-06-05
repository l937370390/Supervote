import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  ArrowRight, 
  Check, 
  Loader2, 
  Settings, 
  Layers, 
  Activity, 
  FileText, 
  BrainCircuit, 
  X, 
  ChevronRight, 
  HelpCircle,
  Clock,
  Heart,
  CornerDownLeft,
  RefreshCw,
  Sliders,
  Sparkle,
  Dribbble,
  BookOpen
} from "lucide-react";
import { ConceptCard, FeedbackSignal, RespondentSession } from "./types";

const DEMO_CONCEPTS: ConceptCard[] = [
  {
    id: "concept-1",
    title: "AI Onboarding Copilot",
    description: "A setup assistant that interviews new users, detects missing context, and turns answers into a usable product profile.",
    category: "Activation",
    type: "single",
    followUpMode: "default",
    followUpDwellThresholdMs: 4
  },
  {
    id: "concept-2",
    title: "Supervote Pricing Signal",
    description: "Let users spend one scarce star on the concept they would actually prioritize, not just casually like.",
    category: "Preference",
    type: "single",
    followUpMode: "force",
    followUpDwellThresholdMs: 4
  },
  {
    id: "concept-compare-1",
    title: "Feedback Collection Mode",
    description: "Compare two product research flows and drag the star onto the stronger direction.",
    category: "Comparison",
    type: "compare",
    optionA: {
      title: "Fast Swipe Test",
      description: "Collect quick like/pass reactions and dwell-time signals from mobile respondents."
    },
    optionB: {
      title: "Structured Survey",
      description: "Ask detailed questions up front and collect longer written answers."
    },
    followUpMode: "conditional",
    followUpDwellThresholdMs: 3
  },
  {
    id: "concept-3",
    title: "Persona Recap Card",
    description: "Reward respondents with a shareable feedback personality card after the test is complete.",
    category: "Reward Loop",
    type: "single",
    followUpMode: "never",
    followUpDwellThresholdMs: 4
  }
];

const DEMO_ANALYTICS = {
  totalRespondents: 42,
  conceptAnalytics: [
    {
      id: "concept-1",
      title: "AI Onboarding Copilot",
      type: "single",
      likes: 24,
      passes: 8,
      supervotes: 10,
      avgDwellTimeSeconds: 6.2,
      confirmedReasons: [
        { reason: "Reduces setup friction", count: 18 },
        { reason: "Feels immediately useful", count: 13 },
        { reason: "Clearer value", count: 9 }
      ]
    },
    {
      id: "concept-2",
      title: "Supervote Pricing Signal",
      type: "single",
      likes: 18,
      passes: 6,
      supervotes: 18,
      avgDwellTimeSeconds: 8.4,
      confirmedReasons: [
        { reason: "Shows real priority", count: 16 },
        { reason: "Worth paying for", count: 12 },
        { reason: "Better than survey ratings", count: 8 }
      ]
    },
    {
      id: "concept-compare-1",
      title: "Feedback Collection Mode",
      type: "compare",
      optionA: DEMO_CONCEPTS[2].optionA,
      optionB: DEMO_CONCEPTS[2].optionB,
      compareACount: 19,
      compareBCount: 8,
      compareSuperACount: 11,
      compareSuperBCount: 4,
      avgDwellTimeSeconds: 7.1,
      confirmedReasons: [
        { reason: "Faster to complete", count: 17 },
        { reason: "Feels more natural", count: 14 },
        { reason: "Less survey fatigue", count: 9 }
      ]
    },
    {
      id: "concept-3",
      title: "Persona Recap Card",
      type: "single",
      likes: 21,
      passes: 12,
      supervotes: 9,
      avgDwellTimeSeconds: 5.7,
      confirmedReasons: [
        { reason: "Makes completion rewarding", count: 15 },
        { reason: "Shareable artifact", count: 10 },
        { reason: "Fun but not required", count: 7 }
      ]
    }
  ],
  demographics: {
    roles: ["Founders", "Product managers", "Researchers", "Designers"]
  },
  sessions: [
    {
      id: "demo-session-1",
      selfDescription: "I am a solo founder testing AI workflow tools. I use ChatGPT daily and decide which tools to buy.",
      profile: {
        role: "Solo founder",
        aiUsage: "Daily",
        purchaseRole: "Decision maker",
        market: "North America",
        companySize: "1-10 people"
      },
      signals: [],
      personalityName: "The High-Signal Pragmatist",
      personalityDesc: "You move quickly, but your strongest preferences are practical and purchase-oriented.",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: "demo-session-2",
      selfDescription: "Product manager at a B2B SaaS company. I evaluate research tools and run user interviews every month.",
      profile: {
        role: "Product Manager",
        aiUsage: "Weekly",
        purchaseRole: "Evaluator",
        market: "Europe",
        companySize: "51-200 people"
      },
      signals: [],
      personalityName: "The Insight Curator",
      personalityDesc: "You prefer tools that turn messy reactions into readable decision evidence.",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    }
  ],
  aiInsights: [
    "Supervote is the strongest signal: users reserve it for concepts that imply purchase intent or clear workflow priority.",
    "Swipe-first testing reduces completion friction for early concept validation, especially on mobile.",
    "Reason confirmation bubbles produce cleaner qualitative evidence than asking every respondent to write from scratch.",
    "Comparison cards should be used when teams need a directional product decision rather than simple concept validation."
  ]
};

function inferDemoProfile(selfDescription: string) {
  const text = selfDescription.toLowerCase();
  return {
    role: text.includes("founder") ? "Solo founder" : text.includes("manager") || text.includes("pm") ? "Product Manager" : text.includes("research") ? "Researcher" : "Product builder",
    aiUsage: text.includes("daily") ? "Daily" : text.includes("rare") ? "Rarely" : "Weekly",
    purchaseRole: text.includes("decide") || text.includes("buy") || text.includes("founder") ? "Decision maker" : "Evaluator",
    market: text.includes("china") ? "China" : text.includes("europe") ? "Europe" : "North America",
    companySize: text.includes("solo") || text.includes("founder") ? "1-10 people" : text.includes("enterprise") ? "1000+ people" : "11-50 people"
  };
}

export default function App() {
  // Navigation State: 'respondent' | 'researcher'
  const [appMode, setAppMode] = useState<'respondent' | 'researcher'>('respondent');

  // Respondent Survey Journey Steps: 
  // 'welcome' | 'selfDescription' | 'confirmProfile' | 'swipeIntro' | 'swiping' | 'reasons' | 'loadingReport' | 'reportDetails'
  const [surveyStep, setSurveyStep] = useState<
    'welcome' | 'selfDescription' | 'confirmProfile' | 'swiping' | 'reasons' | 'loadingReport' | 'reportDetails'
  >('welcome');

  // Core Survey Project State loaded from Server
  const [project, setProject] = useState<{
    name: string;
    description: string;
    concepts: ConceptCard[];
    targetProfileFields: string[];
    aiEngineStatus?: 'active' | 'suspended' | 'offline';
    forceSandbox?: boolean;
  }>({
    name: "Supervote",
    description: "A lighter way to turn product reactions into user research signals.",
    concepts: DEMO_CONCEPTS,
    targetProfileFields: ["market", "companySize"],
    aiEngineStatus: 'active',
    forceSandbox: false
  });

  // Load Survey Design Configuration
  const fetchProjectData = async () => {
    try {
      const res = await fetch("/api/project");
      const data = await res.json();
      if (data && data.concepts) {
        setProject({
          ...data,
          name: data.name || "Supervote",
          description: data.description || "A lighter way to turn product reactions into user research signals.",
          concepts: data.concepts.length > 0 ? data.concepts : DEMO_CONCEPTS
        });
      }
    } catch (e) {
      console.error("Failed to load project design configurations", e);
      setProject(prev => ({
        ...prev,
        name: "Supervote",
        description: "A lighter way to turn product reactions into user research signals.",
        concepts: DEMO_CONCEPTS,
        aiEngineStatus: 'offline',
        forceSandbox: true
      }));
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  // Respondent Active Capture Variables
  const [selfDesc, setSelfDesc] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [profile, setProfile] = useState({
    role: "",
    aiUsage: "",
    purchaseRole: "",
    market: "",
    companySize: ""
  });

  // Backfill trackers for profile confirmation step
  const [activeBackfillField, setActiveBackfillField] = useState<string | null>(null);

  // Active Swipe Session Variables
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [starCount, setStarCount] = useState(1); // Supervote stars left
  const [signals, setSignals] = useState<FeedbackSignal[]>([]);
  const signalsRef = useRef<FeedbackSignal[]>([]);

  // Sync signals state to ref to avoid stale closure state in timeouts
  useEffect(() => {
    signalsRef.current = signals;
  }, [signals]);
  
  // Dwell speed measurement
  const cardStartTimestamp = useRef<number>(0);
  
  // Custom Dynamic Reasons generated per swipe action
  const [reasonAction, setReasonAction] = useState<'like' | 'pass' | 'supervote'>('like');
  const [generatedReasonsList, setGeneratedReasonsList] = useState<string[]>([]);
  const [isGeneratingReasons, setIsGeneratingReasons] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  // Generated Persona Summary
  const [generatedPersona, setGeneratedPersona] = useState<{
    personalityName: string;
    personalityDesc: string;
    session?: any;
  } | null>(null);

  // Loading report transition state items
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  // Drag-and-swipe state handlers (Satisfying physical card swipe)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Floating Interactive Drag Star State for Compare Cards (Supervote)
  const [starDragOffset, setStarDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingStar, setIsDraggingStar] = useState(false);
  const [starCollision, setStarCollision] = useState<'none' | 'optionA' | 'optionB'>('none');
  const starDragStartPos = useRef({ x: 0, y: 0 });

  const optionARef = useRef<HTMLDivElement | null>(null);
  const optionBRef = useRef<HTMLDivElement | null>(null);

  // Researcher Dashboard Variables
  const [analyticsData, setAnalyticsData] = useState<{
    totalRespondents: number;
    conceptAnalytics: any[];
    demographics: any;
    sessions: any[];
    aiInsights: string[];
  } | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // Manage test cards states (CRUD)
  const [isSavingConcepts, setIsSavingConcepts] = useState(false);
  const [conceptsEditList, setConceptsEditList] = useState<ConceptCard[]>([]);

  // Active edit/add concept form item state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [newCardForm, setNewCardForm] = useState<{
    title: string;
    description: string;
    category: string;
    type: 'single' | 'compare';
    optionATitle?: string;
    optionADesc?: string;
    optionBTitle?: string;
    optionBDesc?: string;
    followUpMode: 'default' | 'force' | 'never' | 'conditional';
    followUpDwellThresholdMs: number;
  }>({
    title: "",
    description: "",
    category: "General",
    type: "single",
    optionATitle: "",
    optionADesc: "",
    optionBTitle: "",
    optionBDesc: "",
    followUpMode: "default",
    followUpDwellThresholdMs: 4
  });

  // Fetch Researcher Analytics Data
  const fetchAnalytics = async () => {
    setIsAnalyticsLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalyticsData(data && data.conceptAnalytics ? data : DEMO_ANALYTICS);
    } catch (e) {
      console.error("Failed to load survey analytics dataset", e);
      setAnalyticsData(DEMO_ANALYTICS);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (appMode === 'researcher') {
      fetchAnalytics();
      setConceptsEditList(project.concepts);
    }
  }, [appMode, project.concepts]);

  // Handle Drag-to-Swipe Physics (Dwell, Offset)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const card = project.concepts[currentCardIndex];
    if (card && card.type === 'compare') return; // Disable entire-card dragging for comparison cards
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diffX = clientX - dragStartPos.current.x;
    const diffY = clientY - dragStartPos.current.y;
    setDragOffset({ x: diffX, y: diffY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 110; // Trigger threshold
    if (dragOffset.y < -threshold) {
      // Swipe Up -> Supervote
      if (starCount > 0) {
        submitSwipeChoice('supervote');
      } else {
        alert("No supervote stars left!");
        setDragOffset({ x: 0, y: 0 });
      }
    } else if (dragOffset.x > threshold) {
      // Swipe Right -> Like
      submitSwipeChoice('like');
    } else if (dragOffset.x < -threshold) {
      // Swipe Left -> Pass
      submitSwipeChoice('pass');
    } else {
      // Reset back to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Star Drag-and-Drop mechanics for Comparison Cards (Supervotes)
  const handleStarDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingStar(true);
    starDragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleStarDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingStar) return;
    const diffX = e.clientX - starDragStartPos.current.x;
    const diffY = e.clientY - starDragStartPos.current.y;
    setStarDragOffset({ x: diffX, y: diffY });

    const clientX = e.clientX;
    const clientY = e.clientY;

    let col = 'none' as 'none' | 'optionA' | 'optionB';
    if (optionARef.current) {
      const rect = optionARef.current.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        col = 'optionA';
      }
    }
    if (optionBRef.current) {
      const rect = optionBRef.current.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        col = 'optionB';
      }
    }
    setStarCollision(col);
  };

  const handleStarDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingStar) return;
    setIsDraggingStar(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const finalCollision = starCollision;
    setStarCollision('none');
    setStarDragOffset({ x: 0, y: 0 });

    if (finalCollision === 'optionA' || finalCollision === 'optionB') {
      if (starCount > 0) {
        // Cast the Supervote!
        submitSwipeChoice(finalCollision === 'optionA' ? 'compare_superA' : 'compare_superB');
      } else {
        alert("No supervote stars left!");
      }
    }
  };

  // Modern high-fidelity window drag-tracking for reliable swipes that cross element boundaries
  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      const diffX = clientX - dragStartPos.current.x;
      const diffY = clientY - dragStartPos.current.y;
      setDragOffset({ x: diffX, y: diffY });
    };

    const handleWindowMouseUp = () => {
      handleDragEnd();
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const diffX = clientX - dragStartPos.current.x;
      const diffY = clientY - dragStartPos.current.y;
      setDragOffset({ x: diffX, y: diffY });
      // Prevent physical page scrolls or default zoom gestures when actively dragging a card choice
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleWindowTouchEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
    window.addEventListener('touchend', handleWindowTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };
  }, [isDragging, dragOffset, starCount]);

  // Trigger Survey Concept Card swipe evaluation
  const submitSwipeChoice = async (choice: 'like' | 'pass' | 'supervote' | 'compare_A' | 'compare_B' | 'compare_superA' | 'compare_superB') => {
    // Stop timers & analyze dwell duration
    const endedAt = Date.now();
    const dwellMs = endedAt - cardStartTimestamp.current;

    const currentCard = project.concepts[currentCardIndex];
    if (!currentCard) return;

    // Deduct supervote star count
    const isSuper = choice === 'supervote' || choice === 'compare_superA' || choice === 'compare_superB';
    if (isSuper && starCount > 0) {
      setStarCount(prev => prev - 1);
    } else if (isSuper) {
      // Fallback choice redirection to regular like / compare selection if out of super stars
      if (choice === 'compare_superA') choice = 'compare_A';
      else if (choice === 'compare_superB') choice = 'compare_B';
      else choice = 'like';
    }

    // Capture the state
    setReasonAction(choice === 'compare_superA' || choice === 'compare_superB' ? 'supervote' : choice === 'compare_A' ? 'like' : choice === 'compare_B' ? 'pass' : choice);
    
    // Calculate display swipe animations
    let slideX = 0;
    let slideY = 0;
    if (choice === 'like') slideX = 200;
    else if (choice === 'pass') slideX = -200;
    else if (choice === 'supervote') slideY = -200;
    else if (choice === 'compare_A') slideX = -150;
    else if (choice === 'compare_B') slideX = 150;
    else if (choice === 'compare_superA') { slideX = -150; slideY = -100; }
    else if (choice === 'compare_superB') { slideX = 150; slideY = -100; }

    setDragOffset({ x: slideX, y: slideY });
    setSelectedReasons([]);

    // Determine if follow-up reasons should be queried & shown
    const mode = currentCard.followUpMode || 'default';
    const thresholdSec = currentCard.followUpDwellThresholdMs || 4;
    let triggerFollowUp = true;

    if (mode === 'never') {
      triggerFollowUp = false;
    } else if (mode === 'conditional') {
      const thresholdMs = thresholdSec * 1000;
      triggerFollowUp = dwellMs >= thresholdMs;
    } else if (mode === 'force') {
      triggerFollowUp = true;
    } else {
      // 'default'
      triggerFollowUp = true;
    }

    if (triggerFollowUp) {
      // Query Dynamic custom reasons generated from backend
      setIsGeneratingReasons(true);
      setSurveyStep('reasons');

      try {
        const res = await fetch("/api/respond/reasons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conceptTitle: currentCard.type === 'compare' ? `${currentCard.optionA?.title} vs ${currentCard.optionB?.title}` : currentCard.title,
            conceptDescription: currentCard.type === 'compare' ? `${currentCard.optionA?.description} or ${currentCard.optionB?.description}` : currentCard.description,
            action: choice.startsWith('compare_') ? (choice.includes('super') ? 'supervote' : choice === 'compare_A' ? 'like' : 'pass') : choice
          })
        });
        const data = await res.json();
        if (data.success && data.reasons) {
          setGeneratedReasonsList(data.reasons);
        } else {
          throw new Error();
        }
      } catch {
        // Hard fallback
        setGeneratedReasonsList(
          choice === 'pass' || choice === 'compare_B' || choice === 'compare_superB'
            ? ["Too complex for me", "Unclear value", "Already solved easily", "No active pain-point", "Doesn't fit current specs"]
            : ["Saves manual clocking", "Better design quality", "Highly urgent constraint", "Worth paying coin for", "Fits everyday workflows"]
        );
      } finally {
        setIsGeneratingReasons(false);
      }

      // Collect temporary signal representation
      const tempSignal: FeedbackSignal = {
        conceptId: currentCard.id,
        choice: choice,
        dwellTimeMs: Math.max(1000, dwellMs),
        confirmedReasons: [],
        timestamp: Date.now()
      };
      
      // Add pending signal temporarily to session collection
      setSignals(prev => [...prev, tempSignal]);
    } else {
      // Skip reasons follow-up directly!
      const tempSignal: FeedbackSignal = {
        conceptId: currentCard.id,
        choice: choice,
        dwellTimeMs: Math.max(1000, dwellMs),
        confirmedReasons: ["Direct Choice"],
        timestamp: Date.now()
      };

      // Add signal
      setSignals(prev => [...prev, tempSignal]);

      // Animate card slide-away before index increment
      setTimeout(() => {
        setDragOffset({ x: 0, y: 0 });
        const nextIndex = currentCardIndex + 1;
        if (nextIndex < project.concepts.length) {
          setCurrentCardIndex(nextIndex);
          setSurveyStep('swiping');
          cardStartTimestamp.current = Date.now();
        } else {
          triggerReportGeneration();
        }
      }, 350);
    }
  };

  // Confirm reason callback -> advance to next card or complete survey
  const handleConfirmReasons = () => {
    // Append the selected verified reasons onto the last recorded signal
    setSignals(prev => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1].confirmedReasons = selectedReasons.length > 0 ? selectedReasons : ["Direct Choice"];
      }
      return copy;
    });

    // Reset offsets and offsets indicators
    setDragOffset({ x: 0, y: 0 });

    const nextIndex = currentCardIndex + 1;
    if (nextIndex < project.concepts.length) {
      setCurrentCardIndex(nextIndex);
      setSurveyStep('swiping');
      cardStartTimestamp.current = Date.now();
    } else {
      // All cards evaluated -> transition animation loading report
      triggerReportGeneration();
    }
  };

  // Animate loading simulation metrics
  const triggerReportGeneration = () => {
    setSurveyStep('loadingReport');
    setLoadingStepIdx(0);
    
    setTimeout(() => {
      setLoadingStepIdx(1);
    }, 1300);

    setTimeout(() => {
      setLoadingStepIdx(2);
    }, 2800);

    setTimeout(async () => {
      // Trigger API submit
      try {
        const res = await fetch("/api/respond/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selfDescription: selfDesc,
            profile: profile,
            signals: signalsRef.current
          })
        });
        const data = await res.json();
        if (data.success && data.session) {
          setGeneratedPersona({
            personalityName: data.session.personalityName,
            personalityDesc: data.session.personalityDesc,
            session: data.session
          });
        } else {
          throw new Error("No generated session returned");
        }
      } catch (e) {
        console.error("Failed report submission", e);
        setGeneratedPersona({
          personalityName: "The High-Signal Pragmatist",
          personalityDesc: "You react quickly, but your strongest preferences cluster around products that reduce research friction and create clearer decision evidence."
        });
      } finally {
        setSurveyStep('reportDetails');
      }
    }, 4200);
  };

  // Submit Self-Description parsing payload
  const handleExtractProfile = async () => {
    if (!selfDesc.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch("/api/respond/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfDescription: selfDesc })
      });
      const data = await res.json();
      if (data.success && data.profile) {
        const p = data.profile;
        setProfile({
          role: p.role !== "Unknown" ? p.role : "",
          aiUsage: p.aiUsage !== "Unknown" ? p.aiUsage : "",
          purchaseRole: p.purchaseRole !== "Unknown" ? p.purchaseRole : "",
          market: p.market !== "Unknown" ? p.market : "",
          companySize: p.companySize !== "Unknown" ? p.companySize : ""
        });
      } else {
        setProfile(inferDemoProfile(selfDesc));
      }
    } catch (e) {
      console.error("Self desc extraction error, resetting fallback fields", e);
      setProfile(inferDemoProfile(selfDesc));
    } finally {
      setIsExtracting(false);
      setSurveyStep('confirmProfile');
    }
  };

  // Complete profile validation check logic
  const handleValidateAndContinue = () => {
    // Search if any required field is missing (role, aiUsage, purchaseRole)
    if (!profile.role) {
      setActiveBackfillField("role");
      return;
    }
    if (!profile.aiUsage) {
      setActiveBackfillField("aiUsage");
      return;
    }
    if (!profile.purchaseRole) {
      setActiveBackfillField("purchaseRole");
      return;
    }
    // Check optional/target criteria listed in survey design (e.g., market, companySize)
    if (project.targetProfileFields.includes("market") && !profile.market) {
      setActiveBackfillField("market");
      return;
    }
    if (project.targetProfileFields.includes("companySize") && !profile.companySize) {
      setActiveBackfillField("companySize");
      return;
    }

    // All clean! Advance to Card Swipe session
    setActiveBackfillField(null);
    setSurveyStep('swiping');
    setCurrentCardIndex(0);
    setSignals([]);
    setStarCount(1);
    cardStartTimestamp.current = Date.now();
  };

  // Select Choice backfill answer callback
  const handleChooseBackfill = (field: string, val: string) => {
    setProfile(prev => ({ ...prev, [field]: val }));
    // Quick re-evaluation of missing fields
    setTimeout(() => {
      // Find remaining field missing to backfill recursively
      const updatedProfile = { ...profile, [field]: val };
      if (!updatedProfile.role) {
        setActiveBackfillField("role");
      } else if (!updatedProfile.aiUsage) {
        setActiveBackfillField("aiUsage");
      } else if (!updatedProfile.purchaseRole) {
        setActiveBackfillField("purchaseRole");
      } else if (project.targetProfileFields.includes("market") && !updatedProfile.market) {
        setActiveBackfillField("market");
      } else if (project.targetProfileFields.includes("companySize") && !updatedProfile.companySize) {
        setActiveBackfillField("companySize");
      } else {
        // Ready! Advance
        setActiveBackfillField(null);
        setSurveyStep('swiping');
        setCurrentCardIndex(0);
        setSignals([]);
        setStarCount(1);
        cardStartTimestamp.current = Date.now();
      }
    }, 300);
  };

  // Restart Survey Loop
  const handleRestartSurvey = () => {
    setSelfDesc("");
    setProfile({
      role: "",
      aiUsage: "",
      purchaseRole: "",
      market: "",
      companySize: ""
    });
    setCurrentCardIndex(0);
    setSignals([]);
    setStarCount(1);
    setGeneratedPersona(null);
    setSurveyStep('welcome');
  };

  // Clear analytics test submission list helper
  const handleClearDatabaseSubmissions = async () => {
    if (!window.confirm("Are you sure you want to delete all respondent submission history? Metrics will be reset.")) return;
    try {
      const res = await fetch("/api/project/clear", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add / Edit survey concept card helper
  const handleSaveSurveyCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardForm.title.trim()) return;

    let targetList = [...conceptsEditList];
    if (editingCardId) {
      // Modify existing card
      targetList = targetList.map(c => c.id === editingCardId ? {
        ...c,
        title: newCardForm.title,
        description: newCardForm.description,
        category: newCardForm.category,
        type: newCardForm.type,
        optionA: newCardForm.type === 'compare' ? { title: newCardForm.optionATitle || "", description: newCardForm.optionADesc || "" } : undefined,
        optionB: newCardForm.type === 'compare' ? { title: newCardForm.optionBTitle || "", description: newCardForm.optionBDesc || "" } : undefined,
        followUpMode: newCardForm.followUpMode,
        followUpDwellThresholdMs: Number(newCardForm.followUpDwellThresholdMs)
      } : c);
    } else {
      // Create new card
      const newCard: ConceptCard = {
        id: "concept-" + Date.now(),
        title: newCardForm.title,
        description: newCardForm.description,
        category: newCardForm.category,
        type: newCardForm.type,
        optionA: newCardForm.type === 'compare' ? { title: newCardForm.optionATitle || "", description: newCardForm.optionADesc || "" } : undefined,
        optionB: newCardForm.type === 'compare' ? { title: newCardForm.optionBTitle || "", description: newCardForm.optionBDesc || "" } : undefined,
        followUpMode: newCardForm.followUpMode,
        followUpDwellThresholdMs: Number(newCardForm.followUpDwellThresholdMs)
      };
      targetList.push(newCard);
    }

    setIsSavingConcepts(true);
    try {
      const res = await fetch("/api/project/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts: targetList })
      });
      const data = await res.json();
      if (data.success) {
        setProject(prev => ({ ...prev, concepts: data.concepts }));
        setConceptsEditList(data.concepts);
        // Reset state
        setEditingCardId(null);
        setNewCardForm({
          title: "",
          description: "",
          category: "General",
          type: "single",
          optionATitle: "",
          optionADesc: "",
          optionBTitle: "",
          optionBDesc: "",
          followUpMode: "default",
          followUpDwellThresholdMs: 4
        });
        alert("Concept successfully saved to test pipeline!");
      }
    } catch {
      alert("Failed to update test concepts list.");
    } finally {
      setIsSavingConcepts(false);
    }
  };

  // Delete card command
  const handleDeleteConcept = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this concept card from the test series?")) return;
    const targetList = conceptsEditList.filter(c => c.id !== id);
    try {
      const res = await fetch("/api/project/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts: targetList })
      });
      const data = await res.json();
      if (data.success) {
        setProject(prev => ({ ...prev, concepts: data.concepts }));
        setConceptsEditList(data.concepts);
      }
    } catch {
      alert("Failed to delete concept card.");
    }
  };

  // Populate card fields to edit
  const handleTriggerEditMock = (card: ConceptCard) => {
    setEditingCardId(card.id);
    setNewCardForm({
      title: card.title,
      description: card.description,
      category: card.category || "General",
      type: card.type,
      optionATitle: card.optionA?.title || "",
      optionADesc: card.optionA?.description || "",
      optionBTitle: card.optionB?.title || "",
      optionBDesc: card.optionB?.description || "",
      followUpMode: card.followUpMode || "default",
      followUpDwellThresholdMs: card.followUpDwellThresholdMs || 4
    });
  };

  return (
    <div className="min-h-screen text-on-surface bg-[#f9f9f8] paper-texture flex flex-col font-sans transition-all selection:bg-black selection:text-white relative">
      
      {/* Dynamic Background Noise Accent overlay for vintage paper feel */}
      <div className="absolute inset-0 pointer-events-none opacity-4 z-0 paper-hatch"></div>

      {/* Primary Top Header Nav App Bar */}
      <header className="w-full h-16 flex items-center justify-between px-4 border-b border-outline-variant bg-white relative z-50 shrink-0">
        <div className="flex items-center gap-2">
          {appMode === 'respondent' && (
            <button 
              onClick={handleRestartSurvey}
              className="w-8 h-8 flex items-center justify-center text-secondary hover:text-black hover:bg-[#f3f4f3] rounded-full transition-colors"
              title="Welcome screen"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <span className="font-mono text-xs text-secondary border border-outline-variant rounded px-2 py-0.5 bg-white uppercase tracking-widest hidden sm:block">
            {appMode === 'respondent' ? "Respondent Demo" : "Researcher Dashboard"}
          </span>
          {project.aiEngineStatus && (
            <div 
              className={`flex items-center gap-1 px-2 py-0.5 rounded border border-dashed font-mono text-[9px] uppercase font-bold tracking-wider ${
                project.aiEngineStatus === 'active' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : project.aiEngineStatus === 'suspended'
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-50 text-slate-500 border-slate-300'
              }`}
              title={
                project.aiEngineStatus === 'active' 
                  ? "Gemini API (Flash 3.5) Connected & Active" 
                  : project.aiEngineStatus === 'suspended'
                  ? "Local Sandbox Active (Self-Healing Fallback / Custom Dev Sandbox)"
                  : "Gemini Offline - Running entirely on Local Sandbox Mock Mode"
              }
            >
              <span className={`w-1 h-1 rounded-full ${
                project.aiEngineStatus === 'active' 
                  ? 'bg-emerald-500 animate-pulse' 
                  : project.aiEngineStatus === 'suspended'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-slate-400'
              }`} />
              <span>{project.aiEngineStatus === 'active' ? "Real AI Online" : "Sandbox AI"}</span>
            </div>
          )}
        </div>

        {/* System Title */}
        <h1 className="font-sans text-xs font-bold uppercase tracking-widest absolute left-1/2 -translate-x-1/2 text-black select-none pointer-events-none">
          SUPERVOTE
        </h1>

        {/* Global toggling switch between Respondent Testing Simulator & Researcher Analytics Dashboard */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setAppMode(appMode === 'respondent' ? 'researcher' : 'respondent');
            }}
            className="flex items-center gap-2 px-3 py-1.5 border border-black rounded-lg text-xs font-medium bg-white hover:bg-[#eeeeed] transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-y-0.5 active:shadow-none"
          >
            {appMode === 'respondent' ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch to Researcher Portal</span>
                <span className="sm:hidden">Analysis</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Launch Respondent Demo</span>
                <span className="sm:hidden">Demo</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* CORE FRAME LAYOUT */}
      <div className="flex-1 flex flex-col relative z-20 overflow-x-hidden">
        
        {/* =======================================================
            1. RESPONDENT HANDSET VIEW
            ======================================================= */}
        {appMode === 'respondent' && (
          <div className="flex-1 w-full max-w-lg mx-auto p-4 flex flex-col justify-center items-center">
            
            {/* Step: Welcome Landing */}
            {surveyStep === 'welcome' && (
              <div className="w-full flex-1 flex flex-col justify-between py-5 animate-fade-in text-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black text-[10px] font-mono font-bold uppercase tracking-widest shadow-[2px_2px_0px_#000000]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Mobile AI Research Demo
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-4xl font-extrabold tracking-tight text-black leading-none">
                      Supervote
                    </h2>
                    <p className="font-serif text-[18px] leading-relaxed text-slate-800 max-w-sm mx-auto">
                      A lighter way to turn product reactions into user research signals.
                    </p>
                  </div>

                  <div className="relative mx-auto w-full max-w-[330px] bg-white border-2 border-black rounded-[28px] p-4 shadow-[7px_7px_0px_#000000] text-left overflow-hidden">
                    <div className="flex items-center justify-between border-b border-dashed border-[#cfc4c5] pb-3 mb-4">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-slate-500">Live test card</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-[10px] font-mono font-bold">★ Supervote</span>
                    </div>
                    <div className="bg-[#f9f9f8] border border-black rounded-2xl p-5 min-h-[210px] flex flex-col justify-between">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Concept</span>
                        <h3 className="text-2xl font-extrabold leading-tight mt-2 mb-3">AI Onboarding Copilot</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Swipe right to like, left to pass, or spend one scarce star when the idea feels truly important.
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-5 text-center font-mono text-[10px] uppercase font-bold">
                        <span className="border border-black rounded-lg py-2 bg-white">Pass</span>
                        <span className="border border-black rounded-lg py-2 bg-black text-white">★</span>
                        <span className="border border-black rounded-lg py-2 bg-white">Like</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-left">
                    {[
                      ["Profile", "AI extracts respondent context from one sentence."],
                      ["Signal", "Swipe, dwell time, stars, and reasons are captured."],
                      ["Insight", "Researchers see segments, scores, and AI recommendations."]
                    ].map(([title, body]) => (
                      <div key={title} className="bg-white border border-outline-variant rounded-xl p-3 min-h-[92px]">
                        <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-black mb-1">{title}</h3>
                        <p className="text-[11px] leading-snug text-slate-500">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full space-y-3 pt-6">
                  <button
                    onClick={() => setSurveyStep('selfDescription')}
                    className="w-full bg-black text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer active:translate-y-0.5 shadow-[0_4px_0_0_#dadad9] active:shadow-none"
                  >
                    <Play className="w-5 h-5 text-white fill-white" />
                    <span>Try respondent demo</span>
                  </button>
                  <button
                    onClick={() => setAppMode('researcher')}
                    className="w-full bg-white text-black border border-black font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#eeeeed] transition-all cursor-pointer active:translate-y-0.5 shadow-[0_3px_0_0_#000000] active:shadow-none"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>View researcher dashboard</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step: Self-Description Capture Intro */}
            {surveyStep === 'selfDescription' && (
              <div className="w-full flex-1 flex flex-col justify-between py-4 animate-fade-in">
                
                {/* Mascot Bubble */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative bg-white border border-black p-5 rounded-2xl max-w-sm mb-4 stacked-card">
                    <p className="font-serif text-[17px] text-center text-slate-900 leading-relaxed">
                      "Tell me a little about yourself. One sentence is enough."
                    </p>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-black transform rotate-45"></div>
                  </div>
                  <img 
                    alt="Soot sprite mascot" 
                    className="w-16 h-16 object-contain float-animation mix-blend-multiply mt-2" 
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuSOVbr3IeEQSL_B6776x4yyQGZxGDXS_I6OKyxjULha4V85jtKKZCLGl0Cl-O-WMcyOgiPPgt6XiZtOG5xcHpNpTiawR-606CkWLuTfDdTCgtSi7YWfgD4zGoRuXwznsAA1FXS7ntRIljYEQ5s_-_NlHV6vY6s9tQBqLyhAiV5WgjmiMtPAI0xJIV1pJp7V7p2Fj8ojpyZtNQOFyuPhx2TJ6fy5dPiqeo6GnjOPej1zHPOfeUOIPABE_0" 
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Input Card Form */}
                <div className="w-full bg-white brutalist-border rounded-xl p-6 mb-8 relative group focus-within:border-black transition-all">
                  <div className="absolute top-4 left-4 flex gap-1 text-[#cfc4c5]">
                    <Sparkles className="w-4 h-4 fill-none" />
                  </div>

                  <div className="mt-4">
                    <label className="sr-only">Self description</label>
                    <textarea 
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-black resize-none text-[17px] text-black placeholder:text-[#cfc4c5] p-0 focus:outline-none min-h-[110px]"
                      placeholder="e.g. I’m a solo founder. I use ChatGPT daily and decide which developer tools to buy."
                      value={selfDesc}
                      maxLength={180}
                      onChange={(e) => setSelfDesc(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-between items-center mt-3 text-xs text-secondary font-mono">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-secondary" />
                      AI extracts profile attributes automatically
                    </span>
                    <span>{selfDesc.length} / 180</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelfDesc("I am a solo founder. I use ChatGPT daily and decide which AI tools my team should buy.")}
                    className="mt-4 w-full border border-dashed border-black rounded-xl py-2.5 text-xs font-bold text-black bg-[#f9f9f8] hover:bg-[#eeeeed] transition-colors"
                  >
                    Use demo respondent
                  </button>
                </div>

                {/* Bottom Extraction submit button */}
                <button 
                  onClick={handleExtractProfile}
                  disabled={!selfDesc.trim() || isExtracting}
                  className="w-full bg-black text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-[0_4px_0_0_#dadad9] active:translate-y-0.5 active:shadow-none"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Reading attributes...</span>
                    </>
                  ) : (
                    <>
                      <span>Extract profile</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step: Confirm Profiles Field values */}
            {surveyStep === 'confirmProfile' && activeBackfillField === null && (
              <div className="w-full flex-1 flex flex-col justify-between py-4 animate-fade-in">
                
                {/* Speech Bubble speaking about properties */}
                <div className="flex items-center gap-4 mb-8">
                  <img 
                    alt="Mascot avatar" 
                    className="w-14 h-14 object-contain flex-shrink-0 float-animation" 
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuSOVbr3IeEQSL_B6776x4yyQGZxGDXS_I6OKyxjULha4V85jtKKZCLGl0Cl-O-WMcyOgiPPgt6XiZtOG5xcHpNpTiawR-606CkWLuTfDdTCgtSi7YWfgD4zGoRuXwznsAA1FXS7ntRIljYEQ5s_-_NlHV6vY6s9tQBqLyhAiV5WgjmiMtPAI0xJIV1pJp7V7p2Fj8ojpyZtNQOFyuPhx2TJ6fy5dPiqeo6GnjOPej1zHPOfeUOIPABE_0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative bg-white border border-outline-variant rounded-[16px] p-4 flex-grow shadow-sm">
                    <p className="font-serif text-[15px] leading-relaxed text-black">
                      "Here’s how I understand you. Click missing gaps to backfill, or modify parsed fields."
                    </p>
                    <div className="absolute -left-2 bottom-6 w-3 h-3 bg-white border-b border-l border-outline-variant rotate-45"></div>
                  </div>
                </div>

                {/* Extracted property edit boxes list */}
                <div className="flex-1 flex flex-col gap-3 w-full my-3">
                  
                  {/* Field: Role */}
                  <div className="relative">
                    <span className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-secondary uppercase tracking-widest font-mono">
                      Role
                    </span>
                    <div className="w-full flex items-center justify-between p-3.5 bg-white border border-black rounded-lg shadow-sm">
                      <input 
                        className="font-sans font-medium text-black bg-transparent border-none p-0 focus:ring-0 text-sm w-full outline-none"
                        value={profile.role || "Missing"}
                        onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="e.g. Solo founder"
                      />
                      <Edit className="w-4 h-4 text-[#cfc4c5]" />
                    </div>
                  </div>

                  {/* Field: AI usage */}
                  <div className="relative">
                    <span className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-secondary uppercase tracking-widest font-mono">
                      AI usage
                    </span>
                    <div className="w-full flex items-center justify-between p-3.5 bg-white border border-black rounded-lg shadow-sm">
                      <input 
                        className="font-sans font-medium text-black bg-transparent border-none p-0 focus:ring-0 text-sm w-full outline-none"
                        value={profile.aiUsage || "Missing"}
                        onChange={(e) => setProfile(prev => ({ ...prev, aiUsage: e.target.value }))}
                        placeholder="e.g. Daily"
                      />
                      <Edit className="w-4 h-4 text-[#cfc4c5]" />
                    </div>
                  </div>

                  {/* Field: Purchase role */}
                  <div className="relative">
                    <span className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-secondary uppercase tracking-widest font-mono">
                      Purchase role
                    </span>
                    <div className="w-full flex items-center justify-between p-3.5 bg-white border border-black rounded-lg shadow-sm">
                      <input 
                        className="font-sans font-medium text-black bg-transparent border-none p-0 focus:ring-0 text-sm w-full outline-none"
                        value={profile.purchaseRole || "Missing"}
                        onChange={(e) => setProfile(prev => ({ ...prev, purchaseRole: e.target.value }))}
                        placeholder="e.g. Decision maker"
                      />
                      <Edit className="w-4 h-4 text-[#cfc4c5]" />
                    </div>
                  </div>

                  {/* Field: Market (Missing dotted card) */}
                  <button 
                    onClick={() => setActiveBackfillField("market")}
                    className={`w-full text-left p-3.5 rounded-lg border flex items-center justify-between transition-all group cursor-pointer ${
                      profile.market 
                        ? "bg-white border-black" 
                        : "bg-stone-50 border-dashed border-[#7e7576] hover:bg-white"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-mono">Market</span>
                      <span className={`text-sm font-sans font-medium ${profile.market ? "text-black" : "text-slate-400 italic"}`}>
                        {profile.market || "Missing (Click to complete)"}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#eeeeed] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Field: Company Size (Missing dotted card) */}
                  <button 
                    onClick={() => setActiveBackfillField("companySize")}
                    className={`w-full text-left p-3.5 rounded-lg border flex items-center justify-between transition-all group cursor-pointer ${
                      profile.companySize 
                        ? "bg-white border-black" 
                        : "bg-stone-50 border-dashed border-[#7e7576] hover:bg-white"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-mono">Company size</span>
                      <span className={`text-sm font-sans font-medium ${profile.companySize ? "text-black" : "text-slate-400 italic"}`}>
                        {profile.companySize || "Missing (Click to complete)"}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#eeeeed] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>

                </div>

                {/* Continue Switch bottom button bar */}
                <div className="mt-8 pt-4 border-t border-outline-variant w-full">
                  <button 
                    onClick={handleValidateAndContinue}
                    className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-[0_4px_0_0_#dadad9]"
                  >
                    <span>Continue to evaluation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Backfill Field Specific choice flow (e.g. Which market are you in?) */}
            {surveyStep === 'confirmProfile' && activeBackfillField !== null && (
              <div className="w-full flex-1 flex flex-col justify-between py-4 animate-fade-in">
                
                {/* Mascot header instruction */}
                <div className="flex flex-col items-center mb-6">
                  <img 
                    alt="Cute mascot" 
                    className="w-16 h-16 object-contain float-animation mb-3" 
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuSOVbr3IeEQSL_B6776x4yyQGZxGDXS_I6OKyxjULha4V85jtKKZCLGl0Cl-O-WMcyOgiPPgt6XiZtOG5xcHpNpTiawR-606CkWLuTfDdTCgtSi7YWfgD4zGoRuXwznsAA1FXS7ntRIljYEQ5s_-_NlHV6vY6s9tQBqLyhAiV5WgjmiMtPAI0xJIV1pJp7V7p2Fj8ojpyZtNQOFyuPhx2TJ6fy5dPiqeo6GnjOPej1zHPOfeUOIPABE_0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-white border border-black px-6 py-3.5 rounded-xl max-w-sm text-center">
                    <p className="font-serif text-sm">
                      "Help me complete this field to compare feedback accurately."
                    </p>
                  </div>
                </div>

                {/* Big card questionnaire choice */}
                <div className="w-full bg-white brutalist-border rounded-xl p-8 mb-6">
                  <h2 className="text-xl font-bold font-sans text-center text-black mb-8">
                    {activeBackfillField === 'market' && "Which market are you in?"}
                    {activeBackfillField === 'companySize' && "What is your company size?"}
                    {activeBackfillField === 'role' && "Confirm your role/identity"}
                    {activeBackfillField === 'aiUsage' && "How often do you use AI tools?"}
                    {activeBackfillField === 'purchaseRole' && "What's your software purchasing role?"}
                  </h2>

                  {/* Options selection stack */}
                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    
                    {/* Market Choices */}
                    {activeBackfillField === 'market' && ["China", "North America", "Europe", "Southeast Asia", "Other"].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => handleChooseBackfill('market', opt)}
                        className="w-full h-12 flex items-center justify-center bg-white border border-outline hover:border-black hover:bg-[#f3f4f3] rounded-lg text-sm font-medium text-black cursor-pointer transition-all active:translate-y-0.5 active:shadow-none"
                      >
                        {opt}
                      </button>
                    ))}

                    {/* Company Size Choices */}
                    {activeBackfillField === 'companySize' && ["1-10 people", "11-50 people", "51-200 people", "201-1000 people", "1000+ people"].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => handleChooseBackfill('companySize', opt)}
                        className="w-full h-12 flex items-center justify-center bg-white border border-outline hover:border-black hover:bg-[#f3f4f3] rounded-lg text-sm font-medium text-black cursor-pointer transition-all active:translate-y-0.5"
                      >
                        {opt}
                      </button>
                    ))}

                    {/* Standard Role Choices */}
                    {activeBackfillField === 'role' && ["Solo founder", "Product Manager", "Software Engineer", "Researcher", "General Tech Enthusiast"].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => handleChooseBackfill('role', opt)}
                        className="w-full h-12 flex items-center justify-center bg-white border border-outline hover:border-black hover:bg-[#f3f4f3] rounded-lg text-sm font-medium text-black cursor-pointer transition-all active:translate-y-0.5"
                      >
                        {opt}
                      </button>
                    ))}

                    {/* AI Usage Choices */}
                    {activeBackfillField === 'aiUsage' && ["Daily", "Weekly", "Rarely", "Never"].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => handleChooseBackfill('aiUsage', opt)}
                        className="w-full h-12 flex items-center justify-center bg-white border border-outline hover:border-black hover:bg-[#f3f4f3] rounded-lg text-sm font-medium text-black cursor-pointer transition-all active:translate-y-0.5"
                      >
                        {opt}
                      </button>
                    ))}

                    {/* Purchase Role Choices */}
                    {activeBackfillField === 'purchaseRole' && ["Decision maker", "Evaluator", "End user"].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => handleChooseBackfill('purchaseRole', opt)}
                        className="w-full h-12 flex items-center justify-center bg-white border border-outline hover:border-black hover:bg-[#f3f4f3] rounded-lg text-sm font-medium text-black cursor-pointer transition-all active:translate-y-0.5"
                      >
                        {opt}
                      </button>
                    ))}

                  </div>
                </div>

                <div className="w-full flex justify-center text-center">
                  <button 
                    onClick={() => setActiveBackfillField(null)}
                    className="text-xs text-[#7e7576] hover:text-black hover:underline"
                  >
                    ← Back to confirmation check
                  </button>
                </div>
              </div>
            )}

            {/* Step: EVALUATION CORE SWIPE CANVAS */}
            {surveyStep === 'swiping' && (
              <div className="w-full flex-1 flex flex-col justify-between py-2 animate-fade-in relative z-10 select-none">
                
                {/* Tutorial mascot balloon at the top-center */}
                <div className="w-full flex items-end gap-3 z-30 mb-4">
                  <img 
                    alt="Soot sprite speaking bubbles instructions"
                    className="w-12 h-12 object-contain mix-blend-multiply flex-shrink-0 -mb-2 float-animation"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuSOVbr3IeEQSL_B6776x4yyQGZxGDXS_I6OKyxjULha4V85jtKKZCLGl0Cl-O-WMcyOgiPPgt6XiZtOG5xcHpNpTiawR-606CkWLuTfDdTCgtSi7YWfgD4zGoRuXwznsAA1FXS7ntRIljYEQ5s_-_NlHV6vY6s9tQBqLyhAiV5WgjmiMtPAI0xJIV1pJp7V7p2Fj8ojpyZtNQOFyuPhx2TJ6fy5dPiqeo6GnjOPej1zHPOfeUOIPABE_0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative bg-white border border-black rounded-[14px] p-3 flex-grow z-10 shadow-sm text-xs select-none">
                    <p className="font-serif text-slate-800 leading-normal">
                      Swipe RIGHT if you like it. Swipe LEFT to Pass. Use Star for Supervote.
                    </p>
                    <div className="absolute -left-1.5 bottom-3 w-3 h-3 bg-white border-b border-l border-black rotate-45"></div>
                  </div>
                </div>

                {/* Main Interactive Swipe Card Stage */}
                <div className="flex-grow flex flex-col justify-center items-center w-full relative my-3 z-20">
                  
                  {/* Background overlay directions arrows doddles */}
                  <div className="absolute inset-x-0 pointer-events-none flex justify-center items-center opacity-30 select-none z-0">
                    <img 
                      alt="Hand-drawn navigation gestures arrows guidance" 
                      className="w-full max-w-[280px] h-auto object-contain mix-blend-multiply" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOy1r_Yy878-DAxgp6l0Ulzc5Hd0XkEt5ip22qWisnU7Kz-NvWNVBkTs4lpT6xFemZWliO5jbgqDrXvHI1i6uaSGevpZgX18aawCffa2uOyFAaBefXw1u6BMQoViFvMdgdDP1ZDnwEH5PgA1JrYZxvwNDfnoPrNhtwks9iYgoVAver91Ww5V5fZLwrGtgkI0Xwu1Pyq66_6KD0TM246lEZDFhJWtWy7-WEnbhrigqJSPE3LFNILlc34nYxz5nWuurLHY-0pWTDT2k" 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {project.concepts.length > 0 && currentCardIndex < project.concepts.length ? (
                    (() => {
                      const card = project.concepts[currentCardIndex];
                      if (card.type === 'compare') {
                        return (
                          <div className="w-full max-w-sm flex flex-col gap-4 py-2 relative z-10 select-none">
                            
                            {/* Option A Box Panel */}
                            <div
                              ref={optionARef}
                              onClick={() => submitSwipeChoice('compare_A')}
                              className={`p-5 rounded-2xl cursor-pointer text-left transition-all border-2 bg-white select-none relative duration-200 ${
                                starCollision === 'optionA'
                                  ? 'border-amber-400 bg-amber-50/50 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.03] rotate-[0.5deg]'
                                  : 'border-black hover:bg-[#fafafa]/80 hover:shadow-[5px_5px_0px_#000000] active:scale-[0.99] hover:-translate-y-0.5'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-[#7e7576]">
                                  Option A
                                </span>
                                {starCollision === 'optionA' ? (
                                  <span className="font-mono text-[9px] text-amber-600 uppercase font-bold animate-pulse">
                                    ★ Dropping releases Supervote ★
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-rose-600 font-mono font-bold tracking-tight">
                                    Tap to Choose A
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-sm sm:text-base text-black mb-1 line-clamp-1">
                                {card.optionA?.title || "Product Option A"}
                              </h3>
                              <p className="text-xs text-secondary leading-normal line-clamp-2">
                                {card.optionA?.description}
                              </p>
                            </div>

                            {/* Simple clean horizontal line divider */}
                            <div className="border-t border-slate-200 w-full my-1 shrink-0"></div>

                            {/* Option B Box Panel */}
                            <div
                              ref={optionBRef}
                              onClick={() => submitSwipeChoice('compare_B')}
                              className={`p-5 rounded-2xl cursor-pointer text-left transition-all border-2 bg-white select-none relative duration-200 ${
                                starCollision === 'optionB'
                                  ? 'border-amber-400 bg-amber-50/50 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.03] rotate-[-0.5deg]'
                                  : 'border-black hover:bg-[#fafafa]/80 hover:shadow-[5px_5px_0px_#000000] active:scale-[0.99] hover:-translate-y-0.5'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-[#7e7576]">
                                  Option B
                                </span>
                                {starCollision === 'optionB' ? (
                                  <span className="font-mono text-[9px] text-amber-600 uppercase font-bold animate-pulse">
                                    ★ Dropping releases Supervote ★
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-[#2c3e50] font-mono font-bold tracking-tight">
                                    Tap to Choose B
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-sm sm:text-base text-black mb-1 line-clamp-1">
                                {card.optionB?.title || "Product Option B"}
                              </h3>
                              <p className="text-xs text-secondary leading-normal line-clamp-2">
                                {card.optionB?.description}
                              </p>
                            </div>

                            {/* Draggable Supervote Star zone specifically designed for comparison cards */}
                            <div className="flex flex-col items-center gap-1.5 mt-4 select-none shrink-0 w-full relative z-30">
                              {starCount > 0 ? (
                                <div className="flex flex-col items-center">
                                  {/* Draggable Star Badge */}
                                  <div
                                    onPointerDown={handleStarDragStart}
                                    onPointerMove={handleStarDragMove}
                                    onPointerUp={handleStarDragEnd}
                                    style={{
                                      transform: `translate(${starDragOffset.x}px, ${starDragOffset.y}px)`,
                                      touchAction: 'none'
                                    }}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_4px_12px_rgba(245,158,11,0.4)] border-2 border-amber-400 bg-amber-500 text-white font-bold select-none text-2xl transition-shadow relative ${
                                      isDraggingStar ? 'scale-110 shadow-[0_8px_20px_rgba(245,158,11,0.6)] z-50' : 'hover:scale-[1.05]'
                                    }`}
                                  >
                                    ★
                                    {isDraggingStar && (
                                      <span className="absolute inset-0 rounded-full bg-amber-400 opacity-30 animate-pulse -z-10" />
                                    )}
                                  </div>
                                  <span className="text-[9px] uppercase font-bold tracking-widest text-amber-600 font-mono mt-1.5 animate-pulse">
                                    ★ Drag Star onto A or B to Supervote ★
                                  </span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400 text-center italic font-mono uppercase tracking-wider">
                                  No supervote stars left
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      }

                      // Return standard single-concept swipe card
                      return (
                        <div 
                          className="relative w-full max-w-sm z-10 aspect-[4/5] max-h-[50vh] min-h-[360px]"
                          onMouseDown={handleDragStart}
                          onTouchStart={handleDragStart}
                        >
                          
                          {/* STACK SHADOW BACKGROUND CARDS FOR depth layer */}
                          <div className="absolute inset-0 border border-black bg-white rounded-2xl transform translate-x-2 translate-y-2 opacity-20 -z-20"></div>
                          <div className="absolute inset-0 border border-black bg-white rounded-2xl transform translate-x-1 translate-y-1 opacity-50 -z-10"></div>

                          {/* ACTIVE DRAGGABLE CARD CONTAINER */}
                          <div 
                            className="absolute inset-0 bg-white brutalist-border-md rounded-2xl flex flex-col p-5 cursor-grab active:cursor-grabbing select-none touch-none"
                            style={{
                              transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`,
                              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                            }}
                          >
                            
                            {/* Card Category Head & Spark icon */}
                            <div className="flex justify-between items-center w-full mb-2.5 shrink-0 text-slate-400">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-widest border border-dashed border-[#cfc4c5] px-2 py-0.5 rounded">
                                {card.category || "Concept"}
                              </span>
                              <Sparkle className="w-4 h-4 text-black fill-none" />
                            </div>

                            <div className="flex-grow flex flex-col justify-center text-center px-2">
                              <h3 className="text-2xl font-bold font-sans tracking-tight text-black mb-4 select-none">
                                {card.title}
                              </h3>
                              <p className="text-secondary text-[16px] leading-relaxed max-w-[280px] mx-auto select-none">
                                {card.description}
                              </p>
                            </div>

                            {/* Relative active indicator overlays based on drag coordinates */}
                            <div className="w-full flex justify-center mt-3 shrink-0 text-center font-mono text-[10px] uppercase font-bold tracking-widest text-[#cfc4c5]">
                              {dragOffset.y < -35 ? (
                                <span className="text-amber-500 font-extrabold flex items-center gap-1 animate-pulse">★ SUPERVOTE! ★</span>
                              ) : dragOffset.x > 35 ? (
                                <span className="text-black">Like →</span>
                              ) : dragOffset.x < -35 ? (
                                <span className="text-[#e23030]">← Pass</span>
                              ) : (
                                <span>Slide or Tap to choose</span>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center p-8 bg-white border border-black rounded-xl">
                      <p className="text-slate-500 italic">No concepts designed for testing yet.</p>
                    </div>
                  )}

                </div>

                {/* Bottom Control Actions (Direct buttons to provide fallback swiping on desktops) */}
                <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 mt-2 shrink-0 z-30">
                  
                  {/* Stars indicators remaining count */}
                  <div className="px-3 py-1 border border-[#cfc4c5] rounded-full bg-white text-secondary text-[10px] font-bold font-mono uppercase tracking-widest leading-none">
                    Supervote stars left: {starCount}
                  </div>

                  {/* Actions buttons stack row */}
                  <div className="flex items-center justify-between w-full max-w-xs gap-3">
                    
                    {/* Pass button */}
                    <button 
                      onClick={() => submitSwipeChoice('pass')}
                      className="flex-1 h-14 flex items-center justify-center brutalist-border rounded-xl bg-white text-secondary font-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-neutral-50 active:translate-y-0.5"
                    >
                      Pass
                    </button>

                    {/* Star Supervote button */}
                    <button 
                      onClick={() => {
                        if (starCount > 0) submitSwipeChoice('supervote');
                        else alert("No supervote stars left!");
                      }}
                      disabled={starCount === 0}
                      className="w-14 h-14 shrink-0 flex items-center justify-center brutalist-border rounded-xl bg-black text-white text-lg font-bold cursor-pointer hover:bg-neutral-800 active:translate-y-0.5 disabled:opacity-20 disabled:pointer-events-none"
                    >
                      ★
                    </button>

                    {/* Like button */}
                    <button 
                      onClick={() => submitSwipeChoice('like')}
                      className="flex-1 h-14 flex items-center justify-center brutalist-border rounded-xl bg-white text-black font-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-neutral-50 active:translate-y-0.5"
                    >
                      Like
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* Step: REASON AI SELECTION FOLLOW-UP */}
            {surveyStep === 'reasons' && (
              <div className="w-full flex-grow flex flex-col justify-between py-4 animate-fade-in">
                
                {/* Visual Speaking bubble Mascot layout top */}
                <div className="w-full flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="bg-white border border-black p-5 rounded-2xl max-w-sm text-center shadow-sm">
                      <h1 className="font-serif text-lg text-black leading-snug">
                        "What made that choice feel right?"
                      </h1>
                    </div>
                    {/* speech bubble arrow pointing downwards */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-black transform rotate-45"></div>
                  </div>
                  <img 
                    alt="Owl logo" 
                    className="w-16 h-16 object-contain float-animation" 
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuSOVbr3IeEQSL_B6776x4yyQGZxGDXS_I6OKyxjULha4V85jtKKZCLGl0Cl-O-WMcyOgiPPgt6XiZtOG5xcHpNpTiawR-606CkWLuTfDdTCgtSi7YWfgD4zGoRuXwznsAA1FXS7ntRIljYEQ5s_-_NlHV6vY6s9tQBqLyhAiV5WgjmiMtPAI0xJIV1pJp7V7p2Fj8ojpyZtNQOFyuPhx2TJ6fy5dPiqeo6GnjOPej1zHPOfeUOIPABE_0"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Micro AI subtitle */}
                <div className="mb-6 flex items-center justify-center gap-1.5 text-xs text-secondary font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI suggests options. You confirm.</span>
                </div>

                {/* Reason Pills Bubble container stack */}
                <div className="flex-grow flex flex-col gap-3 items-center justify-center w-full max-w-sm mx-auto px-2">
                  {isGeneratingReasons ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-black animate-spin" />
                      <p className="font-mono text-[10px] uppercase text-secondary">Dreaming up context reasons...</p>
                    </div>
                  ) : (
                    <>
                      {generatedReasonsList.map((reason, idx) => {
                        const isChosenTarget = selectedReasons.includes(reason);
                        return (
                          <button 
                            key={idx}
                            onClick={() => {
                              setSelectedReasons(prev => 
                                prev.includes(reason) 
                                  ? prev.filter(r => r !== reason)
                                  : [...prev, reason]
                              );
                            }}
                            className={`px-5 py-3 w-full max-w-[300px] text-center border font-sans text-sm font-medium cursor-pointer transition-all active:translate-y-[2px] ${
                              idx % 2 === 0 ? "sketchy-border-1" : "sketchy-border-2"
                            } ${
                              isChosenTarget 
                                ? "bg-black text-white border-black shadow-[2px_2px_0px_#7e7576]" 
                                : "bg-white text-[#1a1c1c] border-black hover:bg-slate-50 shadow-[1px_1px_0px_rgba(0,0,0,0.15)]"
                            }`}
                          >
                            {reason}
                          </button>
                        );
                      })}

                      {/* Fallback alternative when none apply */}
                      <button 
                        onClick={() => setSelectedReasons(["None of these"])}
                        className={`px-5 py-3 w-full max-w-[300px] border border-dashed text-stone-500 font-sans text-sm font-medium cursor-pointer transition-all active:translate-y-[2px] sketchy-border-3 ${
                          selectedReasons.includes("None of these")
                            ? "bg-stone-100 text-black border-black font-semibold"
                            : "bg-transparent border-[#7e7576] hover:bg-stone-50"
                        }`}
                      >
                        None of these
                      </button>
                    </>
                  )}
                </div>

                {/* Bottom fixed Confirmation Action triggers */}
                <div className="w-full mt-8">
                  <button 
                    onClick={handleConfirmReasons}
                    disabled={isGeneratingReasons}
                    className="w-full bg-black text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-40 transition-all cursor-pointer shadow-[0_4px_0_0_#dadad9]"
                  >
                    <span>Confirm reason</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* Step: LOADING PATTERN AND REPORT GENERATION */}
            {surveyStep === 'loadingReport' && (
              <div className="w-full flex-grow flex flex-col justify-center items-center py-8 text-center animate-fade-in max-w-sm">
                
                {/* Speech Bubble */}
                <div className="bg-white border border-black p-6 rounded-2xl mb-8 relative stacked-card w-full max-w-[280px]">
                  <p className="font-serif text-lg text-slate-800 italic">
                    "I’m reading your reaction patterns..."
                  </p>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-black transform rotate-45"></div>
                </div>

                {/* Floating mascot sprite */}
                <div className="w-28 h-28 float-animation mb-12">
                  <img 
                    alt="Black soot sprite animated" 
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow" 
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuSOVbr3IeEQSL_B6776x4yyQGZxGDXS_I6OKyxjULha4V85jtKKZCLGl0Cl-O-WMcyOgiPPgt6XiZtOG5xcHpNpTiawR-606CkWLuTfDdTCgtSi7YWfgD4zGoRuXwznsAA1FXS7ntRIljYEQ5s_-_NlHV6vY6s9tQBqLyhAiV5WgjmiMtPAI0xJIV1pJp7V7p2Fj8ojpyZtNQOFyuPhx2TJ6fy5dPiqeo6GnjOPej1zHPOfeUOIPABE_0" 
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Process checklists */}
                <div className="w-full max-w-[240px] space-y-4 text-left font-sans text-[15px]">
                  
                  {/* Step 1 */}
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-black flex items-center justify-center shrink-0 bg-white">
                      {loadingStepIdx >= 0 ? <Check className="w-3.5 h-3.5 text-black stroke-[3]" /> : null}
                    </div>
                    <span className={loadingStepIdx >= 0 ? "text-black font-semibold" : "text-stone-400"}>
                      Sorting your signals
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-black flex items-center justify-center shrink-0 bg-white">
                      {loadingStepIdx >= 1 ? (
                        <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-200 animate-ping"></span>
                      )}
                    </div>
                    <span className={loadingStepIdx >= 1 ? "text-black font-semibold" : "text-stone-400"}>
                      Matching your feedback type
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-black flex items-center justify-center shrink-0 bg-white">
                      {loadingStepIdx >= 2 ? (
                        <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      ) : null}
                    </div>
                    <span className={loadingStepIdx >= 2 ? "text-black font-semibold" : "text-stone-400"}>
                      Generating your card
                    </span>
                  </div>

                </div>

              </div>
            )}

            {/* Step: FINAL REPORT FEEDBACK PERSONA TICKET */}
            {surveyStep === 'reportDetails' && (
              <div className="w-full flex-grow flex flex-col py-2 animate-fade-in max-w-sm mx-auto">
                
                {/* Speech Bubble */}
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    alt="Soot sprite speaking bubbles instructions"
                    className="w-12 h-12 object-contain mix-blend-multiply flex-shrink-0 float-animation"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuSOVbr3IeEQSL_B6776x4yyQGZxGDXS_I6OKyxjULha4V85jtKKZCLGl0Cl-O-WMcyOgiPPgt6XiZtOG5xcHpNpTiawR-606CkWLuTfDdTCgtSi7YWfgD4zGoRuXwznsAA1FXS7ntRIljYEQ5s_-_NlHV6vY6s9tQBqLyhAiV5WgjmiMtPAI0xJIV1pJp7V7p2Fj8ojpyZtNQOFyuPhx2TJ6fy5dPiqeo6GnjOPej1zHPOfeUOIPABE_0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative bg-white border border-black rounded-[14px] p-4 flex-grow z-10 shadow-sm text-xs">
                    <p className="font-serif leading-relaxed text-black">
                      "I've written your feedback personality card! Look at these traits below."
                    </p>
                    <div className="absolute -left-1.5 bottom-4 w-3 h-3 bg-white border-b border-l border-black rotate-45"></div>
                  </div>
                </div>

                {/* NetEase Annual Style Persona ticket */}
                <div className="w-full bg-white brutalist-border-md rounded-2xl p-6 mb-6 flex flex-col relative overflow-hidden">
                  
                  {/* Stamped Ink layout header */}
                  <div className="flex justify-between items-start border-b border-[#cfc4c5] pb-4 mb-4 select-none">
                    <div>
                      <h4 className="font-mono text-[9px] uppercase tracking-wider text-secondary font-bold">Feedback Ticket</h4>
                      <h3 className="font-sans font-bold text-xs text-black uppercase tracking-widest">{profile.role || "Innovator"}</h3>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      #{Math.floor(Math.random() * 1000 + 4900)}
                    </span>
                  </div>

                  {/* Persona Personality title */}
                  <div className="text-center py-4">
                    <div className="inline-block px-2.5 py-0.5 bg-[#eeeeed] border border-outline-variant rounded-full text-[10px] font-bold font-mono uppercase tracking-widest text-slate-600 mb-2">
                      Your Persona
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight font-sans text-black leading-snug">
                      {generatedPersona?.personalityName || "The Deliberate Rationalist"}
                    </h2>
                  </div>

                  {/* Narrative details */}
                  <div className="p-4 bg-[#f9f9f8] rounded-xl border border-outline-variant border-dashed text-left my-2 shrink-0">
                    <p className="font-serif text-sm leading-relaxed text-slate-800">
                      {generatedPersona?.personalityDesc}
                    </p>
                  </div>

                  {/* Implicit interaction statistics node */}
                  <div className="border-t border-[#cfc4c5] pt-4 mt-3 select-none">
                    <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#7e7576] mb-3">
                      Your Implicit Behavioral Signals
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-left">
                      
                      {/* Dwell stats */}
                      <div className="p-2 border border-outline-variant rounded-lg bg-stone-50">
                        <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-400 font-mono mb-0.5">Avg Dwell time</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-base font-bold text-black">
                            {(signals.reduce((acc, s) => acc + s.dwellTimeMs, 0) / Math.max(1, signals.length) / 1000).toFixed(1)}s
                          </span>
                        </div>
                        <span className="text-[9px] text-[#7e7576]">
                          {signals.reduce((acc, s) => acc + s.dwellTimeMs, 0) / Math.max(1, signals.length) > 5000 
                            ? "Deliberate Thinker" 
                            : "Intuitive Decisive"}
                        </span>
                      </div>

                      {/* Pref bias */}
                      <div className="p-2 border border-outline-variant rounded-lg bg-stone-50">
                        <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-400 font-mono mb-0.5">Voted bias</span>
                        <span className="font-mono text-sm font-bold text-black uppercase tracking-wider block">
                          {signals.filter(s => s.choice === 'like').length} Likes / {signals.filter(s => s.choice === 'pass').length} Pass
                        </span>
                        <span className="text-[9px] text-[#7e7576]">
                          {signals.filter(s => s.choice === 'supervote').length ? "Used Supervote" : "Standard Evaluator"}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Ticket footer tear strip */}
                  <div className="mt-6 border-t border-dashed border-[#cfc4c5] pt-3 text-center">
                    <span className="font-mono text-[9px] text-[#cfc4c5] uppercase tracking-[0.2em]">
                      ▼ TEAR HERE DISMISS ▼
                    </span>
                  </div>

                </div>

                {/* Restart surveys buttons */}
                <button 
                  onClick={handleRestartSurvey}
                  className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-[0_4px_0_0_#dadad9]"
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                  <span>Restart evaluation sandbox</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* =======================================================
            2. RESEARCHER ANALYTICS DASHBOARD
            ======================================================= */}
        {appMode === 'researcher' && (
          <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            
            {/* Header section panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-outline-variant gap-4">
              <div>
                <h2 className="text-3xl font-extrabold font-sans text-black tracking-tight flex items-center gap-2">
                  <Sliders className="w-7 h-7 text-black stroke-[2.5]" />
                  Researcher Workspace
                </h2>
                <p className="text-secondary text-sm mt-1">
                  Evaluate concept swiping analytics, manage cards under test, and read instant AI recommendations.
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={fetchAnalytics}
                  disabled={isAnalyticsLoading}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-black rounded-lg text-xs font-semibold text-black cursor-pointer hover:bg-[#eeeeed] shadow-[2px_2px_0px_#000000] active:translate-y-0.5 active:shadow-none"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyticsLoading && "animate-spin"}`} />
                  Sync Analytics
                </button>
                <button 
                  onClick={handleClearDatabaseSubmissions}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-red-600 rounded-lg text-xs font-semibold text-red-600 cursor-pointer hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset Submissions
                </button>
              </div>
            </div>

            {/* DASHBOARD GRID TILES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left columns sidebar: managing concept cards */}
              <div className="lg:col-span-1 bg-white brutalist-border rounded-xl p-5 flex flex-col">
                <h3 className="font-sans font-bold text-md text-black border-b border-outline-variant pb-3 mb-4 flex items-center gap-1">
                  <Settings className="w-4.5 h-4.5" />
                  Manage Test Cards ({conceptsEditList.length})
                </h3>

                {/* AI Engine Controller panel to toggle between real Gemini vs offline prototype sandbox */}
                <div className="bg-[#f9f9f8] border border-black/10 rounded-xl p-3.5 mb-5 space-y-2 select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">AI Execution Model</span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      project.aiEngineStatus === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {project.aiEngineStatus === 'active' ? "Real-time AI" : "Local Sandbox"}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-normal">
                    Avoid hitting Gemini daily quota rate limits during high-frequency developer testing. Force Local Sandbox Mode to simulate profiles with local-heuristic patterns.
                  </p>
                  
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const targetVal = !project.forceSandbox;
                        try {
                          const res = await fetch("/api/project/toggle-sandbox", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ forceSandbox: targetVal })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setProject(prev => ({
                              ...prev,
                              forceSandbox: data.forceSandbox,
                              aiEngineStatus: data.aiEngineStatus
                            }));
                          }
                        } catch (err) {
                          console.error("Failed toggling sandbox mode", err);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-black rounded-lg text-xs font-semibold cursor-pointer text-slate-800 hover:bg-[#eeeeed] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{project.forceSandbox ? "Switch to Live Gemini 1.5" : "Force Local Sandbox Mode"}</span>
                    </button>
                  </div>
                </div>

                {/* Form to Create/Edit test Cards */}
                <form onSubmit={handleSaveSurveyCard} className="space-y-4 mb-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                      Concept Title
                    </label>
                    <input 
                      type="text"
                      className="w-full text-xs font-medium border border-outline rounded p-2 focus:ring-1 focus:ring-black outline-none bg-[#f9f9f8]"
                      placeholder="e.g. AI Content Planner"
                      value={newCardForm.title}
                      onChange={(e) => setNewCardForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                      Concept Pitch Description
                    </label>
                    <textarea 
                      className="w-full text-xs font-medium border border-outline rounded p-2 focus:ring-1 focus:ring-black outline-none bg-[#f9f9f8] min-h-[60px]"
                      placeholder="Define the primary action/benefit of the concept"
                      value={newCardForm.description}
                      onChange={(e) => setNewCardForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                        Category Tag
                      </label>
                      <input 
                        type="text"
                        className="w-full text-xs font-medium border border-outline rounded p-2 focus:ring-1 focus:ring-black outline-none bg-[#f9f9f8]"
                        placeholder="Productivity"
                        value={newCardForm.category}
                        onChange={(e) => setNewCardForm(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                        Layout Type
                      </label>
                      <select 
                        className="w-full text-xs font-medium border border-outline rounded p-2 focus:ring-1 focus:ring-black outline-none bg-[#f9f9f8]"
                        value={newCardForm.type}
                        onChange={(e) => setNewCardForm(prev => ({ ...prev, type: e.target.value as 'single' | 'compare' }))}
                      >
                        <option value="single">Single Card (Swipe)</option>
                        <option value="compare">Double Compare (AB)</option>
                      </select>
                    </div>
                  </div>

                  {/* Rendering Double Options compare forms nested */}
                  {newCardForm.type === 'compare' && (
                    <div className="p-3 border border-[#cfc4c5] rounded border-dashed space-y-3 bg-stone-50">
                      <span className="block text-[9px] font-bold uppercase tracking-wider font-mono text-slate-500 underline">
                        Double Option Details
                      </span>
                      
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Option A Title</label>
                        <input 
                          type="text"
                          className="w-full text-[11px] border border-outline rounded p-1 bg-white"
                          placeholder="Knowledge Base A"
                          value={newCardForm.optionATitle}
                          onChange={(e) => setNewCardForm(prev => ({ ...prev, optionATitle: e.target.value }))}
                        />
                        <input 
                          type="text"
                          className="w-full text-[10px] border border-outline rounded p-1 bg-white"
                          placeholder="Short description A"
                          value={newCardForm.optionADesc}
                          onChange={(e) => setNewCardForm(prev => ({ ...prev, optionADesc: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Option B Title</label>
                        <input 
                          type="text"
                          className="w-full text-[11px] border border-outline rounded p-1 bg-white"
                          placeholder="Knowledge Base B"
                          value={newCardForm.optionBTitle}
                          onChange={(e) => setNewCardForm(prev => ({ ...prev, optionBTitle: e.target.value }))}
                        />
                        <input 
                          type="text"
                          className="w-full text-[10px] border border-outline rounded p-1 bg-white"
                          placeholder="Short description B"
                          value={newCardForm.optionBDesc}
                          onChange={(e) => setNewCardForm(prev => ({ ...prev, optionBDesc: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Follow-up / Survey Customization settings */}
                  <div className="p-3 border border-slate-200 rounded-xl space-y-3 bg-[#fdfdfc] text-left">
                    <span className="block text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                      💬 Follow-up / Ask Reason Trigger (追问触发机制)
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Trigger Mode (触发模式)</label>
                        <select 
                          className="w-full text-[11px] border border-outline rounded p-1.5 bg-white outline-none"
                          value={newCardForm.followUpMode}
                          onChange={(e) => setNewCardForm(prev => ({ ...prev, followUpMode: e.target.value as any }))}
                        >
                          <option value="default">默认模式 (On Choose/Supervote)</option>
                          <option value="force">强制追问 (Always Ask)</option>
                          <option value="never">绝不追问 (Never Ask)</option>
                          <option value="conditional">迟疑追问 (On Hesitation)</option>
                        </select>
                      </div>

                      {newCardForm.followUpMode === 'conditional' && (
                        <div className="space-y-1 animate-fade-in animate-duration-150">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Hesitation Delay (秒)</label>
                          <div className="flex items-center gap-1">
                            <input 
                              type="number"
                              min="1"
                              max="30"
                              className="w-full text-[11px] border border-outline rounded p-1 text-center font-mono"
                              value={newCardForm.followUpDwellThresholdMs}
                              onChange={(e) => setNewCardForm(prev => ({ ...prev, followUpDwellThresholdMs: Math.max(1, Number(e.target.value)) }))}
                            />
                            <span className="text-[10px] text-slate-400">sec</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-[9.5px] text-slate-400 leading-snug">
                      {newCardForm.followUpMode === 'default' && "Default mode: Prompts reason dynamic survey follow-up on choose/vote."}
                      {newCardForm.followUpMode === 'force' && "Force mode: Always trigger the query regardless of speed or choice."}
                      {newCardForm.followUpMode === 'never' && "Never mode: Move onto the next card immediately to optimize completion time."}
                      {newCardForm.followUpMode === 'conditional' && `Hesitation mode: Prompts ONLY if user stays on screen without decision for longer than ${newCardForm.followUpDwellThresholdMs} seconds.`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      disabled={isSavingConcepts}
                      className="flex-1 py-2 bg-black text-white text-xs font-bold rounded cursor-pointer hover:bg-neutral-800 transition-all flex items-center justify-center gap-1"
                    >
                      {isSavingConcepts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>{editingCardId ? "Save Change" : "Create Card"}</span>
                    </button>
                    {editingCardId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingCardId(null);
                          setNewCardForm({
                            title: "",
                            description: "",
                            category: "General",
                            type: "single",
                            optionATitle: "",
                            optionADesc: "",
                            optionBTitle: "",
                            optionBDesc: "",
                            followUpMode: "default",
                            followUpDwellThresholdMs: 4
                          });
                        }}
                        className="px-3 py-2 border border-black rounded text-xs text-black"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Render listed concepts edit list */}
                <div className="flex-grow overflow-y-auto no-scrollbar space-y-2 max-h-[300px]">
                  <span className="block text-[10px] font-bold font-mono uppercase tracking-widest text-[#7e7576]">
                    Active Concepts Series
                  </span>
                  {conceptsEditList.map(card => (
                    <div key={card.id} className="p-3 border border-outline-variant bg-[#f9f9f8] rounded-xl flex items-center justify-between gap-2">
                      <div className="truncate text-left flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-[#5d5f5f] px-1 bg-[#eeeeed] rounded text-[9px] uppercase">
                            {card.type}
                          </span>
                          <span className="text-xs font-bold text-black truncate">{card.title}</span>
                        </div>
                        <p className="text-[10px] text-secondary truncate">{card.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleTriggerEditMock(card)}
                          className="p-1 text-slate-500 hover:text-black hover:bg-[#eeeeed] rounded"
                          title="Edit Card"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteConcept(card.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Right main columns: Analytics reports */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Statistics Overview Card Cards Row */}
                <div className="grid grid-cols-3 gap-4">
                  
                  {/* Metric 1 */}
                  <div className="bg-white brutalist-border rounded-xl p-4 text-left select-none">
                    <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono mb-1">
                      Total Respondents
                    </span>
                    <div className="font-mono text-3xl font-bold tracking-tight text-black">
                      {analyticsData?.totalRespondents || 0}
                    </div>
                    <span className="text-[10px] text-secondary">
                      Survey interactions recorded
                    </span>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-white brutalist-border rounded-xl p-4 text-left select-none">
                    <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono mb-1">
                      Target Fields Checked
                    </span>
                    <div className="font-mono text-3xl font-bold tracking-tight text-black">
                      {project.targetProfileFields.length + 3}
                    </div>
                    <span className="text-[10px] text-secondary">
                      Attributes auto-compiled
                    </span>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-white brutalist-border rounded-xl p-4 text-left select-none">
                    <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono mb-1">
                      Concept Cards Count
                    </span>
                    <div className="font-mono text-3xl font-bold tracking-tight text-black">
                      {project.concepts.length}
                    </div>
                    <span className="text-[10px] text-secondary">
                      Tested variations
                    </span>
                  </div>

                </div>

                {/* AI generated recommendations & strategic pivot section header */}
                <div className="bg-white brutalist-border rounded-xl p-5 border-l-4 border-l-black select-none">
                  <h3 className="font-sans font-bold text-sm text-black flex items-center gap-1.5 mb-3">
                    <BrainCircuit className="w-5 h-5 text-black stroke-[2.5]" />
                    AI Strategic Recommendations & Target Insights
                  </h3>
                  {isAnalyticsLoading ? (
                    <div className="flex items-center gap-2 py-3 text-xs text-secondary font-mono">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Summarizing respondent signals into strategic suggestions...
                    </div>
                  ) : (
                    <ul className="space-y-3.5 text-left">
                      {analyticsData?.aiInsights && analyticsData.aiInsights.map((insight, idx) => (
                        <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2 bg-[#f9f9f8] p-3 rounded-lg border border-dashed border-[#cfc4c5]">
                          <span className="w-4.5 h-4.5 rounded-full bg-black text-white flex items-center justify-center shrink-0 font-mono text-[9px] font-bold">
                            {idx+1}
                          </span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Core Concept evaluations graphs statistics and lists */}
                <div className="bg-white brutalist-border rounded-xl p-5">
                  <h3 className="font-sans font-bold text-md text-black border-b border-outline-variant pb-3 mb-4 flex items-center gap-1">
                    <Layers className="w-4.5 h-4.5" />
                    Concept Card Slide Performance
                  </h3>

                  {isAnalyticsLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-10 h-10 animate-spin text-black" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {analyticsData?.conceptAnalytics && analyticsData.conceptAnalytics.map((stat, idx) => {
                        const isCompare = stat.type === 'compare';
                        
                        if (isCompare) {
                          const totalCompare = (stat.compareACount || 0) + (stat.compareBCount || 0) + (stat.compareSuperACount || 0) + (stat.compareSuperBCount || 0) || 1;
                          const countA = (stat.compareACount || 0) + (stat.compareSuperACount || 0);
                          const countB = (stat.compareBCount || 0) + (stat.compareSuperBCount || 0);
                          
                          const percentA = Math.round((countA / totalCompare) * 100);
                          const percentB = Math.round((countB / totalCompare) * 100);
                          
                          const scoreA = (stat.compareACount || 0) + ((stat.compareSuperACount || 0) * 2);
                          const scoreB = (stat.compareBCount || 0) + ((stat.compareSuperBCount || 0) * 2);
                          
                          let priorityLabel = "Option A ≈ Option B";
                          let priorityColor = "bg-stone-100 text-stone-700 border-stone-300";
                          if (scoreA > scoreB) {
                            priorityLabel = `Option A > Option B (Priority Rank)`;
                            priorityColor = "bg-emerald-50 text-emerald-700 border-emerald-300";
                          } else if (scoreB > scoreA) {
                            priorityLabel = `Option B > Option A (Priority Rank)`;
                            priorityColor = "bg-blue-50 text-blue-700 border-blue-300";
                          }

                          return (
                            <div key={stat.id} className="pb-5 border-b border-[#eeeeed] last:border-b-0 last:pb-0 text-left">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                <div>
                                  <h4 className="font-sans font-bold text-sm text-black flex items-center gap-2">
                                    <span className="font-mono text-xs text-slate-400">0{idx+1}</span>
                                    {stat.title}
                                    <span className="text-[9px] bg-[#ececeb] text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-tight ml-1">Comparative AB</span>
                                  </h4>
                                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                                    Average dwell: {stat.avgDwellTimeSeconds}s
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${priorityColor}`}>
                                    {priorityLabel}
                                  </span>
                                </div>
                              </div>

                              {/* Comparative Side-by-side preference ratio bar */}
                              <div className="mb-1.5 flex justify-between text-[10px] font-mono font-bold text-slate-600">
                                <span>{stat.optionA?.title || "Option A"}: {percentA}% ({countA} votes)</span>
                                <span>{stat.optionB?.title || "Option B"}: {percentB}% ({countB} votes)</span>
                              </div>
                              
                              <div className="w-full bg-[#eeeeed] h-3.5 rounded-full overflow-hidden flex mb-3 border border-[#dedede]">
                                <div 
                                  style={{ width: `${percentA}%` }} 
                                  className="bg-emerald-500 shrink-0 hover:opacity-90 transition-all flex items-center justify-center text-[7px] text-white font-bold"
                                  title={`Option A preferred: ${countA}`}
                                >
                                  {percentA > 15 && `A (${countA})`}
                                </div>
                                <div 
                                  style={{ width: `${percentB}%` }} 
                                  className="bg-blue-500 shrink-0 hover:opacity-90 transition-all flex items-center justify-center text-[7px] text-white font-bold"
                                  title={`Option B preferred: ${countB}`}
                                >
                                  {percentB > 15 && `B (${countB})`}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-500 mb-3 bg-[#faf9f8] p-2 rounded-lg border border-dashed border-slate-200">
                                <div>
                                  <span className="font-bold block text-slate-700">Option A Stats:</span>
                                  <span>Choice Votes: {stat.compareACount || 0}</span><br />
                                  <span className="text-amber-600">★ Supervotes: {stat.compareSuperACount || 0}</span>
                                </div>
                                <div>
                                  <span className="font-bold block text-slate-700">Option B Stats:</span>
                                  <span>Choice Votes: {stat.compareBCount || 0}</span><br />
                                  <span className="text-amber-600">★ Supervotes: {stat.compareSuperBCount || 0}</span>
                                </div>
                              </div>

                              {/* Verified Reasons tags distributions */}
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#7e7576]">
                                  Verified arguments:
                                </span>
                                {stat.confirmedReasons && stat.confirmedReasons.slice(0, 3).map((r: any, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 border border-[#dfc4c5] bg-[#f9f9f8] text-[9.5px] rounded-full text-secondary">
                                    "{r.reason}" ({r.count})
                                  </span>
                                ))}
                                {(!stat.confirmedReasons || stat.confirmedReasons.length === 0) && (
                                  <span className="text-[9px] italic text-slate-400">None checked yet</span>
                                )}
                              </div>
                            </div>
                          );
                        }

                        // Standard mode
                        const total = stat.likes + stat.passes + stat.supervotes || 1;
                        const likeRatio = Math.round(((stat.likes + stat.supervotes) / total) * 100);
                        const superRatio = Math.round((stat.supervotes / total) * 100);
                        
                        return (
                          <div key={stat.id} className="pb-5 border-b border-[#eeeeed] last:border-b-0 last:pb-0 text-left">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                              <div>
                                <h4 className="font-sans font-bold text-sm text-black flex items-center gap-2">
                                  <span className="font-mono text-xs text-slate-400">0{idx+1}</span>
                                  {stat.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                                  Average dwell: {stat.avgDwellTimeSeconds}s
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-bold text-black bg-[#eeeeed] px-2.5 py-0.5 rounded border border-outline-variant uppercase">
                                  Choice: {likeRatio}% Pos Match
                                </span>
                                <span className="font-mono text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 uppercase">
                                  {superRatio}% Stars
                                </span>
                              </div>
                            </div>

                            {/* visual percentage comparison lines representing metrics */}
                            <div className="w-full bg-[#eeeeed] h-3 rounded-full overflow-hidden flex mb-3">
                              <div 
                                style={{ width: `${(stat.likes / total) * 100}%` }} 
                                className="bg-black shrink-0 hover:opacity-90 transition-opacity"
                                title={`Likes: ${stat.likes}`}
                              />
                              <div 
                                style={{ width: `${(stat.supervotes / total) * 100}%` }} 
                                className="bg-yellow-400 shrink-0 hover:opacity-90 transition-opacity"
                                title={`Supervotes: ${stat.supervotes}`}
                              />
                              <div 
                                style={{ width: `${(stat.passes / total) * 100}%` }} 
                                className="bg-stone-300 shrink-0 hover:opacity-90 transition-opacity"
                                title={`Passes: ${stat.passes}`}
                              />
                            </div>

                            {/* Verified Reasons tags distributions */}
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#7e7576]">
                                Verified reasons:
                              </span>
                              {stat.confirmedReasons && stat.confirmedReasons.slice(0, 3).map((r: any, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 border border-[#dfc4c5] bg-[#f9f9f8] text-[9.5px] rounded-full text-secondary">
                                  "{r.reason}" ({r.count})
                                </span>
                              ))}
                              {(!stat.confirmedReasons || stat.confirmedReasons.length === 0) && (
                                <span className="text-[9px] italic text-slate-400">None checked yet</span>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* Respondents Raw Submission List history logs */}
                <div className="bg-white brutalist-border rounded-xl p-5">
                  <h3 className="font-sans font-bold text-md text-black border-b border-outline-variant pb-3 mb-4 flex items-center gap-1">
                    <FileText className="w-4.5 h-4.5" />
                    Interactive Respondent Submissions history ({analyticsData?.sessions ? analyticsData.sessions.length : 0})
                  </h3>

                  {isAnalyticsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto my-4" />
                  ) : (
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto no-scrollbar">
                      {analyticsData?.sessions && analyticsData.sessions.map((sess) => (
                        <div key={sess.id} className="p-4 bg-[#f9f9f8] border border-outline-variant rounded-xl text-left">
                          
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-dashed border-[#cfc4c5] pb-2 mb-2">
                            <div>
                              <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#5d5f5f] bg-[#e2e2e2] px-2 py-0.5 rounded mr-2 inline-block">
                                {sess.profile.role || "Responder"}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {new Date(sess.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold text-black border border-black rounded px-2 py-0.5 bg-white uppercase tracking-wider">
                              {sess.personalityName || "The Rational Pragmatist"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 leading-relaxed italic mb-2">
                            "{sess.selfDescription}"
                          </p>

                          <div className="flex flex-wrap gap-2 text-[10.5px] mt-1">
                            <span className="font-mono text-slate-400 font-bold uppercase tracking-wide">Attributes:</span>
                            <span className="text-secondary bg-[#eeeeed] px-1.5 rounded">AI usage: {sess.profile.aiUsage}</span>
                            <span className="text-secondary bg-[#eeeeed] px-1.5 rounded">Purchase: {sess.profile.purchaseRole}</span>
                            <span className="text-secondary bg-[#eeeeed] px-1.5 rounded">Market: {sess.profile.market}</span>
                            <span className="text-secondary bg-[#eeeeed] px-1.5 rounded">Size: {sess.profile.companySize}</span>
                          </div>

                        </div>
                      ))}

                      {(!analyticsData?.sessions || analyticsData?.sessions.length === 0) && (
                        <p className="text-center text-xs italic text-slate-400 py-6">No survey submissions yet. Start respondent demo to participate.</p>
                      )}

                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
