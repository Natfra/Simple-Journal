# 🏗️ Architecture Documentation

## Overview

Simple Journal follows a **layered architecture** pattern with clear separation of concerns, making it maintainable, testable, and scalable.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  React Native Components + Expo Router + Gesture Handler        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  • Screens (index.tsx, note-edit.tsx)                          │
│  • UI Components (SwipeableNoteCard, Modal)                    │
│  • Navigation Logic                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT LAYER                         │
│  • Custom Hooks (useNotes, useColorScheme)                     │
│  • React State (useState, useEffect, useCallback)              │
│  • Local State Management                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
│  • Services (notesService, geminiService)                      │
│  • Data Validation & Transformation                            │
│  • Error Handling & Retry Logic                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
│  Currently: In-Memory Storage                                   │
│  Future: SQLite / Firebase / Supabase                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│  • Google Gemini API (AI Generation)                           │
│  • Google Search Grounding                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### 1. User Interface Layer

**Purpose**: Render UI and capture user input

**Components**:
- Navigation structure (Expo Router)
- Screen layouts
- Visual components
- Gesture handlers

**Key Files**:
```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigation
│   ├── index.tsx            # Home screen
│   └── details/
│       └── note-edit.tsx    # Edit screen
└── _layout.tsx              # Root layout
```

**Responsibilities**:
- ✅ Display data from state
- ✅ Capture user events
- ✅ Navigate between screens
- ❌ NO business logic
- ❌ NO direct API calls
- ❌ NO data transformation

---

### 2. Presentation Layer

**Purpose**: Manage UI logic and user interactions

**Pattern**: Container/Presentational Components

```typescript
// Container Component (Smart)
export default function NotesScreen() {
  const { notes, createNewNote } = useNotes(); // State logic
  
  return <NotesList notes={notes} onCreate={createNewNote} />;
}

// Presentational Component (Dumb)
const NotesList: React.FC<Props> = ({ notes, onCreate }) => {
  return (
    <ScrollView>
      {notes.map(note => <NoteCard key={note.id} note={note} />)}
    </ScrollView>
  );
};
```

**Responsibilities**:
- ✅ Compose UI components
- ✅ Handle user events
- ✅ Manage local UI state (modals, inputs)
- ✅ Call hook methods
- ❌ NO direct service calls
- ❌ NO complex data transformations

---

### 3. State Management Layer

**Purpose**: Manage application state and side effects

**Pattern**: Custom Hooks + React Context (when needed)

```typescript
// hooks/useNotes.ts
export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const createNewNote = useCallback(async (data: CreateNoteDTO) => {
    const newNote = await createNote(data); // Service call
    setNotes(prev => [newNote, ...prev]);   // Update state
    return newNote;
  }, []);
  
  return { notes, isLoading, createNewNote };
};
```

**State Flow**:
```
User Action
    ↓
UI Event Handler
    ↓
Hook Method (useNotes.createNewNote)
    ↓
Service Call (notesService.createNote)
    ↓
Update State (setNotes)
    ↓
Re-render UI
```

**Responsibilities**:
- ✅ Manage global/shared state
- ✅ Coordinate service calls
- ✅ Handle loading/error states
- ✅ Provide state to components
- ❌ NO UI rendering
- ❌ NO direct database access

---

### 4. Business Logic Layer

**Purpose**: Encapsulate business rules and data operations

**Pattern**: Service Objects

```typescript
// services/notesService.ts

// Data validation
const validateNote = (data: CreateNoteDTO): void => {
  if (!data.title.trim()) {
    throw new Error('Title required');
  }
  if (data.title.length > 50) {
    throw new Error('Title too long');
  }
};

// Business operation
export const createNote = async (data: CreateNoteDTO): Promise<Note> => {
  validateNote(data);                    // Validation
  
  const note = {
    ...data,
    id: generateId(),                    // ID generation
    date: formatDate(new Date()),        // Formatting
    createdAt: new Date().toISOString(), // Timestamp
  };
  
  await saveToDatabase(note);            // Persistence
  
  return note;
};
```

**Responsibilities**:
- ✅ Validate business rules
- ✅ Transform data
- ✅ Coordinate with data layer
- ✅ Error handling
- ✅ Retry logic
- ❌ NO UI concerns
- ❌ NO state management

---

### 5. Data Access Layer

**Purpose**: Abstract data storage implementation

