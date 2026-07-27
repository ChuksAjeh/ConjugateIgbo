/**
 * @fileoverview Rule-based Igbo verb conjugation engine.
 *
 * The engine is split into four layers:
 *  1. **Morphological primitives** — harmony, phrase splitting, affix
 *     attachment. See `lib/dialects/morphology.ts`.
 *  2. **Morphological rules** — per-tense stem builders. See
 *     `lib/dialects/sharedRules.ts` for the default set; individual dialects
 *     may override in their own profile module.
 *  3. **Dialect surfaces** — pronoun spellings and grammatical particles,
 *     defined in `lib/dialects/<dialect>.ts`.
 *  4. **Frame assembly** — this file. Combines rules + surfaces + pronouns
 *     into the final conjugation table.
 *
 * Nothing outside layers 1–2 implements morphology. UI rule explanations are
 * generated from the same profile (see `lib/grammarRules.ts`) so an
 * explanation can never drift from the form it describes.
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
 * 5. Add the tense to `tenses` / `tenseLabels` in `@/models/interfaces` and
 *    a rule card in `lib/grammarRules.ts`.
 */

import * as Sentry from '@sentry/react-native';
import { Conjugations, Dialect, IgboVerb, Pronoun, Tense } from '@/models/verb';
import { getDialectProfile } from '@/lib/dialects';
import {
  attachPrefix,
  attachSuffix,
  harmonyPrefix,
  harmonyPronoun,
  stripInfinitivePrefix,
  toNfc,
} from '@/lib/dialects/morphology';

// Re-export for backward compatibility — prefer importing Dialect from @/models/verb directly.
export type { Dialect };

/**
 * Resolves the conjugation root for a verb.
 *
 * Coerces to a string so a malformed verb (non-string `igbo`/`rootForm`, or
 * no verb at all) can never make the downstream string ops throw.
 *
 * @param verb the verb to read; may be `undefined` or malformed.
 * @returns the trimmed, NFC-normalised citation form, or `''`.
 */
function getRoot(verb: IgboVerb): string {
  const raw = verb?.rootForm || verb?.igbo || '';
  return toNfc(typeof raw === 'string' ? raw : String(raw)).trim();
}

/**
 * Generates the full conjugation table for a verb in the specified dialect.
 *
 * @param verb    the verb to conjugate.
 * @param dialect the dialect whose profile supplies rules and surfaces;
 *                unknown keys fall back to the default dialect.
 * @returns a `Conjugations` table keyed by tense then pronoun.
 */
