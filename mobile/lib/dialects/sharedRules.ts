/**
 * @fileoverview Shared morphological rules for Igbo verb conjugation.
 *
 * Most dialects use the same rules — these functions derive tense/aspect
 * stems from a bare verb root. Per-dialect differences (pronoun spellings,
 * particles) live in `DialectSurfaces` instead.
 *
 * Dialects that need to override a specific rule can spread `sharedRules`
 * and replace the affected entries in their profile module.
 */

import { Pronoun } from '@/models/verb';
import { DialectRules } from './types';

// ---------------------------------------------------------------------------
// Morphological helpers
// ---------------------------------------------------------------------------

/** Removes a leading infinitive prefix ('i' or 'ị'). */
function removePrefixI(root: string): string {
  return root.startsWith('i') || root.startsWith('ị') ? root.substring(1) : root;
}

/** Lowercase vowel-harmony prefix ('a' for back/heavy stems, 'e' for front/light). */
function getVowelHarmonyPrefix(stem: string): 'a' | 'e' {
  return /[aọụịỌỤỊ]/.test(stem) ? 'a' : 'e';
}

/** -ná / -né negation suffix selected by vowel harmony. */
function getNegationSuffix(stem: string): 'na' | 'ne' {
  return /[aọụịỌỤỊ]/.test(stem) ? 'na' : 'ne';
}

function lastChar(s: string): string {
  return s.length > 0 ? s[s.length - 1] : '';
}

// ---------------------------------------------------------------------------
// Individual rule functions
// ---------------------------------------------------------------------------

/** True if the stem already opens with a vowel — the harmony prefix is
 *  only applied to consonant-initial stems. */
function startsWithVowel(stem: string): boolean {
  return /^[aeiouọụịAEIOUỌỤỊ]/.test(stem);
}

/** Present stem: vowel-harmony prefix + stripped stem. e.g. "iri" → "eri".
 *  Stems that already start with a vowel skip the prefix. */
export function applyPresentRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
  if (startsWithVowel(stem)) return stem;
  return `${getVowelHarmonyPrefix(stem)}${stem}`;
}

/** Past stem: bare stripped stem. e.g. "iri" → "ri". */
export function applyPastRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  return removePrefixI(root);
}

/** Future stem — same shape as present; the future auxiliary drives the tense. */
export function applyFutureRule(root: string, pronoun: Pronoun): string {
  return applyPresentRule(root, pronoun);
}

/** Verbs whose imperative form doesn't take an appended vowel. */
const IMPERATIVE_EXCEPTIONS = new Set(['bia', 'je', 'nodu']);

/**
 * 2sg imperative surface form, pronoun-free — used by derivational helpers
 * (first/polite) that compose onto the imperative stem.
 */
function buildImperativeForm(root: string): string {
  const stem = removePrefixI(root);
  if (IMPERATIVE_EXCEPTIONS.has(stem)) return stem;
  const last = lastChar(stem);
  if ('aịọụ'.includes(last)) return stem + 'a';
  return stem + 'e';
}

/**
 * Imperative form (Notion: Delta Igbo Tenses: Imperatives).
 *   - Rule 1:   stem ends in a/ị/ọ/ụ → stem + 'a'   (ta → taa, ri → ria)
 *   - Rule 1.2: stem ends in e/i/o/u → stem + 'e'   (me → mee, yi → yie)
 *   - Rule 1.3: exceptions (bia, je, nodu) keep the bare stem.
 * The rule does not distinguish person/number — every pronoun gets the
 * same surface form; the frame prepends the pronoun (e.g. "Anyi mee").
 */
export function applyImperativeRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  return buildImperativeForm(root);
}

/** Habitual present stem: vowel-harmony prefix + stem + '-kari'. */
export function applyHabitualPresentRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
  if (startsWithVowel(stem)) return `${stem}kari`;
  return `${getVowelHarmonyPrefix(stem)}${stem}kari`;
}

/** Negative-past stem: stripped stem + -ná/-né suffix. */
export function applyNegativePastRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
  return stem + getNegationSuffix(stem);
}

/** Negative-future stem: bare stem (no prefix — the "ma" auxiliary drops it). */
export function applyNegativeFutureRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  return removePrefixI(root);
}

/**
 * Negative imperative (Notion: Delta Igbo Tenses: Imperatives, Rule 2).
 * Formula: <verbPrefix> + <stem> + na/ne. The rule does not distinguish
 * person/number — every pronoun gets the same surface form; the frame
 * prepends the pronoun.
 */
export function applyNegativeImperativeRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
  if (startsWithVowel(stem)) return `${stem}${getNegationSuffix(stem)}`;
  return `${getVowelHarmonyPrefix(stem)}${stem}${getNegationSuffix(stem)}`;
}

/** Never-perfect stem: stripped stem + '-nene'. */
export function applyNeverPerfectRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  return removePrefixI(root) + 'nene';
}

// ---------------------------------------------------------------------------
// Derivational suffixes — used by "helper tense" frames in the engine.
// Each returns a root-plus-suffix stem; the engine decides what frame
// (present / future / imperative / perfect) to compose it into.
// ---------------------------------------------------------------------------

/** Finished-action stem: stripped stem + '-si'. */
export function applyFinishedRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  return removePrefixI(root) + 'si';
}

/** Together stem: stripped stem + '-kota'. */
export function applyTogetherRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  return removePrefixI(root) + 'kota';
}

/**
 * First-of-all stem: imperative form + '-gode'.
 * 2sg/1pl/2pl inherit the imperative skeleton; other pronouns return '—'.
 */
export function applyFirstRule(root: string, pronoun: Pronoun): string {
  if (!root) return '';
  if (pronoun !== 'i' && pronoun !== 'anyi' && pronoun !== 'unu') return '—';
  return buildImperativeForm(root) +'gode';
}

/**
 * Polite intensifier stem: imperative form + '-nụ́'.
 * Only 2sg/1pl/2pl carry forms.
 */
export function applyPoliteRule(root: string, pronoun: Pronoun): string {
  if (!root) return '';
  if (pronoun !== 'i' && pronoun !== 'anyi' && pronoun !== 'unu') return '—';
  return buildImperativeForm(root) +'nụ́';
}

// ---------------------------------------------------------------------------
// Default bundle used by all dialects unless overridden
// ---------------------------------------------------------------------------

export const sharedRules: DialectRules = {
  applyPresentRule,
  applyPastRule,
  applyFutureRule,
  applyImperativeRule,
  applyHabitualPresentRule,
  applyNegativePastRule,
  applyNegativeFutureRule,
  applyNegativeImperativeRule,
  applyNeverPerfectRule,
  applyFinishedRule,
  applyTogetherRule,
  applyFirstRule,
  applyPoliteRule,
};
