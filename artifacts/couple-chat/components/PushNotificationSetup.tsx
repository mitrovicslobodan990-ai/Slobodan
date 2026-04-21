import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationSetup() {
  usePushNotifications();
  return null;
}
