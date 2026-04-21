/**
 * @fileoverview Per-dialect configuration types for the conjugation engine.
 *
 * A `DialectProfile` bundles everything that varies across dialects:
 *  - `rules`: morphological functions that derive stems from a root
 *  - `surfaces`: pronoun spellings and grammatical particles
 *
 * Most dialects share the same rule set and differ only in surfaces. The
 * `sharedRules` export in `./sharedRules.ts` is the default rule bundle;
 * dialects may spread it and override individual entries as needed.
 */

import { Pronoun } from '@/models/verb';

export type RuleFn = (root: string, pronoun: Pronoun) => string;

/** Full set of morphological rules needed to build the conjugation table. */
export interface DialectRules {
  applyPresentRule: RuleFn;
  applyPastRule: RuleFn;
  applyFutureRule: RuleFn;
  applyImperativeRule: RuleFn;
  applyHabitualPresentRule: RuleFn;
  applyNegativePastRule: RuleFn;
  applyNegativeFutureRule: RuleFn;
  applyNegativeImperativeRule: RuleFn;
  applyNeverPerfectRule: RuleFn;
  // Derivational suffixes — used by "helper tense" frames in the engine.
  applyFinishedRule: RuleFn;
  applyTogetherRule: RuleFn;
  applyFirstRule: RuleFn;
  applyPoliteRule: RuleFn;
}

/** Surface forms (pronouns & grammatical particles) for a dialect. */
export interface DialectSurfaces {
  pronouns: Record<Pronoun, string>;
  particles: {
    /** Linking particle used in present/imperfect frames, e.g. "na". */
    presentLink: string;
    /** Future auxiliary particle, e.g. "ga". */
    futureAux: string;
    /** Negative future auxiliary, e.g. "ma". */
    negativeFutureAux: string;
    /** Negative perfect prefix particle, e.g. "dị́ká" / "dika". */
    negativePerfectPrefix: string;
    /** Present-perfect suffix. */
    perfectSuffix: 'ga' | 'ge' | 'go';
  };
}

/** Bundle of everything the engine needs for one dialect. */
export interface DialectProfile {
  rules: DialectRules;
  surfaces: DialectSurfaces;
}
