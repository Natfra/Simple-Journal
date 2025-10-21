// app/(tabs)/details/note-edit.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importación del servicio de gemini
import { generateGeminiContent } from '@/services/geminiService';


const { width, height } = Dimensions.get('window');
const COLOR_BAND_HEIGHT = 220;
const HEADER_TITLE_THRESHOLD = COLOR_BAND_HEIGHT * 0.75;

// Función para aclarar el color 
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

  // OBTENIENDO DATOS DINÁMICOS
  const initialNoteColor = (params.color as string) || '#FDE68A';
  const initialNoteTitle = (params.title as string) || 'Nueva Nota';
  const initialNoteContent = (params.content as string) || ''; // Contenido vacío por defecto
  const initialNoteEmoji = (params.emoji as string) || '📘';
  const initialNoteDate = (params.date as string) || 'Fecha desconocida';

  const headerTitleOpacity = useRef(new Animated.Value(0)).current;
  // Referencia para el scrollview
  const scrollViewRef = useRef<ScrollView>(null);


  // Estados principales de edición
  const [currentNoteTitle, setCurrentNoteTitle] = useState<string>(initialNoteTitle);
  const [currentNoteContent, setCurrentNoteContent] = useState<string>(initialNoteContent);
  const [currentNoteEmoji, setCurrentNoteEmoji] = useState<string>(initialNoteEmoji);

  // Estados para la IA
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Efecto para sincronizar
  React.useEffect(() => {
    setCurrentNoteTitle(initialNoteTitle);
    setCurrentNoteContent(initialNoteContent);
    setCurrentNoteEmoji(initialNoteEmoji);
  }, [initialNoteTitle, initialNoteContent, initialNoteEmoji]);

  // Cálculos de diseño basados en el color dinámico
  const noteColor = initialNoteColor;
  const boxColor = lightenColor(noteColor, 0.20);
  const contentBackgroundColor = '#FFFFFF';

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

  const handleEmojiChange = (text: string) => {
    if (!text || text.length === 0) {
      setCurrentNoteEmoji('');
      return;
    }
    setCurrentNoteEmoji(text.slice(-1));
  };
  
  // LÓGICA DE LA IA 
  const handleGenerateWithAI = useCallback(async () => {
    if (!aiPrompt.trim()) {
      Alert.alert('Atención', 'Por favor, escribe una pregunta para el asistente.');
      return;
    }

    setIsGenerating(true);
    setIsModalVisible(false); // Cierra el modal mientras genera

    try {
      // Usar la versión actual del contenido para el PROMPT de CONTEXTO
      const context = currentNoteContent.trim() || ''; 
      
      const fullPrompt = context 
        ? `Basado en el siguiente texto de mi diario, por favor, genera una respuesta, un resumen, o una expansión según esta instrucción: "${aiPrompt}".\n\nTexto del diario: "${context}"`
        : `Genera una respuesta o contenido basado en la siguiente instrucción: "${aiPrompt}"`;

      const result = await generateGeminiContent(fullPrompt);
      
      // Usar la función de actualización de estado para aprender el contenido de forma segura
      setCurrentNoteContent(prevContent => {
        // En este punto, 'prevContent' es el estado más actual.
        const currentContext = prevContent.trim();
        // Usamos un separador si la nota no estaba vacía antes del resultado de la IA
        const separator = currentContext ? '\n\n---\n\n✨ Asistente IA:\n' : '';
        
        // Si la nota estaba vacía antes de la generación, el texto de la IA es el nuevo contenido.
        return `${prevContent}${separator}${result.text}`;
      });
      
      setAiPrompt(''); // Limpiar el prompt

      Alert.alert('Asistente IA', 'Contenido generado y añadido a tu nota.');
      
      // Desplazar ala final
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error: any) {
      console.error('Error al generar contenido con Gemini:', error);
      Alert.alert('Error de IA', `No se pudo conectar con el asistente. ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [aiPrompt, currentNoteContent]);

  // TEMPORAL: Función de guardado simple (debe ser reemplazada por la lógica de DB)
  const handleSaveNote = () => {
    if (!currentNoteTitle.trim() || !currentNoteContent.trim()) {
       Alert.alert('Error', 'El título y el contenido no pueden estar vacíos.');
       return;
    }
    // Aquí iría la llamada a createEntry/updateEntry de useAppDB
    Alert.alert('Guardado (TEMP)', `Nota "${currentNoteTitle}" guardada localmente.`);
    // router.back();
  }


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
            {/* BOTÓN DEL ASISTENTE IA */}
            <TouchableOpacity 
              style={styles.headerIconButton}
              activeOpacity={0.7}
              onPress={() => setIsModalVisible(true)} // Abre el modal de IA
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#1F2937" />
              ) : (
                <Ionicons name="sparkles" size={24} color="#1F2937" />
              )}
            </TouchableOpacity>
            {/* BOTÓN DE GUARDAR (Temporal) */}
            <TouchableOpacity 
              style={styles.headerIconButton}
              activeOpacity={0.7}
              onPress={handleSaveNote} // Llama a la función de guardado
            >
              <Text style={styles.headerIcon}>💾</Text> 
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
          ref={scrollViewRef}
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
                onChangeText={handleEmojiChange} 
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
      
      {/* MODAL DEL ASISTENTE DE IA */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={modalStyles.centeredView}>
            {/* Evita que los toques dentro del modal lo cierren */}
            <TouchableWithoutFeedback>
              <View style={modalStyles.modalView}>
                <Text style={modalStyles.modalTitle}>Asistente de Diario IA ✨</Text>
                <Text style={modalStyles.modalSubtitle}>
                  Escribe una instrucción (ej: "Resume esta entrada en tres frases" o "Genera un plan de acción").
                </Text>
                
                <TextInput
                  style={modalStyles.promptInput}
                  placeholder="Tu pregunta para la IA..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={aiPrompt}
                  onChangeText={setAiPrompt}
                  editable={!isGenerating}
                />

                <TouchableOpacity 
                  style={modalStyles.generateButton}
                  onPress={handleGenerateWithAI}
                  disabled={isGenerating || !aiPrompt.trim()}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={modalStyles.generateButtonText}>Generar Contenido</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Indicador de carga de generación de IA  */}
      {isGenerating && (
        <View style={styles.generationOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.generationText}>Generando ideas con la IA...</Text>
        </View>
      )}

    </SafeAreaView>
  );
}

// --- ESTILOS COMPONENTES PRINCIPALES ---
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
  // ESTILOS PARA EL OVERLAY DE CARGA DE IA
  generationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, 
  },
  generationText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});

// --- ESTILOS DEL MODAL DE IA ---
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#6B7280',
  },
  promptInput: {
    width: '100%',
    minHeight: 80,
    maxHeight: 150,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
