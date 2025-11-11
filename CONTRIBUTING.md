# Contributing to Simple Journal 🤝

First off, thank you for considering contributing to Simple Journal! It's people like you that make this app a great tool for daily inspiration and reflection.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Architecture Guidelines](#architecture-guidelines)
- [Testing Requirements](#testing-requirements)

---

## Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites
1. **Node.js** >= 18.x
2. **npm** or **yarn**
3. **Git**
4. **Code Editor** (VSCode recommended)
5. **Expo CLI**
6. **iOS Simulator** or **Android Studio** for testing

### Fork & Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/simple-journal.git
   cd simple-journal
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/simple-journal.git
   ```

### Install Dependencies

```bash
npm install
```

### Environment Setup

Create a `.env` file:
```env
EXPO_PUBLIC_GEMINI_API_KEY="your_test_api_key"
```

### Run the App

```bash
npx expo start
```

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Test on both platforms
# iOS
npx expo start --ios

# Android
npx expo start --android
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

See [Commit Guidelines](#commit-guidelines) for format details.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

Go to GitHub and create a pull request from your branch to `main`.

---

## Coding Standards

### TypeScript Style Guide

#### ✅ DO:

```typescript
// Use explicit types
const userName: string = 'John';
const age: number = 25;

// Use interfaces for objects
interface User {
  id: string;
  name: string;
  email: string;
}

// Use async/await instead of .then()
const fetchData = async (): Promise<Data> => {
  const response = await api.getData();
  return response;
};

// Use meaningful variable names
const isUserAuthenticated = checkAuth();

// Use arrow functions for components
const MyComponent: React.FC<Props> = ({ title }) => {
  return <Text>{title}</Text>;
};
```

#### ❌ DON'T:

```typescript
// Avoid 'any' type
const data: any = getData(); // Bad

// Don't use var
var count = 0; // Bad - use const or let

// Avoid nested ternaries
const value = condition1 ? value1 : condition2 ? value2 : value3; // Bad

// Don't use magic numbers
if (status === 200) { } // Bad - use constants
```

### React Native Best Practices

```typescript
// ✅ Use hooks properly
const [state, setState] = useState<string>('');

// ✅ Memoize expensive computations
const sortedNotes = useMemo(() => {
  return notes.sort((a, b) => b.date - a.date);
}, [notes]);

// ✅ Use useCallback for event handlers
const handlePress = useCallback(() => {
  navigation.navigate('Details');
}, [navigation]);

// ✅ Clean up effects
useEffect(() => {
  const subscription = eventEmitter.addListener();
  return () => subscription.remove();
}, []);
```

### File Organization

```typescript
// Import order: React → React Native → Libraries → Local
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useNotes } from '@/hooks/useNotes';
import { Button } from '@/components/Button';
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface Props {
  title: string;
  onPress: () => void;
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  // 3.1 Hooks
  const [state, setState] = useState('');
  
  // 3.2 Event Handlers
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);
  
  // 3.3 Render
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

// 4. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(notes): add color picker to note creation

# Bug fix
fix(ai): resolve Gemini API timeout issue

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(services): extract API calls to separate module

# Multiple changes
feat(notes): add tags and search functionality

- Add tag selection UI
- Implement tag filtering
- Update search to include tags
```

### Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Capitalize first letter of subject
- No period at the end of subject
- Limit subject line to 50 characters
- Wrap body at 72 characters
- Reference issues in footer (`Closes #123`)

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.log statements (use proper logging)
- [ ] Tested on iOS and Android (if applicable)
- [ ] No breaking changes (or clearly documented)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots or GIFs

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested on both iOS and Android
```

### Review Process

1. At least one maintainer must approve
2. All CI checks must pass
3. No merge conflicts
4. Discussion resolved
5. Squash and merge (usually)

---

## Architecture Guidelines

### Service Layer

When adding new services:

```typescript
// services/newService.ts

/**
 * Service description
 */

// 1. Define types
interface ServiceData {
  id: string;
  value: string;
}

// 2. Export operations
export const getData = async (): Promise<ServiceData[]> => {
  try {
    // Implementation
    // TODO: Replace with database call
    return mockData;
  } catch (error) {
    console.error('Error in getData:', error);
    throw new Error('Failed to fetch data');
  }
};
```

### Custom Hooks

```typescript
// hooks/useCustomHook.ts

export const useCustomHook = () => {
  const [data, setData] = useState<Data[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await service.getData();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};
```

### Component Guidelines

- Keep components small and focused
- Extract reusable logic to hooks
- Use composition over inheritance
- Avoid prop drilling (use context if needed)
- Performance: memoize expensive operations

---

## Testing Requirements

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Feature works on iOS
- [ ] Feature works on Android
- [ ] No crashes or errors in console
- [ ] UI responds correctly to user interactions
- [ ] Loading states display properly
- [ ] Error states are handled gracefully
- [ ] Works with both light and dark modes
- [ ] Accessibility features maintained

### Future: Automated Testing

We're working on adding:
- Unit tests (Jest)
- Integration tests
- E2E tests (Detox)

---

## Additional Notes

### Getting Help

- **Questions?** Open a [discussion](https://github.com/yourusername/simple-journal/discussions)
- **Bugs?** Create an [issue](https://github.com/yourusername/simple-journal/issues)
- **Security?** Email security@simplejournal.app

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to the contributors team (after significant contributions)

---

## Thank You! 🙏

Your contributions make this project better for everyone. We appreciate your time and effort!

Happy coding! 🚀