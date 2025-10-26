// Verb models and types

export type Tense = 'present' | 'past' | 'future' | 'subjunctive';
export type Pronoun = 'm' | 'i' | 'o' | 'anyi' | 'unu' | 'ha';

export type VerbType = 'regular' | 'irregular';
export type VerbFrequency = 'high' | 'medium' | 'low';
export type VerbDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Conjugations {
  present: Record<Pronoun, string>;
  past: Record<Pronoun, string>;
  future: Record<Pronoun, string>;
  subjunctive: Record<Pronoun, string>;
}

export interface ExamplePair {
  igbo: string;
  english: string;
}

// Base verb shape used throughout the app and from API
export interface IgboVerb {
  id: string;
  infinitive: string;
  meaning: string;
  type: VerbType;
  frequency: VerbFrequency;
  difficulty: VerbDifficulty;
  // Optional morphology hints from DB to support rule-based conjugation
  rootForm?: string;
  prefix?: string;
  suffix?: string;
  // Optional legacy fields to keep compatibility while refactoring
  conjugations?: Conjugations;
  examples?: ExamplePair[];
}
