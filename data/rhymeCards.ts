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
    id: 'ar-sounds',
    title: 'AR Sounds',
    rhymePattern: '-ar',
    verbs: [
      { igbo: 'fluir', english: 'to flow', pronunciation: 'floo-eer' },
      { igbo: 'flotar', english: 'to float', pronunciation: 'flo-tar' },
      { igbo: 'faltar', english: 'to lack', pronunciation: 'fal-tar' },
      { igbo: 'fallar', english: 'to fail', pronunciation: 'fal-yar' },
    ],
  },
  {
    id: 'er-sounds',
    title: 'ER Sounds',
    rhymePattern: '-er',
    verbs: [
      { igbo: 'imer', english: 'to eat', pronunciation: 'ee-mer' },
      { igbo: 'iler', english: 'to see', pronunciation: 'ee-ler' },
      { igbo: 'iker', english: 'to go', pronunciation: 'ee-ker' },
      { igbo: 'iner', english: 'to come', pronunciation: 'ee-ner' },
    ],
  },
  {
    id: 'u-sounds',
    title: 'U Sounds',
    rhymePattern: '-u',
    verbs: [
      { igbo: 'iru', english: 'to work', pronunciation: 'ee-roo' },
      { igbo: 'inu', english: 'to drink', pronunciation: 'ee-noo' },
      { igbo: 'imu', english: 'to know', pronunciation: 'ee-moo' },
      { igbo: 'itu', english: 'to carry', pronunciation: 'ee-too' },
    ],
  },
  {
    id: 'a-sounds',
    title: 'A Sounds',
    rhymePattern: '-a',
    verbs: [
      { igbo: 'iga', english: 'to go', pronunciation: 'ee-ga' },
      { igbo: 'ira', english: 'to buy', pronunciation: 'ee-ra' },
      { igbo: 'isa', english: 'to wash', pronunciation: 'ee-sa' },
      { igbo: 'ita', english: 'to chew', pronunciation: 'ee-ta' },
    ],
  },
  {
    id: 'e-sounds',
    title: 'E Sounds',
    rhymePattern: '-e',
    verbs: [
      { igbo: 'ime', english: 'to do', pronunciation: 'ee-me' },
      { igbo: 'ile', english: 'to see', pronunciation: 'ee-le' },
      { igbo: 'ire', english: 'to sell', pronunciation: 'ee-re' },
      { igbo: 'ise', english: 'to cook', pronunciation: 'ee-se' },
    ],
  },
  {
    id: 'i-sounds',
    title: 'I Sounds',
    rhymePattern: '-i',
    verbs: [
      { igbo: 'iri', english: 'to eat', pronunciation: 'ee-ree' },
      { igbo: 'iti', english: 'to call', pronunciation: 'ee-tee' },
      { igbo: 'idi', english: 'to be', pronunciation: 'ee-dee' },
      { igbo: 'igi', english: 'to cut', pronunciation: 'ee-gee' },
    ],
  },
  {
    id: 'o-sounds',
    title: 'O Sounds',
    rhymePattern: '-o',
    verbs: [
      { igbo: 'ilo', english: 'to say', pronunciation: 'ee-lo' },
      { igbo: 'iro', english: 'to think', pronunciation: 'ee-ro' },
      { igbo: 'iso', english: 'to follow', pronunciation: 'ee-so' },
      { igbo: 'ito', english: 'to take', pronunciation: 'ee-to' },
    ],
  },
  {
    id: 'wa-sounds',
    title: 'WA Sounds',
    rhymePattern: '-wa',
    verbs: [
      { igbo: 'ikwa', english: 'to cry', pronunciation: 'ee-kwa' },
      { igbo: 'igwa', english: 'to tell', pronunciation: 'ee-gwa' },
      { igbo: 'ikpawa', english: 'to gather', pronunciation: 'ee-kpa-wa' },
    ],
  },
  {
    id: 'ba-sounds',
    title: 'BA Sounds',
    rhymePattern: '-ba',
    verbs: [
      { igbo: 'ibia', english: 'to come', pronunciation: 'ee-bee-a' },
      { igbo: 'igba', english: 'to run', pronunciation: 'ee-gba' },
      { igbo: 'ikpoba', english: 'to call', pronunciation: 'ee-kpo-ba' },
    ],
  },
  {
    id: 'zu-sounds',
    title: 'ZU Sounds',
    rhymePattern: '-zu',
    verbs: [
      { igbo: 'izu', english: 'to steal', pronunciation: 'ee-zoo' },
      { igbo: 'ikuzu', english: 'to teach', pronunciation: 'ee-koo-zoo' },
      { igbo: 'isuzu', english: 'to whisper', pronunciation: 'ee-soo-zoo' },
    ],
  },
];

export const getRhymeCardById = (id: string): RhymeCard | undefined => {
  return rhymeCards.find(card => card.id === id);
};

export const getRandomRhymeCard = (): RhymeCard => {
  const randomIndex = Math.floor(Math.random() * rhymeCards.length);
  return rhymeCards[randomIndex];
};

export const getTotalRhymeCards = (): number => {
  return rhymeCards.length;
};