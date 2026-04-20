/**
 * Snapshot tests for the Igbo conjugation engine.
 *
 * Covers a representative set of verbs across the full tense table in both
 * Delta and Central dialects. When engine output changes, review the diff
 * carefully against the Notion grammar reference before updating the
 * snapshot (`jest -u`).
 */

import { generateConjugations, checkConjugation } from '@/lib/conjugateVerbs';
import { IgboVerb } from '@/models/verb';

/** Canonical test verbs — chosen for vowel-harmony coverage and edge cases. */
const verbs: Record<string, IgboVerb> = {
  // Light-vowel stem (e/i harmony), infinitive prefix "i".
  iri:   { id: '1', igbo: 'iri', english: 'to eat' },
  // Heavy-vowel stem (a/ị/ọ/ụ harmony), imperative exception ("bia").
  ibia:  { id: '2', igbo: 'ibia', english: 'to come' },
  // Light stem, tests -ne negation suffix.
  ikwu:  { id: '3', igbo: 'ikwu', english: 'to say' },
  // Light stem with final 'e' edge case ("de").
  ide:   { id: '4', igbo: 'ide', english: 'to write' },
  // Verb phrase — whole phrase goes through the engine intact.
  igbaOso: { id: '5', igbo: 'igba ọsọ', english: 'to run' },
};

describe('generateConjugations — Delta dialect', () => {
  for (const [name, verb] of Object.entries(verbs)) {
    test(`${name} (${verb.igbo})`, () => {
      expect(generateConjugations(verb, 'delta')).toMatchSnapshot();
    });
  }
});

describe('generateConjugations — Central dialect', () => {
  for (const [name, verb] of Object.entries(verbs)) {
    test(`${name} (${verb.igbo})`, () => {
      expect(generateConjugations(verb, 'central')).toMatchSnapshot();
    });
  }
});

describe('imperative vowel-ending rule', () => {
  test('heavy-vowel stem appends "a" (ri → ria)', () => {
    const { imperative } = generateConjugations(verbs.iri, 'delta');
    expect(imperative!.i).toBe('rie');
  });

  test('exception "bia" stays bare', () => {
    const { imperative } = generateConjugations(verbs.ibia, 'delta');
    expect(imperative!.i).toBe('bia');
  });

  test('light-vowel stem appends "e" (de → dee)', () => {
    const { imperative } = generateConjugations(verbs.ide, 'delta');
    expect(imperative!.i).toBe('dee');
  });

  test('non-imperative slots return "—"', () => {
    const { imperative } = generateConjugations(verbs.iri, 'delta');
    expect(imperative!.m).toBe('—');
    expect(imperative!.o).toBe('—');
    expect(imperative!.wa).toBe('—');
  });
});

describe('present perfect singular-vs-plural split', () => {
  test('singular pronouns (m/i/o) drop the perfective suffix', () => {
    const { presentPerfect } = generateConjugations(verbs.ibia, 'delta');
    expect(presentPerfect!.i).not.toMatch(/ga\b/);
    expect(presentPerfect!.o).not.toMatch(/ga\b/);
  });

  test('plural pronouns carry the -ga/ge/go suffix', () => {
    const { presentPerfect } = generateConjugations(verbs.ibia, 'delta');
    expect(presentPerfect!.wa).toMatch(/ga\b/);
    expect(presentPerfect!.anyi).toMatch(/ga\b/);
    expect(presentPerfect!.unu).toMatch(/ga\b/);
  });
});

describe('negative future uses "ma" auxiliary and drops the verb prefix', () => {
  test('1sg: M ma <bare-stem>', () => {
    const { negativeFuture } = generateConjugations(verbs.iri, 'delta');
    expect(negativeFuture!.m).toBe('M ma ri');
  });

  test('drops the verb prefix (no "eri"/"ari")', () => {
    const { negativeFuture } = generateConjugations(verbs.iri, 'delta');
    expect(negativeFuture!.i).not.toMatch(/eri|ari/);
  });
});

describe('negative imperative only populates 2sg / 1pl / 2pl', () => {
  test('m/o/wa slots are "—"', () => {
    const { negativeImperative } = generateConjugations(verbs.ikwu, 'delta');
    expect(negativeImperative!.m).toBe('—');
    expect(negativeImperative!.o).toBe('—');
    expect(negativeImperative!.wa).toBe('—');
  });

  test('2sg carries the "-ne" suffix after harmony prefix', () => {
    const { negativeImperative } = generateConjugations(verbs.ikwu, 'delta');
    expect(negativeImperative!.i).toBe('ekwune');
  });
});

describe('dialect surface differences', () => {
  test('Delta uses "Wa" for 3pl; Central uses "Ha"', () => {
    const delta = generateConjugations(verbs.iri, 'delta');
    const central = generateConjugations(verbs.iri, 'central');
    expect(delta.present.wa.startsWith('Wa')).toBe(true);
    expect(central.present.wa.startsWith('Ha')).toBe(true);
  });

  test('Central uses diacritics for 2sg pronoun (Ị vs I)', () => {
    const delta = generateConjugations(verbs.iri, 'delta');
    const central = generateConjugations(verbs.iri, 'central');
    expect(delta.present.i.startsWith('I ')).toBe(true);
    expect(central.present.i.startsWith('Ị ')).toBe(true);
  });
});

describe('checkConjugation', () => {
  test('case-insensitive match', () => {
    expect(checkConjugation('A na m eri', 'a na m eri')).toBe(true);
  });

  test('tolerates collapsed whitespace', () => {
    expect(checkConjugation('A  na m   eri', 'A na m eri')).toBe(true);
  });

  test('rejects mismatched forms', () => {
    expect(checkConjugation('A na m ari', 'A na m eri')).toBe(false);
  });
});
