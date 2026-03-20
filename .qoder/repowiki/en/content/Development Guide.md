# Development Guide

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [tsconfig.json](file://tsconfig.json)
- [README.md](file://README.md)
- [TESTING.md](file://TESTING.md)
- [PLUGIN-GUIDE.md](file://PLUGIN-GUIDE.md)
- [QUICK_REFERENCE.md](file://QUICK_REFERENCE.md)
- [src/main.ts](file://src/main.ts)
- [src/preload.ts](file://src/preload.ts)
- [src/core/PluginManager.ts](file://src/core/PluginManager.ts)
- [src/core/AnnotationManager.ts](file://src/core/AnnotationManager.ts)
- [src/core/AIServiceManager.ts](file://src/core/AIServiceManager.ts)
- [src/types/index.ts](file://src/types/index.ts)
- [src/renderer/App.tsx](file://src/renderer/App.tsx)
- [src/renderer/components/PDFViewer.tsx](file://src/renderer/components/PDFViewer.tsx)
- [src/renderer/components/RightPanel.tsx](file://src/renderer/components/RightPanel.tsx)
- [src/renderer/components/Sidebar.tsx](file://src/renderer/components/Sidebar.tsx)
- [scripts/create-sample-pdf.js](file://scripts/create-sample-pdf.js)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive testing documentation based on TESTING.md
- Enhanced development workflow with step-by-step testing procedures
- Included automated testing with sample PDF generation
- Added troubleshooting protocols and performance testing guidelines
- Integrated testing checklist and quality assurance processes

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Contribution Guidelines](#contribution-guidelines)
10. [Testing Strategies](#testing-strategies)
11. [Development Workflow](#development-workflow)
12. [Release Process and Distribution](#release-process-and-distribution)
13. [Debugging and Profiling](#debugging-and-profiling)
14. [Code Standards and Conventions](#code-standards-and-conventions)
15. [Conclusion](#conclusion)

## Introduction
This development guide provides a comprehensive overview of setting up the development environment, building, extending, and contributing to SciPDFReader. It covers Node.js requirements, dependency management, TypeScript configuration, compilation and packaging, linting, cross-platform builds, code standards, contribution workflow, testing strategies, development workflow enhancements, release processes, and practical debugging and optimization tips tailored for the Electron environment.

## Project Structure
SciPDFReader follows a layered architecture:
- Electron main process orchestrates the app lifecycle and exposes IPC handlers.
- A preload script safely bridges the renderer process to the main process via a controlled API surface.
- Core modules implement the plugin system, annotation management, and AI service integration.
- Types define shared interfaces and enums used across the application.

```mermaid
graph TB
subgraph "Electron App"
Main["src/main.ts"]
Preload["src/preload.ts"]
end
subgraph "Core Modules"
PM["src/core/PluginManager.ts"]
AM["src/core/AnnotationManager.ts"]
AIM["src/core/AIServiceManager.ts"]
end
subgraph "Shared Types"
Types["src/types/index.ts"]
end
Main --> PM
Main --> AM
Main --> AIM
Main --> Preload
PM --> Types
AM --> Types
AIM --> Types
```

**Diagram sources**
- [src/main.ts:1-156](file://src/main.ts#L1-L156)
- [src/preload.ts:1-34](file://src/preload.ts#L1-L34)
- [src/core/PluginManager.ts:1-250](file://src/core/PluginManager.ts#L1-L250)
- [src/core/AnnotationManager.ts:1-172](file://src/core/AnnotationManager.ts#L1-L172)
- [src/core/AIServiceManager.ts:1-214](file://src/core/AIServiceManager.ts#L1-L214)
- [src/types/index.ts:1-224](file://src/types/index.ts#L1-L224)

**Section sources**
- [README.md:13-29](file://README.md#L13-L29)

## Core Components
- Electron main process initializes BrowserWindow, sets up IPC handlers, and manages lifecycle events.
- Preload script exposes a minimal, secure API surface to the renderer process.
- PluginManager loads, activates, and manages plugins, exposing a controlled API to plugin code.
- AnnotationManager handles annotation creation, persistence, search, and export.
- AIServiceManager executes AI tasks (translation, summarization, background info, keyword extraction, Q&A) with configurable providers.

Key responsibilities and interactions are defined in the source files listed below.

**Section sources**
- [src/main.ts:1-156](file://src/main.ts#L1-L156)
- [src/preload.ts:1-34](file://src/preload.ts#L1-L34)
- [src/core/PluginManager.ts:1-250](file://src/core/PluginManager.ts#L1-L250)
- [src/core/AnnotationManager.ts:1-172](file://src/core/AnnotationManager.ts#L1-L172)
- [src/core/AIServiceManager.ts:1-214](file://src/core/AIServiceManager.ts#L1-L214)
- [src/types/index.ts:1-224](file://src/types/index.ts#L1-L224)

## Architecture Overview
The runtime architecture connects the renderer UI to the main process via IPC, with the preload script mediating safe communication. Core managers encapsulate domain logic and expose typed APIs to plugins.

```mermaid
sequenceDiagram
participant UI as "Renderer UI"
participant Preload as "Preload Script"
participant Main as "Electron Main"
participant PM as "PluginManager"
participant AM as "AnnotationManager"
participant AIM as "AIServiceManager"
UI->>Preload : "api.loadPDF(filePath)"
Preload->>Main : "invoke('load-pdf', filePath)"
Main->>Main : "readFileSync(filePath)"
Main-->>Preload : "{success, path, name, size}"
Preload-->>UI : "resolve(result)"
UI->>Preload : "api.executeAITask(task)"
Preload->>Main : "invoke('execute-ai-task', task)"
Main->>AIM : "executeTask(task)"
AIM-->>Main : "AITaskResult"
Main-->>Preload : "result"
Preload-->>UI : "resolve(result)"
```

**Diagram sources**
- [src/preload.ts:5-33](file://src/preload.ts#L5-L33)
- [src/main.ts:81-142](file://src/main.ts#L81-L142)
- [src/core/AIServiceManager.ts:13-56](file://src/core/AIServiceManager.ts#L13-L56)

**Section sources**
- [src/main.ts:13-43](file://src/main.ts#L13-L43)
- [src/preload.ts:1-34](file://src/preload.ts#L1-L34)

## Detailed Component Analysis

### Electron Main Process
- Creates the BrowserWindow with security-focused webPreferences and loads the renderer HTML.
- Initializes core services (AnnotationManager, AIServiceManager, PluginManager) and auto-loads installed plugins.
- Provides IPC handlers for PDF loading, file reading, dialogs, annotation CRUD, AI task execution, and plugin registration.

```mermaid
flowchart TD
Start(["App Ready"]) --> CreateWindow["Create BrowserWindow<br/>with webPreferences"]
CreateWindow --> InitServices["Initialize Managers:<br/>Annotation, AI, Plugin"]
InitServices --> LoadPlugins["Load Installed Plugins"]
LoadPlugins --> Ready(["App Ready"])
```

**Diagram sources**
- [src/main.ts:63-71](file://src/main.ts#L63-L71)
- [src/main.ts:45-60](file://src/main.ts#L45-L60)

**Section sources**
- [src/main.ts:13-78](file://src/main.ts#L13-L78)

### Preload Security Bridge
- Uses contextBridge to expose a minimal API surface to the renderer.
- Wraps ipcRenderer.invoke and ipcRenderer.on for specific operations (PDF load, file read, open dialog, annotation CRUD, AI tasks, plugin registration).

```mermaid
classDiagram
class PreloadAPI {
+loadPDF(filePath)
+readFileAsArrayBuffer(path)
+saveAnnotation(annotation)
+getAnnotations(pageNumber)
+executeAITask(task)
+openFileDialog()
+onLoadPDF(callback)
+registerCommand(commandId, callback)
+registerAnnotationType(type)
}
```

**Diagram sources**
- [src/preload.ts:5-33](file://src/preload.ts#L5-L33)

**Section sources**
- [src/preload.ts:1-34](file://src/preload.ts#L1-L34)

### Plugin System
- Discovers plugins in a user-specific directory, loads their main module, and invokes activate with a plugin context.
- Exposes APIs for annotations, AI tasks, PDF renderer stubs, and storage to plugins.
- Supports enabling/disabling, deactivation, and uninstallation.

```mermaid
sequenceDiagram
participant Main as "Electron Main"
participant PM as "PluginManager"
participant FS as "File System"
participant Plugin as "Plugin Module"
Main->>PM : "initializeServices()"
PM->>FS : "ensurePluginsDirectory()"
PM->>FS : "readDir(pluginsPath)"
loop For each plugin
PM->>FS : "read manifest"
PM->>Plugin : "require(main)"
PM->>Plugin : "activate(context)"
end
```

**Diagram sources**
- [src/core/PluginManager.ts:48-99](file://src/core/PluginManager.ts#L48-L99)

**Section sources**
- [src/core/PluginManager.ts:1-250](file://src/core/PluginManager.ts#L1-L250)

### Annotation Management
- Manages annotation types and instances, persists to a user-specific data directory, supports CRUD operations, search, and export to multiple formats.
- Initializes default annotation types and ensures data directory exists.

```mermaid
flowchart TD
Init["Init AnnotationManager<br/>Register Defaults"] --> EnsureDir["Ensure Data Directory"]
EnsureDir --> CRUD["CRUD Operations"]
CRUD --> Save["Persist to JSON"]
Save --> Load["Load on Startup"]
```

**Diagram sources**
- [src/core/AnnotationManager.ts:11-40](file://src/core/AnnotationManager.ts#L11-L40)
- [src/core/AnnotationManager.ts:153-170](file://src/core/AnnotationManager.ts#L153-L170)

**Section sources**
- [src/core/AnnotationManager.ts:1-172](file://src/core/AnnotationManager.ts#L1-L172)

### AI Service Management
- Executes AI tasks based on configured provider (OpenAI, Azure, local, custom).
- Implements task queueing, cancellation, and batch execution.
- Provides fallbacks and mock responses when providers are unavailable.

```mermaid
flowchart TD
Start(["executeTask(task)"]) --> CheckConfig{"Configured?"}
CheckConfig --> |No| ThrowErr["Throw Error"]
CheckConfig --> |Yes| Enqueue["Add to taskQueue"]
Enqueue --> SwitchType{"Task Type?"}
SwitchType --> Translate["Translation"]
SwitchType --> Summarize["Summarization"]
SwitchType --> Background["Background Info"]
SwitchType --> Keywords["Keyword Extraction"]
SwitchType --> QA["Question Answering"]
Translate --> Result["Store in taskResults"]
Summarize --> Result
Background --> Result
Keywords --> Result
QA --> Result
Result --> Cleanup["Remove from taskQueue"]
Cleanup --> Return["Return AITaskResult"]
```

**Diagram sources**
- [src/core/AIServiceManager.ts:13-56](file://src/core/AIServiceManager.ts#L13-L56)
- [src/core/AIServiceManager.ts:96-171](file://src/core/AIServiceManager.ts#L96-L171)

**Section sources**
- [src/core/AIServiceManager.ts:1-214](file://src/core/AIServiceManager.ts#L1-L214)

### TypeScript Configuration and Compilation
- Compiles to ES2020 with CommonJS modules, source maps, strict mode, and declaration files.
- RootDir is src, outDir is out, and JSX is configured for React.

```mermaid
flowchart TD
TSConfig["tsconfig.json"] --> CompilerOptions["Compiler Options:<br/>target=ES2020, module=CommonJS,<br/>strict=true, declaration=true,<br/>jsx=react-jsx"]
CompilerOptions --> Build["tsc -p ./"]
Build --> Watch["tsc -watch -p ./"]
```

**Diagram sources**
- [tsconfig.json:2-17](file://tsconfig.json#L2-L17)

**Section sources**
- [tsconfig.json:1-21](file://tsconfig.json#L1-L21)

### Build Commands and Packaging
- Scripts include compile, watch, start, package, and lint.
- electron-builder is configured for cross-platform targets (NSIS for Windows, AppImage for Linux) and product metadata.

```mermaid
flowchart TD
Scripts["package.json scripts"] --> Compile["compile: tsc -p ./"]
Scripts --> Watch["watch: tsc -watch -p ./"]
Scripts --> Start["start: electron ."]
Scripts --> Package["package: electron-builder"]
Scripts --> Lint["lint: eslint src --ext ts"]
Scripts --> CreateSample["create-sample: node scripts/create-sample-pdf.js"]
Scripts --> TestApp["test-app: npm run create-sample && npm run dev"]
```

**Diagram sources**
- [package.json:7-18](file://package.json#L7-L18)
- [package.json:34-54](file://package.json#L34-L54)

**Section sources**
- [package.json:1-63](file://package.json#L1-L63)

## Dependency Analysis
External dependencies include Electron, TypeScript, ESLint, and UI/runtime libraries. Build-time configuration defines cross-platform targets and output directories.

```mermaid
graph TB
Pkg["package.json"]
Electron["electron"]
Builder["electron-builder"]
Types["typescript, @types/*"]
ESLint["eslint, @typescript-eslint/*"]
PDFJS["pdfjs-dist"]
React["react, react-dom"]
SQLite["sqlite3"]
UUID["uuid"]
Pkg --> Electron
Pkg --> Builder
Pkg --> Types
Pkg --> ESLint
Pkg --> PDFJS
Pkg --> React
Pkg --> SQLite
Pkg --> UUID
```

**Diagram sources**
- [package.json:16-33](file://package.json#L16-L33)

**Section sources**
- [package.json:16-33](file://package.json#L16-L33)

## Performance Considerations
- Keep the renderer isolated from Node.js APIs via contextBridge to avoid heavy context switching.
- Offload AI and file operations to the main process to prevent UI blocking.
- Use incremental saves and lazy loading for annotations and large PDFs.
- Consider virtualization for large document rendering and batch AI requests where appropriate.

## Troubleshooting Guide
Common development issues and resolutions:
- Node.js version mismatch: Ensure Node.js 18+ as per prerequisites.
- Missing native modules: Rebuild native deps against Electron's Node.js ABI if needed.
- IPC errors: Verify preload exposes the correct API and main process handlers match invocation signatures.
- Plugin load failures: Confirm plugin manifests and main entry paths; check activation events and user plugins directory permissions.
- Lint failures: Run ESLint and fix reported issues; ensure TypeScript strictness is maintained.

**Section sources**
- [README.md:33-59](file://README.md#L33-L59)
- [src/preload.ts:5-33](file://src/preload.ts#L5-L33)
- [src/core/PluginManager.ts:48-69](file://src/core/PluginManager.ts#L48-L69)

## Contribution Guidelines
Workflow:
- Fork and branch from the latest main.
- Install dependencies, compile, and run locally.
- Make focused commits with clear messages.
- Open a Pull Request describing changes, rationale, and testing performed.

Review process:
- Ensure CI passes and code adheres to style and type safety.
- Request reviews from maintainers; address feedback promptly.

Issue reporting:
- Provide environment details, steps to reproduce, expected vs. actual behavior, and logs.

Community collaboration:
- Use GitHub Discussions for ideas and questions.
- Follow the code style and architectural patterns outlined in the repository.

**Section sources**
- [README.md:152-158](file://README.md#L152-L158)

## Testing Strategies

### Automated Testing with Sample PDF Generation
SciPDFReader provides comprehensive automated testing capabilities through a dedicated testing framework and sample PDF generation:

#### Quick Test Command
The fastest way to test SciPDFReader uses the integrated test-app command:
```bash
npm run test-app
```

This single command automatically:
1. ✅ Creates a sample PDF (`test-sample.pdf`)
2. ✅ Compiles TypeScript code
3. ✅ Launches the application

#### Step-by-Step Testing Process
**Installation & Setup:**
```bash
# Clone and install
git clone https://github.com/Chunde/SciPDFReader.git
cd SciPDFReader
npm install

# Compile
npm run compile
```

**Create Test PDF:**
```bash
npm run create-sample
```

This creates `test-sample.pdf` with:
- 2 pages of content
- Feature list for testing
- Text suitable for annotation testing

**Run Application:**
```bash
npm start
```

Or use development mode:
```bash
npm run dev
```

#### Testing Checklist
**Basic Functionality:**
- [ ] Application launches without errors
- [ ] Can open PDF files
- [ ] PDF renders correctly
- [ ] Page navigation works
- [ ] Zoom controls function properly

**UI/UX:**
- [ ] All buttons are clickable
- [ ] Menus open and close correctly
- [ ] Sidebar panels collapse/expand
- [ ] No visual glitches or overlapping elements

**Advanced Features (If configured):**
- [ ] Annotations can be created
- [ ] Annotations are saved
- [ ] Annotations display in right panel
- [ ] AI features work (if API key configured)

### PDF Rendering Quality Assessment
The testing framework focuses on comprehensive PDF rendering validation:

**PDF Rendering Tests:**
- [ ] Open PDF file (File → Open or toolbar button)
- [ ] Check rendering quality
- [ ] Navigate between pages using:
  - Previous/Next buttons
  - Page number input
  - Keyboard arrow keys (if implemented)

**Zoom Controls Testing:**
- [ ] Zoom In (toolbar button)
- [ ] Zoom Out (toolbar button)
- [ ] Select zoom levels from dropdown (50% - 300%)
- [ ] Fit to Width functionality

### Annotation System Verification
Comprehensive annotation system testing covers multiple annotation types:

**Annotation Types to Test:**
- [ ] Highlight text
- [ ] Underline text
- [ ] Add notes
- [ ] Translation annotations (requires AI setup)
- [ ] Background information (requires AI setup)

**Annotation Management:**
- [ ] Annotations can be created
- [ ] Annotations are saved
- [ ] Annotations display in right panel
- [ ] Annotation export functionality (JSON, Markdown, HTML)

### AI Service Testing
**AI Feature Testing (If configured):**
- [ ] Translation functionality
- [ ] Summarization feature
- [ ] Background information lookup
- [ ] Keyword extraction
- [ ] Question answering

### UI Component Testing
**Component Verification:**
- [ ] Left sidebar (document outline)
- [ ] Right panel (annotations list)
- [ ] Toolbar responsiveness
- [ ] View options dropdown menu

### Performance Testing
**Performance Validation:**
Test with different PDF sizes:
- Small PDF (< 1MB) ✅
- Medium PDF (1-10MB) ✅
- Large PDF (> 10MB) ⚠️

Monitor:
- Memory usage
- Rendering speed
- Scroll smoothness

### Troubleshooting Protocols
**Application Won't Start:**
```bash
# Error: Cannot find module
npm install
npm run compile

# Error: ERR_FILE_NOT_FOUND
Check that `src/renderer/index.html` exists
```

**Compilation Errors:**
```bash
# Clean and recompile
rm -rf out/
npm run compile
```

**PDF Not Loading:**
- Ensure the file path doesn't contain special characters
- Try the sample PDF: `test-sample.pdf`
- Check Electron console for errors (Ctrl+Shift+I)

### Development Mode Testing
For active development with hot reload:
```bash
# Watch mode for TypeScript
npm run watch

# In another terminal, start Electron
npm start
```

### Testing Infrastructure
The testing infrastructure includes:

**Sample PDF Generator:**
The `scripts/create-sample-pdf.js` script generates comprehensive test PDFs with:
- Multiple pages of structured content
- Feature lists for testing various functionalities
- Text suitable for annotation and selection testing

**Renderer Components Testing:**
- PDFViewer component testing for rendering quality
- RightPanel component testing for annotation display
- Sidebar component testing for document outline
- Toolbar component testing for UI interactions

**Core Services Testing:**
- AnnotationManager testing for CRUD operations
- AIServiceManager testing for AI task execution
- PluginManager testing for plugin lifecycle

**Section sources**
- [TESTING.md:1-191](file://TESTING.md#L1-L191)
- [scripts/create-sample-pdf.js:1-112](file://scripts/create-sample-pdf.js#L1-L112)
- [src/renderer/App.tsx:1-104](file://src/renderer/App.tsx#L1-L104)
- [src/renderer/components/PDFViewer.tsx:1-152](file://src/renderer/components/PDFViewer.tsx#L1-L152)
- [src/renderer/components/RightPanel.tsx:1-171](file://src/renderer/components/RightPanel.tsx#L1-L171)
- [src/renderer/components/Sidebar.tsx:1-70](file://src/renderer/components/Sidebar.tsx#L1-L70)

## Development Workflow

### Integrated Development Environment Setup
1. **Environment Preparation:**
   - Ensure Node.js 18+ is installed
   - Install dependencies: `npm install`
   - Compile TypeScript: `npm run compile`

2. **Development Server:**
   - Start development server: `npm run dev`
   - Watch mode for automatic recompilation: `npm run watch`

3. **Testing Workflow:**
   - Quick testing: `npm run test-app`
   - Manual testing: `npm run create-sample` then `npm run dev`

### Continuous Integration Testing
The development workflow supports continuous testing through:
- Automated sample PDF generation
- Integrated compilation and launch
- Comprehensive testing checklists
- Performance monitoring

### Quality Assurance Processes
- Run ESLint and TypeScript checks before committing
- Use watch mode during development to catch type errors early
- Validate all core functionalities through systematic testing
- Monitor performance metrics during development

### Issue Reporting and Resolution
When reporting bugs, include:
- Operating system version
- Node.js version (`node -v`)
- npm version (`npm -v`)
- Error messages from console
- Steps to reproduce

**Section sources**
- [TESTING.md:145-191](file://TESTING.md#L145-L191)
- [package.json:7-18](file://package.json#L7-L18)

## Release Process and Distribution
- Versioning: Increment version in package.json for releases.
- Build: Run the package script to produce distributables for target platforms.
- Distribution: Publish artifacts to your chosen channels (e.g., GitHub Releases, installer repositories).

**Section sources**
- [package.json:3-12](file://package.json#L3-L12)
- [package.json:34-54](file://package.json#L34-L54)

## Debugging and Profiling
Debugging Electron:
- Enable DevTools in development via NODE_ENV in main process.
- Use preload API calls to log and inspect data passed between processes.
- Inspect main process logs and renderer console for errors.

Profiling:
- Use Chrome DevTools for renderer performance.
- Monitor main process resource usage and avoid synchronous heavy work.

Memory management:
- Avoid retaining large buffers; convert to ArrayBuffer views when possible.
- Dispose plugin subscriptions and clear caches when unloading documents.

**Section sources**
- [src/main.ts:33-35](file://src/main.ts#L33-L35)
- [src/preload.ts:5-33](file://src/preload.ts#L5-L33)

## Code Standards and Conventions
- TypeScript best practices:
  - Strict compiler options and explicit typing.
  - Prefer immutable updates and small, pure functions.
  - Use enums and interfaces from shared types for consistency.
- Architectural patterns:
  - Clear separation between main, preload, and renderer.
  - Dependency injection for core managers to facilitate testing.
- Naming conventions:
  - Use PascalCase for classes and enums, camelCase for methods and variables.
  - Prefix Electron IPC handlers consistently (e.g., load-pdf, execute-ai-task).

**Section sources**
- [tsconfig.json:9-16](file://tsconfig.json#L9-L16)
- [src/types/index.ts:1-224](file://src/types/index.ts#L1-L224)
- [src/main.ts:81-156](file://src/main.ts#L81-L156)

## Conclusion
This guide consolidates the essential development practices for SciPDFReader, from environment setup and build configuration to architecture, comprehensive testing strategies, development workflow enhancements, and release procedures. The addition of detailed testing documentation through TESTING.md provides developers with a complete testing framework, automated sample PDF generation, and systematic quality assurance processes. By following the documented workflows, standards, and testing procedures, contributors can efficiently extend the application, integrate plugins, deliver robust cross-platform experiences, and maintain high-quality software development practices.