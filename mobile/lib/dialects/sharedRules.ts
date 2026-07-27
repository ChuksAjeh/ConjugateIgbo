/**
 * @fileoverview Shared morphological rules for Igbo verb conjugation.
 *
 * Each rule derives a tense/aspect **stem** from a verb's citation form; the
 * engine (`lib/conjugateVerbs.ts`) decides which frame to compose that stem
 * into. Per-dialect differences in pronoun spellings and particles live in
 * `DialectSurfaces` rather than here.
 *
 * All primitives (harmony, phrase splitting, affix attachment) come from
 * `./morphology` so there is a single implementation of each.
 *
 * Dialects that need to override a specific rule spread `sharedRules` and
 * replace the affected entries in their profile module.
 *
 * Every rule is cross-referenced to the Notion grammar reference in its
 * doc comment. When Notion changes, change the rule here — nothing else in
 * the app re-implements morphology.
 */

import { Pronoun } from '@/models/verb';
import { DialectRules } from './types';
import {
  attachPrefix,
  attachSuffix,
  buildImperativeForm,
  harmonyPrefix,
  negativeImperativeSuffix,
  negativePastSuffix,
  stripInfinitivePrefix,
} from './morphology';

/**
 * Pronouns that carry a form for the imperative-derived helper suffixes
 * (`-gode`, `-nụ́`). Those suffixes are requests, so only 2sg, 1pl (hortative)
 * and 2pl are meaningful.
 */
const IMPERATIVE_PRONOUNS: ReadonlySet<Pronoun> = new Set<Pronoun>([
  'i',
  'anyi',
  'unu',
]);

/** Placeholder shown for pronoun cells a rule does not license. */
const NO_FORM = '—';

// ---------------------------------------------------------------------------
// Core tense rules
// ---------------------------------------------------------------------------

/**
 * Present / present-continuous stem (Notion: Present Continuous Rule 1,
 * `na + <verbPrefix(a/e)> + verb`). The `na` particle is added by the frame.
 *
 * @example applyPresentRule('irị') // 'arị'  → "I na arị"
 * @example applyPresentRule('igba ọsọ') // 'agba ọsọ'
 */
export function applyPresentRule(root: string, _pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  return attachPrefix(stem, harmonyPrefix(stem));
}

/**
 * Past stem (Notion: Past Tense Rule 1, `pronoun + root verb`) — the bare
 * stem, no affixes.
 *
 * @example applyPastRule('igba ọsọ') // 'gba ọsọ' → "A gba m ọsọ"
 */
export function applyPastRule(root: string, _pronoun: Pronoun): string {
  return stripInfinitivePrefix(root);
}

/**
 * Future stem (Notion: Future Rule 1, `ga + <verbPrefix(a/e)> + verb`) —
 * identical to the present stem; the `ga` auxiliary carries the tense.
 */
export function applyFutureRule(root: string, pronoun: Pronoun): string {
  return applyPresentRule(root, pronoun);
}

/**
 * Imperative form (Notion: Imperatives Rules 1, 1.2, 1.3).
 *
 * The rule does not distinguish person or number — every pronoun gets the
 * same surface form and the frame prepends the pronoun ("Anyi mee").
 *
 * @example applyImperativeRule('irị') // 'rịa'
 * @example applyImperativeRule('ibia') // 'bia' (exception)
 */
export function applyImperativeRule(root: string, _pronoun: Pronoun): string {
  return buildImperativeForm(stripInfinitivePrefix(root));
}

/**
 * Habitual-present stem (Notion: Suffixes Rule 1, `-kari/keli/kali` on the
 * present-continuous frame — `na-abia` + `kari` → `na-abiakari`).
 *
 * @example applyHabitualPresentRule('ibia') // 'abiakari'
 */
export function applyHabitualPresentRule(root: string, _pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  return attachSuffix(attachPrefix(stem, harmonyPrefix(stem)), 'kari');
}

// ---------------------------------------------------------------------------
// Negation rules
// ---------------------------------------------------------------------------

