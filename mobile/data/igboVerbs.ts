import { IgboVerb } from '@/models/verb';

// Minimal offline verb list (first 10), used as seed when no network/cache
export const offlineVerbs: IgboVerb[] = [
  {
    id: 'ije',
    igbo: 'ije',
    english: 'to go',
    type: 'irregular',
    difficulty: 'beginner',
    // optional legacy label; backend uses freqRank instead
    frequency: 'high',
    examples: [
      { igbo: 'Ana m aga ahia', english: 'I am going to the market' },
      { igbo: 'Agaara m ulo akwukwo', english: 'I went to school' },
    ],
  },
  {
    id: 'iri',
    igbo: 'iri',
    english: 'to eat',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
  },
  {
    id: 'ibia',
    igbo: 'ibia',
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
    english: 'to buy',
    type: 'regular',
    frequency: 'medium',
    difficulty: 'beginner',
  },
  {
    id: 'igu',
    igbo: 'igu',
    english: 'to read/count',
    type: 'regular',
    frequency: 'medium',
    difficulty: 'intermediate',
  },
  {
    id: 'ide',
    igbo: 'ide',
    english: 'to write',
    type: 'regular',
    frequency: 'medium',
    difficulty: 'intermediate',
  },
];

// Note: This file acts solely as the offline seed store for verbs.
// If the app cannot fetch from the backend or has no cached verbs,
// `verbService` will seed from this `offlineVerbs` list.