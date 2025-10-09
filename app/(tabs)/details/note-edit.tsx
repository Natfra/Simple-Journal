// app/(tabs)/details/note-edit.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const COLOR_BAND_HEIGHT = 220; 
const HEADER_TITLE_THRESHOLD = COLOR_BAND_HEIGHT * 0.75; 

// Función para aclarar el color (Crea los derivados sutiles)
const lightenColor = (hex: string, amount: number) => {
  const color = hex.startsWith('#') ? hex.slice(1) : hex;
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  let newR = Math.min(255, r + Math.floor((255 - r) * amount));
  let newG = Math.min(255, g + Math.floor((255 - g) * amount));
  let newB = Math.min(255, b + Math.floor((255 - b) * amount));
  
  newR = Math.min(255, Math.max(0, newR));
  newG = Math.min(255, Math.max(0, newG));
  newB = Math.min(255, Math.max(0, newB));

  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};


export default function NoteEditScreen(): React.JSX.Element {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // OBTENIENDO DATOS DINÁMICOS. Usamos valores por defecto si no llegan los parámetros.
  // NO usamos useState para estos valores, porque ya vienen de la navegación.
  const initialNoteColor = (params.color as string) || '#FDE68A'; 
  const initialNoteTitle = (params.title as string) || 'Shopping List';
  const initialNoteContent = (params.content as string) || 'Milk, Bread, Eggs, Coffee, Sugar...';
  const initialNoteEmoji = (params.emoji as string) || '📘';
  const initialNoteDate = (params.date as string) || 'Fecha desconocida'; // Usado para propósitos de ejemplo/futuros

  const headerTitleOpacity = useRef(new Animated.Value(0)).current;

  // ESTADO PARA LA EDICIÓN: Usamos useState para la versión editable de los campos
  // que el usuario puede cambiar, inicializados con los valores dinámicos.
  const [currentNoteTitle, setCurrentNoteTitle] = useState<string>(initialNoteTitle);
  const [currentNoteContent, setCurrentNoteContent] = useState<string>(initialNoteContent);
  const [currentNoteEmoji, setCurrentNoteEmoji] = useState<string>(initialNoteEmoji);

  // EFECTO PARA SINCRONIZAR: Re-sincronizar el estado de edición (current...) 
  // cuando los parámetros de navegación (initial...) cambian.
  React.useEffect(() => {
    setCurrentNoteTitle(initialNoteTitle);
    setCurrentNoteContent(initialNoteContent);
    setCurrentNoteEmoji(initialNoteEmoji);
  }, [initialNoteTitle, initialNoteContent, initialNoteEmoji]);

  // CÁLCULOS DE DISEÑO BASADOS EN EL COLOR DINÁMICO
  const noteColor = initialNoteColor; // Usamos el color base dinámico
  const boxColor = lightenColor(noteColor, 0.20); // Color de la caja flotante: Color base LIGERAMENTE aclarado
  const contentBackgroundColor = '#FFFFFF'; // Fondo del contenido: BLANCO PURO

  const handleGoBack = () => {
    router.back();
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const opacity = Math.min(1, Math.max(0, scrollY / HEADER_TITLE_THRESHOLD));

    Animated.timing(headerTitleOpacity, {
      toValue: opacity,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  // Lógica de cambio de emoji CORREGIDA para evitar devolver un valor no-string
  const handleEmojiChange = (text: string) => {
    // Si la entrada no es un string o está vacía, devuelve ''
    if (!text || text.length === 0) {
        setCurrentNoteEmoji('');
        return;
    }
    // Para asegurar que solo se muestre el último carácter (el último emoji introducido)
    setCurrentNoteEmoji(text.slice(-1));
  };
  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: noteColor }]} edges={['top']}>
      <StatusBar style="dark" backgroundColor={noteColor} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.header, { 
          backgroundColor: noteColor, 
          borderBottomColor: 'transparent'
        }]}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleGoBack}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Animated.Text 
              style={[
                styles.headerTitleText,
                { opacity: headerTitleOpacity } 
              ]} 
              numberOfLines={1}
            >
              {currentNoteTitle}
            </Animated.Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerIconButton}
              activeOpacity={0.7}
            >
              <Text style={styles.headerIcon}>🧨</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerIconButton}
              activeOpacity={0.7}
            >
              <Text style={styles.headerIcon}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.contentArea}
          contentContainerStyle={[
            styles.contentContainer, 
            { backgroundColor: contentBackgroundColor } 
          ]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll} 
          scrollEventThrottle={16}
        >
          <View style={[styles.colorBand, { backgroundColor: noteColor }]}>
            <View style={[styles.floatingTitleBox, { 
                backgroundColor: boxColor, 
                borderColor: 'transparent', 
              }]}>
              <TextInput
                style={styles.emojiInput}
                value={currentNoteEmoji}
                // *** AQUÍ ESTÁ LA CORRECCIÓN CLAVE ***
                onChangeText={handleEmojiChange} 
                // ************************************
                placeholder="📖"
                maxLength={2}
              />
              <TextInput
                style={styles.displayTitle}
                value={currentNoteTitle}
                onChangeText={setCurrentNoteTitle}
                placeholder="Título"
                placeholderTextColor="rgba(31, 41, 55, 0.4)"
                multiline={false}
                maxLength={50}
              />
            </View>
          </View>

          <TextInput
            style={styles.contentInput}
            value={currentNoteContent}
            onChangeText={setCurrentNoteContent}
            placeholder="Escribe tu nota aquí..."
            placeholderTextColor="rgba(31, 41, 55, 0.3)"
            multiline
            textAlignVertical="top"
            autoFocus={false}
          />
        </ScrollView>

        <View style={[styles.bottomToolbar, { 
          backgroundColor: contentBackgroundColor, 
          borderTopColor: '#E5E7EB'
        }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarContent}
          >
            <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}><Text style={styles.toolIcon}>✏️</Text></TouchableOpacity>
            <View style={styles.toolDivider} />
            <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}><Text style={styles.toolIcon}>☑️</Text></TouchableOpacity>
            <View style={styles.toolDivider} />
            <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}><Text style={styles.toolIconText}>T</Text></TouchableOpacity>
            <View style={styles.toolDivider} />
            <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}><Text style={styles.toolIconText}>U</Text></TouchableOpacity>
            <View style={styles.toolDivider} />
            <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}><Text style={styles.toolIconText}>I</Text></TouchableOpacity>
            <View style={styles.toolDivider} />
            <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}><Text style={styles.toolIcon}>A</Text></TouchableOpacity>
            <View style={styles.toolDivider} />
            <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}><Text style={styles.toolIcon}>S</Text></TouchableOpacity>
            <View style={styles.toolDivider} />
            <TouchableOpacity style={styles.toolButton} activeOpacity={0.7}><Text style={styles.toolIcon}>≡</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
    zIndex: 10, 
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: '400',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    color: '#1F2937',
  },
  contentArea: {
    flex: 1,
    marginTop: -1, 
  },
  contentContainer: {
    padding: 0,
    minHeight: height * 0.9, 
  },
  colorBand: {
    height: COLOR_BAND_HEIGHT, 
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 0, 
    paddingBottom: 20, 
    marginTop: 0, 
    justifyContent: 'flex-end',
  },
  floatingTitleBox: {
    borderRadius: 16, 
    padding: 15, 
    marginBottom: 10, 
    borderWidth: 0, 
    borderColor: 'transparent', 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2, 
    },
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 4, 
  },
  emojiInput: {
    fontSize: 48,
    marginBottom: 10,
    width: 60,
    height: 60,
    textAlign: 'left',
    paddingVertical: 0,
  },
  displayTitle: {
    fontSize: 32, 
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 0,
    lineHeight: 38,
    padding: 0, 
    paddingHorizontal: 0,
  },
  contentInput: {
    fontSize: 18, 
    color: '#1F2937',
    lineHeight: 30, 
    minHeight: height * 0.6,
    paddingBottom: 50,
    paddingHorizontal: 20, 
    paddingTop: 20, 
  },
  bottomToolbar: {
    paddingVertical: 8,
    borderTopWidth: 1,
    // Se ajustaron los colores del toolbar para mayor contraste y consistencia
  },
  toolbarContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  toolButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  toolIcon: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '700',
  },
  toolIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  toolDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D1D5DB',
  },
});