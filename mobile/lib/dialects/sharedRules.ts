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

/** Present stem: vowel-harmony prefix + stripped stem. e.g. "iri" → "eri". */
export function applyPresentRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
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
 * Imperative form per pronoun.
 * 2sg: heavy-vowel-ending stem → +'a'; light-vowel-ending → +'e'; exceptions bare.
 * 1pl: stem + 'nu' ; 2pl: stem + 'enu'; others '—'.
 */
export function applyImperativeRule(root: string, pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
  switch (pronoun) {
    case 'i': {
      if (IMPERATIVE_EXCEPTIONS.has(stem)) return stem;
      const last = lastChar(stem);
      if ('aịọụ'.includes(last)) return stem + 'a';
      return stem + 'e';
    }
    case 'anyi': return stem + 'nu';
    case 'unu':  return stem + 'enu';
    default:     return '—';
  }
}

/** Subjunctive stem: stripped stem + 'e'. */
export function applySubjunctiveRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  return removePrefixI(root) + 'e';
}

/** Habitual present stem: vowel-harmony prefix + stem + '-kari'. */
export function applyHabitualPresentRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
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

/** Negative imperative stem — only 2sg/1pl/2pl carry forms. */
export function applyNegativeImperativeRule(root: string, pronoun: Pronoun): string {
  if (!root) return '';
  if (pronoun !== 'i' && pronoun !== 'unu' && pronoun !== 'anyi') return '—';
  const stem = removePrefixI(root);
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
  return applyImperativeRule(root, pronoun) + 'gode';
}

/**
 * For-someone stem: imperative form + '-nye' (or '-ye' for stems ending
 * in a consonant cluster where 'nye' would double).
 * Only 2sg/1pl/2pl carry forms.
 */
export function applyForSomeoneRule(root: string, pronoun: Pronoun): string {
  if (!root) return '';
  if (pronoun !== 'i' && pronoun !== 'anyi' && pronoun !== 'unu') return '—';
  return applyImperativeRule(root, pronoun) + 'nye';
}

/**
 * Polite intensifier stem: imperative form + '-nụ́'.
 * Only 2sg/1pl/2pl carry forms.
 */
export function applyPoliteRule(root: string, pronoun: Pronoun): string {
  if (!root) return '';
  if (pronoun !== 'i' && pronoun !== 'anyi' && pronoun !== 'unu') return '—';
  return applyImperativeRule(root, pronoun) + 'nụ́';
}

// ---------------------------------------------------------------------------
// Default bundle used by all dialects unless overridden
// ---------------------------------------------------------------------------

export const sharedRules: DialectRules = {
  applyPresentRule,
  applyPastRule,
  applyFutureRule,
  applyImperativeRule,
  applySubjunctiveRule,
  applyHabitualPresentRule,
  applyNegativePastRule,
  applyNegativeFutureRule,
  applyNegativeImperativeRule,
  applyNeverPerfectRule,
  applyFinishedRule,
  applyTogetherRule,
  applyFirstRule,
  applyForSomeoneRule,
  applyPoliteRule,
};
