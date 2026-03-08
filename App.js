import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainLayout from './src/screens/MainLayout';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <MainLayout />
    </SafeAreaProvider>
  );
}
