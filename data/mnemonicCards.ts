export interface MnemonicCard {
  id: string;
  title: string;
  subtitle: string;
  mnemonic: string;
  colors: string[];
  verbs: {
    igbo: string;
    english: string;
    pronunciation: string;
  }[];
}

// Mnemonic flashcards for grouping similar-sounding or related Igbo verbs
export const mnemonicCards: MnemonicCard[] = [
  {
    id: 'movement-verbs',
    title: 'Movement Magic',
    subtitle: 'Verbs of Going & Coming',
    colors: ['#3b82f6', '#1d4ed8'],
    mnemonic: 'Remember: "I JE (go) to GET something, then I COME BACK home." Think of movement as a circle - you GO somewhere and then COME back.',
    verbs: [
      { igbo: 'ije', english: 'to go', pronunciation: 'ee-jay' },
      { igbo: 'ibia', english: 'to come', pronunciation: 'ee-bee-ah' },
      { igbo: 'ilaghachi', english: 'to return', pronunciation: 'ee-lah-gah-chee' },
      { igbo: 'igbafe', english: 'to cross over', pronunciation: 'ee-gbah-fay' },
    ],
  },
  {
    id: 'eating-drinking',
    title: 'Food & Drink Friends',
    subtitle: 'Verbs for Eating & Drinking',
    colors: ['#10b981', '#059669'],
    mnemonic: 'Think: "I RI (eat) rice, then I NU (drink) water." The sounds RI and NU flow together like eating and drinking!',
    verbs: [
      { igbo: 'iri', english: 'to eat', pronunciation: 'ee-ree' },
      { igbo: 'inu', english: 'to drink', pronunciation: 'ee-noo' },
      { igbo: 'ita', english: 'to chew', pronunciation: 'ee-tah' },
      { igbo: 'imicha', english: 'to swallow', pronunciation: 'ee-mee-chah' },
    ],
  },
  {
    id: 'communication-verbs',
    title: 'Communication Crew',
    subtitle: 'Verbs for Speaking & Hearing',
    colors: ['#8b5cf6', '#7c3aed'],
    mnemonic: 'Remember: "KWU (speak) your truth, then NU (hear) the response." Communication is about speaking AND listening!',
    verbs: [
      { igbo: 'ikwu', english: 'to speak/say', pronunciation: 'ee-kwoo' },
      { igbo: 'inu', english: 'to hear', pronunciation: 'ee-noo' },
      { igbo: 'iti', english: 'to call', pronunciation: 'ee-tee' },
      { igbo: 'iza', english: 'to answer', pronunciation: 'ee-zah' },
    ],
  },
  {
    id: 'learning-verbs',
    title: 'Learning Legends',
    subtitle: 'Verbs for Education & Knowledge',
    colors: ['#f59e0b', '#d97706'],
    mnemonic: 'Think: "I GU (read) to learn, then I DE (write) what I know." Reading and writing are learning partners!',
    verbs: [
      { igbo: 'igu', english: 'to read/count', pronunciation: 'ee-goo' },
      { igbo: 'ide', english: 'to write', pronunciation: 'ee-day' },
      { igbo: 'imu', english: 'to know/learn', pronunciation: 'ee-moo' },
      { igbo: 'ikuzi', english: 'to teach', pronunciation: 'ee-koo-zee' },
    ],
  },
  {
    id: 'action-verbs',
    title: 'Action Squad',
    subtitle: 'Verbs for Doing & Making',
    colors: ['#ef4444', '#dc2626'],
    mnemonic: 'Remember: "I ME (do) work, then I WU (build) something." Actions create results!',
    verbs: [
      { igbo: 'ime', english: 'to do/make', pronunciation: 'ee-may' },
      { igbo: 'iwu', english: 'to build', pronunciation: 'ee-woo' },
      { igbo: 'iru', english: 'to work', pronunciation: 'ee-roo' },
      { igbo: 'itinye', english: 'to put/place', pronunciation: 'ee-teen-yay' },
    ],
  },
  {
    id: 'emotion-verbs',
    title: 'Feeling Friends',
    subtitle: 'Verbs for Emotions',
    colors: ['#ec4899', '#db2777'],
    mnemonic: 'Think: "I HU (love) deeply, I CHI (laugh) loudly, I BE (cry) softly." Emotions have different intensities!',
    verbs: [
      { igbo: 'ihu', english: 'to love', pronunciation: 'ee-hoo' },
      { igbo: 'ichi', english: 'to laugh', pronunciation: 'ee-chee' },
      { igbo: 'ibe', english: 'to cry', pronunciation: 'ee-bay' },
      { igbo: 'iwe', english: 'to be angry', pronunciation: 'ee-way' },
    ],
  },
  {
    id: 'sense-verbs',
    title: 'Sense Squad',
    subtitle: 'Verbs for the Five Senses',
    colors: ['#06b6d4', '#0891b2'],
    mnemonic: 'Remember: "I LE (see) with eyes, I NU (hear) with ears, I NWE (feel) with hands." Each sense has its verb!',
    verbs: [
      { igbo: 'ile', english: 'to see/look', pronunciation: 'ee-lay' },
      { igbo: 'inu', english: 'to hear', pronunciation: 'ee-noo' },
      { igbo: 'inwe', english: 'to feel/have', pronunciation: 'ee-nway' },
      { igbo: 'isi', english: 'to smell', pronunciation: 'ee-see' },
    ],
  },
  {
    id: 'daily-routine',
    title: 'Daily Routine Rockstars',
    subtitle: 'Verbs for Everyday Activities',
    colors: ['#84cc16', '#65a30d'],
    mnemonic: 'Think of your day: "I TETA (wake up), I SA (wash), I YI (wear clothes), I RA (sleep)." Your daily rhythm!',
    verbs: [
      { igbo: 'iteta', english: 'to wake up', pronunciation: 'ee-tay-tah' },
      { igbo: 'isa', english: 'to wash', pronunciation: 'ee-sah' },
      { igbo: 'iyi', english: 'to wear', pronunciation: 'ee-yee' },
      { igbo: 'ira', english: 'to sleep', pronunciation: 'ee-rah' },
    ],
  },
];

export const getMnemonicCardById = (id: string): MnemonicCard | undefined => {
  return mnemonicCards.find(card => card.id === id);
};

export const getRandomMnemonicCard = (): MnemonicCard => {
  const randomIndex = Math.floor(Math.random() * mnemonicCards.length);
  return mnemonicCards[randomIndex];
};

export const getMnemonicCardsByVerb = (verbInfinitive: string): MnemonicCard[] => {
  return mnemonicCards.filter(card => 
    card.verbs.some(verb => verb.igbo === verbInfinitive)
  );
};