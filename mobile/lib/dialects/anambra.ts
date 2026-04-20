import { DialectProfile } from './types';
import { centralProfile } from './central';

/**
 * Anambra Igbo — closely mirrors Central/literary Igbo.
 * Add Anambra-specific overrides here as the engine learns them.
 */
export const anambraProfile: DialectProfile = {
  rules: centralProfile.rules,
  surfaces: centralProfile.surfaces,
};
