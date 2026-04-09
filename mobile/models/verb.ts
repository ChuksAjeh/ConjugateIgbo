// Verb models and types

// Backend-aligned DTO coming from the API
export interface VerbDTO {
  id: number; // Java long
  igbo: string;
  english: string;
  freqRank?: number | null;
}

/** The five supported regional varieties of Igbo. */
export type Dialect = 'central' | 'delta' | 'anambra' | 'imo' | 'abia';

export type Tense =
  | 'present'
  | 'past'
  | 'future'
  | 'imperative'
  | 'imperfect'
  | 'conditional'
  | 'subjunctive';
export type Pronoun = 'm' | 'i' | 'o' | 'anyi' | 'unu' | 'wa';

export type VerbType = 'regular' | 'irregular';
export type VerbFrequency = 'high' | 'medium' | 'low';
export type VerbDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * A complete conjugation table for a verb.
 *
 * `present`, `past`, and `future` are always present (engine always generates them).
 * The remaining tenses are optional so that legacy pre-computed/stored verb objects
 * (which pre-date those tense implementations) remain valid without migration.
 */
export interface Conjugations {
  present: Record<Pronoun, string>;
  past: Record<Pronoun, string>;
  future: Record<Pronoun, string>;
  /** Imperative — only 2sg, 1pl (inclusive), and 2pl slots produce actual forms; others return '—'. */
  imperative?: Record<Pronoun, string>;
  /** Imperfect (habitual/continuous past) — rules are a work-in-progress; see conjugateVerbs.ts. */
  imperfect?: Record<Pronoun, string>;
  /** Conditional — rules are a work-in-progress; see conjugateVerbs.ts. */
  conditional?: Record<Pronoun, string>;
  /** Subjunctive. */
  subjunctive?: Record<Pronoun, string>;
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
