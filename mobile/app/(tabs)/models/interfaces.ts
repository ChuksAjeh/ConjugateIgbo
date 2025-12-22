import { useState } from 'react';
import { IgboVerb, Pronoun, Tense } from '@/models/verb';

export const tenses: Tense[] = ['present', 'past', 'future'];
export const pronouns: Pronoun[] = ['m', 'i', 'o', 'anyi', 'unu', 'wa'];
export const pronounLabels: Record<Pronoun, string> = {
  m: 'A/E… m (I)',
  i: 'I/Iyu (You)',
  o: 'Ọ (He/She/It)',
  anyi: 'Anyị (We)',
  unu: 'Unu (You all)',
  wa: 'Wa (They)',
};
