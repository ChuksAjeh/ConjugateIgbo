// Rule-based conjugation engine for Igbo verbs
import { Conjugations, IgboVerb, Pronoun, Tense } from '@/models/verb';

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

export function generateConjugations(verb: IgboVerb): Conjugations {
  const root = getRoot(verb);
  const stem = removePrefixI(root);
  const vowelPrefix = getVowelharmonyPronoun(stem);
  
  return {
    present: {
      m: `${vowelPrefix} na m ${applyPresentRule(root, 'm')}`,
      i: `I na ${applyPresentRule(root, 'i')}`,
      o: `Ọ na ${applyPresentRule(root, 'o')}`,
      anyi: `Ànyị na ${applyPresentRule(root, 'anyi')}`,
      unu: `Unu na ${applyPresentRule(root, 'unu')}`,
      wa: `Wa na ${applyPresentRule(root, 'wa')}`,
    },
    past: {
      m: `${vowelPrefix} ${applyPastRule(root, 'm')} m`,
      i: `I ${applyPastRule(root, 'i')}`,
      o: `Ọ ${applyPastRule(root, 'o')}`,
      anyi: `Ànyị ${applyPastRule(root, 'anyi')}`,
      unu: `Unu ${applyPastRule(root, 'unu')}`,
      wa: `Wa ${applyPastRule(root, 'wa')}`,
    },
    future: {
      m: `M ga ${applyFutureRule(root, 'm')}`,
      i: `I ga ${applyFutureRule(root, 'i')}`,
      o: `Ọ ga${applyFutureRule(root, 'o')}`,
      anyi: `Ànyị ga ${applyFutureRule(root, 'anyi')}`,
      unu: `Unu ga ${applyFutureRule(root, 'unu')}`,
      wa: `Wa ga ${applyFutureRule(root, 'wa')}`,
    },
    // subjunctive: {
    // //   m: `ka m ${applySubjunctiveRule(root, 'm')}`,
    // //   i: `ka i ${applySubjunctiveRule(root, 'i')}`,
    // //   o: `ka o ${applySubjunctiveRule(root, 'o')}`,
    // //   anyi: `ka anyi ${applySubjunctiveRule(root, 'anyi')}`,
    // //   unu: `ka unu ${applySubjunctiveRule(root, 'unu')}`,
    // //   wa: `ka wa ${applySubjunctiveRule(root, 'wa')}`,
    // },
  };
}

export function getConjugatedForm(verb: IgboVerb, tense: Tense, pronoun: Pronoun): string {
  // Prefer pre-computed conjugations if present (legacy data), otherwise generate
  if (verb.conjugations && verb.conjugations[tense] && verb.conjugations[tense][pronoun]) {
    return verb.conjugations[tense][pronoun];
  }
  const conj = generateConjugations(verb);
  console.log("conj", conj);

  console.log("tense", tense);
  console.log("pronoun", pronoun);
  console.log("conj[tense][pronoun]", conj[tense][pronoun]);
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
