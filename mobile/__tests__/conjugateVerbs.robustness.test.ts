/**
 * Crash-stress tests for the Igbo conjugation engine.
 *
 * The practice and verb-detail screens call into this engine during render on
 * data that may originate from a remote API or a persisted cache. These tests
 * assert the engine NEVER throws — for every dialect × tense × pronoun — no
 * matter how malformed the verb is, and always returns the expected type.
 *
 * Companion to conjugateVerbs.test.ts (which snapshots correct output); this
 * file is purely about not crashing.
 */

import {
  getConjugatedForm,
  generateConjugations,
  checkConjugation,
} from '@/lib/conjugateVerbs';
import { tenses, pronouns } from '@/models/interfaces';
import { Dialect, IgboVerb, Pronoun, Tense } from '@/models/verb';

const dialects: Dialect[] = ['delta', 'central', 'anambra', 'imo', 'abia'];

// Deliberately hostile verb objects. Several are cast through `unknown` to
// exercise the runtime guards that protect against bad API/cache data slipping
// past TypeScript.
const malformedVerbs: { name: string; verb: IgboVerb }[] = [
  { name: 'empty igbo', verb: { id: '1', igbo: '', english: 'x' } },
  { name: 'whitespace igbo', verb: { id: '2', igbo: '   ', english: 'x' } },
  { name: 'single char', verb: { id: '3', igbo: 'i', english: 'x' } },
  { name: 'no i-prefix', verb: { id: '4', igbo: 'gba', english: 'x' } },
  { name: 'unicode combining', verb: { id: '5', igbo: 'ọ̀', english: 'x' } },
  { name: 'emoji igbo', verb: { id: '6', igbo: '🙂🚀', english: 'x' } },
  { name: 'very long igbo', verb: { id: '7', igbo: 'i'.repeat(5000), english: 'x' } },
  { name: 'missing igbo', verb: { id: '8', english: 'x' } as unknown as IgboVerb },
  { name: 'null igbo', verb: { id: '9', igbo: null, english: 'x' } as unknown as IgboVerb },
  { name: 'number igbo', verb: { id: '10', igbo: 42, english: 'x' } as unknown as IgboVerb },
  { name: 'object igbo', verb: { id: '11', igbo: {}, english: 'x' } as unknown as IgboVerb },
  { name: 'empty object', verb: {} as unknown as IgboVerb },
];

describe('getConjugatedForm never throws on malformed input', () => {
  for (const dialect of dialects) {
    for (const { name, verb } of malformedVerbs) {
      test(`${dialect} / ${name}`, () => {
        for (const tense of tenses) {
          for (const pronoun of pronouns) {
            let result = '';
            expect(() => {
              result = getConjugatedForm(verb, tense, pronoun, dialect);
            }).not.toThrow();
            expect(typeof result).toBe('string');
          }
        }
      });
    }
  }
});

describe('generateConjugations never throws on malformed input', () => {
  for (const dialect of dialects) {
    for (const { name, verb } of malformedVerbs) {
      test(`${dialect} / ${name}`, () => {
        expect(() => generateConjugations(verb, dialect)).not.toThrow();
      });
    }
  }
});

describe('getConjugatedForm tolerates unknown tense / pronoun / dialect', () => {
  const verb: IgboVerb = { id: '1', igbo: 'irị', english: 'to eat' };

  test('unknown tense returns a string without throwing', () => {
    let r = 'sentinel';
    expect(() => {
      r = getConjugatedForm(verb, 'no-such-tense' as Tense, 'm', 'delta');
    }).not.toThrow();
    expect(typeof r).toBe('string');
  });

  test('unknown pronoun returns a string without throwing', () => {
    let r = 'sentinel';
    expect(() => {
      r = getConjugatedForm(verb, 'present', 'zzz' as Pronoun, 'delta');
    }).not.toThrow();
    expect(typeof r).toBe('string');
  });

  test('unknown dialect falls back to delta without throwing', () => {
    expect(() =>
      getConjugatedForm(verb, 'present', 'm', 'klingon' as Dialect),
    ).not.toThrow();
  });
});

describe('checkConjugation never throws on odd input', () => {
  const cases: [string, string][] = [
    ['', ''],
    ['  HELLO  ', 'hello'],
    ['ị Rị', 'ị rị'],
    ['🙂', '🙂'],
    ['a'.repeat(10000), 'a'],
  ];
  for (const [a, b] of cases) {
    test(`checkConjugation("${a.slice(0, 12)}…")`, () => {
      let r: boolean | undefined;
      expect(() => {
        r = checkConjugation(a, b);
      }).not.toThrow();
      expect(typeof r).toBe('boolean');
    });
  }
});
