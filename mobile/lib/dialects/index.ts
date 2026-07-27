/**
 * @fileoverview Registry of supported dialect profiles.
 *
 * This is the single source of truth for which dialects exist, what they are
 * called, whether they are selectable, and how their grammar behaves. Screens
 * read from here rather than hardcoding dialect lists.
 *
 * To add a new Igbo dialect:
 *  1. Add the key to the `Dialect` union in `@/models/verb`.
 *  2. Create a new profile module in this folder (e.g. `./enugu.ts`),
 *     including its `label`, `description` and `supported` flag.
 *  3. Register it in the `dialectProfiles` map below.
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

/** The dialect used whenever a requested one is unknown or unsupported. */
export const DEFAULT_DIALECT: Dialect = 'delta';

/**
 * Resolves a dialect key to its profile, falling back to the default dialect
 * for unknown keys (e.g. a stale value persisted by an older app build).
 *
 * @param dialect the requested dialect key.
 * @returns the matching profile, or the default profile.
 */
export function getDialectProfile(dialect: Dialect | undefined): DialectProfile {
  return (dialect && dialectProfiles[dialect]) || dialectProfiles[DEFAULT_DIALECT];
}

/**
 * All profiles in display order, supported dialects first. Drives the
 * Settings dialect picker.
 */
export const dialectProfileList: DialectProfile[] = Object.values(dialectProfiles).sort(
  (a, b) => Number(b.supported) - Number(a.supported) || a.label.localeCompare(b.label),
);

/** Keys of dialects that have verified grammar data and may be selected. */
export const supportedDialects: Dialect[] = dialectProfileList
  .filter((p) => p.supported)
  .map((p) => p.key);

export type {
  DialectProfile,
  DialectRules,
  DialectSurfaces,
  PerfectSuffixFn,
  RuleFn,
} from './types';
export { sharedRules } from './sharedRules';
export * from './morphology';
