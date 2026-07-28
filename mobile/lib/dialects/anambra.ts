import { DialectProfile } from './types';
import { centralProfile } from './central';

/**
 * Anambra Igbo — closely mirrors Central/literary Igbo.
 * Add Anambra-specific overrides here as the engine learns them.
 */
export const anambraProfile: DialectProfile = {
  key: 'anambra',
  label: 'Anambra Igbo',
  description: 'COMING SOON',
  supported: false,
  rules: centralProfile.rules,
  surfaces: centralProfile.surfaces,
};
