import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { installConsoleLogging } from '@/lib/logger';

let hasInitializedSentry = false;

const SENSITIVE_KEY_PATTERN =
  /(receipt|token|apiKey|api_key|authorization|password|secret|entitlements?|customerInfo|originalAppUserId|productIdentifier|originalPurchaseDate|latestExpirationDate)/i;

const redactValue = (value: unknown, depth = 0): unknown => {
  if (depth > 4 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redactValue(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEY_PATTERN.test(k)
        ? '[redacted]'
        : redactValue(v, depth + 1);
    }
    return out;
  }
  return value;
};

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
    sendDefaultPii: false,
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
    // Screenshot/view-hierarchy capture and session replay all flow through
    // [UIView drawViewHierarchyInRect:afterScreenUpdates:] in the Sentry iOS
    // SDK. On iOS/iPadOS 26.4.2 that path crashes inside UIKit's
    // _snapshotDisplaySystemIdentifier (App Review rejection, build 4).
    // Keep them disabled until Sentry ships a fix verified on iOS 26.
    attachScreenshot: false,
    attachViewHierarchy: false,
    beforeSend(event) {
      if (event.extra) event.extra = redactValue(event.extra) as typeof event.extra;
      if (event.contexts) {
        event.contexts = redactValue(event.contexts) as typeof event.contexts;
      }
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((b) =>
          b.data ? { ...b, data: redactValue(b.data) as typeof b.data } : b,
        );
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data) {
        breadcrumb.data = redactValue(breadcrumb.data) as typeof breadcrumb.data;
      }
      return breadcrumb;
    },
    tracesSampleRate: __DEV__ ? 1 : 0.2,
    profilesSampleRate: __DEV__ ? 0 : 0.1,
    // Mobile replay disabled — same UIKit snapshot path as attachScreenshot
    // crashes on iOS/iPadOS 26.4.2.
    integrations: [Sentry.feedbackIntegration()],
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
