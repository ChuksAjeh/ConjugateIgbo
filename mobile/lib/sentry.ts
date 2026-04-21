import * as Sentry from '@sentry/react-native';

let hasInitializedSentry = false;

/**
 * Boots the shared Sentry client once for the lifetime of the app process.
 *
 * Keeping this configuration in a dedicated module makes the root layout much
 * easier to scan and gives the rest of the codebase a single home for future
 * logging or tracing refinements.
 */
export function initSentry(): void {
  if (hasInitializedSentry) {
    return;
  }

  Sentry.init({
    dsn: 'https://7e72a03af7db7a5f56723457c152a612@o4510583564402688.ingest.de.sentry.io/4510583571808336',
    sendDefaultPii: true,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],
  });

  hasInitializedSentry = true;
}

/**
 * Re-export the configured Sentry namespace so screens can keep using the
 * vendor API without each module needing to know where initialisation lives.
 */
export { Sentry };
