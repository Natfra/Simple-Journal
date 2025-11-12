// services/notesService.ts
/**
 * Servicio para gestionar todas las operaciones de notas con SQLite.
 * Este servicio maneja todas las operaciones CRUD conectadas a SQLite.
 */

import { db } from './database';



export interface Note {
  id: string;
  title: string;
  content: string;
  emoji: string;
  date: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  userId: string | null;
}

export interface CreateNoteDTO {
  title: string;
  content: string;
  emoji: string;
  color: string;
  categoryId?: string;
  userId?: string;
}

export interface UpdateNoteDTO {
  id: string;
  title?: string;
  content?: string;
  emoji?: string;
  color?: string;
  categoryId?: string;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Genera un ID único usando timestamp y random
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formatea una fecha al formato legible
 */
const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('es-ES', options);
};

/**
 * Convierte una fila de la base de datos al tipo Note
 */
const rowToNote = (row: any): Note => {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    emoji: row.emoji || '📝',
    date: row.date,
    color: row.color,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    categoryId: row.categoryId,
    userId: row.userId,
  };
};

// ============================================
// OPERACIONES CRUD
// ============================================

/**
 * Obtiene todas las notas ordenadas por fecha de actualización (más reciente primero)
 */
export const getAllNotes = async (userId?: string): Promise<Note[]> => {
  try {
    let query = `
      SELECT * FROM notes
      ${userId ? 'WHERE userId = ?' : ''}
      ORDER BY updatedAt DESC
    `;

    const result = userId 
      ? await db.getAllAsync<Note>(query, [userId])
      : await db.getAllAsync<Note>(query);

    return result.map(rowToNote);
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
    const result = await db.getFirstAsync<Note>(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );

    if (!result) {
      return null;
    }

    return rowToNote(result);
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
      id: generateId(),
      title: noteData.title.trim(),
      content: noteData.content.trim(),
      emoji: noteData.emoji || '📝',
      color: noteData.color,
      date: formatDate(now),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      categoryId: noteData.categoryId || null,
      userId: noteData.userId || null,
    };

    // Insertar en la base de datos
    await db.runAsync(
      `INSERT INTO notes (id, title, content, emoji, color, date, createdAt, updatedAt, categoryId, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newNote.id,
        newNote.title,
        newNote.content,
        newNote.emoji,
        newNote.color,
        newNote.date,
        newNote.createdAt,
        newNote.updatedAt,
        newNote.categoryId,
        newNote.userId,
      ]
    );

    console.log('✅ Nota creada en SQLite:', newNote.id);
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
    // Obtener la nota existente
    const existingNote = await getNoteById(noteData.id);
    
    if (!existingNote) {
      throw new Error('Nota no encontrada');
    }

    const now = new Date();

    // Crear objeto con los datos actualizados
    const updatedNote: Note = {
      ...existingNote,
      title: noteData.title?.trim() ?? existingNote.title,
      content: noteData.content?.trim() ?? existingNote.content,
      emoji: noteData.emoji ?? existingNote.emoji,
      color: noteData.color ?? existingNote.color,
      categoryId: noteData.categoryId !== undefined ? noteData.categoryId : existingNote.categoryId,
      date: formatDate(now),
      updatedAt: now.toISOString(),
    };

    // Actualizar en la base de datos
    await db.runAsync(
      `UPDATE notes 
       SET title = ?, content = ?, emoji = ?, color = ?, date = ?, updatedAt = ?, categoryId = ?
       WHERE id = ?`,
      [
        updatedNote.title,
        updatedNote.content,
        updatedNote.emoji,
        updatedNote.color,
        updatedNote.date,
        updatedNote.updatedAt,
        updatedNote.categoryId,
        noteData.id,
      ]
    );

    console.log('✅ Nota actualizada en SQLite:', updatedNote.id);
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
    // Verificar que la nota existe
    const note = await getNoteById(id);
    
    if (!note) {
      throw new Error('Nota no encontrada');
    }

    // Eliminar de la base de datos
    await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);

    console.log('✅ Nota eliminada de SQLite:', id);
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    throw error;
  }
};

/**
 * Busca notas por texto (título o contenido)
 */
export const searchNotes = async (query: string, userId?: string): Promise<Note[]> => {
  try {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return getAllNotes(userId);
    }

    // Búsqueda usando LIKE en SQLite
    const sqlQuery = `
      SELECT * FROM notes
      WHERE (LOWER(title) LIKE ? OR LOWER(content) LIKE ?)
      ${userId ? 'AND userId = ?' : ''}
      ORDER BY updatedAt DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const params = userId 
      ? [searchPattern, searchPattern, userId]
      : [searchPattern, searchPattern];

    const result = await db.getAllAsync<Note>(sqlQuery, params);

    return result.map(rowToNote);
  } catch (error) {
    console.error('Error al buscar notas:', error);
    throw new Error('No se pudo realizar la búsqueda');
  }
};

