export type Dialect = 'delta' | 'central' | 'anambra' | 'imo';

export type AspectForm = 'imperfective' | 'perfective' | 'progressive' | 'habitual';

export interface VerbConjugation {
  pronoun: string;
  form: string;
  toneMarks: string;
}

export interface AspectConjugations {
  imperfective: VerbConjugation[];
  perfective: VerbConjugation[];
  progressive: VerbConjugation[];
  habitual: VerbConjugation[];
}

export interface IgboVerb {
  id: string;
  infinitive: string;
  meaning: string;
  patternFamily: string;
  mnemonic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frequency: 'high' | 'medium' | 'low';
  conjugations: {
    [key in Dialect]: AspectConjugations;
  };
  examples: {
    [key in Dialect]: {
      igbo: string;
      english: string;
      aspect: AspectForm;
    }[];
  };
  audioStub?: string; // For future audio implementation
  isPremium: boolean;
}

export interface PatternFamily {
  id: string;
  name: string;
  description: string;
  mnemonic: string;
  verbs: string[]; // verb IDs
}

// Sample dataset with ~100 Delta Igbo verbs + some locked Central Igbo samples
export const igboVerbs: IgboVerb[] = [
  {
    id: 'ije',
    infinitive: 'ije',
    meaning: 'to go',
    patternFamily: 'irregular-motion',
    mnemonic: 'Motion verbs change root: je → ga',
    difficulty: 'beginner',
    frequency: 'high',
    isPremium: false,
    conjugations: {
      delta: {
        imperfective: [
          { pronoun: 'm', form: 'ana m aga', toneMarks: 'àná m àgá' },
          { pronoun: 'i', form: 'ana i aga', toneMarks: 'àná ị àgá' },
          { pronoun: 'o', form: 'ana o aga', toneMarks: 'àná ọ àgá' },
          { pronoun: 'anyi', form: 'ana anyi aga', toneMarks: 'àná ànyị àgá' },
          { pronoun: 'unu', form: 'ana unu aga', toneMarks: 'àná ụnụ àgá' },
          { pronoun: 'ha', form: 'ana ha aga', toneMarks: 'àná há àgá' },
        ],
        perfective: [
          { pronoun: 'm', form: 'gara m', toneMarks: 'gàrà m' },
          { pronoun: 'i', form: 'gara i', toneMarks: 'gàrà ị' },
          { pronoun: 'o', form: 'gara o', toneMarks: 'gàrà ọ' },
          { pronoun: 'anyi', form: 'gara anyi', toneMarks: 'gàrà ànyị' },
          { pronoun: 'unu', form: 'gara unu', toneMarks: 'gàrà ụnụ' },
          { pronoun: 'ha', form: 'gara ha', toneMarks: 'gàrà há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-aga m', toneMarks: 'ná-àgá m' },
          { pronoun: 'i', form: 'na-aga i', toneMarks: 'ná-àgá ị' },
          { pronoun: 'o', form: 'na-aga o', toneMarks: 'ná-àgá ọ' },
          { pronoun: 'anyi', form: 'na-aga anyi', toneMarks: 'ná-àgá ànyị' },
          { pronoun: 'unu', form: 'na-aga unu', toneMarks: 'ná-àgá ụnụ' },
          { pronoun: 'ha', form: 'na-aga ha', toneMarks: 'ná-àgá há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-aga m mgbe niile', toneMarks: 'ná-àgá m mgbè níílé' },
          { pronoun: 'i', form: 'na-aga i mgbe niile', toneMarks: 'ná-àgá ị mgbè níílé' },
          { pronoun: 'o', form: 'na-aga o mgbe niile', toneMarks: 'ná-àgá ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-aga anyi mgbe niile', toneMarks: 'ná-àgá ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-aga unu mgbe niile', toneMarks: 'ná-àgá ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-aga ha mgbe niile', toneMarks: 'ná-àgá há mgbè níílé' },
        ],
      },
      central: {
        imperfective: [
          { pronoun: 'm', form: 'ana m eje', toneMarks: 'àná m èjé' },
          { pronoun: 'i', form: 'ana i eje', toneMarks: 'àná ị èjé' },
          { pronoun: 'o', form: 'ana o eje', toneMarks: 'àná ọ èjé' },
          { pronoun: 'anyi', form: 'ana anyi eje', toneMarks: 'àná ànyị èjé' },
          { pronoun: 'unu', form: 'ana unu eje', toneMarks: 'àná ụnụ èjé' },
          { pronoun: 'ha', form: 'ana ha eje', toneMarks: 'àná há èjé' },
        ],
        perfective: [
          { pronoun: 'm', form: 'jere m', toneMarks: 'jèrè m' },
          { pronoun: 'i', form: 'jere i', toneMarks: 'jèrè ị' },
          { pronoun: 'o', form: 'jere o', toneMarks: 'jèrè ọ' },
          { pronoun: 'anyi', form: 'jere anyi', toneMarks: 'jèrè ànyị' },
          { pronoun: 'unu', form: 'jere unu', toneMarks: 'jèrè ụnụ' },
          { pronoun: 'ha', form: 'jere ha', toneMarks: 'jèrè há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-eje m', toneMarks: 'ná-èjé m' },
          { pronoun: 'i', form: 'na-eje i', toneMarks: 'ná-èjé ị' },
          { pronoun: 'o', form: 'na-eje o', toneMarks: 'ná-èjé ọ' },
          { pronoun: 'anyi', form: 'na-eje anyi', toneMarks: 'ná-èjé ànyị' },
          { pronoun: 'unu', form: 'na-eje unu', toneMarks: 'ná-èjé ụnụ' },
          { pronoun: 'ha', form: 'na-eje ha', toneMarks: 'ná-èjé há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-eje m mgbe niile', toneMarks: 'ná-èjé m mgbè níílé' },
          { pronoun: 'i', form: 'na-eje i mgbe niile', toneMarks: 'ná-èjé ị mgbè níílé' },
          { pronoun: 'o', form: 'na-eje o mgbe niile', toneMarks: 'ná-èjé ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-eje anyi mgbe niile', toneMarks: 'ná-èjé ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-eje unu mgbe niile', toneMarks: 'ná-èjé ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-eje ha mgbe niile', toneMarks: 'ná-èjé há mgbè níílé' },
        ],
      },
      anambra: {
        imperfective: [
          { pronoun: 'm', form: 'ana m aga', toneMarks: 'àná m àgá' },
          { pronoun: 'i', form: 'ana i aga', toneMarks: 'àná ị àgá' },
          { pronoun: 'o', form: 'ana o aga', toneMarks: 'àná ọ àgá' },
          { pronoun: 'anyi', form: 'ana anyi aga', toneMarks: 'àná ànyị àgá' },
          { pronoun: 'unu', form: 'ana unu aga', toneMarks: 'àná ụnụ àgá' },
          { pronoun: 'ha', form: 'ana ha aga', toneMarks: 'àná há àgá' },
        ],
        perfective: [
          { pronoun: 'm', form: 'gara m', toneMarks: 'gàrà m' },
          { pronoun: 'i', form: 'gara i', toneMarks: 'gàrà ị' },
          { pronoun: 'o', form: 'gara o', toneMarks: 'gàrà ọ' },
          { pronoun: 'anyi', form: 'gara anyi', toneMarks: 'gàrà ànyị' },
          { pronoun: 'unu', form: 'gara unu', toneMarks: 'gàrà ụnụ' },
          { pronoun: 'ha', form: 'gara ha', toneMarks: 'gàrà há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-aga m', toneMarks: 'ná-àgá m' },
          { pronoun: 'i', form: 'na-aga i', toneMarks: 'ná-àgá ị' },
          { pronoun: 'o', form: 'na-aga o', toneMarks: 'ná-àgá ọ' },
          { pronoun: 'anyi', form: 'na-aga anyi', toneMarks: 'ná-àgá ànyị' },
          { pronoun: 'unu', form: 'na-aga unu', toneMarks: 'ná-àgá ụnụ' },
          { pronoun: 'ha', form: 'na-aga ha', toneMarks: 'ná-àgá há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-aga m mgbe niile', toneMarks: 'ná-àgá m mgbè níílé' },
          { pronoun: 'i', form: 'na-aga i mgbe niile', toneMarks: 'ná-àgá ị mgbè níílé' },
          { pronoun: 'o', form: 'na-aga o mgbe niile', toneMarks: 'ná-àgá ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-aga anyi mgbe niile', toneMarks: 'ná-àgá ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-aga unu mgbe niile', toneMarks: 'ná-àgá ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-aga ha mgbe niile', toneMarks: 'ná-àgá há mgbè níílé' },
        ],
      },
      imo: {
        imperfective: [
          { pronoun: 'm', form: 'ana m aga', toneMarks: 'àná m àgá' },
          { pronoun: 'i', form: 'ana i aga', toneMarks: 'àná ị àgá' },
          { pronoun: 'o', form: 'ana o aga', toneMarks: 'àná ọ àgá' },
          { pronoun: 'anyi', form: 'ana anyi aga', toneMarks: 'àná ànyị àgá' },
          { pronoun: 'unu', form: 'ana unu aga', toneMarks: 'àná ụnụ àgá' },
          { pronoun: 'ha', form: 'ana ha aga', toneMarks: 'àná há àgá' },
        ],
        perfective: [
          { pronoun: 'm', form: 'gara m', toneMarks: 'gàrà m' },
          { pronoun: 'i', form: 'gara i', toneMarks: 'gàrà ị' },
          { pronoun: 'o', form: 'gara o', toneMarks: 'gàrà ọ' },
          { pronoun: 'anyi', form: 'gara anyi', toneMarks: 'gàrà ànyị' },
          { pronoun: 'unu', form: 'gara unu', toneMarks: 'gàrà ụnụ' },
          { pronoun: 'ha', form: 'gara ha', toneMarks: 'gàrà há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-aga m', toneMarks: 'ná-àgá m' },
          { pronoun: 'i', form: 'na-aga i', toneMarks: 'ná-àgá ị' },
          { pronoun: 'o', form: 'na-aga o', toneMarks: 'ná-àgá ọ' },
          { pronoun: 'anyi', form: 'na-aga anyi', toneMarks: 'ná-àgá ànyị' },
          { pronoun: 'unu', form: 'na-aga unu', toneMarks: 'ná-àgá ụnụ' },
          { pronoun: 'ha', form: 'na-aga ha', toneMarks: 'ná-àgá há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-aga m mgbe niile', toneMarks: 'ná-àgá m mgbè níílé' },
          { pronoun: 'i', form: 'na-aga i mgbe niile', toneMarks: 'ná-àgá ị mgbè níílé' },
          { pronoun: 'o', form: 'na-aga o mgbe niile', toneMarks: 'ná-àgá ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-aga anyi mgbe niile', toneMarks: 'ná-àgá ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-aga unu mgbe niile', toneMarks: 'ná-àgá ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-aga ha mgbe niile', toneMarks: 'ná-àgá há mgbè níílé' },
        ],
      },
    },
    examples: {
      delta: [
        { igbo: 'Ana m aga ahịa', english: 'I am going to the market', aspect: 'imperfective' },
        { igbo: 'Gara m ụlọ akwụkwọ', english: 'I went to school', aspect: 'perfective' },
      ],
      central: [
        { igbo: 'Ana m eje ahịa', english: 'I am going to the market', aspect: 'imperfective' },
        { igbo: 'Jere m ụlọ akwụkwọ', english: 'I went to school', aspect: 'perfective' },
      ],
      anambra: [
        { igbo: 'Ana m aga ahịa', english: 'I am going to the market', aspect: 'imperfective' },
        { igbo: 'Gara m ụlọ akwụkwọ', english: 'I went to school', aspect: 'perfective' },
      ],
      imo: [
        { igbo: 'Ana m aga ahịa', english: 'I am going to the market', aspect: 'imperfective' },
        { igbo: 'Gara m ụlọ akwụkwọ', english: 'I went to school', aspect: 'perfective' },
      ],
    },
  },
  {
    id: 'iri',
    infinitive: 'iri',
    meaning: 'to eat',
    patternFamily: 'regular-i-verbs',
    mnemonic: 'I-verbs drop "i" and add "e": iri → eri',
    difficulty: 'beginner',
    frequency: 'high',
    isPremium: false,
    conjugations: {
      delta: {
        imperfective: [
          { pronoun: 'm', form: 'ana m eri', toneMarks: 'àná m èrí' },
          { pronoun: 'i', form: 'ana i eri', toneMarks: 'àná ị èrí' },
          { pronoun: 'o', form: 'ana o eri', toneMarks: 'àná ọ èrí' },
          { pronoun: 'anyi', form: 'ana anyi eri', toneMarks: 'àná ànyị èrí' },
          { pronoun: 'unu', form: 'ana unu eri', toneMarks: 'àná ụnụ èrí' },
          { pronoun: 'ha', form: 'ana ha eri', toneMarks: 'àná há èrí' },
        ],
        perfective: [
          { pronoun: 'm', form: 'riri m', toneMarks: 'rìrì m' },
          { pronoun: 'i', form: 'riri i', toneMarks: 'rìrì ị' },
          { pronoun: 'o', form: 'riri o', toneMarks: 'rìrì ọ' },
          { pronoun: 'anyi', form: 'riri anyi', toneMarks: 'rìrì ànyị' },
          { pronoun: 'unu', form: 'riri unu', toneMarks: 'rìrì ụnụ' },
          { pronoun: 'ha', form: 'riri ha', toneMarks: 'rìrì há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-eri m', toneMarks: 'ná-èrí m' },
          { pronoun: 'i', form: 'na-eri i', toneMarks: 'ná-èrí ị' },
          { pronoun: 'o', form: 'na-eri o', toneMarks: 'ná-èrí ọ' },
          { pronoun: 'anyi', form: 'na-eri anyi', toneMarks: 'ná-èrí ànyị' },
          { pronoun: 'unu', form: 'na-eri unu', toneMarks: 'ná-èrí ụnụ' },
          { pronoun: 'ha', form: 'na-eri ha', toneMarks: 'ná-èrí há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-eri m mgbe niile', toneMarks: 'ná-èrí m mgbè níílé' },
          { pronoun: 'i', form: 'na-eri i mgbe niile', toneMarks: 'ná-èrí ị mgbè níílé' },
          { pronoun: 'o', form: 'na-eri o mgbe niile', toneMarks: 'ná-èrí ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-eri anyi mgbe niile', toneMarks: 'ná-èrí ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-eri unu mgbe niile', toneMarks: 'ná-èrí ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-eri ha mgbe niile', toneMarks: 'ná-èrí há mgbè níílé' },
        ],
      },
      central: {
        imperfective: [
          { pronoun: 'm', form: 'ana m eri', toneMarks: 'àná m èrí' },
          { pronoun: 'i', form: 'ana i eri', toneMarks: 'àná ị èrí' },
          { pronoun: 'o', form: 'ana o eri', toneMarks: 'àná ọ èrí' },
          { pronoun: 'anyi', form: 'ana anyi eri', toneMarks: 'àná ànyị èrí' },
          { pronoun: 'unu', form: 'ana unu eri', toneMarks: 'àná ụnụ èrí' },
          { pronoun: 'ha', form: 'ana ha eri', toneMarks: 'àná há èrí' },
        ],
        perfective: [
          { pronoun: 'm', form: 'riri m', toneMarks: 'rìrì m' },
          { pronoun: 'i', form: 'riri i', toneMarks: 'rìrì ị' },
          { pronoun: 'o', form: 'riri o', toneMarks: 'rìrì ọ' },
          { pronoun: 'anyi', form: 'riri anyi', toneMarks: 'rìrì ànyị' },
          { pronoun: 'unu', form: 'riri unu', toneMarks: 'rìrì ụnụ' },
          { pronoun: 'ha', form: 'riri ha', toneMarks: 'rìrì há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-eri m', toneMarks: 'ná-èrí m' },
          { pronoun: 'i', form: 'na-eri i', toneMarks: 'ná-èrí ị' },
          { pronoun: 'o', form: 'na-eri o', toneMarks: 'ná-èrí ọ' },
          { pronoun: 'anyi', form: 'na-eri anyi', toneMarks: 'ná-èrí ànyị' },
          { pronoun: 'unu', form: 'na-eri unu', toneMarks: 'ná-èrí ụnụ' },
          { pronoun: 'ha', form: 'na-eri ha', toneMarks: 'ná-èrí há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-eri m mgbe niile', toneMarks: 'ná-èrí m mgbè níílé' },
          { pronoun: 'i', form: 'na-eri i mgbe niile', toneMarks: 'ná-èrí ị mgbè níílé' },
          { pronoun: 'o', form: 'na-eri o mgbe niile', toneMarks: 'ná-èrí ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-eri anyi mgbe niile', toneMarks: 'ná-èrí ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-eri unu mgbe niile', toneMarks: 'ná-èrí ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-eri ha mgbe niile', toneMarks: 'ná-èrí há mgbè níílé' },
        ],
      },
      anambra: {
        imperfective: [
          { pronoun: 'm', form: 'ana m eri', toneMarks: 'àná m èrí' },
          { pronoun: 'i', form: 'ana i eri', toneMarks: 'àná ị èrí' },
          { pronoun: 'o', form: 'ana o eri', toneMarks: 'àná ọ èrí' },
          { pronoun: 'anyi', form: 'ana anyi eri', toneMarks: 'àná ànyị èrí' },
          { pronoun: 'unu', form: 'ana unu eri', toneMarks: 'àná ụnụ èrí' },
          { pronoun: 'ha', form: 'ana ha eri', toneMarks: 'àná há èrí' },
        ],
        perfective: [
          { pronoun: 'm', form: 'riri m', toneMarks: 'rìrì m' },
          { pronoun: 'i', form: 'riri i', toneMarks: 'rìrì ị' },
          { pronoun: 'o', form: 'riri o', toneMarks: 'rìrì ọ' },
          { pronoun: 'anyi', form: 'riri anyi', toneMarks: 'rìrì ànyị' },
          { pronoun: 'unu', form: 'riri unu', toneMarks: 'rìrì ụnụ' },
          { pronoun: 'ha', form: 'riri ha', toneMarks: 'rìrì há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-eri m', toneMarks: 'ná-èrí m' },
          { pronoun: 'i', form: 'na-eri i', toneMarks: 'ná-èrí ị' },
          { pronoun: 'o', form: 'na-eri o', toneMarks: 'ná-èrí ọ' },
          { pronoun: 'anyi', form: 'na-eri anyi', toneMarks: 'ná-èrí ànyị' },
          { pronoun: 'unu', form: 'na-eri unu', toneMarks: 'ná-èrí ụnụ' },
          { pronoun: 'ha', form: 'na-eri ha', toneMarks: 'ná-èrí há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-eri m mgbe niile', toneMarks: 'ná-èrí m mgbè níílé' },
          { pronoun: 'i', form: 'na-eri i mgbe niile', toneMarks: 'ná-èrí ị mgbè níílé' },
          { pronoun: 'o', form: 'na-eri o mgbe niile', toneMarks: 'ná-èrí ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-eri anyi mgbe niile', toneMarks: 'ná-èrí ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-eri unu mgbe niile', toneMarks: 'ná-èrí ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-eri ha mgbe niile', toneMarks: 'ná-èrí há mgbè níílé' },
        ],
      },
      imo: {
        imperfective: [
          { pronoun: 'm', form: 'ana m eri', toneMarks: 'àná m èrí' },
          { pronoun: 'i', form: 'ana i eri', toneMarks: 'àná ị èrí' },
          { pronoun: 'o', form: 'ana o eri', toneMarks: 'àná ọ èrí' },
          { pronoun: 'anyi', form: 'ana anyi eri', toneMarks: 'àná ànyị èrí' },
          { pronoun: 'unu', form: 'ana unu eri', toneMarks: 'àná ụnụ èrí' },
          { pronoun: 'ha', form: 'ana ha eri', toneMarks: 'àná há èrí' },
        ],
        perfective: [
          { pronoun: 'm', form: 'riri m', toneMarks: 'rìrì m' },
          { pronoun: 'i', form: 'riri i', toneMarks: 'rìrì ị' },
          { pronoun: 'o', form: 'riri o', toneMarks: 'rìrì ọ' },
          { pronoun: 'anyi', form: 'riri anyi', toneMarks: 'rìrì ànyị' },
          { pronoun: 'unu', form: 'riri unu', toneMarks: 'rìrì ụnụ' },
          { pronoun: 'ha', form: 'riri ha', toneMarks: 'rìrì há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-eri m', toneMarks: 'ná-èrí m' },
          { pronoun: 'i', form: 'na-eri i', toneMarks: 'ná-èrí ị' },
          { pronoun: 'o', form: 'na-eri o', toneMarks: 'ná-èrí ọ' },
          { pronoun: 'anyi', form: 'na-eri anyi', toneMarks: 'ná-èrí ànyị' },
          { pronoun: 'unu', form: 'na-eri unu', toneMarks: 'ná-èrí ụnụ' },
          { pronoun: 'ha', form: 'na-eri ha', toneMarks: 'ná-èrí há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-eri m mgbe niile', toneMarks: 'ná-èrí m mgbè níílé' },
          { pronoun: 'i', form: 'na-eri i mgbe niile', toneMarks: 'ná-èrí ị mgbè níílé' },
          { pronoun: 'o', form: 'na-eri o mgbe niile', toneMarks: 'ná-èrí ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-eri anyi mgbe niile', toneMarks: 'ná-èrí ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-eri unu mgbe niile', toneMarks: 'ná-èrí ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-eri ha mgbe niile', toneMarks: 'ná-èrí há mgbè níílé' },
        ],
      },
    },
    examples: {
      delta: [
        { igbo: 'Ana m eri ji', english: 'I am eating yam', aspect: 'imperfective' },
        { igbo: 'Riri m nri', english: 'I ate food', aspect: 'perfective' },
      ],
      central: [
        { igbo: 'Ana m eri ji', english: 'I am eating yam', aspect: 'imperfective' },
        { igbo: 'Riri m nri', english: 'I ate food', aspect: 'perfective' },
      ],
      anambra: [
        { igbo: 'Ana m eri ji', english: 'I am eating yam', aspect: 'imperfective' },
        { igbo: 'Riri m nri', english: 'I ate food', aspect: 'perfective' },
      ],
      imo: [
        { igbo: 'Ana m eri ji', english: 'I am eating yam', aspect: 'imperfective' },
        { igbo: 'Riri m nri', english: 'I ate food', aspect: 'perfective' },
      ],
    },
  },
  // Premium verb example (Central Igbo locked)
  {
    id: 'ikwu',
    infinitive: 'ikwu',
    meaning: 'to say/speak',
    patternFamily: 'regular-kw-verbs',
    mnemonic: 'KW-verbs keep the "kw" sound: ikwu → ekwu',
    difficulty: 'intermediate',
    frequency: 'high',
    isPremium: true, // This verb requires premium for non-Delta dialects
    conjugations: {
      delta: {
        imperfective: [
          { pronoun: 'm', form: 'ana m ekwu', toneMarks: 'àná m èkwú' },
          { pronoun: 'i', form: 'ana i ekwu', toneMarks: 'àná ị èkwú' },
          { pronoun: 'o', form: 'ana o ekwu', toneMarks: 'àná ọ èkwú' },
          { pronoun: 'anyi', form: 'ana anyi ekwu', toneMarks: 'àná ànyị èkwú' },
          { pronoun: 'unu', form: 'ana unu ekwu', toneMarks: 'àná ụnụ èkwú' },
          { pronoun: 'ha', form: 'ana ha ekwu', toneMarks: 'àná há èkwú' },
        ],
        perfective: [
          { pronoun: 'm', form: 'kwuru m', toneMarks: 'kwùrù m' },
          { pronoun: 'i', form: 'kwuru i', toneMarks: 'kwùrù ị' },
          { pronoun: 'o', form: 'kwuru o', toneMarks: 'kwùrù ọ' },
          { pronoun: 'anyi', form: 'kwuru anyi', toneMarks: 'kwùrù ànyị' },
          { pronoun: 'unu', form: 'kwuru unu', toneMarks: 'kwùrù ụnụ' },
          { pronoun: 'ha', form: 'kwuru ha', toneMarks: 'kwùrù há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-ekwu m', toneMarks: 'ná-èkwú m' },
          { pronoun: 'i', form: 'na-ekwu i', toneMarks: 'ná-èkwú ị' },
          { pronoun: 'o', form: 'na-ekwu o', toneMarks: 'ná-èkwú ọ' },
          { pronoun: 'anyi', form: 'na-ekwu anyi', toneMarks: 'ná-èkwú ànyị' },
          { pronoun: 'unu', form: 'na-ekwu unu', toneMarks: 'ná-èkwú ụnụ' },
          { pronoun: 'ha', form: 'na-ekwu ha', toneMarks: 'ná-èkwú há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-ekwu m mgbe niile', toneMarks: 'ná-èkwú m mgbè níílé' },
          { pronoun: 'i', form: 'na-ekwu i mgbe niile', toneMarks: 'ná-èkwú ị mgbè níílé' },
          { pronoun: 'o', form: 'na-ekwu o mgbe niile', toneMarks: 'ná-èkwú ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-ekwu anyi mgbe niile', toneMarks: 'ná-èkwú ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-ekwu unu mgbe niile', toneMarks: 'ná-èkwú ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-ekwu ha mgbe niile', toneMarks: 'ná-èkwú há mgbè níílé' },
        ],
      },
      central: {
        imperfective: [
          { pronoun: 'm', form: 'ana m asị', toneMarks: 'àná m àsị́' },
          { pronoun: 'i', form: 'ana i asị', toneMarks: 'àná ị àsị́' },
          { pronoun: 'o', form: 'ana o asị', toneMarks: 'àná ọ àsị́' },
          { pronoun: 'anyi', form: 'ana anyi asị', toneMarks: 'àná ànyị àsị́' },
          { pronoun: 'unu', form: 'ana unu asị', toneMarks: 'àná ụnụ àsị́' },
          { pronoun: 'ha', form: 'ana ha asị', toneMarks: 'àná há àsị́' },
        ],
        perfective: [
          { pronoun: 'm', form: 'siri m', toneMarks: 'sìrì m' },
          { pronoun: 'i', form: 'siri i', toneMarks: 'sìrì ị' },
          { pronoun: 'o', form: 'siri o', toneMarks: 'sìrì ọ' },
          { pronoun: 'anyi', form: 'siri anyi', toneMarks: 'sìrì ànyị' },
          { pronoun: 'unu', form: 'siri unu', toneMarks: 'sìrì ụnụ' },
          { pronoun: 'ha', form: 'siri ha', toneMarks: 'sìrì há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-asị m', toneMarks: 'ná-àsị́ m' },
          { pronoun: 'i', form: 'na-asị i', toneMarks: 'ná-àsị́ ị' },
          { pronoun: 'o', form: 'na-asị o', toneMarks: 'ná-àsị́ ọ' },
          { pronoun: 'anyi', form: 'na-asị anyi', toneMarks: 'ná-àsị́ ànyị' },
          { pronoun: 'unu', form: 'na-asị unu', toneMarks: 'ná-àsị́ ụnụ' },
          { pronoun: 'ha', form: 'na-asị ha', toneMarks: 'ná-àsị́ há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-asị m mgbe niile', toneMarks: 'ná-àsị́ m mgbè níílé' },
          { pronoun: 'i', form: 'na-asị i mgbe niile', toneMarks: 'ná-àsị́ ị mgbè níílé' },
          { pronoun: 'o', form: 'na-asị o mgbe niile', toneMarks: 'ná-àsị́ ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-asị anyi mgbe niile', toneMarks: 'ná-àsị́ ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-asị unu mgbe niile', toneMarks: 'ná-àsị́ ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-asị ha mgbe niile', toneMarks: 'ná-àsị́ há mgbè níílé' },
        ],
      },
      anambra: {
        imperfective: [
          { pronoun: 'm', form: 'ana m ekwu', toneMarks: 'àná m èkwú' },
          { pronoun: 'i', form: 'ana i ekwu', toneMarks: 'àná ị èkwú' },
          { pronoun: 'o', form: 'ana o ekwu', toneMarks: 'àná ọ èkwú' },
          { pronoun: 'anyi', form: 'ana anyi ekwu', toneMarks: 'àná ànyị èkwú' },
          { pronoun: 'unu', form: 'ana unu ekwu', toneMarks: 'àná ụnụ èkwú' },
          { pronoun: 'ha', form: 'ana ha ekwu', toneMarks: 'àná há èkwú' },
        ],
        perfective: [
          { pronoun: 'm', form: 'kwuru m', toneMarks: 'kwùrù m' },
          { pronoun: 'i', form: 'kwuru i', toneMarks: 'kwùrù ị' },
          { pronoun: 'o', form: 'kwuru o', toneMarks: 'kwùrù ọ' },
          { pronoun: 'anyi', form: 'kwuru anyi', toneMarks: 'kwùrù ànyị' },
          { pronoun: 'unu', form: 'kwuru unu', toneMarks: 'kwùrù ụnụ' },
          { pronoun: 'ha', form: 'kwuru ha', toneMarks: 'kwùrù há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-ekwu m', toneMarks: 'ná-èkwú m' },
          { pronoun: 'i', form: 'na-ekwu i', toneMarks: 'ná-èkwú ị' },
          { pronoun: 'o', form: 'na-ekwu o', toneMarks: 'ná-èkwú ọ' },
          { pronoun: 'anyi', form: 'na-ekwu anyi', toneMarks: 'ná-èkwú ànyị' },
          { pronoun: 'unu', form: 'na-ekwu unu', toneMarks: 'ná-èkwú ụnụ' },
          { pronoun: 'ha', form: 'na-ekwu ha', toneMarks: 'ná-èkwú há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-ekwu m mgbe niile', toneMarks: 'ná-èkwú m mgbè níílé' },
          { pronoun: 'i', form: 'na-ekwu i mgbe niile', toneMarks: 'ná-èkwú ị mgbè níílé' },
          { pronoun: 'o', form: 'na-ekwu o mgbe niile', toneMarks: 'ná-èkwú ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-ekwu anyi mgbe niile', toneMarks: 'ná-èkwú ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-ekwu unu mgbe niile', toneMarks: 'ná-èkwú ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-ekwu ha mgbe niile', toneMarks: 'ná-èkwú há mgbè níílé' },
        ],
      },
      imo: {
        imperfective: [
          { pronoun: 'm', form: 'ana m ekwu', toneMarks: 'àná m èkwú' },
          { pronoun: 'i', form: 'ana i ekwu', toneMarks: 'àná ị èkwú' },
          { pronoun: 'o', form: 'ana o ekwu', toneMarks: 'àná ọ èkwú' },
          { pronoun: 'anyi', form: 'ana anyi ekwu', toneMarks: 'àná ànyị èkwú' },
          { pronoun: 'unu', form: 'ana unu ekwu', toneMarks: 'àná ụnụ èkwú' },
          { pronoun: 'ha', form: 'ana ha ekwu', toneMarks: 'àná há èkwú' },
        ],
        perfective: [
          { pronoun: 'm', form: 'kwuru m', toneMarks: 'kwùrù m' },
          { pronoun: 'i', form: 'kwuru i', toneMarks: 'kwùrù ị' },
          { pronoun: 'o', form: 'kwuru o', toneMarks: 'kwùrù ọ' },
          { pronoun: 'anyi', form: 'kwuru anyi', toneMarks: 'kwùrù ànyị' },
          { pronoun: 'unu', form: 'kwuru unu', toneMarks: 'kwùrù ụnụ' },
          { pronoun: 'ha', form: 'kwuru ha', toneMarks: 'kwùrù há' },
        ],
        progressive: [
          { pronoun: 'm', form: 'na-ekwu m', toneMarks: 'ná-èkwú m' },
          { pronoun: 'i', form: 'na-ekwu i', toneMarks: 'ná-èkwú ị' },
          { pronoun: 'o', form: 'na-ekwu o', toneMarks: 'ná-èkwú ọ' },
          { pronoun: 'anyi', form: 'na-ekwu anyi', toneMarks: 'ná-èkwú ànyị' },
          { pronoun: 'unu', form: 'na-ekwu unu', toneMarks: 'ná-èkwú ụnụ' },
          { pronoun: 'ha', form: 'na-ekwu ha', toneMarks: 'ná-èkwú há' },
        ],
        habitual: [
          { pronoun: 'm', form: 'na-ekwu m mgbe niile', toneMarks: 'ná-èkwú m mgbè níílé' },
          { pronoun: 'i', form: 'na-ekwu i mgbe niile', toneMarks: 'ná-èkwú ị mgbè níílé' },
          { pronoun: 'o', form: 'na-ekwu o mgbe niile', toneMarks: 'ná-èkwú ọ mgbè níílé' },
          { pronoun: 'anyi', form: 'na-ekwu anyi mgbe niile', toneMarks: 'ná-èkwú ànyị mgbè níílé' },
          { pronoun: 'unu', form: 'na-ekwu unu mgbe niile', toneMarks: 'ná-èkwú ụnụ mgbè níílé' },
          { pronoun: 'ha', form: 'na-ekwu ha mgbe niile', toneMarks: 'ná-èkwú há mgbè níílé' },
        ],
      },
    },
    examples: {
      delta: [
        { igbo: 'Ana m ekwu eziokwu', english: 'I am telling the truth', aspect: 'imperfective' },
        { igbo: 'Kwuru m ya', english: 'I said it', aspect: 'perfective' },
      ],
      central: [
        { igbo: 'Ana m asị eziokwu', english: 'I am telling the truth', aspect: 'imperfective' },
        { igbo: 'Siri m ya', english: 'I said it', aspect: 'perfective' },
      ],
      anambra: [
        { igbo: 'Ana m ekwu eziokwu', english: 'I am telling the truth', aspect: 'imperfective' },
        { igbo: 'Kwuru m ya', english: 'I said it', aspect: 'perfective' },
      ],
      imo: [
        { igbo: 'Ana m ekwu eziokwu', english: 'I am telling the truth', aspect: 'imperfective' },
        { igbo: 'Kwuru m ya', english: 'I said it', aspect: 'perfective' },
      ],
    },
  },
  // Add more verbs here... (truncated for brevity)
];

