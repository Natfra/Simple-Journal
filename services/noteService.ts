// services/notesService.ts
/**
 * Servicio para gestionar todas las operaciones de notas.
 * Este servicio actúa como una capa de abstracción entre la UI y la base de datos.
 * Cuando conectes la base de datos real, solo necesitas modificar las implementaciones aquí.
 */

export interface Note {
  id: string; // Cambiado a string para compatibilidad con UUIDs de DB
  title: string;
  content: string;
  emoji: string;
  date: string; // ISO string
  color: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateNoteDTO {
  title: string;
  content: string;
  emoji: string;
  color: string;
}

export interface UpdateNoteDTO {
  id: string;
  title?: string;
  content?: string;
  emoji?: string;
  color?: string;
}

// ============================================
// STORAGE TEMPORAL (Reemplazar con DB real)
// ============================================
let notesStorage: Note[] = [
  {
    id: '1',
    title: 'An amazing story',
    content: 'Once upon a time there was a developer...',
    emoji: '📖',
    date: '10 Nov 2024',
    color: '#BFDBFE',
    createdAt: new Date('2024-11-10').toISOString(),
    updatedAt: new Date('2024-11-10').toISOString(),
  },
  {
    id: '2',
    title: 'Shopping List',
    content: 'Milk, Bread, Eggs, Coffee, Sugar...',
    emoji: '🛒',
    date: '09 Nov 2024',
    color: '#FEF3C7',
    createdAt: new Date('2024-11-09').toISOString(),
    updatedAt: new Date('2024-11-09').toISOString(),
  },
  {
    id: '3',
    title: 'Plan for today',
    content: 'Meeting at 3pm with the team...',
    emoji: '📋',
    date: '09 Nov 2024',
    color: '#E9D5FF',
    createdAt: new Date('2024-11-09').toISOString(),
    updatedAt: new Date('2024-11-09').toISOString(),
  },
];

// Función auxiliar para generar IDs temporales
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Función auxiliar para formatear fechas
const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('es-ES', options);
};

// ============================================
// OPERACIONES CRUD
// ============================================

/**
 * Obtiene todas las notas ordenadas por fecha de actualización (más reciente primero)
 */
export const getAllNotes = async (): Promise<Note[]> => {
  try {
    // TODO: Reemplazar con consulta a la base de datos
    // Ejemplo: const notes = await db.notes.findAll({ orderBy: 'updatedAt DESC' });
    
    // Simular delay de red (opcional, remover en producción)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return [...notesStorage].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error al obtener notas:', error);
    throw new Error('No se pudieron cargar las notas');
  }
};

/**
 * Obtiene una nota por su ID
 */
export const getNoteById = async (id: string): Promise<Note | null> => {
  try {
    // TODO: Reemplazar con consulta a la base de datos
    // Ejemplo: const note = await db.notes.findById(id);
    
    const note = notesStorage.find(n => n.id === id);
    return note || null;
  } catch (error) {
    console.error('Error al obtener nota:', error);
    throw new Error('No se pudo cargar la nota');
  }
};

/**
 * Crea una nueva nota
 */
export const createNote = async (noteData: CreateNoteDTO): Promise<Note> => {
  try {
    // Validación básica
    if (!noteData.title.trim()) {
      throw new Error('El título no puede estar vacío');
    }

    const now = new Date();
    const newNote: Note = {
      id: generateId(), // TODO: La DB generará el ID automáticamente
      title: noteData.title.trim(),
      content: noteData.content.trim(),
      emoji: noteData.emoji || '📝',
      color: noteData.color,
      date: formatDate(now),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // TODO: Reemplazar con inserción en base de datos
    // Ejemplo: const createdNote = await db.notes.create(newNote);
    
    notesStorage.unshift(newNote); // Agregar al inicio
    
    console.log('✅ Nota creada:', newNote.id);
    return newNote;
  } catch (error) {
    console.error('Error al crear nota:', error);
    throw error;
  }
};

/**
 * Actualiza una nota existente
 */
export const updateNote = async (noteData: UpdateNoteDTO): Promise<Note> => {
  try {
    const noteIndex = notesStorage.findIndex(n => n.id === noteData.id);
    
    if (noteIndex === -1) {
      throw new Error('Nota no encontrada');
    }

    const existingNote = notesStorage[noteIndex];
    const now = new Date();

    const updatedNote: Note = {
      ...existingNote,
      title: noteData.title?.trim() ?? existingNote.title,
      content: noteData.content?.trim() ?? existingNote.content,
      emoji: noteData.emoji ?? existingNote.emoji,
      color: noteData.color ?? existingNote.color,
      date: formatDate(now),
      updatedAt: now.toISOString(),
    };

    // TODO: Reemplazar con actualización en base de datos
    // Ejemplo: await db.notes.update(noteData.id, updatedNote);
    
    notesStorage[noteIndex] = updatedNote;
    
    console.log('✅ Nota actualizada:', updatedNote.id);
    return updatedNote;
  } catch (error) {
    console.error('Error al actualizar nota:', error);
    throw error;
  }
};

/**
 * Elimina una nota
 */
export const deleteNote = async (id: string): Promise<void> => {
  try {
    const noteIndex = notesStorage.findIndex(n => n.id === id);
    
    if (noteIndex === -1) {
      throw new Error('Nota no encontrada');
    }

    // TODO: Reemplazar con eliminación en base de datos
    // Ejemplo: await db.notes.delete(id);
    
    notesStorage.splice(noteIndex, 1);
    
    console.log('✅ Nota eliminada:', id);
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    throw error;
  }
};

/**
 * Busca notas por texto (título o contenido)
 */
export const searchNotes = async (query: string): Promise<Note[]> => {
  try {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return getAllNotes();
    }

    // TODO: Reemplazar con búsqueda en base de datos
    // Ejemplo: const notes = await db.notes.search(query);
    
    const allNotes = await getAllNotes();
    return allNotes.filter(note =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Error al buscar notas:', error);
    throw new Error('No se pudo realizar la búsqueda');
  }
};

// ============================================
// FUNCIONES AUXILIARES PARA LA DB
// ============================================

/**
 * Inicializa la base de datos (llamar al inicio de la app)
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // TODO: Inicializar la base de datos real aquí
    // Ejemplo con SQLite:
    // await db.execute(`
    //   CREATE TABLE IF NOT EXISTS notes (
    //     id TEXT PRIMARY KEY,
    //     title TEXT NOT NULL,
    //     content TEXT,
    //     emoji TEXT,
    //     color TEXT,
    //     date TEXT,
    //     createdAt TEXT,
    //     updatedAt TEXT
    //   )
    // `);
    
    console.log('✅ Base de datos inicializada (modo temporal)');
  } catch (error) {
    console.error('Error al inicializar base de datos:', error);
    throw error;
  }
};

/**
 * Exporta todas las notas (útil para backup)
 */
export const exportNotes = async (): Promise<Note[]> => {
  return getAllNotes();
};

/**
 * Importa notas desde un backup
 */
export const importNotes = async (notes: Note[]): Promise<void> => {
  try {
    // TODO: Implementar importación con validación
    notesStorage = [...notes];
    console.log(`✅ ${notes.length} notas importadas`);
  } catch (error) {
    console.error('Error al importar notas:', error);
    throw new Error('No se pudieron importar las notas');
  }
};