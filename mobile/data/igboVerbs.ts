import { IgboVerb } from '@/models/verb';

/**
 * Offline seed verbs used when no network connection or cache is available.
 *
 * Each entry includes a `rootForm` — the bare stem after stripping the
 * infinitive 'i-' prefix — so the conjugation engine can derive forms
 * reliably without re-applying the strip heuristic to the `igbo` field.
 *
 * Verb selection: the 10 most frequent, beginner-level Igbo verbs, covering
 * a range of vowel-harmony classes (front-vowel and back-vowel stems).
 */
export const offlineVerbs: IgboVerb[] = [
  {
    id: 'ije',
    igbo: 'ije',
    rootForm: 'je',
    english: 'to go',
    type: 'irregular',
    difficulty: 'beginner',
    frequency: 'high',
    examples: [
      { igbo: 'Ana m aga ahia', english: 'I am going to the market' },
      { igbo: 'Agaara m ulo akwukwo', english: 'I went to school' },
    ],
  },
  {
    id: 'iri',
    igbo: 'irị',
    rootForm: 'rị',
    english: 'to eat',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
  },
  {
    id: 'ibia',
    igbo: 'ibia',
    rootForm: 'bia',
    english: 'to come',
    type: 'irregular',
    frequency: 'high',
    difficulty: 'beginner',
    examples: [
      { igbo: 'Ana m abia ugbu a', english: 'I am coming now' },
      { igbo: 'Biara m ulo', english: 'I came home' },
    ],
  },
  {
    id: 'ikwu',
    igbo: 'ikwu',
    rootForm: 'kwu',
    english: 'to say/speak',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
    examples: [
      { igbo: 'Ana m ekwu eziokwu', english: 'I am telling the truth' },
      { igbo: 'Kwuru m ya', english: 'I said it' },
    ],
  },
  {
    id: 'ile',
    igbo: 'ile',
    rootForm: 'le',
    english: 'to see/look',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
    examples: [
      { igbo: 'Ana m ele TV', english: 'I am watching TV' },
      { igbo: 'Lere m ya', english: 'I saw it' },
    ],
  },
  {
    id: 'ime',
    igbo: 'ime',
    rootForm: 'me',
    english: 'to do/make',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
    examples: [
      { igbo: 'Ana m eme oru', english: 'I am working' },
      { igbo: 'Mere m ya', english: 'I did it' },
    ],
  },
  {
    id: 'inu',
    igbo: 'inu',
    rootForm: 'nu',
    english: 'to drink',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
    examples: [
      { igbo: 'Ana m anu mmiri', english: 'I am drinking water' },
      { igbo: 'Nuru m oka', english: 'I drank corn beer' },
    ],
  },
  {
    id: 'ira',
    igbo: 'ira',
    rootForm: 'ra',
    english: 'to buy',
    type: 'regular',
    frequency: 'medium',
    difficulty: 'beginner',
  },
  {
    id: 'igu',
    igbo: 'igu',
    rootForm: 'gu',
    english: 'to read/count',
    type: 'regular',
    frequency: 'medium',
    difficulty: 'intermediate',
  },
  {
    id: 'ide',
    igbo: 'ide',
    rootForm: 'de',
    english: 'to write',
    type: 'regular',
    frequency: 'medium',
    difficulty: 'intermediate',
  },
];

// Note: This file is the offline seed store only. If the app cannot reach the
// backend and has no cached verbs, `verbService` will seed from this list.
