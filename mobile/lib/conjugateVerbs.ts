/**
 * @fileoverview Rule-based Igbo verb conjugation engine.
 *
 * The engine is split into three layers:
 *  1. **Morphological rules** — per-tense stem builders. See
 *     `lib/dialects/sharedRules.ts` for the default set; individual dialects
 *     may override in their own profile module.
 *  2. **Dialect surfaces** — pronoun spellings and grammatical particles,
 *     defined in `lib/dialects/<dialect>.ts`.
 *  3. **Frame assembly** — this file. Combines rules + surfaces + pronouns
 *     into the final conjugation table.
 *
 * ## Adding a new dialect
 * 1. Add the dialect key to the `Dialect` union in `@/models/verb`.
 * 2. Create a new profile module in `lib/dialects/<dialect>.ts`.
 * 3. Register it in `lib/dialects/index.ts` (`dialectProfiles`).
 *
 * ## Adding a new tense
 * 1. Add the tense key to the `Tense` union in `@/models/verb`.
 * 2. Add an optional field to `Conjugations` in `@/models/verb`.
 * 3. Add an `apply<TenseName>Rule` entry to `DialectRules`
 *    (`lib/dialects/types.ts`) and implement it in `sharedRules.ts`.
 * 4. Add the frame block in `generateConjugations()` below.
 * 5. Add the tense to `tenses` / `tenseLabels` in `@/models/interfaces`.
 */

import * as Sentry from '@sentry/react-native';
import { Conjugations, Dialect, IgboVerb, Pronoun, Tense } from '@/models/verb';
import { dialectProfiles } from '@/lib/dialects';

// Re-export for backward compatibility — prefer importing Dialect from @/models/verb directly.
export type { Dialect };

// ---------------------------------------------------------------------------
// Local helpers (frame-assembly only; morphology lives in sharedRules)
// ---------------------------------------------------------------------------

/** Resolves the conjugation root for a verb. */
function getRoot(verb: IgboVerb): string {
  return (verb.rootForm || verb.igbo || '').trim();
}

/** Removes a leading infinitive prefix ('i' or 'ị') — duplicated here for
 *  the 1sg harmony pronoun calculation; shared with `sharedRules`. */
function removePrefixI(root: string): string {
  return root.startsWith('i') || root.startsWith('ị') ? root.substring(1) : root;
}

/** Uppercase harmony pronoun ('A' / 'E') used in 1sg frames. */
function getVowelHarmonyPronoun(stem: string): 'A' | 'E' {
  return /[aọụịỌỤỊ]/.test(stem) ? 'A' : 'E';
}

/** Lowercase harmony particle ('a' / 'e') used as the subject-verb linker
 *  in negation/perfect frames. */
function getVowelHarmonyPrefix(stem: string): 'a' | 'e' {
  return /[aọụịỌỤỊ]/.test(stem) ? 'a' : 'e';
}

/** True when the stem already opens with a vowel — in that case the
 *  harmony prefix is not prepended to the bare stem. */
