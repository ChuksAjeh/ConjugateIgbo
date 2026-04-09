/**
 * @fileoverview Rule-based Igbo verb conjugation engine.
 *
 * Conjugation is driven by two layers:
 *  1. **Morphological rules** — derive tense/aspect stems from a verb root.
 *  2. **Dialect surfaces** — pronoun spellings, linking particles, and auxiliaries
 *     that differ across the five supported regional varieties.
 *
 * ## Adding a new dialect
 * 1. Add the dialect key to the `Dialect` union in `@/models/verb`.
 * 2. Add a `case '<dialect>':` block in `getDialectSurfaces()` returning the
 *    appropriate pronoun overrides and particles.
 * 3. If the dialect has morphologically distinct forms, add a matching block in
 *    `getDialectRules()` and extend `DialectRules` accordingly.
 *
 * ## Adding a new tense
 * 1. Add the tense key to the `Tense` union in `@/models/verb`.
 * 2. Add an optional field to `Conjugations` in `@/models/verb`.
 * 3. Implement an `apply<TenseName>Rule(root, pronoun)` function below.
 * 4. Register it in the `DialectRules` interface and `getDialectRules()`.
 * 5. Add a conjugation block for the tense inside `generateConjugations()`.
 * 6. Add the tense to `tenses` and `tenseLabels` in `@/models/interfaces`.
 */

import * as Sentry from '@sentry/react-native';
import { Conjugations, Dialect, IgboVerb, Pronoun, Tense } from '@/models/verb';

// Re-export for backward compatibility — prefer importing Dialect from @/models/verb directly.
export type { Dialect };

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** The full set of morphological rule functions for a dialect. */
interface DialectRules {
  applyPresentRule: (root: string, pronoun: Pronoun) => string;
  applyPastRule: (root: string, pronoun: Pronoun) => string;
  applyFutureRule: (root: string, pronoun: Pronoun) => string;
  applyImperativeRule: (root: string, pronoun: Pronoun) => string;
  applyImperfectRule: (root: string, pronoun: Pronoun) => string;
  applyConditionalRule: (root: string, pronoun: Pronoun) => string;
  applySubjunctiveRule: (root: string, pronoun: Pronoun) => string;
}

/** Surface forms (pronouns and grammatical particles) for a dialect. */
interface DialectSurfaces {
  pronouns: Record<Pronoun, string>;
  particles: {
    /** Linking particle used in present/imperfect frames, e.g. "na". */
    presentLink: string;
    /** Future auxiliary particle, e.g. "ga". */
    futureAux: string;
  };
}

// ---------------------------------------------------------------------------
// Shared morphological helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the conjugation root for a verb.
 * Prefers `rootForm` when supplied (explicit morphology hint from the data
 * layer) and falls back to the `igbo` field (the infinitive).
 */
function getRoot(verb: IgboVerb): string {
  return (verb.rootForm || verb.igbo || '').trim();
}

/**
 * Removes a leading infinitive prefix ('i' or 'ị') from a verb root.
 * e.g. "iri" → "ri", "ịgụ" → "gụ", "kwu" → "kwu" (unchanged).
 */
function removePrefixI(root: string): string {
  return root.startsWith('i') || root.startsWith('ị') ? root.substring(1) : root;
}

/**
 * Returns the uppercase vowel-harmony marker ('A' or 'E') for use in
 * first-person singular present/past frames.
 *
 * Rule: returns 'A' when the stem contains 'a' or any back vowel (ọ, ụ, ị);
 * returns 'E' otherwise (front-vowel stems).
 */
function getVowelHarmonyPronoun(stem: string): 'A' | 'E' {
  return /[aọụịỌỤỊ]/.test(stem) ? 'A' : 'E';
}

/**
 * Returns the lowercase vowel-harmony prefix ('a' or 'e') applied to the
 * verb stem in the present and related tenses.
 *
 * Rule: mirrors `getVowelHarmonyPronoun` but returns lowercase.
 */
function getVowelHarmonyPrefix(stem: string): 'a' | 'e' {
  return /[aọụịỌỤỊ]/.test(stem) ? 'a' : 'e';
}

