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
  // Perfective / aspect
  | 'presentPerfect'
  | 'habitualPresent'
  // Negation frames
  | 'negativePast'
  | 'negativeFuture'
  | 'negativeImperative'
  | 'negativePerfect'
  | 'neverPerfect'
  // Derivational/modal suffixes shown as standalone helper tenses.
  // These are pronoun-composed in their most natural frame (see the
  // engine for details): `finished` uses the present-perfect frame,
  // `together` uses future, and `first` / `polite` use imperative.
  | 'finished'
  | 'together'
  | 'first'
  | 'polite';
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
  /** Imperative — uniform form across pronouns; frame prepends the pronoun. */
  imperative?: Record<Pronoun, string>;
  /** Present perfect ("has/have done") — suffix -ga/ge/go. */
  presentPerfect?: Record<Pronoun, string>;
  /** Habitual present ("usually does") — suffix -kari on the present frame. */
  habitualPresent?: Record<Pronoun, string>;
  /** Negative past ("did not") — suffix -ná/né. */
  negativePast?: Record<Pronoun, string>;
  /** Negative future ("will not") — "ma" auxiliary replaces "ga", drops verb prefix. */
  negativeFuture?: Record<Pronoun, string>;
  /** Negative imperative ("don't") — suffix -ná/né with vowel-harmony prefix. */
  negativeImperative?: Record<Pronoun, string>;
  /** Negative perfect ("has not/have not") — prefix dị́ká before the verb. */
  negativePerfect?: Record<Pronoun, string>;
  /** Never-perfect ("has never") — suffix -nene. */
  neverPerfect?: Record<Pronoun, string>;
  /** Finished action ("has finished X") — suffix -si, present-perfect frame. */
  finished?: Record<Pronoun, string>;
  /** Together ("will do X together") — suffix -kota, future frame. */
  together?: Record<Pronoun, string>;
  /** First ("do X first") — suffix -gode, imperative frame. */
  first?: Record<Pronoun, string>;
  /** Polite ("please do X") — suffix -nụ́, imperative frame. */
  polite?: Record<Pronoun, string>;
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
