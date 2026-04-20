import { DialectProfile } from './types';
import { centralProfile } from './central';

/**
 * Abia Igbo — closely mirrors Central/literary Igbo.
 * Add Abia-specific overrides here as the engine learns them.
 */
export const abiaProfile: DialectProfile = {
  rules: centralProfile.rules,
  surfaces: centralProfile.surfaces,
};