export function generateConjugations(
  verb: IgboVerb,
  dialect: Dialect = 'delta',
): Conjugations {
  const { rules, surfaces: s } = getDialectProfile(dialect);
  const p = s.particles;

  const root = getRoot(verb);
  const stem = stripInfinitivePrefix(root);
  const vowelPrefix = harmonyPronoun(stem);
  const vowelPrefixLower = harmonyPrefix(stem);

  // Pre-compute reusable stems.
  const presentStem = rules.applyPresentRule(root, 'i');
  const pastStem = rules.applyPastRule(root, 'i');
  const habStem = rules.applyHabitualPresentRule(root, 'i');
  const negPastStem = rules.applyNegativePastRule(root, 'i');
  const negFutureStem = rules.applyNegativeFutureRule(root, 'i');
  const neverStem = rules.applyNeverPerfectRule(root, 'i');
  const dika = p.negativePerfectPrefix;

  // Present-perfect stem. The suffix attaches to the verb head, not the end of
  // a verb phrase (Notion Present Perfect Rule 1.3: "lahu ula" + "ga" →
  // "lahuga ula"), then the harmony prefix goes on the front for plural
  // subjects (Rule 1.4: "Nne m abiaga").
  const perfectedStem = attachPrefix(
    attachSuffix(stem, p.perfectSuffix(stem)),
    vowelPrefixLower,
  );
  // Bare stem with the plural-subject harmony linker, used by the negative
  // perfect ("Anyi adika abia").
  const linkedStem = attachPrefix(stem, vowelPrefixLower);

  /**
   * Places the 1sg `m` clitic directly after the verb head.
   *
   * Notion Past Rule 1 is "A gba m ọsọ" — the clitic sits between the verb
   * and its object, not at the end of the phrase.
   */
  const withMe = (tenseStem: string) => attachSuffix(tenseStem, ' m');

  return {
    present: {
      m:    `${vowelPrefix} ${p.presentLink} m ${presentStem}`,
      i:    `${s.pronouns.i} ${p.presentLink} ${presentStem}`,
      o:    `${s.pronouns.o} ${p.presentLink} ${presentStem}`,
      anyi: `${s.pronouns.anyi} ${p.presentLink} ${presentStem}`,
      unu:  `${s.pronouns.unu} ${p.presentLink} ${presentStem}`,
      wa:   `${s.pronouns.wa} ${p.presentLink} ${presentStem}`,
    },
    past: {
      m:    `${vowelPrefix} ${withMe(pastStem)}`,
      i:    `${s.pronouns.i} ${pastStem}`,
      o:    `${s.pronouns.o} ${pastStem}`,
      anyi: `${s.pronouns.anyi} ${pastStem}`,
      unu:  `${s.pronouns.unu} ${pastStem}`,
      wa:   `${s.pronouns.wa} ${pastStem}`,
    },
    /** Future — 1sg pronoun leads the frame (Notion Future Rule 1:
     *  "m ga-agba ọsọ"). */
    future: {
      m:    `${s.pronouns.m} ${p.futureAux} ${presentStem}`,
      i:    `${s.pronouns.i} ${p.futureAux} ${presentStem}`,
      o:    `${s.pronouns.o} ${p.futureAux} ${presentStem}`,
      anyi: `${s.pronouns.anyi} ${p.futureAux} ${presentStem}`,
      unu:  `${s.pronouns.unu} ${p.futureAux} ${presentStem}`,
      wa:   `${s.pronouns.wa} ${p.futureAux} ${presentStem}`,
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
     * suffix or vowel prefix (Notion Rule 1.2: "Ọ̀ bia", not "Ọ̀ biaga").
     * Plural pronouns and nouns take the full form (Rule 1.4: "Wa abiaga").
     */
    presentPerfect: {
      m:    `${vowelPrefix} ${withMe(pastStem)}`,
      i:    `${s.pronouns.i} ${pastStem}`,
      o:    `${s.pronouns.o} ${pastStem}`,
      anyi: `${s.pronouns.anyi} ${perfectedStem}`,
      unu:  `${s.pronouns.unu} ${perfectedStem}`,
      wa:   `${s.pronouns.wa} ${perfectedStem}`,
    },

    habitualPresent: {
      m:    `${vowelPrefix} ${p.presentLink} m ${habStem}`,
      i:    `${s.pronouns.i} ${p.presentLink} ${habStem}`,
      o:    `${s.pronouns.o} ${p.presentLink} ${habStem}`,
      anyi: `${s.pronouns.anyi} ${p.presentLink} ${habStem}`,
      unu:  `${s.pronouns.unu} ${p.presentLink} ${habStem}`,
      wa:   `${s.pronouns.wa} ${p.presentLink} ${habStem}`,
    },

    /**
     * Negative past — plural pronouns / nouns insert the harmony particle
     * between subject and verb (Notion Rule 5.2: "Anyi eliné"); singular
     * pronouns don't (Rule 5.3: "O liné nni").
     */
    negativePast: {
      m:    `${vowelPrefix} ${withMe(negPastStem)}`,
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
      m:    `${s.pronouns.m} ${p.negativeFutureAux} ${negFutureStem}`,
      i:    `${s.pronouns.i} ${p.negativeFutureAux} ${negFutureStem}`,
      o:    `${s.pronouns.o} ${p.negativeFutureAux} ${negFutureStem}`,
      anyi: `${s.pronouns.anyi} ${p.negativeFutureAux} ${negFutureStem}`,
      unu:  `${s.pronouns.unu} ${p.negativeFutureAux} ${negFutureStem}`,
      wa:   `${s.pronouns.wa} ${p.negativeFutureAux} ${negFutureStem}`,
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
     * Negative perfect — plural subjects conjugate "dika" as well as the verb
     * (Notion Rule 4.2: "Anyi adika abia"); singular pronouns leave "dika"
     * bare (Rule 4.3: "A dika m abia", "O dika ede").
     */
    negativePerfect: {
      m:    `${vowelPrefix} ${dika} m ${linkedStem}`,
      i:    `${s.pronouns.i} ${dika} ${linkedStem}`,
      o:    `${s.pronouns.o} ${dika} ${linkedStem}`,
      anyi: `${s.pronouns.anyi} ${vowelPrefixLower}${dika} ${linkedStem}`,
      unu:  `${s.pronouns.unu} ${vowelPrefixLower}${dika} ${linkedStem}`,
      wa:   `${s.pronouns.wa} ${vowelPrefixLower}${dika} ${linkedStem}`,
    },

    /**
     * Never-perfect — the '-nene' suffix by itself does not require a
     * verb-prefix linker on plural subjects (unlike negative past). The
     * linker only appears when '-nene' is composed with a tense that
     * calls for it. Keep the same bare shape for singular and plural.
     */
    neverPerfect: {
      m:    `${vowelPrefix} ${withMe(neverStem)}`,
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
     * subjects take the perfective suffix; singular pronouns use the bare
     * derived stem (mirrors presentPerfect).
     */
    finished: (() => {
      const finishedStem = rules.applyFinishedRule(root, 'i');
      const finishedPerfect = attachPrefix(
        attachSuffix(finishedStem, p.perfectSuffix(finishedStem)),
        vowelPrefixLower,
      );
      return {
        m:    `${vowelPrefix} ${withMe(finishedStem)}`,
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
      const togetherFrame = `${p.futureAux} ${attachPrefix(togetherStem, vowelPrefixLower)}`;
      return {
        m:    `${s.pronouns.m} ${togetherFrame}`,
        i:    `${s.pronouns.i} ${togetherFrame}`,
        o:    `${s.pronouns.o} ${togetherFrame}`,
        anyi: `${s.pronouns.anyi} ${togetherFrame}`,
        unu:  `${s.pronouns.unu} ${togetherFrame}`,
        wa:   `${s.pronouns.wa} ${togetherFrame}`,
      };
    })(),

    /** First ('-gode', Notion Rule 8) — imperative frame; only 2sg/1pl/2pl
     *  carry forms. */
    first: buildImperativeFrame(root, s.pronouns, rules.applyFirstRule),

    /** Polite intensifier ('-nụ́', Notion Rule 6 "please") — imperative
     *  frame; only 2sg/1pl/2pl carry forms. */
    polite: buildImperativeFrame(root, s.pronouns, rules.applyPoliteRule),

    /** Benefactive ('-ye', Notion Rule 9 "do it for me") — imperative
     *  frame; only 2sg/1pl/2pl carry forms. */
    benefactive: buildImperativeFrame(root, s.pronouns, rules.applyBenefactiveRule),
  };
}

/** Placeholder emitted by rules for pronoun cells they do not license. */
const NO_FORM = '—';

/**
 * Builds an imperative-style frame for a derivational rule that only licenses
 * some pronouns.
 *
 * Licensed cells get `<pronoun> <form>`; unlicensed cells stay as the
 * placeholder so the UI renders an em dash rather than a bare pronoun.
 *
 * @param root     the verb's citation form.
 * @param pronouns the active dialect's pronoun spellings.
 * @param rule     the derivational rule to apply per pronoun.
 */
function buildImperativeFrame(
  root: string,
  pronouns: Record<Pronoun, string>,
  rule: (root: string, pronoun: Pronoun) => string,
): Record<Pronoun, string> {
  const cell = (pronoun: Pronoun): string => {
    const form = rule(root, pronoun);
    if (!form || form === NO_FORM) return NO_FORM;
    return `${pronouns[pronoun]} ${form}`;
  };
  return {
    m: cell('m'),
    i: cell('i'),
    o: cell('o'),
    anyi: cell('anyi'),
    unu: cell('unu'),
    wa: cell('wa'),
  };
}

/**
 * Returns the conjugated form for a specific tense and pronoun.
 *
 * Prefers pre-computed conjugations on the verb object (legacy data), then
 * falls back to the rule-based engine.
 *
 * @param verb    the verb to conjugate.
 * @param tense   the tense to read.
 * @param pronoun the pronoun to read.
 * @param dialect the active dialect.
 * @returns the conjugated string, or `''` if the tense/pronoun has no form.
 */
export function getConjugatedForm(
  verb: IgboVerb,
  tense: Tense,
  pronoun: Pronoun,
  dialect: Dialect = 'delta',
): string {
  try {
    const precomputed = verb.conjugations?.[tense]?.[pronoun];
    // Treat '-' and '—' as "missing" placeholders in legacy data so the engine
    // can fill them in. An empty string is also not usable.
    if (precomputed && precomputed !== '-' && precomputed !== NO_FORM) {
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

    return conj[tense]![pronoun] ?? '';
  } catch (error) {
    // The practice screen calls this during render — never let a malformed verb
    // or unexpected tense/pronoun take down the screen.
    Sentry.captureException(error, {
      tags: { feature: 'conjugation' },
      extra: { verbId: verb?.id, tense, pronoun, dialect },
    });
    return '';
  }
}

/**
 * Normalizes and compares a user's answer to the correct conjugation.
 *
 * Case-insensitive; tolerates extra/collapsed whitespace and mixed Unicode
 * normalisation forms (a keyboard-composed `ị` must match a Notion-sourced one).
 *
 * @param userAnswer    what the learner typed.
 * @param correctAnswer the expected form.
 * @returns `true` when the two match after normalisation.
 */
export function checkConjugation(
  userAnswer: string,
  correctAnswer: string,
): boolean {
  const normalize = (value: string) =>
    toNfc(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  return normalize(userAnswer) === normalize(correctAnswer);
}
