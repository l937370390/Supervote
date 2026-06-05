export interface ConceptCard {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'single' | 'compare';
  icon?: string;
  optionA?: {
    title: string;
    description: string;
    icon?: string;
  };
  optionB?: {
    title: string;
    description: string;
    icon?: string;
  };
  followUpMode?: 'default' | 'force' | 'never' | 'conditional';
  followUpDwellThresholdMs?: number;
}

export interface ProfileField {
  id: string;
  label: string;
  value: string;
  isMissing: boolean;
  options?: string[]; // for multi-choice backfills
}

export interface FeedbackSignal {
  conceptId: string;
  choice: 'like' | 'pass' | 'supervote' | 'compare_A' | 'compare_B' | 'compare_superA' | 'compare_superB';
  dwellTimeMs: number;
  confirmedReasons: string[];
  swipeSpeed?: number;
  timestamp: number;
}

export interface RespondentSession {
  id: string;
  selfDescription: string;
  profile: {
    role: string;
    aiUsage: string;
    purchaseRole: string;
    market: string;
    companySize: string;
  };
  signals: FeedbackSignal[];
  personalityName?: string;
  personalityDesc?: string;
  createdAt: string;
}

export interface SurveyProject {
  id: string;
  name: string;
  description: string;
  concepts: ConceptCard[];
  targetProfileFields: string[]; // e.g. ["market", "companySize"]
}
