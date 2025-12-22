// Verb models and types

// Backend-aligned DTO coming from the API
export interface VerbDTO {
  id: number; // Java long
  igbo: string;
  english: string;
  freqRank?: number | null;
}

export type Tense =
  | 'present'
  | 'past'
  | 'future'
  | 'subjunctive'
  | 'conditional'
  | 'imperative'
  | 'imperfect';
export type Pronoun = 'm' | 'i' | 'o' | 'anyi' | 'unu' | 'wa';

export type VerbType = 'regular' | 'irregular';
export type VerbFrequency = 'high' | 'medium' | 'low';
export type VerbDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Conjugations {
  present: Record<Pronoun, string>;
  past: Record<Pronoun, string>;
  future: Record<Pronoun, string>;
  subjunctive?: Record<Pronoun, string>;
  conditional?: Record<Pronoun, string>;
  imperative?: Record<Pronoun, string>;
  imperfect?: Record<Pronoun, string>;
}

export interface ExamplePair {
  igbo: string;
  english: string;
}

// App/domain verb shape used throughout the UI.
// Core fields align with backend DTO; additional fields are optional for UI/engine support.
export interface AppVerb {
  id: string; // mapped from backend numeric id to string for stable UI keys
  igbo: string;
  english: string;
  freqRank?: number | null;
  // Optional UI-only metadata (not provided by backend)
  type?: VerbType;
  difficulty?: VerbDifficulty;
  // Optional legacy frequency label for seed/backward-compat
  frequency?: VerbFrequency;
  // Optional morphology hints from DB to support rule-based conjugation
  rootForm?: string;
  prefix?: string;
  suffix?: string;
  // Optional legacy fields to keep compatibility while refactoring
  conjugations?: Conjugations;
  examples?: ExamplePair[];
  // Legacy properties for backward compatibility (to be removed later)
  infinitive?: string;
  meaning?: string;
}

// Backward-compatible alias for existing code
export type IgboVerb = AppVerb;
