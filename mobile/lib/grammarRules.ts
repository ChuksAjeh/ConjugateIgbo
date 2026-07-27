/**
 * @fileoverview Presentation layer for the grammar rules — labels, particle
 * annotations, and the worked "how this form is built" explanation shown on
 * each tense card in the verb-detail screen.
 *
 * Everything here is **derived from the active dialect profile and the shared
 * morphology helpers**, never re-implemented. Before this module existed the
 * verb-detail screen carried its own copy of the harmony, phrase-splitting and
 * suffix logic, which drifted from the engine and shipped explanations that
 * did not match the form printed directly above them.
 *
 * The rule of thumb: if a string names a particle or shows a stem, it is built
 * from `DialectSurfaces` + `morphology`, so switching dialect changes the
 * explanation as well as the output.
 */

import { Dialect, IgboVerb, Pronoun, Tense } from '@/models/verb';
import { getDialectProfile } from '@/lib/dialects';
import {
  IMPERATIVE_EXCEPTIONS,
  attachPrefix,
  attachSuffix,
  buildImperativeForm,
  harmonyPrefix,
  negativeImperativeSuffix,
  negativePastSuffix,
  splitVerbPhrase,
  stripInfinitivePrefix,
  toNfc,
} from '@/lib/dialects/morphology';

/** A worked example for one tense, rendered as a rule card. */
export interface RuleExplanation {
  /** The verb's citation form, shown as the starting point. */
  source: string;
  /** Morpheme chips displayed in order (particles, stems, affixes). */
  parts: string[];
  /** Prose description of the rule. */
  text: string;
}

/**
 * Igbo particle + English gloss shown alongside each tense header so the user
 * can see which morpheme the frame hangs off.
 *
 * @param dialect the active dialect; particles come from its profile.
 * @returns a label per tense; empty string means "no annotation".
 */
export function getTenseAnnotations(dialect: Dialect): Record<Tense, string> {
  const p = getDialectProfile(dialect).surfaces.particles;
  // A representative stem is needed to show the harmony-selected allomorphs in
  // the header. Cards show the verb-specific form; this is just the legend.
  return {
    present: `${p.presentLink} (does / is doing)`,
    past: '',
    future: `${p.futureAux} (will)`,
    imperative: '(do!)',
    presentPerfect: `-${p.perfectSuffix('')} (has / have done)`,
    habitualPresent: `-${p.habitualSuffix} (usually)`,
    negativePast: '-ná / -né (did not)',
    negativeFuture: `${p.negativeFutureAux} (will not)`,
    negativeImperative: '-na / -ne (do not)',
    negativePerfect: `${p.negativePerfectPrefix} (have not / has not)`,
    neverPerfect: `-${p.neverSuffix} (has never)`,
    finished: `-${p.finishedSuffix} (finished)`,
    together: `-${p.togetherSuffix} (together)`,
    first: `-${p.firstSuffix} (first of all)`,
    polite: `-${p.politeSuffix} (please)`,
    benefactive: `-${p.benefactiveSuffix} (do it for me)`,
  };
}

/** English glosses for each pronoun — dialect-independent. */
const PRONOUN_GLOSS: Record<Pronoun, string> = {
  m: 'I',
  i: 'You',
  o: 'He/She/It',
  anyi: 'We',
  unu: 'You all',
  wa: 'They',
};

/**
 * Pronoun picker labels for the active dialect, e.g. Delta "Wa (They)" vs
 * Central "Ha (They)".
 *
 * @param dialect the active dialect.
 * @returns a `"<surface> (<gloss>)"` label per pronoun.
 */
export function getPronounLabels(dialect: Dialect): Record<Pronoun, string> {
  const s = getDialectProfile(dialect).surfaces;
  const label = (pronoun: Pronoun) =>
    `${s.pronounDisplay?.[pronoun] ?? s.pronouns[pronoun]} (${PRONOUN_GLOSS[pronoun]})`;
  return {
    m: label('m'),
    i: label('i'),
    o: label('o'),
    anyi: label('anyi'),
    unu: label('unu'),
    wa: label('wa'),
  };
}

/**
 * Builds the worked rule explanation for one verb in one tense.
 *
 * Every stem shown is produced by the same `morphology` helpers the engine
 * uses, so the explanation cannot describe a different form from the one the
 * card displays.
 *
 * @param verb    the verb being explained.
 * @param tense   the tense card being rendered.
 * @param dialect the active dialect.
 */
