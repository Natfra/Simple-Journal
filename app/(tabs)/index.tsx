// app/(tabs)/index.tsx
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
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

const { width } = Dimensions.get('window');

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  color: string;
}

interface Color {
  name: string;
  color: string;
}

interface SwipeableNoteCardProps {
  note: Note;
  onDelete: () => void;
}

// Componente para las notas con swipe
const SwipeableNoteCard: React.FC<SwipeableNoteCardProps> = ({ note, onDelete }) => {
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
      
      // Si desliza más de 120px hacia la izquierda, eliminar
      if (eventTranslationX < -120) {
        // Animar hacia fuera completamente
        Animated.timing(translateX, {
          toValue: -width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDelete();
        });
      } else {
        // Regresar a la posición original
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
      {/* Background del botón eliminar */}
      <View style={styles.deleteBackground}>
        <View style={styles.deleteBackgroundContent}>
          <Text style={styles.deleteBackgroundIcon}>🗑️</Text>
          <Text style={styles.deleteBackgroundText}>Eliminar</Text>
        </View>
      </View>

      {/* Tarjeta de nota */}
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
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <Text style={styles.noteTitle} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={styles.noteContent} numberOfLines={3}>
            {note.content}
          </Text>
          <Text style={styles.noteDate}>
            {note.date}
          </Text>
          
          {/* Indicador visual de swipe */}
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
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, title: 'An amazing story', content: 'Once upon a time there was a developer...', date: '10 Nov 2024', color: '#BFDBFE' },
    { id: 2, title: 'Shopping List', content: 'Milk, Bread, Eggs, Coffee, Sugar...', date: '09 Nov 2024', color: '#FEF3C7' },
    { id: 3, title: 'Plan for today', content: 'Meeting at 3pm with the team...', date: '09 Nov 2024', color: '#E9D5FF' },
    { id: 4, title: 'Work Plan', content: 'Review code, Fix bugs, Deploy to production...', date: '08 Nov 2024', color: '#BBF7D0' },
    { id: 5, title: 'Contracts', content: 'Sign new contract with client...', date: '07 Nov 2024', color: '#FED7AA' },
    { id: 6, title: 'Gym workout', content: 'Chest and triceps workout routine...', date: '06 Nov 2024', color: '#FBCFE8' },
  ]);
  
  const [searchText, setSearchText] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#BFDBFE');

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

  const filteredNotes: Note[] = notes.filter((note: Note) =>
    note.title.toLowerCase().includes(searchText.toLowerCase()) ||
    note.content.toLowerCase().includes(searchText.toLowerCase())
  );

  const deleteNote = (id: number): void => {
    Alert.alert(
      'Eliminar Nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: (): void => {
            setNotes((prevNotes: Note[]) => prevNotes.filter((note: Note) => note.id !== id));
          }
        },
      ]
    );
  };



  const resetModal = (): void => {
    setNewNoteTitle('');
    setNewNoteContent('');
    setSelectedColor('#BFDBFE');
    setShowModal(false);
  };

  const confirmDeleteNote = (id: number): void => {
    deleteNote(id);
  };

  const handleSearchChange = (text: string): void => {
    setSearchText(text);
  };

  const clearSearch = (): void => {
    setSearchText('');
  };

  const handleNewNoteTitleChange = (text: string): void => {
    setNewNoteTitle(text);
  };

  const handleNewNoteContentChange = (text: string): void => {
    setNewNoteContent(text);
  };

  const handleColorSelection = (color: string): void => {
    setSelectedColor(color);
  };

  const openModal = (): void => {
    setShowModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>All Notes</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Text style={styles.iconText}>⊞</Text>
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
            placeholder="Search notes"
            value={searchText}
            onChangeText={handleSearchChange}
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
              <Text style={styles.clearIcon}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notes List */}
      <ScrollView 
        style={styles.notesList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filteredNotes.length === 0 ? styles.emptyContainer : styles.notesContainer}
      >
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No se encontraron notas</Text>
            <Text style={styles.emptySubtitle}>
              {searchText ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera nota tocando el botón +'}
            </Text>
          </View>
        ) : (
          filteredNotes.map((note: Note) => (
            <SwipeableNoteCard
              key={note.id}
              note={note}
              onDelete={() => confirmDeleteNote(note.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openModal}
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
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.colorSection}>
              <Text style={styles.colorLabel}>Elige un color:</Text>
              <View style={styles.colorGrid}>
                {colors.map((color: Color) => (
                  <TouchableOpacity
                    key={color.color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color.color },
                      selectedColor === color.color && styles.selectedColor
                    ]}
                    onPress={() => handleColorSelection(color.color)}
                    activeOpacity={0.7}
                    accessibilityLabel={`Seleccionar color ${color.name}`}
                    accessibilityRole="button"
                  >
                    {selectedColor === color.color && (
                      <View style={styles.colorIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={resetModal}
                activeOpacity={0.7}
                accessibilityLabel="Cancelar creación de nota"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                activeOpacity={0.7}
                accessibilityLabel="Crear nueva nota"
                accessibilityRole="button"
              >
                <Text style={styles.createButtonText}>Crear Nota</Text>
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
  notesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  notesContainer: {
    paddingBottom: 100, // Espacio para el FAB
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#374151',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  colorSection: {
    marginBottom: 24,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
});