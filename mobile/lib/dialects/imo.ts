import { DialectProfile } from './types';
import { centralProfile } from './central';

/**
 * Imo Igbo — closely mirrors Central/literary Igbo.
 * Add Imo-specific overrides here as the engine learns them.
 */
export const imoProfile: DialectProfile = {
  key: 'imo',
  label: 'Imo Igbo',
  description: 'COMING SOON',
  supported: false,
  rules: centralProfile.rules,
  surfaces: centralProfile.surfaces,
};
