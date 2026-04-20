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
    particles: {
      presentLink: 'na',
      futureAux: 'ga',
      negativeFutureAux: 'ma',
      negativePerfectPrefix: 'dika',
      perfectSuffix: 'ga',
    },
  },
};
