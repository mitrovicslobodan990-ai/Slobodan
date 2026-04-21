import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { useApp } from '@/context/AppContext';

// Postavi kako se notifikacije prikazuju dok je app otvorena
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const { registerPushToken, currentUser, isInitialized } = useApp();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Čekaj da se AppContext inicijalizuje i da userId bude poznat
    if (!isInitialized || !currentUser.id) return;

    async function registerToken() {
      // Expo push tokeni rade samo na fizičkom uređaju
      if (!Device.isDevice) {
        console.log('⚠️ Push notifikacije rade samo na fizičkom uređaju');
        return;
      }

      // Zatraži dozvolu
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Dozvola odbijena', 'Potrebna je dozvola za push notifikacije.');
        return;
      }

      // Dobij Expo push token vezan za ovaj uređaj
      // projectId osigurava da token pripada ovoj aplikaciji
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '9296e262-3e29-43d8-bd9c-290d5248654f',
      });

      const token = tokenData.data;
      console.log(`✅ Expo push token za ${currentUser.id}: ${token}`);

      // Registruj token na serveru pod currentUser.id kao ključem
      // Tako Slobodanov token ide na pushTokens/slobodan
      // a Aleksandrin token ide na pushTokens/aleksandra
      await registerPushToken(token);

      // Android kanal za notifikacije
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    }

    registerToken();

    // Listener za primljene notifikacije dok je app otvorena
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📩 Notifikacija primljena:', notification);
    });

    // Listener za tap na notifikaciju
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Tap na notifikaciju:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isInitialized, currentUser.id]);
}
