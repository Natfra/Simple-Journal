# 📘 GitHub Repository Setup Guide

Esta guía te ayudará a configurar tu repositorio de GitHub de manera profesional para maximizar el impacto de tu documentación.

---

## 📋 Tabla de Contenidos

1. [Crear el Repositorio](#1-crear-el-repositorio)
2. [Estructura de Archivos](#2-estructura-de-archivos)
3. [Configurar GitHub Pages](#3-configurar-github-pages-opcional)
4. [Agregar Badges](#4-agregar-badges)
5. [Configurar Issues y Projects](#5-configurar-issues-y-projects)
6. [Templates](#6-templates)
7. [GitHub Actions](#7-github-actions-ci-cd)
8. [Releases y Changelog](#8-releases-y-changelog)

---

## 1. Crear el Repositorio

### Paso 1: Crear en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Configuración recomendada:
   - **Repository name**: `simple-journal`
   - **Description**: `A modern AI-powered journaling app built with React Native and Expo. Features daily inspiration, note-taking, and AI assistance.`
   - **Public** ✅ (para mayor visibilidad)
   - **Add README** ❌ (ya lo tienes)
   - **Add .gitignore** ✅ → Selecciona "Node"
   - **Choose a license** ✅ → MIT License (recomendado)

### Paso 2: Conectar Local con GitHub

```bash
# Si aún no has inicializado Git
git init

# Agregar remote
git remote add origin https://github.com/TU_USUARIO/simple-journal.git

# Crear rama principal
git branch -M main

# Primer commit
git add .
git commit -m "feat: initial commit with full documentation"

# Subir al repositorio
git push -u origin main
```

---

## 2. Estructura de Archivos

### Archivos en la Raíz

Asegúrate de tener todos estos archivos en la raíz de tu proyecto:

```
simple-journal/
├── README.md                    # ⭐ Documentación principal
├── CONTRIBUTING.md              # Guía de contribución
├── API_DOCUMENTATION.md         # Documentación de API
├── ARCHITECTURE.md              # Arquitectura del sistema
├── LICENSE                      # Licencia MIT
├── CHANGELOG.md                 # Historial de cambios
├── CODE_OF_CONDUCT.md          # Código de conducta
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── ci.yml               # GitHub Actions
│
├── docs/
│   ├── screenshots/             # Capturas de pantalla
│   ├── setup.md                 # Guía de instalación detallada
│   └── troubleshooting.md       # Solución de problemas
│
└── [resto de archivos del proyecto]
```

---

## 3. Configurar GitHub Pages (Opcional)

Si quieres una documentación web elegante:

### Opción A: GitHub Pages Simple

1. Ve a **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** → **/docs**
4. Save

Tu documentación estará en: `https://TU_USUARIO.github.io/simple-journal/`

### Opción B: Con VuePress o Docusaurus

```bash
# Instalar Docusaurus
npx create-docusaurus@latest docs-site classic

# O VuePress
npm install -D vuepress

# Agregar script en package.json
"scripts": {
  "docs:dev": "vuepress dev docs",
  "docs:build": "vuepress build docs"
}
```

---

## 4. Agregar Badges

### Badges Recomendados

Agrega estos al inicio de tu README.md:

```markdown
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.79.6-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-53.0.22-000020.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Stars](https://img.shields.io/github/stars/TU_USUARIO/simple-journal?style=social)
![Forks](https://img.shields.io/github/forks/TU_USUARIO/simple-journal?style=social)
![Issues](https://img.shields.io/github/issues/TU_USUARIO/simple-journal)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
```

### Badges Dinámicos

Para agregar badges dinámicos de CI/CD:

```markdown
![CI](https://github.com/TU_USUARIO/simple-journal/workflows/CI/badge.svg)
![Code Coverage](https://codecov.io/gh/TU_USUARIO/simple-journal/branch/main/graph/badge.svg)
```

---

## 5. Configurar Issues y Projects

### Crear Templates de Issues

**`.github/ISSUE_TEMPLATE/bug_report.md`:**

```markdown
---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Bug Description
A clear description of what the bug is.

## 📱 Environment
- Device: [e.g. iPhone 14]
- OS: [e.g. iOS 17.0]
- App Version: [e.g. 1.0.0]

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## ✅ Expected Behavior
What you expected to happen.

## ❌ Actual Behavior
What actually happened.

## 📸 Screenshots
If applicable, add screenshots.

## 📋 Additional Context
Any other context about the problem.
```

**`.github/ISSUE_TEMPLATE/feature_request.md`:**

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## 🚀 Feature Description
A clear description of the feature you'd like.

## 🎯 Problem It Solves
Why is this feature needed?

## 💡 Proposed Solution
How should this feature work?

## 🔄 Alternatives Considered
What other solutions have you considered?

## 📸 Mockups
If applicable, add mockups or designs.
```

### Pull Request Template

**`.github/PULL_REQUEST_TEMPLATE.md`:**

```markdown
## 📝 Description
Brief description of changes

## 🔗 Related Issue
Closes #(issue number)

## 🔄 Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📝 Documentation update
- [ ] ♻️ Code refactoring

## ✅ Testing
Describe how you tested your changes

## 📸 Screenshots (if applicable)
Add screenshots or GIFs

## ✅ Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested on both iOS and Android
```

### Crear GitHub Projects

1. Ve a **Projects** → **New project**
2. Template: **Board**
3. Columnas sugeridas:
   - 📋 Backlog
   - 🔄 In Progress
   - 👀 In Review
   - ✅ Done

---

## 6. Templates

### Código de Conducta

**`CODE_OF_CONDUCT.md`:**

```markdown
# Code of Conduct

## Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

## Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

## Enforcement
Instances of abusive behavior may be reported to [email@example.com].

## Attribution
This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org/).
```

### Changelog

**`CHANGELOG.md`:**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-11-11

### Added
- Initial release
- Note creation and editing
- AI-powered content generation with Gemini
- Color-coded note organization
- Search functionality
- Swipe to delete gestures
- Dark mode support

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

[Unreleased]: https://github.com/TU_USUARIO/simple-journal/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/TU_USUARIO/simple-journal/releases/tag/v1.0.0
```

---

## 7. GitHub Actions (CI/CD)

### Workflow Básico

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npx expo export:web
```

### Workflow para EAS Build

**`.github/workflows/eas-build.yml`:**

```yaml
name: EAS Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build on EAS
        run: eas build --platform all --non-interactive
```

---

## 8. Releases y Changelog

### Crear un Release

1. Ve a **Releases** → **Create a new release**
2. Tag version: `v1.0.0`
3. Release title: `Version 1.0.0 - Initial Release`
4. Description:
   ```markdown
   ## 🎉 Initial Release
   
   ### ✨ Features
   - Note creation and editing
   - AI-powered content generation
   - Search functionality
   - Swipe gestures
   
   ### 📦 Assets
   - [iOS IPA](link)
   - [Android APK](link)
   
   ### 📝 Full Changelog
   See [CHANGELOG.md](CHANGELOG.md)
   ```

### Automatizar Releases

Usa [Release Drafter](https://github.com/release-drafter/release-drafter):

**`.github/release-drafter.yml`:**

```yaml
name-template: 'v$RESOLVED_VERSION'
tag-template: 'v$RESOLVED_VERSION'
categories:
  - title: '🚀 Features'
    labels:
      - 'feature'
      - 'enhancement'
  - title: '🐛 Bug Fixes'
    labels:
      - 'fix'
      - 'bugfix'
      - 'bug'
  - title: '📝 Documentation'
    labels:
      - 'documentation'
change-template: '- $TITLE @$AUTHOR (#$NUMBER)'
version-resolver:
  major:
    labels:
      - 'major'
  minor:
    labels:
      - 'minor'
  patch:
    labels:
      - 'patch'
  default: patch
```

---

## 9. Configuración del Repositorio

### Settings Recomendados

1. **General**:
   - ✅ Allow merge commits
   - ✅ Allow squash merging
   - ✅ Allow rebase merging
   - ✅ Always suggest updating pull request branches
   - ✅ Automatically delete head branches

2. **Branches**:
   - Branch protection rules para `main`:
     - ✅ Require pull request reviews (1)
     - ✅ Require status checks to pass
     - ✅ Require branches to be up to date

3. **Security & Analysis**:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates

---

## 10. Checklist Final

Antes de hacer público tu repositorio:

- [ ] README.md completo y atractivo
- [ ] Licencia agregada
- [ ] .gitignore configurado
- [ ] Todos los archivos de documentación creados
- [ ] Screenshots/GIFs agregados
- [ ] Badges configurados
- [ ] Templates de issues creados
- [ ] GitHub Actions funcionando
- [ ] Descripción del repo configurada
- [ ] Topics agregados (react-native, expo, typescript, ai, journaling)
- [ ] Website URL configurado (si aplica)
- [ ] Eliminar código/comentarios sensibles
- [ ] Verificar que la API key NO esté en el código

---

## 11. Promoción del Proyecto

### Topics Recomendados

Agrega estos topics en **Settings**:
- `react-native`
- `expo`
- `typescript`
- `journaling`
- `ai`
- `gemini`
- `mobile-app`
- `ios`
- `android`
- `inspiration`
- `productivity`
- `notes`

### Compartir el Proyecto

1. **Reddit**:
   - r/reactnative
   - r/expo
   - r/SideProject
   - r/productivity

2. **Twitter/X**:
   - Hashtags: #ReactNative #Expo #OpenSource #AI

3. **Dev.to / Medium**:
   - Escribe un artículo sobre tu proceso

4. **Product Hunt**:
   - Lanza tu app cuando esté lista

---

## 🎉 ¡Listo!

Tu repositorio ahora tiene una documentación profesional que:
- ✅ Es fácil de navegar
- ✅ Tiene procesos claros de contribución
- ✅ Incluye automatización con CI/CD
- ✅ Está optimizado para SEO y descubrimiento
- ✅ Inspira confianza en los usuarios

### Recursos Adicionales

- [GitHub Docs](https://docs.github.com)
- [Awesome README](https://github.com/matiassingers/awesome-readme)
- [Choose a License](https://choosealicense.com/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**¿Preguntas?** Abre un issue en el repositorio o contacta por email.