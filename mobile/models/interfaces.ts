import { Dialect, Pronoun, Tense } from '@/models/verb';

/** All supported tenses, in display order. */
export const tenses: Tense[] = [
  'present',
  'past',
  'future',
  'imperative',
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

/** Igbo particle + English gloss shown alongside each tense header so the
 *  user can see which word the frame hangs off. Empty string = no annotation. */
export const tenseAnnotations: Record<Tense, string> = {
  present: 'na (does / is doing)',
  past: '',
  future: 'ga (will)',
  imperative: '(do!)',
  presentPerfect: '-ga (has / have done)',
  habitualPresent: '-kari (usually)',
  negativePast: '-ná / -né (did not)',
  negativeFuture: 'ma (will not)',
  negativeImperative: '-na / -ne (do not)',
  negativePerfect: 'dika (have not / has not)',
  neverPerfect: '-nene (has never)',
  finished: '-si (finished)',
  together: '-kota (together)',
  first: '-gode (first of all)',
  forSomeone: '-nye (for someone)',
  polite: '-nụ́ (please)',
};

/** Tenses available on the free tier. Everything else requires Pro. */
export const freeTierTenses: Tense[] = ['present', 'past', 'future'];

/** All supported pronouns, in display order. */
export const pronouns: Pronoun[] = ['m', 'i', 'o', 'anyi', 'unu', 'wa'];

/** Human-readable labels for each pronoun. Tuned for Delta Igbo (the only
 *  currently-active dialect). When additional dialects ship, consider moving
 *  these into each dialect profile. */
export const pronounLabels: Record<Pronoun, string> = {
  m: 'A/E… m (I)',
  i: 'I (You)',
  o: 'O (He/She/It)',
  anyi: 'Anyi (We)',
  unu: 'Unu (You all)',
  wa: 'Wa (They)',
};

/** Human-readable labels for each dialect. */
export const dialectLabels: Record<Dialect, string> = {
  central: 'Central Igbo',
  delta: 'Delta Igbo',
  anambra: 'Anambra Igbo',
  imo: 'Imo Igbo',
  abia: 'Abia Igbo',
};
