export interface IgboVerb {
  id: string;
  infinitive: string;
  meaning: string;
  type: 'regular' | 'irregular';
  frequency: 'high' | 'medium' | 'low';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  conjugations: {
    present: {
      m: string;    // I
      i: string;    // You (singular)
      o: string;    // He/She/It
      anyi: string; // We
      unu: string;  // You (plural)
      ha: string;   // They
    };
    past: {
      m: string;
      i: string;
      o: string;
      anyi: string;
      unu: string;
      ha: string;
    };
    future: {
      m: string;
      i: string;
      o: string;
      anyi: string;
      unu: string;
      ha: string;
    };
    subjunctive: {
      m: string;
      i: string;
      o: string;
      anyi: string;
      unu: string;
      ha: string;
    };
  };
  examples?: {
    igbo: string;
    english: string;
  }[];
}

// Core Igbo verbs database with authentic conjugations
export const igboVerbs: IgboVerb[] = [
  {
    id: 'ije',
    infinitive: 'ije',
    meaning: 'to go',
    type: 'irregular',
    frequency: 'high',
    difficulty: 'beginner',
    conjugations: {
      present: {
        m: 'ana m aga',
        i: 'ana i aga',
        o: 'ana o aga',
        anyi: 'ana anyi aga',
        unu: 'ana unu aga',
        ha: 'ana ha aga',
      },
      past: {
        m: 'agaara m',
        i: 'agaara i',
        o: 'agaara o',
        anyi: 'agaara anyi',
        unu: 'agaara unu',
        ha: 'agaara ha',
      },
      future: {
        m: 'aga m aga',
        i: 'aga i aga',
        o: 'ga o aga',
        anyi: 'aga anyi aga',
        unu: 'aga unu aga',
        ha: 'ga ha aga',
      },
      subjunctive: {
        m: 'ka m gaa',
        i: 'ka i gaa',
        o: 'ka o gaa',
        anyi: 'ka anyi gaa',
        unu: 'ka unu gaa',
        ha: 'ka ha gaa',
      },
    },
    examples: [
      { igbo: 'Ana m aga ahia', english: 'I am going to the market' },
      { igbo: 'Agaara m ulo akwukwo', english: 'I went to school' },
    ],
  },
  {
    id: 'iri',
    infinitive: 'iri',
    meaning: 'to eat',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
    conjugations: {
      present: {
        m: 'ana m eri',
        i: 'ana i eri',
        o: 'ana o eri',
        anyi: 'ana anyi eri',
        unu: 'ana unu eri',
        ha: 'ana ha eri',
      },
      past: {
        m: 'riri m',
        i: 'riri i',
        o: 'riri o',
        anyi: 'riri anyi',
        unu: 'riri unu',
        ha: 'riri ha',
      },
      future: {
        m: 'aga m eri',
        i: 'aga i eri',
        o: 'ga o eri',
        anyi: 'aga anyi eri',
        unu: 'aga unu eri',
        ha: 'ga ha eri',
      },
      subjunctive: {
        m: 'ka m rie',
        i: 'ka i rie',
        o: 'ka o rie',
        anyi: 'ka anyi rie',
        unu: 'ka unu rie',
        ha: 'ka ha rie',
      },
    },
    examples: [
      { igbo: 'Ana m eri ji', english: 'I am eating yam' },
      { igbo: 'Riri m nri', english: 'I ate food' },
    ],
  },
  {
    id: 'ibia',
    infinitive: 'ibia',
    meaning: 'to come',
    type: 'irregular',
    frequency: 'high',
    difficulty: 'beginner',
    conjugations: {
      present: {
        m: 'ana m abia',
        i: 'ana i abia',
        o: 'ana o abia',
        anyi: 'ana anyi abia',
        unu: 'ana unu abia',
        ha: 'ana ha abia',
      },
      past: {
        m: 'biara m',
        i: 'biara i',
        o: 'biara o',
        anyi: 'biara anyi',
        unu: 'biara unu',
        ha: 'biara ha',
      },
      future: {
        m: 'aga m abia',
        i: 'aga i abia',
        o: 'ga o abia',
        anyi: 'aga anyi abia',
        unu: 'aga unu abia',
        ha: 'ga ha abia',
      },
      subjunctive: {
        m: 'ka m bia',
        i: 'ka i bia',
        o: 'ka o bia',
        anyi: 'ka anyi bia',
        unu: 'ka unu bia',
        ha: 'ka ha bia',
      },
    },
    examples: [
      { igbo: 'Ana m abia ugbu a', english: 'I am coming now' },
      { igbo: 'Biara m ulo', english: 'I came home' },
    ],
  },
  {
    id: 'ikwu',
    infinitive: 'ikwu',
    meaning: 'to say/speak',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
    conjugations: {
      present: {
        m: 'ana m ekwu',
        i: 'ana i ekwu',
        o: 'ana o ekwu',
        anyi: 'ana anyi ekwu',
        unu: 'ana unu ekwu',
        ha: 'ana ha ekwu',
      },
      past: {
        m: 'kwuru m',
        i: 'kwuru i',
        o: 'kwuru o',
        anyi: 'kwuru anyi',
        unu: 'kwuru unu',
        ha: 'kwuru ha',
      },
      future: {
        m: 'aga m ekwu',
        i: 'aga i ekwu',
        o: 'ga o ekwu',
        anyi: 'aga anyi ekwu',
        unu: 'aga unu ekwu',
        ha: 'ga ha ekwu',
      },
      subjunctive: {
        m: 'ka m kwue',
        i: 'ka i kwue',
        o: 'ka o kwue',
        anyi: 'ka anyi kwue',
        unu: 'ka unu kwue',
        ha: 'ka ha kwue',
      },
    },
    examples: [
      { igbo: 'Ana m ekwu eziokwu', english: 'I am telling the truth' },
      { igbo: 'Kwuru m ya', english: 'I said it' },
    ],
  },
  {
    id: 'ile',
    infinitive: 'ile',
    meaning: 'to see/look',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
    conjugations: {
      present: {
        m: 'ana m ele',
        i: 'ana i ele',
        o: 'ana o ele',
        anyi: 'ana anyi ele',
        unu: 'ana unu ele',
        ha: 'ana ha ele',
      },
      past: {
        m: 'lere m',
        i: 'lere i',
        o: 'lere o',
        anyi: 'lere anyi',
        unu: 'lere unu',
        ha: 'lere ha',
      },
      future: {
        m: 'aga m ele',
        i: 'aga i ele',
        o: 'ga o ele',
        anyi: 'aga anyi ele',
        unu: 'aga unu ele',
        ha: 'ga ha ele',
      },
      subjunctive: {
        m: 'ka m lee',
        i: 'ka i lee',
        o: 'ka o lee',
        anyi: 'ka anyi lee',
        unu: 'ka unu lee',
        ha: 'ka ha lee',
      },
    },
    examples: [
      { igbo: 'Ana m ele TV', english: 'I am watching TV' },
      { igbo: 'Lere m ya', english: 'I saw it' },
    ],
  },
  {
    id: 'ime',
    infinitive: 'ime',
    meaning: 'to do/make',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
    conjugations: {
      present: {
        m: 'ana m eme',
        i: 'ana i eme',
        o: 'ana o eme',
        anyi: 'ana anyi eme',
        unu: 'ana unu eme',
        ha: 'ana ha eme',
      },
      past: {
        m: 'mere m',
        i: 'mere i',
        o: 'mere o',
        anyi: 'mere anyi',
        unu: 'mere unu',
        ha: 'mere ha',
      },
      future: {
        m: 'aga m eme',
        i: 'aga i eme',
        o: 'ga o eme',
        anyi: 'aga anyi eme',
        unu: 'aga unu eme',
        ha: 'ga ha eme',
      },
      subjunctive: {
        m: 'ka m mee',
        i: 'ka i mee',
        o: 'ka o mee',
        anyi: 'ka anyi mee',
        unu: 'ka unu mee',
        ha: 'ka ha mee',
      },
    },
    examples: [
      { igbo: 'Ana m eme oru', english: 'I am working' },
      { igbo: 'Mere m ya', english: 'I did it' },
    ],
  },
  {
    id: 'inu',
    infinitive: 'inu',
    meaning: 'to drink',
    type: 'regular',
    frequency: 'high',
    difficulty: 'beginner',
    conjugations: {
      present: {
        m: 'ana m anu',
        i: 'ana i anu',
        o: 'ana o anu',
        anyi: 'ana anyi anu',
        unu: 'ana unu anu',
        ha: 'ana ha anu',
      },
      past: {
        m: 'nuru m',
        i: 'nuru i',
        o: 'nuru o',
        anyi: 'nuru anyi',
        unu: 'nuru unu',
        ha: 'nuru ha',
      },
      future: {
        m: 'aga m anu',
        i: 'aga i anu',
        o: 'ga o anu',
        anyi: 'aga anyi anu',
        unu: 'aga unu anu',
        ha: 'ga ha anu',
      },
      subjunctive: {
        m: 'ka m nue',
        i: 'ka i nue',
        o: 'ka o nue',
        anyi: 'ka anyi nue',
        unu: 'ka unu nue',
        ha: 'ka ha nue',
      },
    },
    examples: [
      { igbo: 'Ana m anu mmiri', english: 'I am drinking water' },
      { igbo: 'Nuru m oka', english: 'I drank corn beer' },
    ],
  },
  {
    id: 'ira',
    infinitive: 'ira',
    meaning: 'to buy',
    type: 'regular',
    frequency: 'medium',
    difficulty: 'beginner',
    conjugations: {
      present: {
        m: 'ana m azuru',
        i: 'ana i azuru',
        o: 'ana o azuru',
        anyi: 'ana anyi azuru',
        unu: 'ana unu azuru',
        ha: 'ana ha azuru',
      },
      past: {
        m: 'zuru m',
        i: 'zuru i',
        o: 'zuru o',
        anyi: 'zuru anyi',
        unu: 'zuru unu',
        ha: 'zuru ha',
      },
      future: {
        m: 'aga m azuru',
        i: 'aga i azuru',
        o: 'ga o azuru',
        anyi: 'aga anyi azuru',
        unu: 'aga unu azuru',
        ha: 'ga ha azuru',
      },
      subjunctive: {
        m: 'ka m zurue',
        i: 'ka i zurue',
        o: 'ka o zurue',
        anyi: 'ka anyi zurue',
        unu: 'ka unu zurue',
        ha: 'ka ha zurue',
      },
    },
    examples: [
      { igbo: 'Ana m azuru akwa', english: 'I am buying clothes' },
      { igbo: 'Zuru m nri', english: 'I bought food' },
    ],
  },
  {
    id: 'igu',
    infinitive: 'igu',
    meaning: 'to read/count',
    type: 'regular',
    frequency: 'medium',
    difficulty: 'intermediate',
    conjugations: {
      present: {
        m: 'ana m agu',
        i: 'ana i agu',
        o: 'ana o agu',
        anyi: 'ana anyi agu',
        unu: 'ana unu agu',
        ha: 'ana ha agu',
      },
      past: {
        m: 'guru m',
        i: 'guru i',
        o: 'guru o',
        anyi: 'guru anyi',
        unu: 'guru unu',
        ha: 'guru ha',
      },
      future: {
        m: 'aga m agu',
        i: 'aga i agu',
        o: 'ga o agu',
        anyi: 'aga anyi agu',
        unu: 'aga unu agu',
        ha: 'ga ha agu',
      },
      subjunctive: {
        m: 'ka m gue',
        i: 'ka i gue',
        o: 'ka o gue',
        anyi: 'ka anyi gue',
        unu: 'ka unu gue',
        ha: 'ka ha gue',
      },
    },
    examples: [
      { igbo: 'Ana m agu akwukwo', english: 'I am reading a book' },
      { igbo: 'Guru m ego', english: 'I counted money' },
    ],
  },
  {
    id: 'ide',
    infinitive: 'ide',
    meaning: 'to write',
    type: 'regular',
    frequency: 'medium',
    difficulty: 'intermediate',
    conjugations: {
      present: {
        m: 'ana m ede',
        i: 'ana i ede',
        o: 'ana o ede',
        anyi: 'ana anyi ede',
        unu: 'ana unu ede',
        ha: 'ana ha ede',
      },
      past: {
        m: 'dere m',
        i: 'dere i',
        o: 'dere o',
        anyi: 'dere anyi',
        unu: 'dere unu',
        ha: 'dere ha',
      },
      future: {
        m: 'aga m ede',
        i: 'aga i ede',
        o: 'ga o ede',
        anyi: 'aga anyi ede',
        unu: 'aga unu ede',
        ha: 'ga ha ede',
      },
      subjunctive: {
        m: 'ka m dee',
        i: 'ka i dee',
        o: 'ka o dee',
        anyi: 'ka anyi dee',
        unu: 'ka unu dee',
        ha: 'ka ha dee',
      },
    },
    examples: [
      { igbo: 'Ana m ede leta', english: 'I am writing a letter' },
      { igbo: 'Dere m aha m', english: 'I wrote my name' },
    ],
  },
];

// Utility functions for working with verbs
export const getRandomVerb = (): IgboVerb => {
  const randomIndex = Math.floor(Math.random() * igboVerbs.length);
  return igboVerbs[randomIndex];
};

export const getVerbsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): IgboVerb[] => {
  return igboVerbs.filter(verb => verb.difficulty === difficulty);
};

export const getVerbsByFrequency = (frequency: 'high' | 'medium' | 'low'): IgboVerb[] => {
  return igboVerbs.filter(verb => verb.frequency === frequency);
};

export const checkConjugation = (userAnswer: string, correctAnswer: string): boolean => {
  // Remove extra spaces and convert to lowercase for comparison
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();
  
  // Allow for minor variations in spacing and tone marks
  return normalizedUser === normalizedCorrect || 
         normalizedUser.replace(/\s+/g, ' ') === normalizedCorrect.replace(/\s+/g, ' ');
};

export const searchVerbs = (query: string): IgboVerb[] => {
  const lowercaseQuery = query.toLowerCase();
  return igboVerbs.filter(verb => 
    verb.infinitive.toLowerCase().includes(lowercaseQuery) ||
    verb.meaning.toLowerCase().includes(lowercaseQuery)
  );
};