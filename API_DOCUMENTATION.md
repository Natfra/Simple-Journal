# 📚 API Documentation

## Table of Contents
1. [Notes Service API](#notes-service-api)
2. [Gemini AI Service API](#gemini-ai-service-api)
3. [Custom Hooks API](#custom-hooks-api)
4. [Type Definitions](#type-definitions)

---

## Notes Service API

### `getAllNotes()`

Retrieves all notes sorted by last update date.

**Returns**: `Promise<Note[]>`

**Example**:
```typescript
const notes = await getAllNotes();
console.log(notes); // [{ id: '1', title: 'My Note', ... }]
```

**Error Handling**:
```typescript
try {
  const notes = await getAllNotes();
} catch (error) {
  console.error('Failed to load notes:', error.message);
}
```

---

### `getNoteById(id: string)`

Retrieves a single note by its ID.

**Parameters**:
- `id` (string): The unique identifier of the note

**Returns**: `Promise<Note | null>`

**Example**:
```typescript
const note = await getNoteById('abc123');
if (note) {
  console.log(note.title);
} else {
  console.log('Note not found');
}
```

---

### `createNote(noteData: CreateNoteDTO)`

Creates a new note.

**Parameters**:
- `noteData` (CreateNoteDTO):
  ```typescript
  {
    title: string;      // Required, non-empty
    content: string;    // Optional
    emoji: string;      // Default: '📝'
    color: string;      // HEX color code
  }
  ```

**Returns**: `Promise<Note>`

**Example**:
```typescript
const newNote = await createNote({
  title: 'Morning Reflection',
  content: 'Today I feel grateful for...',
  emoji: '🌅',
  color: '#BFDBFE'
});

console.log(newNote.id); // Generated ID
```

**Validation Errors**:
- Throws if `title` is empty
- Throws if database operation fails

---

### `updateNote(noteData: UpdateNoteDTO)`

Updates an existing note.

**Parameters**:
- `noteData` (UpdateNoteDTO):
  ```typescript
  {
    id: string;         // Required
    title?: string;     // Optional
    content?: string;   // Optional
    emoji?: string;     // Optional
    color?: string;     // Optional
  }
  ```

**Returns**: `Promise<Note>`

**Example**:
```typescript
const updated = await updateNote({
  id: 'abc123',
  title: 'Updated Title',
  content: 'New content...'
});

console.log(updated.updatedAt); // New timestamp
```

**Error Cases**:
- Throws if note ID not found
- Throws if validation fails

---

### `deleteNote(id: string)`

Deletes a note permanently.

**Parameters**:
- `id` (string): The unique identifier of the note to delete

**Returns**: `Promise<void>`

**Example**:
```typescript
await deleteNote('abc123');
console.log('Note deleted successfully');
```

**Error Handling**:
```typescript
try {
  await deleteNote('abc123');
} catch (error) {
  if (error.message === 'Nota no encontrada') {
    console.log('Note already deleted');
  }
}
```

---

### `searchNotes(query: string)`

Searches notes by title or content.

**Parameters**:
- `query` (string): Search term (case-insensitive)

**Returns**: `Promise<Note[]>`

**Example**:
```typescript
const results = await searchNotes('morning');
console.log(`Found ${results.length} notes`);
```

**Behavior**:
- Empty query returns all notes
- Searches both title and content fields
- Case-insensitive matching

---

## Gemini AI Service API

### `generateGeminiContent(prompt, systemInstruction?, useSearchGrounding?)`

Generates AI-powered content using Google's Gemini API.

**Parameters**:
- `prompt` (string): User's question or instruction
- `systemInstruction` (string, optional): Guide model behavior
  - Default: Creative journal assistant instructions
- `useSearchGrounding` (boolean, optional): Enable Google Search
  - Default: `false`

**Returns**: `Promise<GeminiResponse>`
```typescript
{
  text: string;                    // Generated content
  sources: Array<{                // Only if useSearchGrounding = true
    uri: string;
    title: string;
  }>;
}
```

**Example 1: Basic Generation**:
```typescript
const response = await generateGeminiContent(
  'Summarize this journal entry in 3 bullet points'
);

console.log(response.text);
// • Point 1
// • Point 2
// • Point 3
```

**Example 2: With Context**:
```typescript
const context = "Today I went hiking and saw amazing views...";
const prompt = `Based on this entry: "${context}", suggest 3 gratitude points`;

const response = await generateGeminiContent(prompt);
```

**Example 3: With Search Grounding**:
```typescript
const response = await generateGeminiContent(
  'What are the latest mindfulness techniques for 2025?',
  'Act as a wellness coach',
  true  // Enable Google Search
);

console.log(response.text);
console.log('Sources:', response.sources);
```

**Error Handling**:
```typescript
try {
  const response = await generateGeminiContent(prompt);
} catch (error) {
  if (error.message.includes('HTTP 429')) {
    console.log('Rate limit exceeded, try again later');
  } else {
    console.error('AI generation failed:', error.message);
  }
}
```

**Rate Limiting**:
- Max 3 retries with exponential backoff
- Delays: 1s, 2s, 4s between retries

---

## Custom Hooks API

### `useNotes()`

Main hook for managing notes state and operations.

**Returns**: `UseNotesReturn`
```typescript
{
  // State
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Operations
  refreshNotes: () => Promise<void>;
  createNewNote: (data: CreateNoteDTO) => Promise<Note>;
  updateExistingNote: (data: UpdateNoteDTO) => Promise<Note>;
  deleteExistingNote: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}
```

**Example Usage**:
```typescript
function NotesScreen() {
  const {
    notes,
    isLoading,
    error,
    createNewNote,
    deleteExistingNote,
  } = useNotes();

  const handleCreate = async () => {
    try {
      await createNewNote({
        title: 'New Note',
        content: 'Content here',
        emoji: '📝',
        color: '#BFDBFE'
      });
      Alert.alert('Success', 'Note created!');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <ErrorView message={error} />;
  
  return <NotesList notes={notes} />;
}
```

**Features**:
- Automatic loading on mount
- Reactive search (debounced)
- Optimistic UI updates
- Error state management

---

## Type Definitions

### `Note`
```typescript
interface Note {
  id: string;              // Unique identifier (UUID recommended)
  title: string;           // Note title (max 50 chars recommended)
  content: string;         // Note body (markdown supported)
  emoji: string;           // Single emoji character
  date: string;            // Human-readable date (e.g., "10 Nov 2024")
  color: string;           // HEX color code (e.g., "#BFDBFE")
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

### `CreateNoteDTO`
```typescript
interface CreateNoteDTO {
  title: string;           // Required, min 1 char
  content: string;         // Optional, can be empty
  emoji: string;           // Default: '📝'
  color: string;           // Must be valid HEX
}
```

### `UpdateNoteDTO`
```typescript
interface UpdateNoteDTO {
  id: string;              // Required, must exist
  title?: string;          // Optional partial update
  content?: string;        // Optional partial update
  emoji?: string;          // Optional partial update
  color?: string;          // Optional partial update
}
```

### `GeminiResponse`
```typescript
interface GeminiResponse {
  text: string;            // Generated content
  sources: Array<{         // Only present if grounding enabled
    uri: string;           // URL of source
    title: string;         // Title of source page
  }>;
}
```

---

## Error Codes

### Notes Service Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `El título no puede estar vacío` | Empty title in create/update | Provide non-empty title |
| `Nota no encontrada` | Invalid note ID | Verify ID exists |
| `No se pudieron cargar las notas` | Database read failure | Check database connection |
| `No se pudo crear la nota` | Database write failure | Check permissions |

### Gemini Service Errors

| Error Pattern | Cause | Solution |
|---------------|-------|----------|
| `Error HTTP 401` | Invalid API key | Check EXPO_PUBLIC_GEMINI_API_KEY |
| `Error HTTP 429` | Rate limit exceeded | Implement backoff or upgrade quota |
| `Error HTTP 500` | Gemini server error | Retry after delay |
| `Fallo al generar contenido después de 3 intentos` | Network issues | Check internet connection |

---

## Best Practices

### 1. **Always Handle Errors**
```typescript
// ✅ Good
try {
  await createNote(data);
} catch (error) {
  Alert.alert('Error', error.message);
  logErrorToAnalytics(error);
}

// ❌ Bad
await createNote(data); // Silent failure
```

### 2. **Use TypeScript Types**
```typescript
// ✅ Good
const note: Note = await getNoteById(id);

// ❌ Bad
const note: any = await getNoteById(id);
```

### 3. **Validate Input**
```typescript
// ✅ Good
if (title.trim().length === 0) {
  throw new Error('Title required');
}

// ❌ Bad
await createNote({ title: '' }); // Caught later
```

### 4. **Optimize AI Calls**
```typescript
// ✅ Good: Debounce user input
const debouncedGenerate = debounce(generateGeminiContent, 500);

// ❌ Bad: Call on every keystroke
onChange={(text) => generateGeminiContent(text)}
```

---

## Rate Limits & Quotas

### Gemini API (Free Tier)
- **Requests per minute**: 15
- **Requests per day**: 1,500
- **Tokens per request**: 32,000

### Recommendations
- Implement request queuing
- Cache frequently requested content
- Use debouncing for user-triggered AI calls
- Display loading indicators during generation

---

## Versioning

This API follows [Semantic Versioning](https://semver.org/):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

**Current Version**: `1.0.0`

---

## Support

For API-related questions:
- Open an [issue](https://github.com/yourusername/simple-journal/issues)
- Check [discussions](https://github.com/yourusername/simple-journal/discussions)
- Email: api-support@simplejournal.app