**Current Implementation**: In-Memory Array
**Future**: Database (SQLite, Firebase, Supabase)

```typescript
// Current: In-Memory
let notesStorage: Note[] = [];

export const saveNote = async (note: Note): Promise<void> => {
  notesStorage.push(note);
};

// Future: SQLite
export const saveNote = async (note: Note): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO notes (id, title, content) VALUES (?, ?, ?)',
    [note.id, note.title, note.content]
  );
};
```

**Migration Strategy**:
1. Keep service interface unchanged
2. Swap implementation in data layer
3. Run migration scripts if needed
4. Test CRUD operations
5. Deploy!

---

## Data Flow Patterns

### 1. Create Note Flow

```
User fills form → Taps "Create"
              ↓
   index.tsx: handleCreateNote()
              ↓
   useNotes: createNewNote(data)
              ↓
   notesService: createNote(data)
              ↓
   Validation → ID Generation → Timestamp
              ↓
   Data Layer: saveToDatabase()
              ↓
   Return new note to hook
              ↓
   Hook updates state: setNotes([newNote, ...prev])
              ↓
   Component re-renders with new note
```

### 2. AI Generation Flow

```
User opens AI modal → Enters prompt → Taps "Generate"
                   ↓
      note-edit.tsx: handleGenerateWithAI()
                   ↓
      geminiService: generateGeminiContent(prompt)
                   ↓
      API Request → Retry Logic → Response
                   ↓
      Parse response text
                   ↓
      Update note content: setCurrentNoteContent(prev + aiText)
                   ↓
      Scroll to bottom → Show success alert
```

### 3. Search Flow

```
User types in search box
         ↓
   index.tsx: handleSearchChange(text)
         ↓
   useNotes: setSearchQuery(text)
         ↓
   useEffect triggers: refreshNotes()
         ↓
   notesService: searchNotes(query)
         ↓
   Filter notes: title.includes(query) || content.includes(query)
         ↓
   Return filtered results
         ↓
   Hook updates state: setNotes(filteredNotes)
         ↓
   UI re-renders with filtered notes
```

---

## Design Patterns Used

### 1. Repository Pattern
**Location**: `services/notesService.ts`

```typescript
// Abstract data access
export const getAllNotes = async (): Promise<Note[]> => {
  // Implementation can change without affecting consumers
  return fetchFromDatabase();
};
```

**Benefits**:
- Decouples business logic from data source
- Easy to swap implementations (memory → DB)
- Testable (mock the repository)

---

### 2. Custom Hook Pattern
**Location**: `hooks/useNotes.ts`

```typescript
export const useNotes = () => {
  // Encapsulates stateful logic
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Reusable across components
  return { notes, createNewNote, deleteNote };
};
```

**Benefits**:
- Reusable logic
- Testable in isolation
- Separates concerns

---

### 3. Service Layer Pattern
**Location**: `services/`

```typescript
// Services contain pure business logic
export const createNote = async (data: CreateNoteDTO): Promise<Note> => {
  validateData(data);
  const note = transformData(data);
  await persistData(note);
  return note;
};
```

**Benefits**:
- Single responsibility
- Easy to test
- No framework dependencies

---

### 4. Error Boundary Pattern
**Location**: Throughout app

```typescript
try {
  await riskyOperation();
} catch (error) {
  handleError(error);
  notifyUser(error.message);
  logToAnalytics(error);
}
```

**Benefits**:
- Graceful degradation
- User-friendly errors
- Better debugging

---

## Component Communication

### Parent → Child (Props)
```typescript
// Parent
<NoteCard note={note} onDelete={handleDelete} />

// Child
const NoteCard: React.FC<Props> = ({ note, onDelete }) => {
  return <View>...</View>;
};
```

### Child → Parent (Callbacks)
```typescript
// Child
<Button onPress={() => onDelete(note.id)} />

// Parent
const handleDelete = (id: string) => {
  deleteNote(id);
};
```

### Sibling Communication (Shared State)
```typescript
// Via custom hook
const ParentA = () => {
  const { notes, createNewNote } = useNotes();
  // ...
};

const ParentB = () => {
  const { notes } = useNotes(); // Shares same state
  // ...
};
```

### Global State (Context - Future)
```typescript
// For app-wide settings, theme, etc.
const { theme, toggleTheme } = useTheme();
```

---

## Error Handling Strategy

