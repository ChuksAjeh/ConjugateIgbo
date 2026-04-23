import * as Sentry from '@sentry/react-native';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogContext = {
  /**
   * Product area this log belongs to, for example `purchases` or `app-init`.
   */
  feature?: string;
  /**
   * React component, hook, service, or native bridge involved in the log.
   */
  component?: string;
  tags?: Record<string, string | number | boolean | null | undefined>;
  extra?: Record<string, unknown>;
};

type ConsoleMethod = 'debug' | 'log' | 'info' | 'warn' | 'error';

let hasInstalledConsoleBridge = false;

const toError = (value: unknown): Error | null => {
  if (value instanceof Error) {
    return value;
  }
  return null;
};

const formatArg = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const formatMessage = (args: unknown[]): string => {
  return args.map(formatArg).join(' ');
};

const normalizeContext = (context?: LogContext) => {
  const tags = {
    ...(context?.feature ? { feature: context.feature } : {}),
    ...(context?.component ? { component: context.component } : {}),
    ...(context?.tags ?? {}),
  };

  return {
    tags,
    extra: context?.extra,
  };
};

const addBreadcrumb = (
  level: Exclude<LogLevel, 'fatal'>,
  message: string,
  context?: LogContext,
) => {
  Sentry.addBreadcrumb({
    category: context?.feature ?? 'app',
    level: level === 'warn' ? 'warning' : level,
    message,
    data: {
      component: context?.component,
      ...(context?.extra ?? {}),
    },
  });
};

const logToSentry = (level: LogLevel, message: string, context?: LogContext) => {
  const sentryContext = normalizeContext(context);

  switch (level) {
    case 'debug':
      Sentry.logger.debug(message, sentryContext);
      break;
    case 'info':
      Sentry.logger.info(message, sentryContext);
      break;
    case 'warn':
      Sentry.logger.warn(message, sentryContext);
      break;
    case 'error':
    case 'fatal':
      Sentry.logger.error(message, sentryContext);
      break;
  }
};

/**
 * Small app logger that keeps log shape consistent across screens, hooks, and
 * services. Logs become Sentry logs and breadcrumbs; errors also become events.
 */
export const logger = {
  debug(message: string, context?: LogContext) {
    addBreadcrumb('debug', message, context);
    logToSentry('debug', message, context);
  },

  info(message: string, context?: LogContext) {
    addBreadcrumb('info', message, context);
    logToSentry('info', message, context);
  },

  warn(message: string, context?: LogContext) {
    addBreadcrumb('warn', message, context);
    logToSentry('warn', message, context);
  },

  error(error: unknown, message = 'Unhandled application error', context?: LogContext) {
    addBreadcrumb('error', message, {
      ...context,
      extra: {
        ...(context?.extra ?? {}),
        error: formatArg(error),
      },
    });

    logToSentry('error', message, context);

    const nativeError = toError(error);
    if (nativeError) {
      Sentry.captureException(nativeError, normalizeContext(context));
      return;
    }

    Sentry.captureMessage(message, {
      level: 'error',
      ...normalizeContext({
        ...context,
        extra: {
          ...(context?.extra ?? {}),
          error,
        },
      }),
    });
  },

  fatal(error: unknown, message = 'Fatal application error', context?: LogContext) {
    addBreadcrumb('error', message, context);
    logToSentry('fatal', message, context);
    Sentry.captureException(error, normalizeContext(context));
  },
};

/**
 * Noisy console messages from RN/Expo/third-party libraries that should not
 * be forwarded to Sentry. Keep these specific — anything too broad risks
 * swallowing real bugs.
 */
const CONSOLE_BRIDGE_IGNORE_PATTERNS: RegExp[] = [
  /Running "/, // Metro bundler boot banner
  /Download:|Downloading|\[Fast Refresh\]/i,
  /\[expo-modules-core\]/i,
  /Non-serializable values were found in the navigation state/i,
  /VirtualizedLists should never be nested/i,
];

const shouldSkipConsoleBridge = (message: string): boolean =>
  CONSOLE_BRIDGE_IGNORE_PATTERNS.some((re) => re.test(message));

/**
 * Bridges accidental console usage into Sentry. This is intentionally small:
 * `warn` and `error` become Sentry logs/events, while lower-severity console
 * calls are breadcrumbs so they provide context without flooding issues.
 */
export function installConsoleLogging(): void {
  if (hasInstalledConsoleBridge || !globalThis.console) {
    return;
  }

  hasInstalledConsoleBridge = true;

  const originalConsole = globalThis.console;
  const methods: ConsoleMethod[] = ['debug', 'log', 'info', 'warn', 'error'];

  methods.forEach((method) => {
    const original = originalConsole[method]?.bind(originalConsole);

    globalThis.console[method] = (...args: unknown[]) => {
      original?.(...args);

      const message = formatMessage(args);
      if (!message || shouldSkipConsoleBridge(message)) {
        return;
      }

      const context: LogContext = {
        feature: 'console',
        component: method,
        extra: { arguments: args.map(formatArg) },
      };

      if (method === 'error') {
        logger.error(args.find(toError) ?? message, message, context);
        return;
      }

      if (method === 'warn') {
        logger.warn(message, context);
        return;
      }

      addBreadcrumb(method === 'log' ? 'info' : method, message, context);
    };
  });
}
