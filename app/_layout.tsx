// app/_layout.tsx
import 'react-native-gesture-handler';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { getDatabaseInfo, initializeDatabase } from '@/services/database';
import { seedDatabase } from '@/services/noteService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Estado para controlar la carga (sin fuentes personalizadas)
  const [loaded, setLoaded] = useState(true);
  const [isDbReady, setIsDbReady] = useState(false);

  // Inicializar base de datos
  useEffect(() => {
    async function setupDatabase() {
      try {
        console.log('🔄 Inicializando base de datos...');
        
        // Inicializar tablas
        await initializeDatabase();
        
        // Obtener información de la DB
        const dbInfo = await getDatabaseInfo();
        console.log('📊 Estado de la base de datos:', dbInfo);
        
        // Si no hay notas, poblar con datos de ejemplo
        if (dbInfo.notesCount === 0) {
          console.log('📝 Poblando base de datos con datos de ejemplo...');
          await seedDatabase();
        }
        
        setIsDbReady(true);
        console.log('✅ Base de datos lista');
      } catch (error: any) {
        console.error('❌ Error al configurar base de datos:', error);
        // Aún así marcamos como lista para no bloquear la app
        setIsDbReady(true);
      }
    }

    setupDatabase();
  }, []);

  // Esperar a que todo esté listo
  useEffect(() => {
    if (loaded && isDbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isDbReady]);

  // Mostrar loading mientras se carga
  if (!loaded || !isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});