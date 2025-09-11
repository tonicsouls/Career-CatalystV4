

export enum AssetType {
  InsightReport = 'INSIGHT_REPORT',
  LinkedInOverhaul = 'LINKEDIN_OVERHAUL',
  PersonalDoctrine = 'PERSONAL_DOCTRINE',
  CvResume = 'CV_RESUME',
}

export interface GeneratedAsset {
  type: AssetType;
  title: string;
  content: string | null;
}

export interface TimelineEvent {
  id: number;
  title: string;
  date: string;
  description: string;
  company?: string;
  isNew?: boolean;
}

export enum PhaseStatus {
  Locked = 'LOCKED',
  Active = 'ACTIVE',
  Complete = 'COMPLETE',
}

export interface Phase {
  id: string;
  name: string;
  status: PhaseStatus;
  section: string;
  step: number;
  timeEstimate?: string;
}

export interface ProjectDetails {
    category: string;
    who: string[];
    what: string[];
    where: string;
    when: string;
    outcome: string;
}

export interface BrainDumpStory {
    id: number;
    text: string;
    audioRecording: string | null; // Base64 encoded audio
    isPlaceholder?: boolean;
    prompt?: string;
    projectDetails?: ProjectDetails;
}

export interface BrainDumpModule {
    id: string; // Corresponds to TimelineEvent id
    title: string;
    date: string;
    stories: BrainDumpStory[];
}

export interface GeneratedResumeData {
    contactInfo: {
        name: string;
        location: string;
        phone: string;
        email: string;
        linkedin: string;
    };
    executiveSummaries: string[];
    coreCompetencies: Array<{
        id: string;
        title: string;
        categories: Array<{
            category: string;
            details: string;
        }>;
    }>;
    experience: Array<{
        title: string;
        company: string;
        location: string;
        dates: string;
        achievements: string[];
    }>;
    education: Array<{
        degree: string;
        institution: string;
        dates?: string;
    }>;
    careerProjections: Array<{
        role: string;
        reason: string;
    }>;
}

export interface SavedResumeVersion {
    id: string;
    name: string;
    jobDescription: string;
    resumeData: GeneratedResumeData;
    createdAt: string;
}

export type LinkedInContentType = 'headline' | 'summary';

export interface SavedLinkedInContent {
    id: string;
    type: LinkedInContentType;
    content: string | string[];
    createdAt: string;
}

export interface InsightReportData {
    careerFocus: string;
    executiveSummary:string;
    kpis: Array<{
        title: string;
        value: string;
        explanation: string;
    }>;
    coreStrengths: string[];
}

export interface InterviewFeedback {
    clarity: string;
    impact: string;
    starMethodAdherence: string;
    overallSuggestion: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ActiveApp = 'dashboard' | 'catalyst' | 'linkedin' | 'headshot' | 'linkedin_banner' | 'asset_hub' | 'elevator_pitch' | 'welcome';

export interface HistoryState {
  activeApp: ActiveApp;
  phases: Phase[];
}

export interface ResumeSection {
  title: string;
  company: string;
  location: string;
  dates: string;
  achievements: string[];
}

export interface EducationSection {
    degree: string;
    institution: string;
    dates?: string;
}

export interface InitialAnalysisResult {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  summary: string;
  keySkills: string[];
  experience: ResumeSection[];
  education: EducationSection[];
  matchAnalysis?: {
    matchSummary: string;
    matchingKeywords: string[];
    missingKeywords: string[];
  };
}

export interface CategorizedSkills {
    category: string;
    skills: string[];
}

export interface JobPreset {
    id: string;
    name: string;
    jobDescription: string;
    initialAnalysis: InitialAnalysisResult | null;
    createdAt: string;
}

export interface HeadshotPresetSettings {
    style: string;
    businessCategory: string;
    lighting: string;
    setting: string;
    reasoning: string;
}