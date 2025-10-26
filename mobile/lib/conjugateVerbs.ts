// Rule-based conjugation engine for Igbo verbs
import { Conjugations, IgboVerb, Pronoun, Tense } from '@/models/verb';

function getRoot(verb: IgboVerb): string {
  const base = verb.rootForm || verb.igbo || '';
  return base.trim();
}

function applyPresentRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  return root.startsWith('i') ? root.substring(1) : root;
}

function applyPastRule(root: string, _pronoun: Pronoun): string {
  if (!root) return '';
  if (root.startsWith('i')) {
    const stem = root.substring(1);
    return stem.replace(/^([aeiou])/, (match) => match);
  }
  return root;
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

  return {
    present: {
      m: `ana m ${applyPresentRule(root, 'm')}`,
      i: `ana i ${applyPresentRule(root, 'i')}`,
      o: `ana o ${applyPresentRule(root, 'o')}`,
      anyi: `ana anyi ${applyPresentRule(root, 'anyi')}`,
      unu: `ana unu ${applyPresentRule(root, 'unu')}`,
      ha: `ana ha ${applyPresentRule(root, 'ha')}`,
    },
    past: {
      m: `${applyPastRule(root, 'm')} m`,
      i: `${applyPastRule(root, 'i')} i`,
      o: `${applyPastRule(root, 'o')} o`,
      anyi: `${applyPastRule(root, 'anyi')} anyi`,
      unu: `${applyPastRule(root, 'unu')} unu`,
      ha: `${applyPastRule(root, 'ha')} ha`,
    },
    future: {
      m: `aga m ${applyFutureRule(root, 'm')}`,
      i: `aga i ${applyFutureRule(root, 'i')}`,
      o: `ga o ${applyFutureRule(root, 'o')}`,
      anyi: `aga anyi ${applyFutureRule(root, 'anyi')}`,
      unu: `aga unu ${applyFutureRule(root, 'unu')}`,
      ha: `ga ha ${applyFutureRule(root, 'ha')}`,
    },
    subjunctive: {
      m: `ka m ${applySubjunctiveRule(root, 'm')}`,
      i: `ka i ${applySubjunctiveRule(root, 'i')}`,
      o: `ka o ${applySubjunctiveRule(root, 'o')}`,
      anyi: `ka anyi ${applySubjunctiveRule(root, 'anyi')}`,
      unu: `ka unu ${applySubjunctiveRule(root, 'unu')}`,
      ha: `ka ha ${applySubjunctiveRule(root, 'ha')}`,
    },
  };
}

export function getConjugatedForm(verb: IgboVerb, tense: Tense, pronoun: Pronoun): string {
  // Prefer pre-computed conjugations if present (legacy data), otherwise generate
  if (verb.conjugations && verb.conjugations[tense] && verb.conjugations[tense][pronoun]) {
    return verb.conjugations[tense][pronoun];
  }
  const conj = generateConjugations(verb);
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