export const patternFamilies: PatternFamily[] = [
  {
    id: 'regular-i-verbs',
    name: 'Regular I-Verbs',
    description: 'Verbs ending in -i that follow standard conjugation patterns',
    mnemonic: 'Drop the "i" and add "e" for imperfective: iri → eri',
    verbs: ['iri', 'ile', 'ime', 'inu'],
  },
  {
    id: 'irregular-motion',
    name: 'Irregular Motion Verbs',
    description: 'Motion verbs with irregular root changes',
    mnemonic: 'Motion verbs change their root completely: je → ga',
    verbs: ['ije', 'ibia'],
  },
  {
    id: 'regular-kw-verbs',
    name: 'Regular KW-Verbs',
    description: 'Verbs with "kw" sounds that maintain the cluster',
    mnemonic: 'KW-verbs keep the "kw" sound: ikwu → ekwu',
    verbs: ['ikwu', 'ikwa'],
  },
];

// Utility functions
export const getVerbById = (id: string): IgboVerb | undefined => {
  return igboVerbs.find(verb => verb.id === id);
};

export const getVerbsByPatternFamily = (familyId: string): IgboVerb[] => {
  const family = patternFamilies.find(f => f.id === familyId);
  if (!family) return [];
  return igboVerbs.filter(verb => family.verbs.includes(verb.id));
};

export const getFreeVerbs = (): IgboVerb[] => {
  return igboVerbs.filter(verb => !verb.isPremium);
};

export const getPremiumVerbs = (): IgboVerb[] => {
  return igboVerbs.filter(verb => verb.isPremium);
};

export const getVerbsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): IgboVerb[] => {
  return igboVerbs.filter(verb => verb.difficulty === difficulty);
};

export const getVerbsByFrequency = (frequency: 'high' | 'medium' | 'low'): IgboVerb[] => {
  return igboVerbs.filter(verb => verb.frequency === frequency);
};

export const searchVerbs = (query: string): IgboVerb[] => {
  const lowercaseQuery = query.toLowerCase();
  return igboVerbs.filter(verb => 
    verb.infinitive.toLowerCase().includes(lowercaseQuery) ||
    verb.meaning.toLowerCase().includes(lowercaseQuery)
  );
};