/**
 * Negative-past stem (Notion: Suffixes Rule 5, `-ná/né` — "Nneoma e liné").
 * The harmony linker for plural subjects is added by the frame.
 *
 * @example applyNegativePastRule('ili') // 'liné'
 */
export function applyNegativePastRule(root: string, _pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  return attachSuffix(stem, negativePastSuffix(stem));
}

/**
 * Negative-future stem (Notion: Future Rule 2 — switch `ga` → `ma` and drop
 * the verb prefix, "m ma gba ọsọ"). Bare stem; the frame supplies `ma`.
 */
export function applyNegativeFutureRule(root: string, _pronoun: Pronoun): string {
  return stripInfinitivePrefix(root);
}

/**
 * Negative imperative (Notion: Imperatives Rule 2,
 * `<verbPrefix> + <verb> + na/ne` — `kwu` → `ekwune`).
 *
 * Note the suffix is unaccented here, unlike the negative past.
 */
export function applyNegativeImperativeRule(root: string, _pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  const negated = attachSuffix(stem, negativeImperativeSuffix(stem));
  return attachPrefix(negated, harmonyPrefix(stem));
}

/**
 * Never-perfect stem (Notion: Suffixes Rule 7, `-nene` — `tu` + `nene` +
 * `ujo` → `tunene ujo`).
 *
 * @example applyNeverPerfectRule('itu ujo') // 'tunene ujo'
 */
export function applyNeverPerfectRule(root: string, _pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  return attachSuffix(stem, 'nene');
}

// ---------------------------------------------------------------------------
// Derivational suffixes — "helper tense" frames in the engine.
// Each returns a stem; the engine chooses the frame to compose it into.
// ---------------------------------------------------------------------------

/**
 * Finished-action stem (Notion: Suffixes Rule 2, `-si` — `gụ` + `si` →
 * `gụsi`, "finish reading"). A **root** suffix, used with any tense frame.
 */
export function applyFinishedRule(root: string, _pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  return attachSuffix(stem, 'si');
}

/**
 * Together stem (Notion: Suffixes Rule 6, `-kota` — `bi` + `kota` →
 * `bikota`, "Anyi ga-ebikota ebeni").
 */
export function applyTogetherRule(root: string, _pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  return attachSuffix(stem, 'kota');
}

/**
 * First-of-all stem (Notion: Suffixes Rule 8, `-gode`).
 *
 * Notion calls this a **root** verb suffix — `bia` + `gode` → `biagode` —
 * so it attaches to the bare stem, not to the imperative form with its added
 * vowel. Only 2sg / 1pl / 2pl carry a form.
 */
export function applyFirstRule(root: string, pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  if (!IMPERATIVE_PRONOUNS.has(pronoun)) return NO_FORM;
  return attachSuffix(stem, 'gode');
}

/**
 * Polite-intensifier stem (Notion: Suffixes Rule 6, `-nụ́` — `nye` + `nụ́` →
 * `nyenụ́`, "please give").
 *
 * Like `-gode`, Notion's worked example attaches it to the bare root rather
 * than the vowel-extended imperative. Only 2sg / 1pl / 2pl carry a form.
 */
export function applyPoliteRule(root: string, pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  if (!IMPERATIVE_PRONOUNS.has(pronoun)) return NO_FORM;
  return attachSuffix(stem, 'nụ́');
}

/**
 * Benefactive stem (Notion: Suffixes Rule 9, `-nye/ye` — `si` + `ye` →
 * `siye`, "cook for me"): asking someone to do the action *for* you or
 * someone else. Imperative frame, so only 2sg / 1pl / 2pl carry a form.
 */
export function applyBenefactiveRule(root: string, pronoun: Pronoun): string {
  const stem = stripInfinitivePrefix(root);
  if (!stem) return '';
  if (!IMPERATIVE_PRONOUNS.has(pronoun)) return NO_FORM;
  return attachSuffix(stem, 'ye');
}

// NOTE: Notion Suffixes Rule 10 (`-bù`, "used to / before") is currently an
// empty heading with no worked example, so it is deliberately not implemented.
// Add `applyUsedToRule` here — and a `usedTo` tense — once the rule is
// written up.

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
  applyBenefactiveRule,
};
