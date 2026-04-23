import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { installConsoleLogging } from '@/lib/logger';

let hasInitializedSentry = false;

const appVersion = Constants.expoConfig?.version ?? 'unknown';
const appSlug = Constants.expoConfig?.slug ?? 'conjugate-igbo';
const iosBuildNumber = Constants.expoConfig?.ios?.buildNumber;
const androidVersionCode = Constants.expoConfig?.android?.versionCode;
const nativeBuild = String(iosBuildNumber ?? androidVersionCode ?? 'unknown');
const environment = __DEV__
  ? 'development'
  : process.env.EXPO_PUBLIC_APP_ENV ?? 'production';

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
    release: `${appSlug}@${appVersion}`,
    dist: nativeBuild,
    environment,
    sendDefaultPii: true,
    attachStacktrace: true,
    enableLogs: true,
    enableNative: true,
    enableNativeCrashHandling: true,
    autoInitializeNativeSdk: true,
    enableAutoSessionTracking: true,
    enableWatchdogTerminationTracking: true,
    enableAppHangTracking: true,
    enableAppStartTracking: true,
    enableNativeFramesTracking: true,
    enableStallTracking: true,
    enableCaptureFailedRequests: true,
    attachScreenshot: !__DEV__,
    attachViewHierarchy: !__DEV__,
    tracesSampleRate: __DEV__ ? 1 : 0.2,
    profilesSampleRate: __DEV__ ? 0 : 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],
    initialScope: {
      tags: {
        app: appSlug,
        appVersion,
        nativeBuild,
        platform: Platform.OS,
        executionEnvironment: Constants.executionEnvironment,
      },
      contexts: {
        app_config: {
          name: Constants.expoConfig?.name,
          slug: appSlug,
          version: appVersion,
          runtimeVersion: Constants.expoConfig?.runtimeVersion,
          projectId: Constants.easConfig?.projectId,
        },
      },
    },
    onReady({ didCallNativeInit }) {
      Sentry.logger.info('[Sentry] SDK ready', {
        tags: { feature: 'observability', didCallNativeInit },
        extra: {
          release: `${appSlug}@${appVersion}`,
          dist: nativeBuild,
          environment,
        },
      });
    },
  });

  installConsoleLogging();
  hasInitializedSentry = true;
}

/**
 * Re-export the configured Sentry namespace so screens can keep using the
 * vendor API without each module needing to know where initialisation lives.
 */
export { Sentry };
