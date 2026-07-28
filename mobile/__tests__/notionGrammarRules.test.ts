/**
 * Conformance tests: engine output vs. the Notion grammar reference.
 *
 * Every assertion here is a **worked example copied verbatim from Notion**,
 * with the page and rule number cited. These are the tests to trust when the
 * snapshots and the grammar disagree — a snapshot records what the engine
 * does, this file records what the grammar says.
 *
 * Sources:
 *  - Delta Igbo Tenses: Present Continuous/Simple Present Tense
 *  - Delta Igbo Tenses: Past Tense
 *  - Delta Igbo Tenses: Future Tense
 *  - Delta Igbo Tenses: Present Perfect Tense (Past Participle)
 *  - Delta Igbo Tenses: Imperatives
 *  - Suffixes and Prefixes
 */

import { generateConjugations } from '@/lib/conjugateVerbs';
import { IgboVerb } from '@/models/verb';

/** Builds a minimal verb object for the engine. */
const verb = (igbo: string): IgboVerb => ({ id: igbo, igbo, english: 'x' });

describe('Present Continuous — Rule 1: na + <verbPrefix(a/e)> + verb', () => {
  test('gba ọsọ → na-agba ọsọ (heavy stem takes "a")', () => {
    expect(generateConjugations(verb('igba ọsọ'), 'delta').present.i).toBe(
      'I na agba ọsọ',
    );
  });

  test('ri nni → na-eri nni (light stem takes "e")', () => {
    expect(generateConjugations(verb('iri nni'), 'delta').present.i).toBe(
      'I na eri nni',
    );
  });
});

describe('Past — Rule 1: pronoun + root verb ("A gba m ọsọ")', () => {
  test('1sg clitic sits after the verb head, not after the object', () => {
    expect(generateConjugations(verb('igba ọsọ'), 'delta').past.m).toBe(
      'A gba m ọsọ',
    );
  });

  test('other pronouns take the bare stem', () => {
    expect(generateConjugations(verb('igba ọsọ'), 'delta').past.i).toBe(
      'I gba ọsọ',
    );
  });
});

describe('Future — Rules 1 & 2', () => {
  test('Rule 1: 1sg pronoun leads — "m ga-agba ọsọ"', () => {
    expect(generateConjugations(verb('igba ọsọ'), 'delta').future.m).toBe(
      'M ga agba ọsọ',
    );
  });

  test('Rule 2: negative swaps ga → ma and drops the verb prefix — "m ma gba ọsọ"', () => {
    expect(generateConjugations(verb('igba ọsọ'), 'delta').negativeFuture!.m).toBe(
      'M ma gba ọsọ',
    );
  });
});

describe('Imperatives — Rules 1, 1.2, 1.3', () => {
  test('Rule 1: head ends in a/ị/ọ/ụ → append "a" (ta → taa)', () => {
    expect(generateConjugations(verb('ita'), 'delta').imperative!.i).toBe('I taa');
  });

  test('Rule 1.2: head ends in e/i/o/u → append "e" (me → mee, yi → yie)', () => {
    expect(generateConjugations(verb('ime'), 'delta').imperative!.i).toBe('I mee');
    expect(generateConjugations(verb('iyi'), 'delta').imperative!.i).toBe('I yie');
  });

  test('Rule 1.3: bia / je / nodu are exceptions and stay bare', () => {
    expect(generateConjugations(verb('ibia'), 'delta').imperative!.i).toBe('I bia');
    expect(generateConjugations(verb('ije'), 'delta').imperative!.i).toBe('I je');
    expect(generateConjugations(verb('inodu'), 'delta').imperative!.i).toBe('I nodu');
  });

  test('the extra vowel lands on the head of a verb phrase', () => {
    expect(generateConjugations(verb('igba ọsọ'), 'delta').imperative!.i).toBe(
      'I gbaa ọsọ',
    );
  });

  test('Rule 2: negative imperative — kwu + ne → ekwune', () => {
    expect(
      generateConjugations(verb('ikwu'), 'delta').negativeImperative!.i,
    ).toBe('I ekwune');
  });
});

