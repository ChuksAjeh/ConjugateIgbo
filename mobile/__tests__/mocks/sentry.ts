// Minimal stub for @sentry/react-native so the conjugation engine can be
// imported from node-based Jest tests without pulling in native code.
const noop = () => undefined;
const wrap = <T,>(component: T) => component;

export const logger = {
  warn: noop,
  info: noop,
  error: noop,
  debug: noop,
};

export const captureException = noop;
export const captureMessage = noop;
export const init = noop;
export const mobileReplayIntegration = noop;
export const feedbackIntegration = noop;
export { wrap };

export default {
  logger,
  captureException,
  captureMessage,
  init,
  mobileReplayIntegration,
  feedbackIntegration,
  wrap,
};
