// hooks/useNotes.ts
/**
 * Hook personalizado para gestionar el estado de las notas.
 * Proporciona todas las operaciones necesarias y maneja el estado de carga/errores.
 */

import {
    CreateNoteDTO,
    Note,
    UpdateNoteDTO,
    createNote,
    deleteNote,
    getAllNotes,
    searchNotes,
    updateNote,
} from '@/services/noteService';
import { useCallback, useEffect, useState } from 'react';

interface UseNotesReturn {
  // Estado
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Operaciones
  refreshNotes: () => Promise<void>;
  createNewNote: (noteData: CreateNoteDTO) => Promise<Note>;
  updateExistingNote: (noteData: UpdateNoteDTO) => Promise<Note>;
  deleteExistingNote: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

export const useNotes = (): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Carga todas las notas o realiza una búsqueda
   */
  const refreshNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedNotes: Note[];
      
      if (searchQuery.trim()) {
        fetchedNotes = await searchNotes(searchQuery);
      } else {
        fetchedNotes = await getAllNotes();
      }
      
      setNotes(fetchedNotes);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las notas');
      console.error('Error en refreshNotes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  /**
   * Crea una nueva nota
   */
  const createNewNote = useCallback(async (noteData: CreateNoteDTO): Promise<Note> => {
    setError(null);
    
    try {
      const newNote = await createNote(noteData);
      
      // Actualizar el estado local optimistamente
      setNotes(prevNotes => [newNote, ...prevNotes]);
      
      return newNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear la nota';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Actualiza una nota existente
   */
  const updateExistingNote = useCallback(async (noteData: UpdateNoteDTO): Promise<Note> => {
    setError(null);
    
    try {
      const updatedNote = await updateNote(noteData);
      
      // Actualizar el estado local
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === updatedNote.id ? updatedNote : note
        ).sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
      
      return updatedNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar la nota';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Elimina una nota
   */
  const deleteExistingNote = useCallback(async (id: string): Promise<void> => {
    setError(null);
    
    try {
      await deleteNote(id);
      
      // Actualizar el estado local
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar la nota';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar notas al montar el componente o cuando cambie la búsqueda
  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  return {
    notes,
    isLoading,
    error,
    searchQuery,
    refreshNotes,
    createNewNote,
    updateExistingNote,
    deleteExistingNote,
    setSearchQuery,
    clearError,
  };
};