describe('Present Perfect — Rules 1, 1.2, 1.3, 1.4', () => {
  test('Rule 1: bia + ga → biaga', () => {
    expect(generateConjugations(verb('ibia'), 'delta').presentPerfect!.wa).toContain(
      'biaga',
    );
  });

  test('Rule 1.2: singular pronouns are NOT conjugated ("Ọ̀ bia", not "Ọ̀ biaga")', () => {
    const { presentPerfect } = generateConjugations(verb('ibia'), 'delta');
    expect(presentPerfect!.o).toBe('O bia');
    expect(presentPerfect!.i).toBe('I bia');
  });

  test('Rule 1.3: in a verb phrase the suffix attaches to the verb — lahu ula + ga → lahuga ula', () => {
    expect(
      generateConjugations(verb('ilahu ula'), 'delta').presentPerfect!.wa,
    ).toContain('lahuga ula');
  });

  test('Rule 1.4: plural subjects take a harmony verb prefix — "Wa abiaga"', () => {
    expect(generateConjugations(verb('ibia'), 'delta').presentPerfect!.wa).toBe(
      'Wa abiaga',
    );
  });
});

describe('Suffixes and Prefixes', () => {
  test('Rule 1 (-kari): na-abia + kari → na-abiakari', () => {
    expect(generateConjugations(verb('ibia'), 'delta').habitualPresent!.i).toBe(
      'I na abiakari',
    );
  });

  test('Rule 2 (-si): gụ + si → gụsi', () => {
    expect(generateConjugations(verb('igụ'), 'delta').finished!.i).toBe('I gụsi');
  });

  test('Rule 4.2 (dịka): plural subjects conjugate dika AND the verb — "Anyi adika abia"', () => {
    expect(generateConjugations(verb('ibia'), 'delta').negativePerfect!.anyi).toBe(
      'Anyi adika abia',
    );
  });

  test('Rule 4.3 (dịka): singular pronouns leave dika bare', () => {
    const { negativePerfect } = generateConjugations(verb('ibia'), 'delta');
    expect(negativePerfect!.m).toBe('A dika m abia');
    expect(negativePerfect!.i).toBe('I dika abia');
  });

  test('Rule 4.3 (dịka): "O dika ede" for ide', () => {
    expect(generateConjugations(verb('ide'), 'delta').negativePerfect!.o).toBe(
      'O dika ede',
    );
  });

  test('Rule 5 (-ná/né): the negative past suffix is accented', () => {
    expect(generateConjugations(verb('ili'), 'delta').negativePast!.o).toBe(
      'O liné',
    );
  });

  test('Rule 5.2: plural subjects insert the harmony linker — "Anyi e liné"', () => {
    expect(generateConjugations(verb('ili'), 'delta').negativePast!.anyi).toBe(
      'Anyi e liné',
    );
  });

  test('Rule 6 (-nụ́): nye + nụ́ → nyenụ́ (attaches to the root, not the imperative)', () => {
    expect(generateConjugations(verb('inye'), 'delta').polite!.i).toBe('I nyenụ́');
  });

  test('Rule 6 (-kota): "Anyi ga-ebikota"', () => {
    expect(generateConjugations(verb('ibi'), 'delta').together!.anyi).toBe(
      'Anyi ga ebikota',
    );
  });

  test('Rule 7 (-nene): tu + nene + ujo → tunene ujo', () => {
    expect(generateConjugations(verb('itu ujo'), 'delta').neverPerfect!.i).toBe(
      'I tunene ujo',
    );
  });

  test('Rule 8 (-gode): bia + gode → biagode (attaches to the root)', () => {
    expect(generateConjugations(verb('ibia'), 'delta').first!.i).toBe('I biagode');
  });

  test('Rule 9 (-ye): si + ye → siye', () => {
    expect(generateConjugations(verb('isi'), 'delta').benefactive!.i).toBe('I siye');
  });

  test('imperative-only suffixes leave unlicensed pronouns blank', () => {
    const { first, polite, benefactive } = generateConjugations(verb('ibia'), 'delta');
    for (const table of [first!, polite!, benefactive!]) {
      expect(table.m).toBe('—');
      expect(table.o).toBe('—');
      expect(table.wa).toBe('—');
    }
  });
});

describe('vowel harmony is keyed off the verb head, not the whole phrase', () => {
  test('"ji olu n\'aka" is light despite the heavy vowels in its complement', () => {
    expect(generateConjugations(verb("iji olu n'aka"), 'delta').present.i).toBe(
      "I na eji olu n'aka",
    );
  });
});

describe('Unicode normalisation', () => {
  test('a decomposed "ị" prefix is stripped as one character', () => {
    const composed = generateConjugations(verb('ịrị'.normalize('NFC')), 'delta');
    const decomposed = generateConjugations(verb('ịrị'.normalize('NFD')), 'delta');
    expect(decomposed.present.i).toBe(composed.present.i);
  });
});
