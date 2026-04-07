import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  if (Constants.appOwnership === "expo") {
    console.warn(
      "Push notifications are not available in Expo Go for SDK 54+. Use a custom development build instead."
    );
    return null;
  }

  if (!Device.isDevice) {
    console.warn("Push notifications only work on a physical device.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Failed to get push notification permission.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3ecf8e",
    });
  }

  const tokenData = await Notifications.getDevicePushTokenAsync();
  const token = tokenData.data;
  console.log("=====================================");
  console.log("✅ DEVICE PUSH TOKEN REGISTROVAN:");
  console.log(token);
  console.log("=====================================");
  console.log("Za test notifikaciju, koristi:");
  console.log('Invoke-WebRequest -Uri "http://192.168.0.28:3000/api/push/notify" -Method POST -ContentType "application/json" -Body \'{"token": "' + token + '", "title": "Test notifikacija", "body": "Ovo je test notifikacija"}\'');
  console.log("=====================================");
  return token;
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isFullscreen, palette } = useTheme();
  const { registerPushToken } = useApp();

  useEffect(() => {
    if (Platform.OS !== "web") {
      registerForPushNotificationsAsync()
        .then((token) => {
          if (token) {
            registerPushToken(token);
          }
        })
        .catch((error) => {
          console.warn("Push registration failed:", error);
        });
    }
  }, [registerPushToken]);

  return (
    <>
      <StatusBar
        hidden={isFullscreen}
        style={palette.statusBarStyle}
        backgroundColor={palette.headerBg}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <ThemeProvider>
                <AppProvider>
                  <RootLayoutNav />
                </AppProvider>
              </ThemeProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
