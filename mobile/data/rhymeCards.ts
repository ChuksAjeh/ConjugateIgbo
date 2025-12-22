export interface RhymeCard {
  id: string;
  title: string;
  rhymePattern: string;
  verbs: {
    igbo: string;
    english: string;
    pronunciation: string;
  }[];
}

// Igbo verb rhyme sets organized by similar sounds
export const rhymeCards: RhymeCard[] = [
  {
    id: 'i-ending',
    title: 'I Ending Sounds',
    rhymePattern: '-i',
    verbs: [
      { igbo: 'iri', english: 'to eat', pronunciation: 'ee-ree' },
      { igbo: 'iti', english: 'to call', pronunciation: 'ee-tee' },
      { igbo: 'idi', english: 'to be', pronunciation: 'ee-dee' },
      { igbo: 'igi', english: 'to cut', pronunciation: 'ee-gee' },
    ],
  },
  {
    id: 'e-ending',
    title: 'E Ending Sounds',
    rhymePattern: '-e',
    verbs: [
      { igbo: 'ime', english: 'to do', pronunciation: 'ee-me' },
      { igbo: 'ile', english: 'to see', pronunciation: 'ee-le' },
      { igbo: 'ire', english: 'to sell', pronunciation: 'ee-re' },
      { igbo: 'ise', english: 'to cook', pronunciation: 'ee-se' },
    ],
  },
  {
    id: 'u-sounds',
    title: 'U Ending Sounds',
    rhymePattern: '-u',
    verbs: [
      { igbo: 'iru', english: 'to work', pronunciation: 'ee-roo' },
      { igbo: 'inu', english: 'to drink', pronunciation: 'ee-noo' },
      { igbo: 'imu', english: 'to know', pronunciation: 'ee-moo' },
      { igbo: 'itu', english: 'to carry', pronunciation: 'ee-too' },
    ],
  },
  {
    id: 'a-ending',
    title: 'A Ending Sounds',
    rhymePattern: '-a',
    verbs: [
      { igbo: 'iga', english: 'to count', pronunciation: 'ee-ga' },
      { igbo: 'ira', english: 'to buy', pronunciation: 'ee-ra' },
      { igbo: 'isa', english: 'to wash', pronunciation: 'ee-sa' },
      { igbo: 'ita', english: 'to chew', pronunciation: 'ee-ta' },
    ],
  },
  {
    id: 'wa-ending',
    title: 'WA Ending Sounds',
    rhymePattern: '-wa',
    verbs: [
      { igbo: 'ikwa', english: 'to cry', pronunciation: 'ee-kwa' },
      { igbo: 'igwa', english: 'to tell', pronunciation: 'ee-gwa' },
      { igbo: 'ikpawa', english: 'to gather', pronunciation: 'ee-kpa-wa' },
    ],
  },
  {
    id: 'ba-ending',
    title: 'BA Ending Sounds',
    rhymePattern: '-ba',
    verbs: [
      { igbo: 'ibia', english: 'to come', pronunciation: 'ee-bee-a' },
      { igbo: 'igba', english: 'to run', pronunciation: 'ee-gba' },
      { igbo: 'ikpoba', english: 'to call', pronunciation: 'ee-kpo-ba' },
    ],
  },
  {
    id: 'o-ending',
    title: 'O Ending Sounds',
    rhymePattern: '-o',
    verbs: [
      { igbo: 'ilo', english: 'to tell', pronunciation: 'ee-lo' },
      { igbo: 'iro', english: 'to think', pronunciation: 'ee-ro' },
      { igbo: 'iso', english: 'to follow', pronunciation: 'ee-so' },
      { igbo: 'ito', english: 'to take', pronunciation: 'ee-to' },
    ],
  },
  {
    id: 'zu-ending',
    title: 'ZU Ending Sounds',
    rhymePattern: '-zu',
    verbs: [
      { igbo: 'izu', english: 'to steal', pronunciation: 'ee-zoo' },
      { igbo: 'ikuzu', english: 'to teach', pronunciation: 'ee-koo-zoo' },
      { igbo: 'isuzu', english: 'to whisper', pronunciation: 'ee-soo-zoo' },
    ],
  },
  {
    id: 'ghi-ending',
    title: 'GHI Ending Sounds',
    rhymePattern: '-ghi',
    verbs: [
      { igbo: 'ighi', english: 'to not know', pronunciation: 'ee-ghee' },
      {
        igbo: 'ikpughi',
        english: 'to not carry',
        pronunciation: 'ee-kpu-ghee',
      },
      { igbo: 'irighi', english: 'to not eat', pronunciation: 'ee-ree-ghee' },
    ],
  },
  {
    id: 'nye-ending',
    title: 'NYE Ending Sounds',
    rhymePattern: '-nye',
    verbs: [
      { igbo: 'itinye', english: 'to put', pronunciation: 'ee-teen-ye' },
      { igbo: 'ikenye', english: 'to share', pronunciation: 'ee-ken-ye' },
      {
        igbo: 'iweghachiye',
        english: 'to return',
        pronunciation: 'ee-we-gha-chee-ye',
      },
    ],
  },
];

export const getRhymeCardById = (id: string): RhymeCard | undefined => {
  return rhymeCards.find((card) => card.id === id);
};

export const getRandomRhymeCard = (): RhymeCard => {
  const randomIndex = Math.floor(Math.random() * rhymeCards.length);
  return rhymeCards[randomIndex];
};

export const getTotalRhymeCards = (): number => {
  return rhymeCards.length;
};
