import { Pronoun, Tense } from '@/models/verb';

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
  'polite',
  'benefactive',
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
  polite: 'Polite (-nụ́)',
  benefactive: 'Benefactive (-ye)',
};

/** Tenses available on the free tier. Everything else requires Pro. */
export const freeTierTenses: Tense[] = ['present', 'past', 'future'];

/** All supported pronouns, in display order. */
export const pronouns: Pronoun[] = ['m', 'i', 'o', 'anyi', 'unu', 'wa'];

/**
 * Dialect-dependent labels live in `lib/grammarRules.ts`
 * (`getPronounLabels`, `getTenseAnnotations`) and the dialect registry
 * (`lib/dialects` — `dialectProfileList`), so that pronoun spellings,
 * particle annotations and the dialect picker all follow the active dialect
 * rather than being hardcoded to Delta.
 */
