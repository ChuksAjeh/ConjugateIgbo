// Rule-based conjugation engine for Igbo verbs
import * as Sentry from '@sentry/react-native';
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
  return root.startsWith('i') || root.startsWith('ị')
    ? root.substring(1)
    : root;
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

// Dialect-specific surface forms (pronouns, particles)
function getDialectSurfaces(dialect: Dialect) {
  // Defaults reflect current Delta outputs to preserve backward compatibility
  const base = {
    pronouns: {
      m: 'M',
      i: 'I',
      o: 'Ọ',
      anyi: 'Ànyị',
      unu: 'Unu',
      wa: 'Wa',
    } as Record<Pronoun, string>,
    particles: {
      presentLink: 'na', // e.g., "I na ..."
      futureAux: 'ga', // e.g., "I ga ..."
    },
  };

  switch (dialect) {
    case 'central':
      // Example difference: use "Ha" instead of "Wa" for 3rd person plural
      return {
        ...base,
        pronouns: { ...base.pronouns, wa: 'Ha' },
      };
    // Add other dialect overrides here as needed
    default:
      return base;
  }
}

export function generateConjugations(
  verb: IgboVerb,
  dialect: Dialect = 'delta',
): Conjugations {
  const root = getRoot(verb);
  const stem = removePrefixI(root);
  const vowelPrefix = getVowelharmonyPronoun(stem);
  const rules = getDialectRules(dialect);
  const surfaces = getDialectSurfaces(dialect);

  return {
    present: {
      m: `${vowelPrefix} ${surfaces.particles.presentLink} m ${rules.applyPresentRule(root, 'm')}`,
      i: `${surfaces.pronouns.i} ${surfaces.particles.presentLink} ${rules.applyPresentRule(root, 'i')}`,
      o: `${surfaces.pronouns.o} ${surfaces.particles.presentLink} ${rules.applyPresentRule(root, 'o')}`,
      anyi: `${surfaces.pronouns.anyi} ${surfaces.particles.presentLink} ${rules.applyPresentRule(root, 'anyi')}`,
      unu: `${surfaces.pronouns.unu} ${surfaces.particles.presentLink} ${rules.applyPresentRule(root, 'unu')}`,
      wa: `${surfaces.pronouns.wa} ${surfaces.particles.presentLink} ${rules.applyPresentRule(root, 'wa')}`,
    },
    past: {
      m: `${vowelPrefix} ${rules.applyPastRule(root, 'm')} m`,
      i: `${surfaces.pronouns.i} ${rules.applyPastRule(root, 'i')}`,
      o: `${surfaces.pronouns.o} ${rules.applyPastRule(root, 'o')}`,
      anyi: `${surfaces.pronouns.anyi} ${rules.applyPastRule(root, 'anyi')}`,
      unu: `${surfaces.pronouns.unu} ${rules.applyPastRule(root, 'unu')}`,
      wa: `${surfaces.pronouns.wa} ${rules.applyPastRule(root, 'wa')}`,
    },
    future: {
      m: `${surfaces.pronouns.m} ${surfaces.particles.futureAux} ${rules.applyFutureRule(root, 'm')}`,
      i: `${surfaces.pronouns.i} ${surfaces.particles.futureAux} ${rules.applyFutureRule(root, 'i')}`,
      o: `${surfaces.pronouns.o} ${surfaces.particles.futureAux} ${rules.applyFutureRule(root, 'o')}`,
      anyi: `${surfaces.pronouns.anyi} ${surfaces.particles.futureAux} ${rules.applyFutureRule(root, 'anyi')}`,
      unu: `${surfaces.pronouns.unu} ${surfaces.particles.futureAux} ${rules.applyFutureRule(root, 'unu')}`,
      wa: `${surfaces.pronouns.wa} ${surfaces.particles.futureAux} ${rules.applyFutureRule(root, 'wa')}`,
    },
  };
}

export function getConjugatedForm(
  verb: IgboVerb,
  tense: Tense,
  pronoun: Pronoun,
  dialect: Dialect = 'delta',
): string {
  // Prefer pre-computed conjugations if present (legacy data), otherwise generate
  if (
    verb.conjugations &&
    verb.conjugations[tense] &&
    verb.conjugations[tense][pronoun]
  ) {
    return verb.conjugations[tense][pronoun];
  }
  const conj = generateConjugations(verb, dialect);

  // Check if the tense exists in the generated conjugations
  if (!conj[tense]) {
    Sentry.logger.warn(`[conjugateVerbs] Tense "${tense}" not yet implemented for verb: ${verb.igbo}`, {
      tags: { feature: 'conjugation' },
      extra: { verbId: verb.id, igbo: verb.igbo, tense },
    });
    return '';
  }

  return conj[tense][pronoun];
}

// Normalize and compare user answer to the correct conjugation.
// Allows minor spacing variations and case-insensitive comparison.
export function checkConjugation(
  userAnswer: string,
  correctAnswer: string,
): boolean {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();
  return (
    normalizedUser === normalizedCorrect ||
    normalizedUser.replace(/\s+/g, ' ') ===
      normalizedCorrect.replace(/\s+/g, ' ')
  );
}