/**
 * Obtiene notas por categoría
 */
export const getNotesByCategory = async (categoryId: string, userId?: string): Promise<Note[]> => {
  try {
    const query = `
      SELECT * FROM notes
      WHERE categoryId = ?
      ${userId ? 'AND userId = ?' : ''}
      ORDER BY updatedAt DESC
    `;

    const result = userId
      ? await db.getAllAsync<Note>(query, [categoryId, userId])
      : await db.getAllAsync<Note>(query, [categoryId]);

    return result.map(rowToNote);
  } catch (error) {
    console.error('Error al obtener notas por categoría:', error);
    throw new Error('No se pudieron cargar las notas');
  }
};

/**
 * Cuenta el total de notas (útil para estadísticas)
 */
export const getNotesCount = async (userId?: string): Promise<number> => {
  try {
    const query = userId
      ? 'SELECT COUNT(*) as count FROM notes WHERE userId = ?'
      : 'SELECT COUNT(*) as count FROM notes';

    const result = userId
      ? await db.getFirstAsync<{ count: number }>(query, [userId])
      : await db.getFirstAsync<{ count: number }>(query);

    return result?.count || 0;
  } catch (error) {
    console.error('Error al contar notas:', error);
    return 0;
  }
};

// ============================================
// FUNCIONES DE BACKUP Y MANTENIMIENTO
// ============================================

/**
 * Exporta todas las notas (útil para backup)
 */
export const exportNotes = async (userId?: string): Promise<Note[]> => {
  return getAllNotes(userId);
};

/**
 * Importa notas desde un backup
 */
export const importNotes = async (notes: Note[]): Promise<void> => {
  try {
    for (const note of notes) {
      // Verificar si la nota ya existe
      const exists = await getNoteById(note.id);
      
      if (!exists) {
        await db.runAsync(
          `INSERT INTO notes (id, title, content, emoji, color, date, createdAt, updatedAt, categoryId, userId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            note.id,
            note.title,
            note.content,
            note.emoji,
            note.color,
            note.date,
            note.createdAt,
            note.updatedAt,
            note.categoryId || null,
            note.userId || null,
          ]
        );
      }
    }
    
    console.log(`✅ ${notes.length} notas importadas a SQLite`);
  } catch (error) {
    console.error('Error al importar notas:', error);
    throw new Error('No se pudieron importar las notas');
  }
};

/**
 * Elimina todas las notas (útil para limpieza o testing)
 */
export const deleteAllNotes = async (userId?: string): Promise<void> => {
  try {
    const query = userId
      ? 'DELETE FROM notes WHERE userId = ?'
      : 'DELETE FROM notes';

    userId
      ? await db.runAsync(query, [userId])
      : await db.runAsync(query);

    console.log('✅ Todas las notas eliminadas de SQLite');
  } catch (error) {
    console.error('Error al eliminar todas las notas:', error);
    throw new Error('No se pudieron eliminar las notas');
  }
};

// ============================================
// FUNCIONES PARA SEEDEAR LA BASE DE DATOS
// ============================================

/**
 * Inserta datos de ejemplo en la base de datos (solo si está vacía)
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    const count = await getNotesCount();
    
    if (count > 0) {
      console.log('⏭️ Base de datos ya tiene notas, saltando seed');
      return;
    }

    const sampleNotes: CreateNoteDTO[] = [
      {
        title: 'An amazing story',
        content: 'Once upon a time there was a developer who wanted to create the perfect journal app...',
        emoji: '📖',
        color: '#BFDBFE',
      },
      {
        title: 'Shopping List',
        content: 'Milk, Bread, Eggs, Coffee, Sugar, Butter, Cheese',
        emoji: '🛒',
        color: '#FEF3C7',
      },
      {
        title: 'Plan for today',
        content: 'Meeting at 3pm with the team. Review the new features and discuss the roadmap.',
        emoji: '📋',
        color: '#E9D5FF',
      },
      {
        title: 'Work Plan',
        content: 'Review code, Fix bugs, Deploy to production, Update documentation',
        emoji: '💼',
        color: '#BBF7D0',
      },
      {
        title: 'Gym workout',
        content: 'Chest and triceps workout routine. 4 sets of 12 reps each exercise.',
        emoji: '💪',
        color: '#FBCFE8',
      },
    ];

    for (const noteData of sampleNotes) {
      await createNote(noteData);
    }

    console.log('✅ Base de datos poblada con notas de ejemplo');
  } catch (error) {
    console.error('Error al poblar base de datos:', error);
    throw error;
  }
};