// ---------------------------------------------------------------------------
// Morphological rules (shared across dialects unless overridden)
// ---------------------------------------------------------------------------

/**
 * Builds the present-tense verb stem: vowel-harmony prefix + stripped stem.
 * e.g. "iri" → stem "ri" → prefix "e" → "eri".
 */
function applyPresentRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
  const prefix = getVowelHarmonyPrefix(stem);
  return `${prefix}${stem}`;
}

/**
 * Builds the past-tense verb stem: the bare stripped stem with no prefix.
 * e.g. "iri" → "ri".
 */
function applyPastRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  return removePrefixI(root);
}

/**
 * Future-tense verb stem — delegates to the present rule because the same
 * stem form is used; the future auxiliary particle differentiates the tense
 * at the surface level.
 */
function applyFutureRule(root: string, pronoun: Pronoun): string {
  return applyPresentRule(root, pronoun);
}

/**
 * Builds the imperative form for a given grammatical person.
 *
 * In Igbo the imperative is only expressed in second-person frames:
 *  - 2sg  (i):    stem + 'e'   — e.g. "rie!"  (eat!)
 *  - 1pl  (anyi): stem + 'nu'  — inclusive "let us…"
 *  - 2pl  (unu):  stem + 'enu' — e.g. "rienu!" (y'all eat!)
 *  - all others: '—'           — not applicable
 */
function applyImperativeRule(root: string, pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
  switch (pronoun) {
    case 'i':    return stem + 'e';
    case 'anyi': return stem + 'nu';
    case 'unu':  return stem + 'enu';
    default:     return '—';
  }
}

/**
 * Builds the imperfect (habitual/continuous past) stem.
 *
 * TODO: Implement full imperfect morphology. Igbo marks habitual past with
 * distinct aspect suffixes that vary by verb class. This currently falls back
 * to the present stem as a placeholder.
 */
function applyImperfectRule(root: string, pronoun: Pronoun): string {
  return applyPresentRule(root, pronoun);
}

/**
 * Builds the conditional stem.
 *
 * TODO: Implement full conditional morphology. Igbo conditional constructions
 * typically use a modal particle + stem and may vary significantly by dialect.
 * This currently falls back to the future stem as a placeholder.
 */
function applyConditionalRule(root: string, pronoun: Pronoun): string {
  return applyFutureRule(root, pronoun);
}

/**
 * Builds the subjunctive stem: stripped stem + 'e' suffix.
 * e.g. "iri" → stem "ri" → "rie".
 */
function applySubjunctiveRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);
  return stem + 'e';
}

// ---------------------------------------------------------------------------
// Dialect configuration
// ---------------------------------------------------------------------------

/**
 * Returns the morphological rule set for a dialect.
 *
 * Most dialects share the same rules and differ only in surface forms
 * (see `getDialectSurfaces`). Add per-dialect overrides here when a dialect
 * requires different stem-formation rules.
 */
function getDialectRules(_dialect: Dialect): DialectRules {
  return {
    applyPresentRule,
    applyPastRule,
    applyFutureRule,
    applyImperativeRule,
    applyImperfectRule,
    applyConditionalRule,
    applySubjunctiveRule,
  };
}

/**
 * Returns the surface forms (pronoun spellings and grammatical particles) for
 * a dialect.
 *
 * Key differences:
 *  - **Delta Igbo**: reduced diacritics; 3pl = "Wa".
 *  - **Central / Anambra / Imo / Abia**: full diacritics; 3pl = "Ha".
 *
 * Note: the 1sg pronoun ('m') in the `pronouns` map is only used in the future
 * frame ("M ga …"). Present/past 1sg uses the vowel-harmony marker computed
 * inline by `getVowelHarmonyPronoun`, not this value.
 */
