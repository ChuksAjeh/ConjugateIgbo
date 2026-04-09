import { Dialect, Pronoun, Tense } from '@/models/verb';

/** All supported tenses, in display order. */
export const tenses: Tense[] = [
  'present',
  'past',
  'future',
  'imperative',
  'imperfect',
  'conditional',
  'subjunctive',
];

/** Human-readable labels for each tense. */
export const tenseLabels: Record<Tense, string> = {
  present: 'Present',
  past: 'Past',
  future: 'Future',
  imperative: 'Imperative',
  imperfect: 'Imperfect',
  conditional: 'Conditional',
  subjunctive: 'Subjunctive',
};

/** All supported pronouns, in display order. */
export const pronouns: Pronoun[] = ['m', 'i', 'o', 'anyi', 'unu', 'wa'];

/** Human-readable labels for each pronoun (dialect-agnostic). */
export const pronounLabels: Record<Pronoun, string> = {
  m: 'A/E… m (I)',
  i: 'Ị/I (You)',
  o: 'Ọ/O (He/She/It)',
  anyi: 'Anyị/Anyi (We)',
  unu: 'Ụnụ/Unu (You all)',
  wa: 'Wa/Ha (They)',
};

/** Human-readable labels for each dialect. */
export const dialectLabels: Record<Dialect, string> = {
  central: 'Central Igbo',
  delta: 'Delta Igbo',
  anambra: 'Anambra Igbo',
  imo: 'Imo Igbo',
  abia: 'Abia Igbo',
};
