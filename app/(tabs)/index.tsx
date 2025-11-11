// app/(tabs)/index.tsx
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  State
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNotes } from '@/hooks/useNotas';
import { Note } from '@/services/noteService';

const { width } = Dimensions.get('window');

interface Color {
  name: string;
  color: string;
}

interface SwipeableNoteCardProps {
  note: Note;
  onDelete: () => void;
  onPress: () => void;
}

// Componente para las notas con swipe
const SwipeableNoteCard: React.FC<SwipeableNoteCardProps> = ({ note, onDelete, onPress }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState<boolean>(false);

  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent): void => {
    const { state, translationX: eventTranslationX } = event.nativeEvent;

    if (state === State.BEGAN) {
      setSwiping(true);
    }

    if (state === State.END) {
      setSwiping(false);
      
      if (eventTranslationX < -120) {
        Animated.timing(translateX, {
          toValue: -width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDelete();
        });
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.deleteBackground}>
        <View style={styles.deleteBackgroundContent}>
          <Text style={styles.deleteBackgroundIcon}>🗑️</Text>
          <Text style={styles.deleteBackgroundText}>Eliminar</Text>
        </View>
      </View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-20, 20]}
      >
        <Animated.View
          style={[
            styles.noteCard,
            { backgroundColor: note.color },
            { transform: [{ translateX }] },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={onPress}
            style={styles.noteCardContent}
          >
            <View style={styles.noteHeader}>
              <Text style={styles.noteEmoji}>{note.emoji}</Text>
              <Text style={styles.noteTitle} numberOfLines={1}>
                {note.title}
              </Text>
            </View>
            <Text style={styles.noteContent} numberOfLines={3}>
              {note.content}
            </Text>
            <Text style={styles.noteDate}>{note.date}</Text>
          </TouchableOpacity>
          
          {swiping && (
            <View style={styles.swipeIndicator}>
              <Text style={styles.swipeIndicatorText}>← Desliza para eliminar</Text>
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default function NotesScreen(): React.JSX.Element {
  const router = useRouter();
  const {
    notes,
    isLoading,
    error,
    searchQuery,
    createNewNote,
    deleteExistingNote,
    setSearchQuery,
    clearError,
    refreshNotes,
  } = useNotes();

  // Estados del modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [newNoteEmoji, setNewNoteEmoji] = useState<string>('📝');
  const [selectedColor, setSelectedColor] = useState<string>('#BFDBFE');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const colors: Color[] = [
    { name: 'Azul', color: '#BFDBFE' },
    { name: 'Amarillo', color: '#FEF3C7' },
    { name: 'Púrpura', color: '#E9D5FF' },
    { name: 'Verde', color: '#BBF7D0' },
    { name: 'Naranja', color: '#FED7AA' },
    { name: 'Rosa', color: '#FBCFE8' },
    { name: 'Gris', color: '#E5E7EB' },
    { name: 'Rojo', color: '#FECACA' },
  ];

  // Manejar eliminación de nota
  const handleDeleteNote = useCallback((id: string): void => {
    Alert.alert(
      'Eliminar Nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async (): Promise<void> => {
            try {
              await deleteExistingNote(id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar la nota');
            }
          },
        },
      ]
    );
  }, [deleteExistingNote]);

  // Abrir nota para editar
  const openNoteForEdit = useCallback((note: Note): void => {
    router.push({
      pathname: '/(tabs)/details/note-edit',
      params: {
        id: note.id,
        title: note.title,
        content: note.content,
        color: note.color,
        emoji: note.emoji,
        date: note.date,
      },
    });
  }, [router]);

  // Resetear el modal
  const resetModal = useCallback((): void => {
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteEmoji('📝');
    setSelectedColor('#BFDBFE');
    setShowModal(false);
    setIsCreating(false);
  }, []);

  // Crear nueva nota
  const handleCreateNote = useCallback(async (): Promise<void> => {
    // Validación
    if (!newNoteTitle.trim()) {
      Alert.alert('Error', 'El título no puede estar vacío');
      return;
    }

    setIsCreating(true);

    try {
      const newNote = await createNewNote({
        title: newNoteTitle,
        content: newNoteContent,
        emoji: newNoteEmoji,
        color: selectedColor,
      });

      // Cerrar modal y mostrar confirmación
      resetModal();
      
      // Opcional: Navegar directamente a la nota creada para editarla
      Alert.alert(
        'Nota Creada',
        '¿Deseas abrir la nota para editarla?',
        [
          { text: 'Después', style: 'cancel' },
          {
            text: 'Abrir',
            onPress: () => openNoteForEdit(newNote),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear la nota');
    } finally {
      setIsCreating(false);
    }
  }, [newNoteTitle, newNoteContent, newNoteEmoji, selectedColor, createNewNote, resetModal, openNoteForEdit]);

  // Manejar cambio en la búsqueda
  const handleSearchChange = useCallback((text: string): void => {
    setSearchQuery(text);
  }, [setSearchQuery]);

  const clearSearch = useCallback((): void => {
    setSearchQuery('');
  }, [setSearchQuery]);

  // Manejar emoji
  const handleEmojiChange = (text: string) => {
    if (!text || text.length === 0) {
      setNewNoteEmoji('📝');
      return;
    }
    setNewNoteEmoji(text.slice(-1));
  };

  // Mostrar error si existe
  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Mis Notas</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton} 
              activeOpacity={0.7}
              onPress={refreshNotes}
            >
              <Text style={styles.iconText}>↻</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Text style={styles.iconText}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar notas"
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
              <Text style={styles.clearIcon}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notes List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando notas...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.notesList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={notes.length === 0 ? styles.emptyContainer : styles.notesContainer}
        >
          {notes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No se encontraron notas</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera nota tocando el botón +'}
              </Text>
            </View>
          ) : (
            notes.map((note: Note) => (
              <SwipeableNoteCard
                key={note.id}
                note={note}
                onDelete={() => handleDeleteNote(note.id)}
                onPress={() => openNoteForEdit(note)}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal para nueva nota */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={resetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Nota</Text>
              <TouchableOpacity
                onPress={resetModal}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
                disabled={isCreating}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Selector de Emoji */}
              <View style={styles.emojiSection}>
                <Text style={styles.inputLabel}>Emoji:</Text>
                <TextInput
                  style={styles.emojiInput}
                  value={newNoteEmoji}
                  onChangeText={handleEmojiChange}
                  placeholder="📝"
                  maxLength={2}
                  editable={!isCreating}
                />
              </View>

              {/* Título */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Título:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Mi día increíble"
                  value={newNoteTitle}
                  onChangeText={setNewNoteTitle}
                  maxLength={50}
                  editable={!isCreating}
                />
              </View>

              {/* Contenido */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Contenido (opcional):</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Escribe aquí..."
                  value={newNoteContent}
                  onChangeText={setNewNoteContent}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isCreating}
                />
              </View>

              {/* Selector de Color */}
              <View style={styles.colorSection}>
                <Text style={styles.colorLabel}>Color:</Text>
                <View style={styles.colorGrid}>
                  {colors.map((color: Color) => (
                    <TouchableOpacity
                      key={color.color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color.color },
                        selectedColor === color.color && styles.selectedColor
                      ]}
                      onPress={() => setSelectedColor(color.color)}
                      activeOpacity={0.7}
                      disabled={isCreating}
                    >
                      {selectedColor === color.color && (
                        <View style={styles.colorIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Botones */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={resetModal}
                activeOpacity={0.7}
                disabled={isCreating}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton, isCreating && styles.disabledButton]}
                onPress={handleCreateNote}
                activeOpacity={0.7}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.createButtonText}>Crear Nota</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  clearIcon: {
    fontSize: 20,
    color: '#9CA3AF',
    paddingLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  notesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  notesContainer: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  swipeContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    width: 120,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  deleteBackgroundContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBackgroundIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  deleteBackgroundText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noteCard: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteCardContent: {
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  swipeIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  noteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  noteContent: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 22,
  },
  noteDate: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#3B82F6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  plusIcon: {
    fontSize: 28,
    color: 'white',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  emojiSection: {
    marginBottom: 16,
  },
  emojiInput: {
    fontSize: 48,
    height: 60,
    textAlign: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  colorSection: {
    marginBottom: 20,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  colorButton: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderColor: '#374151',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#3B82F6',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});