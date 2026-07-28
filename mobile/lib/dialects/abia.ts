import { DialectProfile } from './types';
import { centralProfile } from './central';

/**
 * Abia Igbo — closely mirrors Central/literary Igbo.
 * Add Abia-specific overrides here as the engine learns them.
 */
export const abiaProfile: DialectProfile = {
  key: 'abia',
  label: 'Abia Igbo',
  description: 'COMING SOON',
  supported: false,
  rules: centralProfile.rules,
  surfaces: centralProfile.surfaces,
};
