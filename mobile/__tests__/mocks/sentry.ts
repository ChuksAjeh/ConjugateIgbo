// Minimal stub for @sentry/react-native so the conjugation engine can be
// imported from node-based Jest tests without pulling in native code.
const noop = () => undefined;

export const logger = {
  warn: noop,
  info: noop,
  error: noop,
  debug: noop,
};

export const captureException = noop;
export const captureMessage = noop;

export default { logger, captureException, captureMessage };
