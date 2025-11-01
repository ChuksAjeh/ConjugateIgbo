// Rule-based conjugation engine for Igbo verbs
import { Conjugations, IgboVerb, Pronoun, Tense } from '@/models/verb';

// Supported dialects (keep in sync with settings.dialect)
export type Dialect = 'central' | 'delta' | 'anambra' | 'imo' | 'abia';

function getRoot(verb: IgboVerb): string {
  const base = verb.rootForm || verb.igbo || '';
  return base.trim();
}

// Determine vowel warmony prefix based on stem content
// Returns 'a' if stem contains 'a' or accented vowels (ọ, ụ, ị)
// Returns 'e' otherwise
function getVowelharmonyPronoun(stem: string): 'A' | 'E' {
  const wasAorAccents = /[aọụịỌỤỊ]/.test(stem);
  return wasAorAccents ? 'A' : 'E';
}

// Remove 'i' prefix from verb root
function removePrefixI(root: string): string {
  return root.startsWith('i') ||root.startsWith('ị') ? root.substring(1) : root;
}

// Determine vowel warmony prefix based on stem content
// Returns 'a' if stem contains 'a' or accented vowels (ọ, ụ, ị)
// Returns 'e' otherwise
function getVowelharmonyPrefix(stem: string): 'a' | 'e' {
  const wasAorAccents = /[aọụịỌỤỊ]/.test(stem);
  return wasAorAccents ? 'a' : 'e';
}

function applyPresentRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  
  const stem = removePrefixI(root);
  const prefix = getVowelharmonyPrefix(stem);
  return `${prefix}${stem}`;
}

function applyPastRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  const stem = removePrefixI(root);

  return stem;
}

function applyFutureRule(root: string, pronoun: Pronoun): string {
  return applyPresentRule(root, pronoun);
}

function applySubjunctiveRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  if (root.startsWith('i')) {
    const stem = root.substring(1);
    return stem + 'e';
  }
  return root + 'e';
}

// Return the rule implementations for a given dialect
function getDialectRules(_dialect: Dialect) {
  // TODO: Implement dialect-specific differences. For now, use the same rules.
  return {
    applyPresentRule,
    applyPastRule,
    applyFutureRule,
    applySubjunctiveRule,
  };
}

export function generateConjugations(verb: IgboVerb, dialect: Dialect = 'delta'): Conjugations {
  const root = getRoot(verb);
  const stem = removePrefixI(root);
  const vowelPrefix = getVowelharmonyPronoun(stem);
  const rules = getDialectRules(dialect);
  
  return {
    present: {
      m: `${vowelPrefix} na m ${rules.applyPresentRule(root, 'm')}`,
      i: `I na ${rules.applyPresentRule(root, 'i')}`,
      o: `Ọ na ${rules.applyPresentRule(root, 'o')}`,
      anyi: `Ànyị na ${rules.applyPresentRule(root, 'anyi')}`,
      unu: `Unu na ${rules.applyPresentRule(root, 'unu')}`,
      wa: `Wa na ${rules.applyPresentRule(root, 'wa')}`,
    },
    past: {
      m: `${vowelPrefix} ${rules.applyPastRule(root, 'm')} m`,
      i: `I ${rules.applyPastRule(root, 'i')}`,
      o: `Ọ ${rules.applyPastRule(root, 'o')}`,
      anyi: `Ànyị ${rules.applyPastRule(root, 'anyi')}`,
      unu: `Unu ${rules.applyPastRule(root, 'unu')}`,
      wa: `Wa ${rules.applyPastRule(root, 'wa')}`,
    },
    future: {
      m: `M ga ${rules.applyFutureRule(root, 'm')}`,
      i: `I ga ${rules.applyFutureRule(root, 'i')}`,
      o: `Ọ ga ${rules.applyFutureRule(root, 'o')}`,
      anyi: `Ànyị ga ${rules.applyFutureRule(root, 'anyi')}`,
      unu: `Unu ga ${rules.applyFutureRule(root, 'unu')}`,
      wa: `Wa ga ${rules.applyFutureRule(root, 'wa')}`,
    },
  };
}

export function getConjugatedForm(verb: IgboVerb, tense: Tense, pronoun: Pronoun, dialect: Dialect = 'delta'): string {
  // Prefer pre-computed conjugations if present (legacy data), otherwise generate
  if (verb.conjugations && verb.conjugations[tense] && verb.conjugations[tense][pronoun]) {
    return verb.conjugations[tense][pronoun];
  }
  const conj = generateConjugations(verb, dialect);

  // Check if the tense exists in the generated conjugations
  if (!conj[tense]) {
    console.warn(`Tense "${tense}" not yet implemented for verb: ${verb.igbo}`);
    return '';
  }

  return conj[tense][pronoun];
}

// Normalize and compare user answer to the correct conjugation.
// Allows minor spacing variations and case-insensitive comparison.
export function checkConjugation(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();
  return (
    normalizedUser === normalizedCorrect ||
    normalizedUser.replace(/\s+/g, ' ') === normalizedCorrect.replace(/\s+/g, ' ')
  );
}
