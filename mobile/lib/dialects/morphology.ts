/**
 * @fileoverview Primitive morphological helpers shared by the conjugation
 * engine, the dialect rule bundles, and the UI's rule explanations.
 *
 * These are the *only* place vowel-harmony classification, infinitive-prefix
 * stripping, and verb-phrase segmentation are implemented. Everything else in
 * the app — `sharedRules.ts`, `conjugateVerbs.ts`, and the verb-detail rule
 * cards — imports from here, so a grammar correction lands in one file rather
 * than three divergent copies.
 *
 * ## Vowel harmony
 * Igbo vowels fall into two harmony sets:
 *  - **heavy** (`a`, `ị`, `ọ`, `ụ`) — take the `a`-series affixes
 *  - **light** (`e`, `i`, `o`, `u`) — take the `e`-series affixes
 *
 * A root is classified as heavy when it contains *any* heavy vowel. This
 * matches the Notion worked examples, including `bia` → `abia` (heavy despite
 * the light `i`), which a first-vowel-only rule would get wrong.
 *
 * ## Verb phrases
 * Many Igbo verbs are phrasal — `gba ọsọ` ("run"), `lahu ula` ("sleep"),
 * `tu ujo` ("be afraid"). Notion (Present Perfect Rule 1.3, Suffixes Rule 7)
 * is explicit that suffixes attach to the **verb head**, not the end of the
 * phrase: `lahu ula` + `ga` → `lahuga ula`, `tu` + `nene` + `ujo` →
 * `tunene ujo`. {@link splitVerbPhrase} exists so every suffix rule can honour
 * that without re-deriving the split.
 */

/** Heavy ([-ATR]) vowels — these select the `a`-series affixes. */
const HEAVY_VOWELS = /[aọụịAỌỤỊ]/;

/** Any vowel, used to detect vowel-initial stems that skip the harmony prefix. */
const ANY_VOWEL_INITIAL = /^[aeiouọụịAEIOUỌỤỊ]/;

/**
 * Normalises a string to Unicode NFC.
 *
 * Notion exports mix composed (`ị` U+1ECB) and decomposed (`i` + U+0323)
 * forms. Without this, `substring(1)` on a decomposed `ị` strips the base
 * letter and leaves an orphaned combining dot, producing garbage stems.
 *
 * @param value raw text, possibly in NFD.
 * @returns the NFC-normalised equivalent, or `value` unchanged on runtimes
 *          without `String.prototype.normalize`.
 */
export function toNfc(value: string): string {
  return typeof value.normalize === 'function' ? value.normalize('NFC') : value;
}

/**
 * Removes the infinitive prefix (`i` / `ị`) from a citation form.
 *
 * @param root the infinitive as stored on the verb (e.g. `"irị"`, `"igba ọsọ"`).
 * @returns the bare stem (`"rị"`, `"gba ọsọ"`). Empty input returns `''`.
 */
export function stripInfinitivePrefix(root: string): string {
  const normalised = toNfc(root ?? '').trim();
  if (!normalised) return '';
  return normalised.startsWith('i') || normalised.startsWith('ị')
    ? normalised.substring(1)
    : normalised;
}

/** A verb stem split into its inflecting head and any trailing complement. */
export interface VerbPhraseParts {
  /** The verb word that carries all prefixes and suffixes. */
  head: string;
  /**
   * Everything after the head (object noun, particle, …), including the
   * leading separator. Empty string for single-word verbs.
   */
  tail: string;
}

/**
 * Splits a bare stem into the inflecting head and its complement.
 *
 * @param stem a stem with the infinitive prefix already removed.
 * @returns `{ head, tail }` where `tail` retains its leading space so
 *          `head + tail` round-trips to the original stem.
 *
 * @example
 * splitVerbPhrase('gba ọsọ'); // { head: 'gba', tail: ' ọsọ' }
 * splitVerbPhrase('rị');      // { head: 'rị',  tail: '' }
 */
export function splitVerbPhrase(stem: string): VerbPhraseParts {
  const boundary = stem.search(/\s/);
  if (boundary < 0) return { head: stem, tail: '' };
  return { head: stem.slice(0, boundary), tail: stem.slice(boundary) };
}

/**
 * Classifies a stem for vowel harmony.
 *
 * Only the head of a verb phrase participates — `ji olu n'aka` ("be busy") is
 * light because of `ji`, even though the complement contains a heavy `a`.
 *
 * @param stem a bare stem or full verb phrase.
 * @returns `'heavy'` when the head contains a heavy vowel, otherwise `'light'`.
 */
export function harmonyClass(stem: string): 'heavy' | 'light' {
  const { head } = splitVerbPhrase(toNfc(stem ?? ''));
  return HEAVY_VOWELS.test(head) ? 'heavy' : 'light';
}