function getDialectSurfaces(dialect: Dialect): DialectSurfaces {
  // Central/literary base: full diacritics, "Ha" for 3pl
  const centralBase: DialectSurfaces = {
    pronouns: {
      m: 'M',
      i: 'Ị',
      o: 'Ọ',
      anyi: 'Anyị',
      unu: 'Ụnụ',
      wa: 'Ha',
    },
    particles: { presentLink: 'na', futureAux: 'ga' },
  };

  // Delta base: reduced diacritics, "Wa" for 3pl
  const deltaBase: DialectSurfaces = {
    pronouns: {
      m: 'M',
      i: 'I',
      o: 'O',
      anyi: 'Anyi',
      unu: 'Unu',
      wa: 'Wa',
    },
    particles: { presentLink: 'na', futureAux: 'ga' },
  };

  switch (dialect) {
    case 'central':
      return centralBase;
    case 'anambra':
      // Anambra closely mirrors Central Igbo
      return { ...centralBase };
    case 'imo':
      // Imo closely mirrors Central Igbo
      return { ...centralBase };
    case 'abia':
      // Abia closely mirrors Central Igbo
      return { ...centralBase };
    case 'delta':
    default:
      return deltaBase;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates the full conjugation table for a verb in the specified dialect.
 *
 * The returned `Conjugations` object contains an entry for every supported
 * tense. Tenses whose rules are not yet fully implemented (imperfect,
 * conditional) fall back gracefully and are marked with TODO comments in
 * their respective rule functions.
 *
 * @param verb    - The verb to conjugate.
 * @param dialect - The target dialect (defaults to 'delta').
 * @returns       A complete `Conjugations` map.
 */
export function generateConjugations(
  verb: IgboVerb,
  dialect: Dialect = 'delta',
): Conjugations {
  const root = getRoot(verb);
  const stem = removePrefixI(root);
  const vowelPrefix = getVowelHarmonyPronoun(stem);
  const rules = getDialectRules(dialect);
  const s = getDialectSurfaces(dialect);

  return {
    present: {
      m:    `${vowelPrefix} ${s.particles.presentLink} m ${rules.applyPresentRule(root, 'm')}`,
      i:    `${s.pronouns.i} ${s.particles.presentLink} ${rules.applyPresentRule(root, 'i')}`,
      o:    `${s.pronouns.o} ${s.particles.presentLink} ${rules.applyPresentRule(root, 'o')}`,
      anyi: `${s.pronouns.anyi} ${s.particles.presentLink} ${rules.applyPresentRule(root, 'anyi')}`,
      unu:  `${s.pronouns.unu} ${s.particles.presentLink} ${rules.applyPresentRule(root, 'unu')}`,
      wa:   `${s.pronouns.wa} ${s.particles.presentLink} ${rules.applyPresentRule(root, 'wa')}`,
    },
    past: {
      m:    `${vowelPrefix} ${rules.applyPastRule(root, 'm')} m`,
      i:    `${s.pronouns.i} ${rules.applyPastRule(root, 'i')}`,
      o:    `${s.pronouns.o} ${rules.applyPastRule(root, 'o')}`,
      anyi: `${s.pronouns.anyi} ${rules.applyPastRule(root, 'anyi')}`,
      unu:  `${s.pronouns.unu} ${rules.applyPastRule(root, 'unu')}`,
      wa:   `${s.pronouns.wa} ${rules.applyPastRule(root, 'wa')}`,
    },
    future: {
      m:    `${s.pronouns.m} ${s.particles.futureAux} ${rules.applyFutureRule(root, 'm')}`,
      i:    `${s.pronouns.i} ${s.particles.futureAux} ${rules.applyFutureRule(root, 'i')}`,
      o:    `${s.pronouns.o} ${s.particles.futureAux} ${rules.applyFutureRule(root, 'o')}`,
      anyi: `${s.pronouns.anyi} ${s.particles.futureAux} ${rules.applyFutureRule(root, 'anyi')}`,
      unu:  `${s.pronouns.unu} ${s.particles.futureAux} ${rules.applyFutureRule(root, 'unu')}`,
      wa:   `${s.pronouns.wa} ${s.particles.futureAux} ${rules.applyFutureRule(root, 'wa')}`,
    },
    // Imperative uses bare verb forms — no subject pronoun in the sentence.
    imperative: {
      m:    rules.applyImperativeRule(root, 'm'),
      i:    rules.applyImperativeRule(root, 'i'),
      o:    rules.applyImperativeRule(root, 'o'),
      anyi: rules.applyImperativeRule(root, 'anyi'),
      unu:  rules.applyImperativeRule(root, 'unu'),
      wa:   rules.applyImperativeRule(root, 'wa'),
    },
    imperfect: {
      m:    `${vowelPrefix} ${s.particles.presentLink} m ${rules.applyImperfectRule(root, 'm')}`,
      i:    `${s.pronouns.i} ${s.particles.presentLink} ${rules.applyImperfectRule(root, 'i')}`,
      o:    `${s.pronouns.o} ${s.particles.presentLink} ${rules.applyImperfectRule(root, 'o')}`,
      anyi: `${s.pronouns.anyi} ${s.particles.presentLink} ${rules.applyImperfectRule(root, 'anyi')}`,
      unu:  `${s.pronouns.unu} ${s.particles.presentLink} ${rules.applyImperfectRule(root, 'unu')}`,
      wa:   `${s.pronouns.wa} ${s.particles.presentLink} ${rules.applyImperfectRule(root, 'wa')}`,
    },
    conditional: {
      m:    `${s.pronouns.m} ${s.particles.futureAux} ${rules.applyConditionalRule(root, 'm')}`,
      i:    `${s.pronouns.i} ${s.particles.futureAux} ${rules.applyConditionalRule(root, 'i')}`,
      o:    `${s.pronouns.o} ${s.particles.futureAux} ${rules.applyConditionalRule(root, 'o')}`,
      anyi: `${s.pronouns.anyi} ${s.particles.futureAux} ${rules.applyConditionalRule(root, 'anyi')}`,
      unu:  `${s.pronouns.unu} ${s.particles.futureAux} ${rules.applyConditionalRule(root, 'unu')}`,
      wa:   `${s.pronouns.wa} ${s.particles.futureAux} ${rules.applyConditionalRule(root, 'wa')}`,
    },
    subjunctive: {
      m:    `${vowelPrefix} ${rules.applySubjunctiveRule(root, 'm')} m`,
      i:    `${s.pronouns.i} ${rules.applySubjunctiveRule(root, 'i')}`,
      o:    `${s.pronouns.o} ${rules.applySubjunctiveRule(root, 'o')}`,
      anyi: `${s.pronouns.anyi} ${rules.applySubjunctiveRule(root, 'anyi')}`,
      unu:  `${s.pronouns.unu} ${rules.applySubjunctiveRule(root, 'unu')}`,
      wa:   `${s.pronouns.wa} ${rules.applySubjunctiveRule(root, 'wa')}`,
    },
  };
}

/**
 * Returns the conjugated form for a specific tense and pronoun.
 *
 * Prefers pre-computed conjugations stored on the verb object (legacy data
 * compatibility), and falls back to the rule-based engine for all other cases.
 *
 * @param verb    - The verb to conjugate.
 * @param tense   - The desired tense.
 * @param pronoun - The desired pronoun.
 * @param dialect - The target dialect (defaults to 'delta').
 * @returns The conjugated string, or an empty string if the tense is not yet
 *          implemented.
 */
export function getConjugatedForm(
  verb: IgboVerb,
  tense: Tense,
  pronoun: Pronoun,
  dialect: Dialect = 'delta',
): string {
  // Prefer pre-computed conjugations if present (legacy data)
  if (
    verb.conjugations &&
    verb.conjugations[tense] &&
    verb.conjugations[tense]![pronoun]
  ) {
    return verb.conjugations[tense]![pronoun];
  }

  const conj = generateConjugations(verb, dialect);

  if (!conj[tense]) {
    Sentry.logger.warn(
      `[conjugateVerbs] Tense "${tense}" not yet implemented for verb: ${verb.igbo}`,
      {
        tags: { feature: 'conjugation' },
        extra: { verbId: verb.id, igbo: verb.igbo, tense },
      },
    );
    return '';
  }

  return conj[tense]![pronoun];
}

/**
 * Normalizes and compares a user's answer to the correct conjugation.
 *
 * Comparison is case-insensitive and tolerates extra/collapsed whitespace.
 *
 * @param userAnswer    - The string typed by the learner.
 * @param correctAnswer - The expected conjugated form.
 * @returns `true` if the answers match after normalization.
 */
export function checkConjugation(
  userAnswer: string,
  correctAnswer: string,
): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalize(userAnswer) === normalize(correctAnswer);
}
