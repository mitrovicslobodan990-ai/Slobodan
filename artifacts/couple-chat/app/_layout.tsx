import React from 'react';
import { Slot } from 'expo-router';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';
import { UpdateChecker } from '../components/UpdateChecker';
import { PushNotificationSetup } from '../components/PushNotificationSetup';

export default function RootLayout() {
  return (
    <AppProvider>
      <ThemeProvider>
        <PushNotificationSetup />
        <UpdateChecker />
        <Slot />
      </ThemeProvider>
    </AppProvider>
  );
}
