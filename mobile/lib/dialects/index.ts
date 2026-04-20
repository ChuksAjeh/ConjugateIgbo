/**
 * @fileoverview Registry of supported dialect profiles.
 *
 * To add a new Igbo dialect:
 *  1. Add the key to the `Dialect` union in `@/models/verb`.
 *  2. Add a label in `dialectLabels` (`@/models/interfaces`).
 *  3. Create a new profile module in this folder (e.g. `./enugu.ts`).
 *  4. Register it in the `dialectProfiles` map below.
 *
 * The conjugation engine reads only this registry; it does not know about
 * dialect names statically.
 */

import { Dialect } from '@/models/verb';
import { DialectProfile } from './types';

import { centralProfile } from './central';
import { deltaProfile } from './delta';
import { anambraProfile } from './anambra';
import { imoProfile } from './imo';
import { abiaProfile } from './abia';

export const dialectProfiles: Record<Dialect, DialectProfile> = {
  central: centralProfile,
  delta: deltaProfile,
  anambra: anambraProfile,
  imo: imoProfile,
  abia: abiaProfile,
};

export type { DialectProfile, DialectRules, DialectSurfaces, RuleFn } from './types';
export { sharedRules } from './sharedRules';