function stemStartsWithVowel(stem: string): boolean {
  return /^[aeiouọụịAEIOUỌỤỊ]/.test(stem);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates the full conjugation table for a verb in the specified dialect.
 */
export function generateConjugations(
  verb: IgboVerb,
  dialect: Dialect = 'delta',
): Conjugations {
  const profile = dialectProfiles[dialect] ?? dialectProfiles.delta;
  const { rules, surfaces: s } = profile;

  const root = getRoot(verb);
  const stem = removePrefixI(root);
  const vowelPrefix = getVowelHarmonyPronoun(stem);
  const vowelPrefixLower = getVowelHarmonyPrefix(stem);

  // Pre-compute reusable stems.
  const presentStem = rules.applyPresentRule(root, 'i');
  const pastStem = rules.applyPastRule(root, 'i');
  const perfectiveSuffix = s.particles.perfectSuffix;
  const stemLinker = stemStartsWithVowel(stem) ? '' : vowelPrefixLower;
  const perfectedStem = `${stemLinker}${stem}${perfectiveSuffix}`;
  const habStem = rules.applyHabitualPresentRule(root, 'i');
  const negPastStem = rules.applyNegativePastRule(root, 'i');
  const negFutureStem = rules.applyNegativeFutureRule(root, 'i');
  const neverStem = rules.applyNeverPerfectRule(root, 'i');
  const dika = s.particles.negativePerfectPrefix;

  return {
    present: {
      m:    `${vowelPrefix} ${s.particles.presentLink} m ${presentStem}`,
      i:    `${s.pronouns.i} ${s.particles.presentLink} ${presentStem}`,
      o:    `${s.pronouns.o} ${s.particles.presentLink} ${presentStem}`,
      anyi: `${s.pronouns.anyi} ${s.particles.presentLink} ${presentStem}`,
      unu:  `${s.pronouns.unu} ${s.particles.presentLink} ${presentStem}`,
      wa:   `${s.pronouns.wa} ${s.particles.presentLink} ${presentStem}`,
    },
    past: {
      m:    `${vowelPrefix} ${pastStem} m`,
      i:    `${s.pronouns.i} ${pastStem}`,
      o:    `${s.pronouns.o} ${pastStem}`,
      anyi: `${s.pronouns.anyi} ${pastStem}`,
      unu:  `${s.pronouns.unu} ${pastStem}`,
      wa:   `${s.pronouns.wa} ${pastStem}`,
    },
    future: {
      m:    `${s.pronouns.m} ${s.particles.futureAux} ${presentStem}`,
      i:    `${s.pronouns.i} ${s.particles.futureAux} ${presentStem}`,
      o:    `${s.pronouns.o} ${s.particles.futureAux} ${presentStem}`,
      anyi: `${s.pronouns.anyi} ${s.particles.futureAux} ${presentStem}`,
      unu:  `${s.pronouns.unu} ${s.particles.futureAux} ${presentStem}`,
      wa:   `${s.pronouns.wa} ${s.particles.futureAux} ${presentStem}`,
    },
    imperative: (() => {
      const impForm = rules.applyImperativeRule(root, 'i');
      return {
        m:    `${s.pronouns.m} ${impForm}`,
        i:    `${s.pronouns.i} ${impForm}`,
        o:    `${s.pronouns.o} ${impForm}`,
        anyi: `${s.pronouns.anyi} ${impForm}`,
        unu:  `${s.pronouns.unu} ${impForm}`,
        wa:   `${s.pronouns.wa} ${impForm}`,
      };
    })(),

    /**
     * Present perfect — singular pronouns (m/i/o) don't carry the perfective
     * suffix or vowel prefix (per Delta Igbo rule "Ọ̀ bia", not "Ọ̀ biaga").
     * Plural pronouns and nouns take the full `<harmony><stem><suffix>` form.
     */
    presentPerfect: {
      m:    `${vowelPrefix} ${pastStem} m`,
      i:    `${s.pronouns.i} ${pastStem}`,
      o:    `${s.pronouns.o} ${pastStem}`,
      anyi: `${s.pronouns.anyi} ${perfectedStem}`,
      unu:  `${s.pronouns.unu} ${perfectedStem}`,
      wa:   `${s.pronouns.wa} ${perfectedStem}`,
    },

    habitualPresent: {
      m:    `${vowelPrefix} ${s.particles.presentLink} m ${habStem}`,
      i:    `${s.pronouns.i} ${s.particles.presentLink} ${habStem}`,
      o:    `${s.pronouns.o} ${s.particles.presentLink} ${habStem}`,
      anyi: `${s.pronouns.anyi} ${s.particles.presentLink} ${habStem}`,
      unu:  `${s.pronouns.unu} ${s.particles.presentLink} ${habStem}`,
      wa:   `${s.pronouns.wa} ${s.particles.presentLink} ${habStem}`,
    },

    /**
     * Negative past — plural pronouns / nouns insert the harmony particle
     * between subject and verb ("Anyi e liné"); singular pronouns don't.
     */
    negativePast: {
      m:    `${vowelPrefix} ${negPastStem} m`,
      i:    `${s.pronouns.i} ${negPastStem}`,
      o:    `${s.pronouns.o} ${negPastStem}`,
      anyi: `${s.pronouns.anyi} ${vowelPrefixLower} ${negPastStem}`,
      unu:  `${s.pronouns.unu} ${vowelPrefixLower} ${negPastStem}`,
      wa:   `${s.pronouns.wa} ${vowelPrefixLower} ${negPastStem}`,
    },

    /** Negative future — "ma" replaces "ga", verb keeps no prefix. 1sg
     *  keeps the bare 'm' pronoun at the front (Notion Future Rule 2:
     *  "m ma gba ọsọ"). */
    negativeFuture: {
      m:    `${s.pronouns.m} ${s.particles.negativeFutureAux} ${negFutureStem}`,
      i:    `${s.pronouns.i} ${s.particles.negativeFutureAux} ${negFutureStem}`,
      o:    `${s.pronouns.o} ${s.particles.negativeFutureAux} ${negFutureStem}`,
      anyi: `${s.pronouns.anyi} ${s.particles.negativeFutureAux} ${negFutureStem}`,
      unu:  `${s.pronouns.unu} ${s.particles.negativeFutureAux} ${negFutureStem}`,
      wa:   `${s.pronouns.wa} ${s.particles.negativeFutureAux} ${negFutureStem}`,
    },

    /** Negative imperative — same surface form for every pronoun; the
     *  frame prepends the pronoun (e.g. "Anyi ekwune"). */
    negativeImperative: (() => {
      const negImpForm = rules.applyNegativeImperativeRule(root, 'i');
      return {
        m:    `${s.pronouns.m} ${negImpForm}`,
        i:    `${s.pronouns.i} ${negImpForm}`,
        o:    `${s.pronouns.o} ${negImpForm}`,
        anyi: `${s.pronouns.anyi} ${negImpForm}`,
        unu:  `${s.pronouns.unu} ${negImpForm}`,
        wa:   `${s.pronouns.wa} ${negImpForm}`,
      };
    })(),

    /**
     * Negative perfect — plural subjects conjugate "dika" (gets a harmony
     * prefix); singular pronouns do not.
     */
    negativePerfect: {
      m:    `${vowelPrefix} ${dika} m ${stemLinker}${stem}`,
      i:    `${s.pronouns.i} ${dika} ${stemLinker}${stem}`,
      o:    `${s.pronouns.o} ${dika} ${stemLinker}${stem}`,
      anyi: `${s.pronouns.anyi} ${vowelPrefixLower}${dika} ${stemLinker}${stem}`,
      unu:  `${s.pronouns.unu} ${vowelPrefixLower}${dika} ${stemLinker}${stem}`,
      wa:   `${s.pronouns.wa} ${vowelPrefixLower}${dika} ${stemLinker}${stem}`,
    },

    /**
     * Never-perfect — the '-nene' suffix by itself does not require a
     * verb-prefix linker on plural subjects (unlike negative past). The
     * linker only appears when '-nene' is composed with a tense that
     * calls for it. Keep the same bare shape for singular and plural.
     */
    neverPerfect: {
      m:    `${vowelPrefix} ${neverStem} m`,
      i:    `${s.pronouns.i} ${neverStem}`,
      o:    `${s.pronouns.o} ${neverStem}`,
      anyi: `${s.pronouns.anyi} ${neverStem}`,
      unu:  `${s.pronouns.unu} ${neverStem}`,
      wa:   `${s.pronouns.wa} ${neverStem}`,
    },

    // -----------------------------------------------------------------------
    // Derivational helper tenses — suffixes that compose with a base tense.
    // -----------------------------------------------------------------------

    /**
     * Finished ('-si', Notion Rule 2.3) — present-perfect frame. Plural
     * subjects take the '-ga' perfective suffix; singular pronouns use
     * the bare derived stem (mirrors presentPerfect).
     */
    finished: (() => {
      const finishedStem = rules.applyFinishedRule(root, 'i');
      const finishedPerfect = `${stemLinker}${finishedStem}${perfectiveSuffix}`;
      return {
        m:    `${vowelPrefix} ${finishedStem} m`,
        i:    `${s.pronouns.i} ${finishedStem}`,
        o:    `${s.pronouns.o} ${finishedStem}`,
        anyi: `${s.pronouns.anyi} ${finishedPerfect}`,
        unu:  `${s.pronouns.unu} ${finishedPerfect}`,
        wa:   `${s.pronouns.wa} ${finishedPerfect}`,
      };
    })(),

    /**
     * Together ('-kota', Notion Rule 6) — future frame per the Notion
     * example "Anyi ga-ebikota ebeni".
     */
    together: (() => {
      const togetherStem = rules.applyTogetherRule(root, 'i');
      const togetherFrame = `${s.particles.futureAux} ${stemLinker}${togetherStem}`;
      return {
        m:    `${s.pronouns.m} ${togetherFrame}`,
        i:    `${s.pronouns.i} ${togetherFrame}`,
        o:    `${s.pronouns.o} ${togetherFrame}`,
        anyi: `${s.pronouns.anyi} ${togetherFrame}`,
        unu:  `${s.pronouns.unu} ${togetherFrame}`,
        wa:   `${s.pronouns.wa} ${togetherFrame}`,
      };
    })(),

    /**
     * First ('-gode', Notion Rule 8) — imperative frame; only 2sg/1pl/2pl
     * carry forms.
     */
    first: {
      m:    rules.applyFirstRule(root, 'm'),
      i:    rules.applyFirstRule(root, 'i'),
      o:    rules.applyFirstRule(root, 'o'),
      anyi: rules.applyFirstRule(root, 'anyi'),
      unu:  rules.applyFirstRule(root, 'unu'),
      wa:   rules.applyFirstRule(root, 'wa'),
    },

    /**
     * For-someone ('-nye/ye', Notion Rule 9) — imperative frame.
     */
    forSomeone: {
      m:    rules.applyForSomeoneRule(root, 'm'),
      i:    rules.applyForSomeoneRule(root, 'i'),
      o:    rules.applyForSomeoneRule(root, 'o'),
      anyi: rules.applyForSomeoneRule(root, 'anyi'),
      unu:  rules.applyForSomeoneRule(root, 'unu'),
      wa:   rules.applyForSomeoneRule(root, 'wa'),
    },

    /**
     * Polite intensifier ('-nụ́', Notion Rule 6 "please") — imperative frame.
     */
    polite: {
      m:    rules.applyPoliteRule(root, 'm'),
      i:    rules.applyPoliteRule(root, 'i'),
      o:    rules.applyPoliteRule(root, 'o'),
      anyi: rules.applyPoliteRule(root, 'anyi'),
      unu:  rules.applyPoliteRule(root, 'unu'),
      wa:   rules.applyPoliteRule(root, 'wa'),
    },
  };
}

/**
 * Returns the conjugated form for a specific tense and pronoun.
 * Prefers pre-computed conjugations on the verb object (legacy data), then
 * falls back to the rule-based engine.
 */
export function getConjugatedForm(
  verb: IgboVerb,
  tense: Tense,
  pronoun: Pronoun,
  dialect: Dialect = 'delta',
): string {
  const precomputed = verb.conjugations?.[tense]?.[pronoun];
  // Treat '-' and '—' as "missing" placeholders in legacy data so the engine
  // can fill them in. An empty string is also not usable.
  if (precomputed && precomputed !== '-' && precomputed !== '—') {
    return precomputed;
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
 * Case-insensitive; tolerates extra/collapsed whitespace.
 */
export function checkConjugation(
  userAnswer: string,
  correctAnswer: string,
): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalize(userAnswer) === normalize(correctAnswer);
}
