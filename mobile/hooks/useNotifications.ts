/**
 * @fileoverview Hook for managing Expo push notifications and daily reminders.
 *
 * Handles:
 * - Registering for push notifications and obtaining the Expo push token.
 * - Listening for received notifications and user interaction responses.
 * - Scheduling and cancelling a single daily reminder at a user-specified time.
 *
 * Push notifications are skipped on web (`Platform.OS === 'web'`), where the
 * Expo notifications API is unavailable.
 *
 * ## Usage
 * ```ts
 * const { scheduleDailyReminder, cancelDailyReminder } = useNotifications();
 *
 * // Schedule a reminder at 7:30 PM:
 * await scheduleDailyReminder('19:30');
 *
 * // Cancel all scheduled reminders:
 * await cancelDailyReminder();
 * ```
 */

import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

// Configure how incoming notifications are displayed while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Provides push notification registration state and scheduling helpers.
 *
 * @returns An object with:
 *   - `expoPushToken`         — the Expo push token string (empty until granted).
 *   - `notification`          — the last `Notifications.Notification` received,
 *                               or `null` if none yet.
 *   - `scheduleDailyReminder` — schedules a recurring daily notification.
 *   - `cancelDailyReminder`   — cancels all scheduled notifications.
 */
export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  useEffect(() => {
    let notificationSubscription: Notifications.Subscription | undefined;
    let responseSubscription: Notifications.Subscription | undefined;

    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    notificationSubscription = Notifications.addNotificationReceivedListener(
      (received) => setNotification(received),
    );

    responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        Sentry.logger.info('Notification response received', {
          extra: { response },
          tags: { feature: 'notifications' },
        });
      },
    );

    return () => {
      notificationSubscription?.remove();
      responseSubscription?.remove();
    };
  }, []);

  /**
   * Schedules a daily recurring push notification at the given time.
   * Any previously scheduled notifications are cancelled first so only one
   * daily reminder is ever active.
   *
   * On Android, creates (or updates) a notification channel named
   * `'daily-reminders'` before scheduling.
   *
   * @param time - Reminder time in 24-hour `HH:MM` format, e.g. `'19:00'`.
   */
  const scheduleDailyReminder = async (time: string) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (Platform.OS === 'web') {
        Sentry.logger.warn(
          '[useNotifications] Push notifications not supported on web',
          { tags: { feature: 'notifications' } },
        );
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-reminders', {
          name: 'Daily Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const [hours, minutes] = time.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to practice conjugating Igbo!',
          body: "Keep your streak going with today's verb practice",
          data: { type: 'daily_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          channelId: 'daily-reminders',
        } as Notifications.DailyTriggerInput,
      });

      Sentry.logger.info(
        `[useNotifications] Daily reminder scheduled for ${time}`,
        { tags: { feature: 'notifications', hook: 'useNotifications' } },
      );
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { feature: 'notifications', hook: 'useNotifications' },
        extra: { context: 'Error scheduling notification' },
      });
    }
  };

  /**
   * Cancels all currently scheduled push notifications.
   */
  const cancelDailyReminder = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Sentry.logger.info('[useNotifications] Daily reminders cancelled', {
        tags: { feature: 'notifications', hook: 'useNotifications' },
      });
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { feature: 'notifications', hook: 'useNotifications' },
        extra: { context: 'Error cancelling notifications' },
      });
    }
  };

  return { expoPushToken, notification, scheduleDailyReminder, cancelDailyReminder };
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Requests push notification permissions and retrieves the Expo push token.
 *
 * @returns The Expo push token string, or `null` if permissions were denied
 *   or the platform does not support push notifications (web).
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Sentry.logger.warn(
      '[useNotifications] Push permission not granted',
      { tags: { feature: 'notifications' } },
    );
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    return token.data;
  } catch (error: any) {
    Sentry.captureException(error, {
      tags: { feature: 'notifications', hook: 'useNotifications' },
      extra: { message: 'Error getting push token' },
    });
    return null;
  }
}