### Layers of Defense

**1. Input Validation (UI)**
```typescript
if (!title.trim()) {
  Alert.alert('Error', 'Title is required');
  return;
}
```

**2. Business Logic Validation (Service)**
```typescript
if (title.length > 50) {
  throw new Error('Title too long');
}
```

**3. API Error Handling (Service)**
```typescript
try {
  await api.call();
} catch (error) {
  if (error.status === 429) {
    await retry();
  } else {
    throw error;
  }
}
```

**4. Hook Error Management**
```typescript
const [error, setError] = useState<string | null>(null);

try {
  await operation();
} catch (err) {
  setError(err.message);
}
```

**5. UI Error Display**
```typescript
if (error) {
  return <ErrorView message={error} onRetry={retry} />;
}
```

---

## Performance Optimization

### 1. Memoization
```typescript
// Expensive computation
const sortedNotes = useMemo(() => {
  return notes.sort((a, b) => b.date - a.date);
}, [notes]);

// Stable function reference
const handlePress = useCallback(() => {
  doSomething();
}, [dependency]);
```

### 2. Lazy Loading
```typescript
// Load AI service only when needed
const AIModal = lazy(() => import('./AIModal'));
```

### 3. Virtualization
```typescript
// Use FlatList for large lists
<FlatList
  data={notes}
  renderItem={({ item }) => <NoteCard note={item} />}
  windowSize={10}
/>
```

### 4. Debouncing
```typescript
// Search optimization
const debouncedSearch = debounce(searchNotes, 300);
```

---

## Security Considerations

### 1. API Key Management
```typescript
// ✅ Good: Environment variable
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// ❌ Bad: Hardcoded
const API_KEY = "AIzaSy..."; // Never do this!
```

### 2. Input Sanitization
```typescript
const sanitize = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

### 3. Data Validation
```typescript
const isValidColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};
```

---

## Testing Strategy

### Unit Tests (Future)
```typescript
// hooks/useNotes.test.ts
describe('useNotes', () => {
  it('creates a new note', async () => {
    const { result } = renderHook(() => useNotes());
    
    await act(async () => {
      await result.current.createNewNote(mockData);
    });
    
    expect(result.current.notes).toHaveLength(1);
  });
});
```

### Integration Tests (Future)
```typescript
// Test complete flows
it('creates and displays note', async () => {
  render(<App />);
  
  fireEvent.press(screen.getByText('Create Note'));
  fireEvent.changeText(screen.getByPlaceholder('Title'), 'New Note');
  fireEvent.press(screen.getByText('Save'));
  
  expect(screen.getByText('New Note')).toBeVisible();
});
```

---

## Scalability Considerations

### Current Capacity
- **Notes**: 1,000+ (in-memory)
- **Concurrent operations**: Limited by device
- **AI requests**: 15/min (Gemini free tier)

### Future Scaling

**1. Database Migration**
- Move to SQLite for >10,000 notes
- Implement pagination
- Add indexing for search

**2. State Management**
- Consider Redux/Zustand for complex state
- Implement state persistence
- Add offline support

**3. Performance**
- Implement virtual scrolling
- Add request caching
- Optimize bundle size

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Development                      │
│   Local Expo Dev Server                 │
│   → npm start                           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Staging (TestFlight/Beta)       │
│   EAS Build → Internal Distribution     │
│   → eas build --profile preview         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Production                       │
│   App Store / Google Play               │
│   → eas build --profile production      │
│   → eas submit                          │
└─────────────────────────────────────────┘
```

---

## Future Architecture Enhancements

### Phase 1: Database Integration
- [ ] SQLite implementation
- [ ] Migration scripts
- [ ] Data seeding

### Phase 2: Offline Support
- [ ] Cache management
- [ ] Sync queue
- [ ] Conflict resolution

### Phase 3: Cloud Sync
- [ ] Firebase/Supabase integration
- [ ] Real-time updates
- [ ] Multi-device support

### Phase 4: Advanced Features
- [ ] Push notifications
- [ ] Widget support
- [ ] Sharing capabilities

---

## Conclusion

This architecture provides:
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Testability**: Each layer can be tested independently
- ✅ **Scalability**: Easy to add new features
- ✅ **Flexibility**: Swap implementations without breaking changes
- ✅ **Performance**: Optimized for mobile devices

For questions or suggestions, open an issue or discussion on GitHub.