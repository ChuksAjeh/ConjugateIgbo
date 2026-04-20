import { DialectProfile } from './types';
import { deltaProfile } from './delta';

/**
 * Central (literary) Igbo — extends the Delta base profile and overrides
 * pronoun spellings (full diacritics, 3pl = "Ha") and the negative-perfect
 * prefix (`dị́ká` vs Delta's `dika`).
 *
 * NOTE: disabled in the UI — the engine still uses Delta rules under the
 * hood. Add Central-specific morphology overrides here once we have
 * verified references for e.g. the `r` → `l` consonant shift.
 */
export const centralProfile: DialectProfile = {
  rules: deltaProfile.rules,
  surfaces: {
    ...deltaProfile.surfaces,
    pronouns: {
      ...deltaProfile.surfaces.pronouns,
      i: 'Ị',
      o: 'Ọ',
      anyi: 'Anyị',
      unu: 'Ụnụ',
      wa: 'Ha',
    },
    particles: {
      ...deltaProfile.surfaces.particles,
      negativePerfectPrefix: 'dị́ká',
    },
  },
};
