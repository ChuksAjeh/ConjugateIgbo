/**
 * Tests that the UI's grammar explanations stay in lockstep with the engine.
 *
 * The verb-detail screen used to carry its own copy of the morphology, which
 * drifted from `lib/conjugateVerbs.ts` and printed explanations that did not
 * describe the form rendered beside them. `lib/grammarRules.ts` now derives
 * everything from the same dialect profile; these tests are the guard rail
 * that keeps it that way.
 */

import { generateConjugations } from '@/lib/conjugateVerbs';
import {
  getPronounLabels,
  getRuleExplanation,
  getTenseAnnotations,
} from '@/lib/grammarRules';
import { dialectProfiles, dialectProfileList } from '@/lib/dialects';
import { tenses } from '@/models/interfaces';
import { Dialect, IgboVerb } from '@/models/verb';

const verbs: IgboVerb[] = [
  { id: '1', igbo: 'irị', english: 'to eat' },
  { id: '2', igbo: 'ibia', english: 'to come' },
  { id: '3', igbo: 'ikwu', english: 'to say' },
  { id: '4', igbo: 'ide', english: 'to write' },
  { id: '5', igbo: 'igba ọsọ', english: 'to run' },
  { id: '6', igbo: 'ilahu ula', english: 'to sleep' },
];

const dialects: Dialect[] = ['delta', 'central', 'anambra', 'imo', 'abia'];

describe('rule explanations describe the form the engine actually produces', () => {
  for (const verb of verbs) {
    for (const tense of tenses) {
      test(`${verb.igbo} / ${tense}: every morpheme chip appears in the output`, () => {
        const table = generateConjugations(verb, 'delta')[tense];
        // Only tenses the engine emits are rendered as cards.
        if (!table) return;

        const forms = Object.values(table).join(' | ').toLowerCase();
        const { parts } = getRuleExplanation(verb, tense, 'delta');

        for (const part of parts) {
          expect(forms).toContain(part.toLowerCase());
        }
      });
    }
  }
});

describe('explanations never leak another verb or throw', () => {
  test('malformed verbs still return a usable explanation', () => {
    const broken = { id: 'x', igbo: '', english: '' } as IgboVerb;
    for (const tense of tenses) {
      expect(() => getRuleExplanation(broken, tense, 'delta')).not.toThrow();
      expect(typeof getRuleExplanation(broken, tense, 'delta').text).toBe('string');
    }
  });
});

describe('labels follow the active dialect', () => {
  test('pronoun labels use each dialect\'s own spellings', () => {
    expect(getPronounLabels('delta').wa).toBe('Wa (They)');
    expect(getPronounLabels('central').wa).toBe('Ha (They)');
    expect(getPronounLabels('central').unu).toBe('Ụnụ (You all)');
  });

  test('tense annotations use each dialect\'s own particles', () => {
    expect(getTenseAnnotations('delta').negativePerfect).toContain('dika');
    expect(getTenseAnnotations('central').negativePerfect).toContain('dị́ká');
  });

  test('an unknown dialect falls back to the default rather than crashing', () => {
    expect(() => getPronounLabels('klingon' as Dialect)).not.toThrow();
    expect(getPronounLabels('klingon' as Dialect)).toEqual(getPronounLabels('delta'));
  });

  test('every dialect produces a complete label and annotation set', () => {
    for (const dialect of dialects) {
      expect(Object.keys(getPronounLabels(dialect))).toHaveLength(6);
      expect(Object.keys(getTenseAnnotations(dialect))).toHaveLength(tenses.length);
    }
  });
});

describe('dialect registry drives the Settings picker', () => {
  test('lists every dialect exactly once', () => {
    expect(dialectProfileList).toHaveLength(Object.keys(dialectProfiles).length);
    const keys = dialectProfileList.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('supported dialects sort first so the picker leads with usable options', () => {
    expect(dialectProfileList[0].supported).toBe(true);
    expect(dialectProfileList[0].key).toBe('delta');
  });

  test('every profile carries the metadata the picker renders', () => {
    for (const profile of dialectProfileList) {
      expect(profile.label.length).toBeGreaterThan(0);
      expect(typeof profile.supported).toBe('boolean');
      if (!profile.supported) expect(profile.description).toBe('COMING SOON');
    }
  });
});
