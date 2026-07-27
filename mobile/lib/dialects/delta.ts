import { DialectProfile } from './types';
import { sharedRules } from './sharedRules';

/**
 * Delta Igbo — the variety documented in the Notion grammar reference and
 * the **base profile** that all other dialects extend.
 *
 * Reduced diacritics; 3pl pronoun is "Wa". Other dialects spread this
 * profile and override only what differs (e.g. pronoun spellings for
 * Central, or an `r` → `l` rule transform for future dialect variants).
 *
 * Delta is currently the only dialect with verified grammar data; the
 * others are scaffolded but disabled in the UI until we have concrete
 * references for each.
 */
export const deltaProfile: DialectProfile = {
  key: 'delta',
  label: 'Delta Igbo',
  description: '',
  supported: true,
  rules: sharedRules,
  surfaces: {
    pronouns: {
      m: 'M',
      i: 'I',
      o: 'O',
      anyi: 'Anyi',
      unu: 'Unu',
      wa: 'Wa',
    },
    // 1sg is a discontinuous frame ("A gba m ọsọ"), so the picker shows the
    // frame rather than the bare pronoun.
    pronounDisplay: {
      m: 'A/E… m',
    },
    particles: {
      presentLink: 'na',
      futureAux: 'ga',
      negativeFutureAux: 'ma',
      negativePerfectPrefix: 'dika',
      habitualSuffix: 'kari',
      neverSuffix: 'nene',
      finishedSuffix: 'si',
      togetherSuffix: 'kota',
      firstSuffix: 'gode',
      politeSuffix: 'nụ́',
      benefactiveSuffix: 'ye',
      // Constant until the -ga/ge/go conditioning is confirmed — see
      // PerfectSuffixFn in ./types for the Notion examples that disagree.
      perfectSuffix: () => 'ga',
    },
  },
};
