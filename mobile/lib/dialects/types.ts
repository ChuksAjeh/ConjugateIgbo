/**
 * @fileoverview Per-dialect configuration types for the conjugation engine.
 *
 * A `DialectProfile` bundles everything that varies across dialects:
 *  - `rules`: morphological functions that derive stems from a root
 *  - `surfaces`: pronoun spellings and grammatical particles
 *  - presentation metadata (`label`, `description`, `supported`) so the
 *    Settings dialect picker is driven by this registry rather than a
 *    hardcoded list in a screen
 *
 * Most dialects share the same rule set and differ only in surfaces. The
 * `sharedRules` export in `./sharedRules.ts` is the default rule bundle;
 * dialects may spread it and override individual entries as needed.
 */

import { Dialect, Pronoun } from '@/models/verb';

/** Derives a tense/aspect stem from a verb's citation form. */
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
  /** Notion Suffixes Rule 9, `-nye/ye` — do the action for someone. */
  applyBenefactiveRule: RuleFn;
}

/**
 * Selects the present-perfect suffix for a given stem.
 *
 * Notion (Present Perfect Rule 1, Suffixes Rule 3) documents the suffix as
 * `-ga/ge/go` but its worked examples do not agree on a harmony rule
 * (`bia` → `biaga` and `nu` → `nuga`, yet `gụsi` → `gụsigè`). Until the
 * conditioning environment is confirmed with a speaker, Delta returns a
 * constant `ga`. This hook exists so the real rule lands in one place —
 * a dialect profile — without touching the engine or any screen.
 *
 * @param stem the bare stem (infinitive prefix already removed).
 */
export type PerfectSuffixFn = (stem: string) => string;

/** Surface forms (pronouns & grammatical particles) for a dialect. */
export interface DialectSurfaces {
  /** Pronoun spellings, e.g. Delta `wa` vs Central `Ha`. */
  pronouns: Record<Pronoun, string>;
  /**
   * Optional display overrides for the pronoun picker, used where the plain
   * spelling would be misleading — e.g. Delta's 1sg surfaces as a discontinuous
   * `A/E … m` frame rather than a standalone `M`.
   */
  pronounDisplay?: Partial<Record<Pronoun, string>>;
  particles: {
    /** Linking particle used in present/imperfect frames, e.g. "na". */
    presentLink: string;
    /** Future auxiliary particle, e.g. "ga". */
    futureAux: string;
    /** Negative future auxiliary, e.g. "ma". */
    negativeFutureAux: string;
    /** Negative perfect prefix particle, e.g. "dị́ká" / "dika". */
    negativePerfectPrefix: string;
    /** Habitual-present suffix, e.g. "kari" / "keli" / "kali". */
    habitualSuffix: string;
    /** Never-perfect suffix, e.g. "nene". */
    neverSuffix: string;
    /** Finished-action suffix, e.g. "si". */
    finishedSuffix: string;
    /** Together suffix, e.g. "kota". */
    togetherSuffix: string;
    /** First-of-all suffix, e.g. "gode". */
    firstSuffix: string;
    /** Politeness intensifier, e.g. "nụ́". */
    politeSuffix: string;
    /** Benefactive suffix ("for me/you"), e.g. "ye". */
    benefactiveSuffix: string;
    /** Present-perfect suffix selector — see {@link PerfectSuffixFn}. */
    perfectSuffix: PerfectSuffixFn;
  };
}

/** Bundle of everything the engine and UI need for one dialect. */
export interface DialectProfile {
  /** Stable key, matching the `Dialect` union. */
  key: Dialect;
  /** Human-readable name shown in Settings. */
  label: string;
  /** Short note shown under the label (e.g. "COMING SOON"). */
  description: string;
  /**
   * Whether the dialect has verified grammar data and may be selected.
   * Unsupported dialects are listed but disabled in the picker.
   */
  supported: boolean;
  rules: DialectRules;
  surfaces: DialectSurfaces;
}
