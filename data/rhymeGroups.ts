export interface RhymeGroup {
  id: string;
  pattern: string;
  description: string;
  verbs: {
    id: string;
    infinitive: string;
    meaning: string;
    mnemonic: string;
  }[];
}

export const rhymeGroups: RhymeGroup[] = [
  {
    id: 'i-ending',
    pattern: '-i endings',
    description: 'Verbs ending in -i sound',
    verbs: [
      {
        id: 'iri',
        infinitive: 'iri',
        meaning: 'to eat',
        mnemonic: 'I eat rice (iri → eri)',
      },
      {
        id: 'ile',
        infinitive: 'ile',
        meaning: 'to see',
        mnemonic: 'I see light (ile → ele)',
      },
      {
        id: 'ime',
        infinitive: 'ime',
        meaning: 'to do',
        mnemonic: 'I make everything (ime → eme)',
      },
      {
        id: 'inu',
        infinitive: 'inu',
        meaning: 'to drink',
        mnemonic: 'I need water (inu → anu)',
      },
    ],
  },
  {
    id: 'kw-sounds',
    pattern: 'kw- sounds',
    description: 'Verbs with kw consonant clusters',
    verbs: [
      {
        id: 'ikwu',
        infinitive: 'ikwu',
        meaning: 'to say/speak',
        mnemonic: 'Keep the kw sound (ikwu → ekwu)',
      },
      {
        id: 'ikwa',
        infinitive: 'ikwa',
        meaning: 'to cry',
        mnemonic: 'Crying keeps the kw (ikwa → ekwa)',
      },
    ],
  },
  {
    id: 'motion-verbs',
    pattern: 'Motion verbs',
    description: 'Verbs describing movement with irregular patterns',
    verbs: [
      {
        id: 'ije',
        infinitive: 'ije',
        meaning: 'to go',
        mnemonic: 'Going changes completely (je → ga)',
      },
      {
        id: 'ibia',
        infinitive: 'ibia',
        meaning: 'to come',
        mnemonic: 'Coming drops the i (ibia → bia)',
      },
    ],
  },
  {
    id: 'a-endings',
    pattern: '-a endings',
    description: 'Verbs ending in -a sound',
    verbs: [
      {
        id: 'isa',
        infinitive: 'isa',
        meaning: 'to wash',
        mnemonic: 'Washing stays the same (isa → asa)',
      },
      {
        id: 'ira',
        infinitive: 'ira',
        meaning: 'to buy',
        mnemonic: 'Buying changes to z (ira → azụ)',
      },
    ],
  },
  {
    id: 'u-endings',
    pattern: '-u endings',
    description: 'Verbs ending in -u sound',
    verbs: [
      {
        id: 'iru',
        infinitive: 'iru',
        meaning: 'to work',
        mnemonic: 'Working drops the i (iru → aru)',
      },
      {
        id: 'itu',
        infinitive: 'itu',
        meaning: 'to carry',
        mnemonic: 'Carrying becomes bu (itu → ebu)',
      },
    ],
  },
];

export const getRhymeGroupById = (id: string): RhymeGroup | undefined => {
  return rhymeGroups.find(group => group.id === id);
};

export const getVerbRhymeGroup = (verbId: string): RhymeGroup | undefined => {
  return rhymeGroups.find(group => 
    group.verbs.some(verb => verb.id === verbId)
  );
};