export function getRuleExplanation(
  verb: IgboVerb,
  tense: Tense,
  dialect: Dialect,
): RuleExplanation {
  const p = getDialectProfile(dialect).surfaces.particles;

  const source = toNfc(typeof verb?.igbo === 'string' ? verb.igbo : '');
  const stem = stripInfinitivePrefix(source);
  const { head } = splitVerbPhrase(stem);
  const prefix = harmonyPrefix(stem);
  const prefixed = attachPrefix(stem, prefix);
  const imperative = buildImperativeForm(stem);
  const perfectSuffix = p.perfectSuffix(stem);
  const negPast = negativePastSuffix(stem);
  const negImp = negativeImperativeSuffix(stem);

  /** Wraps a derived form so the prose always quotes what the engine emits. */
  const withSuffix = (suffix: string) => attachSuffix(stem, suffix);

  switch (tense) {
    case 'present':
      return {
        source,
        parts: [p.presentLink, prefixed],
        text: `Drop the infinitive prefix and add the vowel-harmony prefix '${prefix}'. Pronoun + ${p.presentLink} + ${prefixed}.`,
      };
    case 'past':
      return {
        source,
        parts: [stem],
        text: `Drop the infinitive prefix to form the past stem. Pronoun + ${stem}. The 1sg 'm' sits right after the verb.`,
      };
    case 'future':
      return {
        source,
        parts: [p.futureAux, prefixed],
        text: `Same stem as the present, with the '${p.futureAux}' auxiliary. Pronoun + ${p.futureAux} + ${prefixed}.`,
      };
    case 'imperative':
      return {
        source,
        parts: [imperative],
        text: IMPERATIVE_EXCEPTIONS.has(head)
          ? `'${head}' is an imperative exception — the bare stem is used.`
          : `Append '${imperative.replace(stem, '') || prefix}' to the verb by vowel harmony, giving ${imperative}.`,
      };
    case 'presentPerfect':
      return {
        source,
        parts: [prefix, head, perfectSuffix],
        text: `Plural subjects: harmony prefix + verb + '-${perfectSuffix}', giving ${attachPrefix(withSuffix(perfectSuffix), prefix)}. Singular pronouns (m/i/o) drop the suffix.`,
      };
    case 'habitualPresent':
      return {
        source,
        // Chips are head-level: in a verb phrase the suffix lands on the verb
        // ("alahukari ula"), so showing the whole prefixed phrase would not
        // match the rendered form.
        parts: [p.presentLink, attachPrefix(head, prefix), p.habitualSuffix],
        text: `Present frame with the habitual suffix '-${p.habitualSuffix}'. Pronoun + ${p.presentLink} + ${attachSuffix(prefixed, p.habitualSuffix)}.`,
      };
    case 'negativePast':
      return {
        source,
        parts: [head, negPast],
        text: `Verb + '-${negPast}' (vowel harmony), giving ${withSuffix(negPast)}. Plural subjects also insert the '${prefix}' linker before it.`,
      };
    case 'negativeFuture':
      return {
        source,
        parts: [p.negativeFutureAux, stem],
        text: `Replace '${p.futureAux}' with '${p.negativeFutureAux}' and drop the harmony prefix. Pronoun + ${p.negativeFutureAux} + ${stem}.`,
      };
    case 'negativeImperative':
      return {
        source,
        parts: [prefix, head, negImp],
        text: `Harmony prefix + verb + '-${negImp}', giving ${attachPrefix(withSuffix(negImp), prefix)}. Note this suffix is unaccented, unlike the negative past.`,
      };
    case 'negativePerfect':
      return {
        source,
        parts: [p.negativePerfectPrefix, prefixed],
        text: `Pronoun + ${p.negativePerfectPrefix} + ${prefixed}. Plural subjects prefix '${p.negativePerfectPrefix}' with the harmony vowel too (${prefix}${p.negativePerfectPrefix}).`,
      };
    case 'neverPerfect':
      return {
        source,
        parts: [head, p.neverSuffix],
        text: `Verb + '-${p.neverSuffix}', giving ${withSuffix(p.neverSuffix)}. The suffix takes no verb-prefix linker on its own.`,
      };
    case 'finished':
      return {
        source,
        parts: [head, p.finishedSuffix],
        text: `Suffix for a completed action, giving ${withSuffix(p.finishedSuffix)}. Shown in the present-perfect frame: plural subjects add '-${perfectSuffix}', singular pronouns use the bare stem.`,
      };
    case 'together':
      return {
        source,
        parts: [head, p.togetherSuffix],
        text: `Suffix meaning "together", giving ${withSuffix(p.togetherSuffix)}. Shown in the future frame: Pronoun + ${p.futureAux} + ${attachPrefix(withSuffix(p.togetherSuffix), prefix)}.`,
      };
    case 'first':
      return {
        source,
        parts: [head, p.firstSuffix],
        text: `Root suffix meaning "do this first of all", giving ${withSuffix(p.firstSuffix)}. Requests only — 2sg / 1pl / 2pl carry forms.`,
      };
    case 'polite':
      return {
        source,
        parts: [head, p.politeSuffix],
        text: `Polite intensifier ("please") on the root, giving ${withSuffix(p.politeSuffix)}. Requests only — 2sg / 1pl / 2pl carry forms.`,
      };
    case 'benefactive':
      return {
        source,
        parts: [head, p.benefactiveSuffix],
        text: `Root suffix asking for the action to be done for someone, giving ${withSuffix(p.benefactiveSuffix)}. Requests only — 2sg / 1pl / 2pl carry forms.`,
      };
    default:
      return {
        source,
        parts: [stem],
        text: 'Follows the standard conjugation rule for this tense.',
      };
  }
}
