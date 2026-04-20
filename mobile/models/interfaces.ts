import { Dialect, Pronoun, Tense } from '@/models/verb';

/** All supported tenses, in display order. */
export const tenses: Tense[] = [
  'present',
  'past',
  'future',
  'imperative',
  'subjunctive',
  'presentPerfect',
  'habitualPresent',
  'negativePast',
  'negativeFuture',
  'negativeImperative',
  'negativePerfect',
  'neverPerfect',
  'finished',
  'together',
  'first',
  'forSomeone',
  'polite',
];

/** Human-readable labels for each tense. */
export const tenseLabels: Record<Tense, string> = {
  present: 'Present',
  past: 'Past',
  future: 'Future',
  imperative: 'Imperative',
  subjunctive: 'Subjunctive',
  presentPerfect: 'Present Perfect',
  habitualPresent: 'Habitual Present',
  negativePast: 'Negative Past',
  negativeFuture: 'Negative Future',
  negativeImperative: 'Negative Imperative',
  negativePerfect: 'Negative Perfect',
  neverPerfect: 'Never Perfect',
  finished: 'Finished (-si)',
  together: 'Together (-kota)',
  first: 'First (-gode)',
  forSomeone: 'For Someone (-nye)',
  polite: 'Polite (-nụ́)',
};

/** Tenses available on the free tier. Everything else requires Pro. */
export const freeTierTenses: Tense[] = ['present', 'past', 'future'];

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