/**
 * Vowel-harmony verb prefix (Notion: Present/Future Rule 1, `<verbPrefix(a/e)>`).
 *
 * @param stem bare stem or verb phrase.
 * @returns `'a'` for heavy stems, `'e'` for light stems.
 */
export function harmonyPrefix(stem: string): 'a' | 'e' {
  return harmonyClass(stem) === 'heavy' ? 'a' : 'e';
}

/**
 * Uppercase harmony pronoun used in 1sg frames (Notion Past Rule 1,
 * "A gba m ọsọ").
 *
 * @param stem bare stem or verb phrase.
 * @returns `'A'` for heavy stems, `'E'` for light stems.
 */
export function harmonyPronoun(stem: string): 'A' | 'E' {
  return harmonyClass(stem) === 'heavy' ? 'A' : 'E';
}

/**
 * Unaccented negation suffix used by the **negative imperative**
 * (Notion: Imperatives Rule 2 — `kwu` + `ne` → `ekwune`).
 *
 * @param stem bare stem or verb phrase.
 * @returns `'na'` for heavy stems, `'ne'` for light stems.
 */
export function negativeImperativeSuffix(stem: string): 'na' | 'ne' {
  return harmonyClass(stem) === 'heavy' ? 'na' : 'ne';
}

/**
 * Accented negation suffix used by the **negative past**
 * (Notion: Suffixes Rule 5 — `Nneoma e liné`).
 *
 * Distinct from {@link negativeImperativeSuffix}: Notion writes the negative
 * past with a tone mark and the negative imperative without one.
 *
 * @param stem bare stem or verb phrase.
 * @returns `'ná'` for heavy stems, `'né'` for light stems.
 */
export function negativePastSuffix(stem: string): 'ná' | 'né' {
  return harmonyClass(stem) === 'heavy' ? 'ná' : 'né';
}

/**
 * True when the head already opens with a vowel, in which case the harmony
 * prefix is not prepended (it would create an illegal vowel cluster).
 *
 * @param stem bare stem or verb phrase.
 */
export function startsWithVowel(stem: string): boolean {
  const { head } = splitVerbPhrase(toNfc(stem ?? ''));
  return ANY_VOWEL_INITIAL.test(head);
}

/**
 * Appends a suffix to the **verb head**, preserving any phrase complement.
 *
 * Implements Notion Present Perfect Rule 1.3 ("When there is a verb phrase add
 * the suffix to the verb") and Suffixes Rule 7 (`tu` + `nene` + `ujo` →
 * `tunene ujo`).
 *
 * @param stem   bare stem or verb phrase.
 * @param suffix the morpheme to attach.
 * @returns the stem with `suffix` inserted after the head.
 *
 * @example
 * attachSuffix('lahu ula', 'ga'); // 'lahuga ula'
 */
export function attachSuffix(stem: string, suffix: string): string {
  const { head, tail } = splitVerbPhrase(stem);
  return `${head}${suffix}${tail}`;
}

/**
 * Prepends a prefix to the verb head, skipping it when the head already opens
 * with a vowel.
 *
 * @param stem   bare stem or verb phrase.
 * @param prefix the morpheme to attach (typically `'a'` or `'e'`).
 * @returns the prefixed stem, or `stem` unchanged for vowel-initial heads.
 */
export function attachPrefix(stem: string, prefix: string): string {
  if (!stem) return '';
  return startsWithVowel(stem) ? stem : `${prefix}${stem}`;
}

/**
 * Verb heads whose imperative takes no extra vowel
 * (Notion: Imperatives Rule 1.3).
 */
export const IMPERATIVE_EXCEPTIONS: ReadonlySet<string> = new Set([
  'bia',
  'je',
  'nodu',
]);

/**
 * Builds the pronoun-free imperative surface form
 * (Notion: Imperatives Rules 1, 1.2, 1.3).
 *
 * - head ends in `a` / `ị` / `ọ` / `ụ` → append `a` (`ta` → `taa`, `rị` → `rịa`)
 * - head ends in `e` / `i` / `o` / `u` → append `e` (`me` → `mee`, `yi` → `yie`)
 * - `bia`, `je`, `nodu` → unchanged
 *
 * The extra vowel lands on the head, so `gba ọsọ` → `gbaa ọsọ`.
 *
 * @param stem a bare stem or verb phrase.
 * @returns the imperative form, or `''` for empty input.
 */
export function buildImperativeForm(stem: string): string {
  if (!stem) return '';
  const { head, tail } = splitVerbPhrase(stem);
  if (IMPERATIVE_EXCEPTIONS.has(head)) return stem;
  const last = head.length > 0 ? head[head.length - 1] : '';
  const extra = 'aịọụ'.includes(last) ? 'a' : 'e';
  return `${head}${extra}${tail}`;
}
