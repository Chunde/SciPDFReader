# Main Process Architecture

<cite>
**Referenced Files in This Document**
- [src/main.ts](file://src/main.ts)
- [src/core/AnnotationManager.ts](file://src/core/AnnotationManager.ts)
- [src/core/AIServiceManager.ts](file://src/core/AIServiceManager.ts)
- [src/core/PluginManager.ts](file://src/core/PluginManager.ts)
- [src/types/index.ts](file://src/types/index.ts)
- [src/renderer/index.html](file://src/renderer/index.html)
- [src/preload.ts](file://src/preload.ts)
- [package.json](file://package.json)
</cite>

## Update Summary
**Changes Made**
- Updated file loading mechanism section to reflect the enhanced loadURL with explicit file:// protocol specification
- Enhanced debug logging documentation with improved console.log statements for resolved file paths and process information
- Added comprehensive error handling documentation for file operations in IPC handlers
- Updated troubleshooting guide with specific guidance for cross-platform file loading issues

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains the Electron main process architecture with a focus on the process separation model and IPC communication patterns. It details how the main process initializes the BrowserWindow with security-focused webPreferences, how services are initialized and wired, and how IPC handlers are registered for secure communication between the renderer and main processes. It also covers application lifecycle management, security considerations, and practical IPC usage patterns for PDF loading, annotation saving, AI task execution, and plugin command registration.

## Project Structure
The project follows a clear separation of concerns:
- Main process entry point initializes the BrowserWindow and registers IPC handlers.
- Core services encapsulate business logic for annotations, AI tasks, and plugin management.
- Types define shared interfaces and contracts across the application.
- A preload script exposes a minimal, controlled API surface to the renderer via contextBridge.
- The renderer loads a React-based UI and communicates with the main process through the preload bridge.

```mermaid
graph TB
subgraph "Main Process"
MAIN["src/main.ts"]
ANNOT["src/core/AnnotationManager.ts"]
AI["src/core/AIServiceManager.ts"]
PLUG["src/core/PluginManager.ts"]
PRELOAD["src/preload.ts"]
end
subgraph "Renderer"
RENDERER_HTML["src/renderer/index.html"]
end
MAIN --> ANNOT
MAIN --> AI
MAIN --> PLUG
RENDERER_HTML --> PRELOAD
PRELOAD --> MAIN
```

**Diagram sources**
- [src/main.ts:1-165](file://src/main.ts#L1-L165)
- [src/core/AnnotationManager.ts:1-172](file://src/core/AnnotationManager.ts#L1-L172)
- [src/core/AIServiceManager.ts:1-214](file://src/core/AIServiceManager.ts#L1-L214)
- [src/core/PluginManager.ts:1-250](file://src/core/PluginManager.ts#L1-L250)
- [src/preload.ts:1-35](file://src/preload.ts#L1-L35)
- [src/renderer/index.html:1-14](file://src/renderer/index.html#L1-L14)

**Section sources**
- [src/main.ts:13-46](file://src/main.ts#L13-L46)
- [src/renderer/index.html:1-14](file://src/renderer/index.html#L1-L14)
- [src/preload.ts:1-35](file://src/preload.ts#L1-L35)

## Core Components
- AnnotationManager: Manages annotations, persistence, and export formats. Provides CRUD operations and search.
- AIServiceManager: Orchestrates AI tasks (translation, summarization, background info, keyword extraction, Q&A) with configurable providers.
- PluginManager: Loads, activates, and manages plugins, exposing a controlled API surface to plugin modules and managing command registration.

These components are instantiated and wired during main process initialization and are referenced by IPC handlers to serve renderer requests.

**Section sources**
- [src/core/AnnotationManager.ts:6-172](file://src/core/AnnotationManager.ts#L6-L172)
- [src/core/AIServiceManager.ts:3-214](file://src/core/AIServiceManager.ts#L3-L214)
- [src/core/PluginManager.ts:16-36](file://src/core/PluginManager.ts#L16-L36)

## Architecture Overview
The main process creates a secure BrowserWindow with context isolation and a preload script. The preload script exposes a limited API to the renderer, which invokes IPC handlers in the main process. Services are initialized once and reused by IPC handlers to fulfill renderer requests.

```mermaid
sequenceDiagram
participant R as "Renderer"
participant P as "Preload Bridge"
participant M as "Main Process"
participant AM as "AnnotationManager"
participant AIM as "AIServiceManager"
participant PM as "PluginManager"
R->>P : "api.loadPDF(filePath)"
P->>M : "ipcRenderer.invoke('load-pdf', filePath)"
M->>M : "readFileSync(filePath)"
M-->>P : "{success, path, name, size}"
P-->>R : "Promise resolve"
R->>P : "api.saveAnnotation(annotation)"
P->>M : "ipcRenderer.invoke('save-annotation', annotation)"
M->>AM : "createAnnotation(annotation)"
AM-->>M : "Annotation"
M-->>P : "Annotation"
P-->>R : "Promise resolve"
```

**Diagram sources**
- [src/main.ts:90-137](file://src/main.ts#L90-L137)
- [src/preload.ts:5-34](file://src/preload.ts#L5-L34)
- [src/core/AnnotationManager.ts:46-59](file://src/core/AnnotationManager.ts#L46-L59)

**Section sources**
- [src/main.ts:13-46](file://src/main.ts#L13-L46)
- [src/main.ts:83-165](file://src/main.ts#L83-L165)
- [src/preload.ts:1-35](file://src/preload.ts#L1-L35)

## Detailed Component Analysis

### Main Process Initialization and Security Model
- BrowserWindow creation sets:
  - nodeIntegration: false
  - contextIsolation: true
  - preload: path to the compiled preload script
- Development mode opens DevTools automatically.
- Window lifecycle events are handled to reset references on close.
- Application lifecycle:
  - Ready: createWindow and register activate handler.
  - All windows closed: quit except on macOS.

**Enhanced File Loading Mechanism**: The main process now uses an explicit file:// protocol specification in loadURL for cross-platform compatibility. The renderer file is loaded using `mainWindow.loadURL(`file://${indexPath}`)` where indexPath is constructed using `path.join(__dirname, '../src/renderer/index.html')`. This ensures proper file resolution across different operating systems and development environments.

**Improved Debug Logging**: Enhanced logging capabilities include console.log statements that display resolved file paths and process information:
- `[Main] __dirname: ${__dirname}` - Shows the resolved main process directory
- `[Main] Loading index.html from: ${indexPath}` - Displays the exact file path being loaded

Security implications:
- Disabling nodeIntegration prevents direct Node.js access from the renderer.
- Enabling contextIsolation ensures renderer code runs in a separate context.
- The preload script defines a minimal API surface via contextBridge, preventing arbitrary exposure of ipcRenderer.

**Section sources**
- [src/main.ts:13-46](file://src/main.ts#L13-L46)
- [src/main.ts:29-33](file://src/main.ts#L29-L33)
- [src/main.ts:31-32](file://src/main.ts#L31-L32)
- [src/preload.ts:1-35](file://src/preload.ts#L1-L35)

### Service Initialization Sequence
- AnnotationManager: Constructed and initializes default annotation types and persistent storage path.
- AIServiceManager: Constructed and ready to execute tasks when configured.
- PluginManager: Constructed with dependencies on AnnotationManager and AIServiceManager, then auto-loads installed plugins.

```mermaid
flowchart TD
Start(["App Ready"]) --> CreateWindow["createWindow()"]
CreateWindow --> InitServices["initializeServices()"]
InitServices --> NewAnnot["new AnnotationManager()"]
InitServices --> NewAI["new AIServiceManager()"]
InitServices --> NewPM["new PluginManager({annotations, aiService})"]
NewPM --> LoadPlugins["loadInstalledPlugins()"]
LoadPlugins --> End(["Services Ready"])
```

**Diagram sources**
- [src/main.ts:48-63](file://src/main.ts#L48-L63)
- [src/core/AnnotationManager.ts:11-19](file://src/core/AnnotationManager.ts#L11-L19)
- [src/core/PluginManager.ts:22-36](file://src/core/PluginManager.ts#L22-L36)

**Section sources**
- [src/main.ts:48-63](file://src/main.ts#L48-L63)
- [src/core/AnnotationManager.ts:11-19](file://src/core/AnnotationManager.ts#L11-L19)
- [src/core/PluginManager.ts:49-70](file://src/core/PluginManager.ts#L49-L70)

### IPC Handler Registration Pattern
The main process registers handlers using ipcMain.handle() for each capability:
- PDF operations: load-pdf, read-file-as-array-buffer, show-open-dialog.
- Annotation operations: save-annotation, get-annotations.
- AI operations: execute-ai-task.
- Plugin operations: register-command, register-annotation-type.

Handlers validate initialization state and delegate to services, returning structured results or throwing errors. Comprehensive error handling has been implemented with detailed logging for debugging file operations.

```mermaid
sequenceDiagram
participant R as "Renderer"
participant P as "Preload Bridge"
participant M as "Main Process"
participant PM as "PluginManager"
R->>P : "api.registerCommand(commandId, callback)"
P->>M : "ipcRenderer.invoke('register-command', commandId, callback)"
M->>PM : "registerCommand(commandId, callback)"
PM-->>M : "Disposable"
M-->>P : "void"
P-->>R : "Promise resolve"
```

**Diagram sources**
- [src/main.ts:154-158](file://src/main.ts#L154-L158)
- [src/core/PluginManager.ts:123-135](file://src/core/PluginManager.ts#L123-L135)
- [src/preload.ts:27-29](file://src/preload.ts#L27-L29)

**Section sources**
- [src/main.ts:83-165](file://src/main.ts#L83-L165)
- [src/core/PluginManager.ts:123-135](file://src/core/PluginManager.ts#L123-L135)

### Application Lifecycle Management
- Creation: createWindow constructs BrowserWindow with security preferences, loads renderer HTML using the enhanced loadURL mechanism with explicit file:// protocol, and initializes services.
- Activation: app.on('activate') re-creates the window if none exist (macOS behavior).
- Closing: app.on('window-all-closed') quits the app except on macOS.

Graceful shutdown:
- No explicit cleanup shown in the main process; services are long-lived singletons referenced by handlers. Proper disposal patterns are available in PluginManager for plugin lifecycles.

**Section sources**
- [src/main.ts:13-46](file://src/main.ts#L13-L46)
- [src/main.ts:65-81](file://src/main.ts#L65-L81)
- [src/main.ts:13-46](file://src/main.ts#L13-L46)
- [src/core/PluginManager.ts:177-193](file://src/core/PluginManager.ts#L177-L193)

### Security Considerations
- nodeIntegration disabled and contextIsolation enabled in BrowserWindow webPreferences.
- Preload script exposes only named methods via contextBridge, minimizing attack surface.
- File system operations are performed in main process handlers; renderer cannot access Node.js APIs directly.
- Dialog operations are handled in main process, emitting events to renderer rather than exposing dialogs to renderer.
- Enhanced error handling provides detailed logging for debugging while maintaining security boundaries.

**Section sources**
- [src/main.ts:18-22](file://src/main.ts#L18-L22)
- [src/preload.ts:1-35](file://src/preload.ts#L1-L35)
- [src/main.ts:90-130](file://src/main.ts#L90-L130)

### Practical IPC Communication Patterns

#### PDF Loading
- Renderer calls api.loadPDF(filePath) via preload.
- Main process reads file synchronously and returns metadata with comprehensive error handling.
- On open dialog selection, main process emits a load-pdf event to renderer with detailed logging.

```mermaid
sequenceDiagram
participant R as "Renderer"
participant P as "Preload Bridge"
participant M as "Main Process"
R->>P : "api.openFileDialog()"
P->>M : "ipcRenderer.invoke('show-open-dialog')"
M->>M : "dialog.showOpenDialog()"
M-->>P : "filePath or null"
alt Selected
M->>P : "ipcRenderer.send('load-pdf', filePath)"
P-->>R : "load-pdf event"
else Canceled
M-->>P : "null"
end
```

**Diagram sources**
- [src/main.ts:115-130](file://src/main.ts#L115-L130)
- [src/preload.ts:17-24](file://src/preload.ts#L17-L24)

**Section sources**
- [src/main.ts:90-103](file://src/main.ts#L90-L103)
- [src/main.ts:115-130](file://src/main.ts#L115-L130)
- [src/preload.ts:7-24](file://src/preload.ts#L7-L24)

#### Annotation Saving and Retrieval
- Renderer saves annotations via api.saveAnnotation(annotation).
- Main process delegates to AnnotationManager and persists data with comprehensive error handling.
- Renderer retrieves annotations via api.getAnnotations(pageNumber).

```mermaid
sequenceDiagram
participant R as "Renderer"
participant P as "Preload Bridge"
participant M as "Main Process"
participant AM as "AnnotationManager"
R->>P : "api.saveAnnotation(annotation)"
P->>M : "ipcRenderer.invoke('save-annotation', annotation)"
M->>AM : "createAnnotation(annotation)"
AM-->>M : "Annotation"
M-->>P : "Annotation"
P-->>R : "Promise resolve"
R->>P : "api.getAnnotations(pageNumber)"
P->>M : "ipcRenderer.invoke('get-annotations', pageNumber)"
M->>AM : "getAnnotations(pageNumber)"
AM-->>M : "Annotation[]"
M-->>P : "Annotation[]"
P-->>R : "Promise resolve"
```

**Diagram sources**
- [src/main.ts:132-144](file://src/main.ts#L132-L144)
- [src/core/AnnotationManager.ts:46-84](file://src/core/AnnotationManager.ts#L46-L84)
- [src/preload.ts:10-12](file://src/preload.ts#L10-L12)

**Section sources**
- [src/main.ts:132-144](file://src/main.ts#L132-L144)
- [src/core/AnnotationManager.ts:46-84](file://src/core/AnnotationManager.ts#L46-L84)

#### AI Task Execution
- Renderer submits tasks via api.executeAITask(task).
- Main process delegates to AIServiceManager, which routes to provider-specific implementations with comprehensive error handling.

```mermaid
sequenceDiagram
participant R as "Renderer"
participant P as "Preload Bridge"
participant M as "Main Process"
participant AIM as "AIServiceManager"
R->>P : "api.executeAITask(task)"
P->>M : "ipcRenderer.invoke('execute-ai-task', task)"
M->>AIM : "executeTask(task)"
AIM-->>M : "AITaskResult"
M-->>P : "AITaskResult"
P-->>R : "Promise resolve"
```

**Diagram sources**
- [src/main.ts:146-151](file://src/main.ts#L146-L151)
- [src/core/AIServiceManager.ts:13-56](file://src/core/AIServiceManager.ts#L13-L56)
- [src/preload.ts:14-15](file://src/preload.ts#L14-L15)

**Section sources**
- [src/main.ts:146-151](file://src/main.ts#L146-L151)
- [src/core/AIServiceManager.ts:13-56](file://src/core/AIServiceManager.ts#L13-L56)

#### Plugin Command Registration
- Renderer registers plugin commands via api.registerCommand(commandId, callback).
- Main process stores the command in PluginManager for later execution with comprehensive error handling.

```mermaid
sequenceDiagram
participant R as "Renderer"
participant P as "Preload Bridge"
participant M as "Main Process"
participant PM as "PluginManager"
R->>P : "api.registerCommand(commandId, callback)"
P->>M : "ipcRenderer.invoke('register-command', commandId, callback)"
M->>PM : "registerCommand(commandId, callback)"
PM-->>M : "Disposable"
M-->>P : "void"
P-->>R : "Promise resolve"
```

**Diagram sources**
- [src/main.ts:154-158](file://src/main.ts#L154-L158)
- [src/core/PluginManager.ts:123-135](file://src/core/PluginManager.ts#L123-L135)
- [src/preload.ts:27-29](file://src/preload.ts#L27-L29)

**Section sources**
- [src/main.ts:154-158](file://src/main.ts#L154-L158)
- [src/core/PluginManager.ts:123-135](file://src/core/PluginManager.ts#L123-L135)

### Platform-Specific Behaviors and Development vs Production Differences
- Development:
  - DevTools opened automatically for debugging.
  - Enhanced console.log statements provide detailed file path information and process details.
  - NODE_ENV environment variable controls this behavior.
- Production:
  - No automatic DevTools; production builds rely on packaged renderer assets.
  - Enhanced error handling provides comprehensive logging for debugging.
- macOS:
  - App does not quit when the last window is closed; activate event re-creates the window.
- Other platforms:
  - App quits when all windows are closed.

**Section sources**
- [src/main.ts:35-38](file://src/main.ts#L35-L38)
- [src/main.ts:69-73](file://src/main.ts#L69-L73)

## Dependency Analysis
The main process depends on core services, which in turn depend on shared types. The preload script bridges the renderer to the main process via a controlled API surface.

```mermaid
graph LR
MAIN["src/main.ts"] --> ANNOT["src/core/AnnotationManager.ts"]
MAIN --> AI["src/core/AIServiceManager.ts"]
MAIN --> PLUG["src/core/PluginManager.ts"]
PRELOAD["src/preload.ts"] --> MAIN
RENDERER["src/renderer/index.html"] --> PRELOAD
ANNOT --> TYPES["src/types/index.ts"]
AI --> TYPES
PLUG --> TYPES
```

**Diagram sources**
- [src/main.ts:1-12](file://src/main.ts#L1-L12)
- [src/core/AnnotationManager.ts:1-5](file://src/core/AnnotationManager.ts#L1-L5)
- [src/core/AIServiceManager.ts:1](file://src/core/AIServiceManager.ts#L1)
- [src/core/PluginManager.ts:1-4](file://src/core/PluginManager.ts#L1-L4)
- [src/preload.ts:1](file://src/preload.ts#L1)
- [src/renderer/index.html:10](file://src/renderer/index.html#L10)
- [src/types/index.ts:1](file://src/types/index.ts#L1)

**Section sources**
- [src/main.ts:1-12](file://src/main.ts#L1-L12)
- [src/core/AnnotationManager.ts:1-5](file://src/core/AnnotationManager.ts#L1-L5)
- [src/core/AIServiceManager.ts:1](file://src/core/AIServiceManager.ts#L1)
- [src/core/PluginManager.ts:1-4](file://src/core/PluginManager.ts#L1-L4)
- [src/preload.ts:1](file://src/preload.ts#L1)
- [src/renderer/index.html:10](file://src/renderer/index.html#L10)
- [src/types/index.ts:1](file://src/types/index.ts#L1)

## Performance Considerations
- Synchronous file operations in main process handlers (e.g., readFileSync) can block the main thread. Consider asynchronous alternatives for large files to keep the UI responsive.
- AI task execution is asynchronous; ensure tasks are queued and results cached where appropriate to avoid redundant computations.
- Plugin loading scans directories and requires modules; cache plugin manifests and avoid repeated disk scans.
- Annotation persistence writes to disk; batch writes or debounce to reduce I/O overhead.
- Enhanced logging provides performance insights but should be disabled in production for optimal performance.

## Troubleshooting Guide
Common issues and resolutions:
- Renderer cannot access Node.js APIs:
  - Verify contextIsolation is true and preload exposes only allowed methods.
- IPC handlers not responding:
  - Confirm handlers are registered before renderer calls them.
  - Check that service instances exist and are initialized.
- Plugin command not found:
  - Ensure registerCommand was invoked and the commandId matches when executing.
- File dialog not opening:
  - Ensure main process dialog handler is registered and called from preload.
- **Cross-platform file loading issues**:
  - **Critical**: Verify the enhanced loadURL mechanism is working correctly. The main process now uses `mainWindow.loadURL(`file://${indexPath}`)` with explicit file:// protocol specification for cross-platform compatibility.
  - **Development Environment**: Check that console.log statements show correct resolved file paths: `[Main] __dirname: ${__dirname}` and `[Main] Loading index.html from: ${indexPath}`.
  - **Production Build Issues**: Ensure the renderer bundle is built and placed in the correct output directory structure with proper file:// protocol handling.
- **Enhanced Error Handling**: Main process handlers now include comprehensive error handling with detailed logging:
  - PDF loading errors: `console.error('Error loading PDF:', error)`
  - File reading errors: `console.error('Error reading file:', error)`
  - Plugin loading errors: `console.error('Failed to load plugin ${dir}:', error)`
  - Use these logs to diagnose file operation failures.

**Updated** Enhanced troubleshooting guide with specific guidance for the improved file loading mechanism, debug logging, and comprehensive error handling.

**Section sources**
- [src/main.ts:18-22](file://src/main.ts#L18-L22)
- [src/main.ts:29-33](file://src/main.ts#L29-L33)
- [src/main.ts:31-32](file://src/main.ts#L31-L32)
- [src/main.ts:90-103](file://src/main.ts#L90-L103)
- [src/main.ts:105-113](file://src/main.ts#L105-L113)
- [src/main.ts:154-158](file://src/main.ts#L154-L158)
- [src/preload.ts:1-35](file://src/preload.ts#L1-L35)

## Conclusion
The main process architecture employs a secure, service-oriented design with clear IPC boundaries. The BrowserWindow is configured with strong security defaults, and the preload script exposes a minimal API surface. Services are initialized once and reused by IPC handlers to provide robust functionality for PDF operations, annotations, AI tasks, and plugin management. The enhanced file loading mechanism with explicit file:// protocol specification ensures cross-platform compatibility, while comprehensive error handling and improved debug logging provide better observability. Following the patterns documented here ensures predictable behavior, maintainable code, and safe cross-process communication.

## Appendices

### IPC Handler Reference
- load-pdf: Reads a file and returns metadata with comprehensive error handling.
- read-file-as-array-buffer: Returns file content as ArrayBuffer with detailed error logging.
- show-open-dialog: Opens a file dialog and emits load-pdf to renderer.
- save-annotation: Persists an annotation via AnnotationManager.
- get-annotations: Retrieves annotations for a page.
- execute-ai-task: Executes an AI task via AIServiceManager.
- register-command: Registers a plugin command in PluginManager.
- register-annotation-type: Registers a new annotation type in AnnotationManager.

**Section sources**
- [src/main.ts:83-165](file://src/main.ts#L83-L165)

### Types Overview
Key shared types define contracts for annotations, AI tasks, plugin manifests, and plugin APIs. These types guide service implementations and ensure consistent IPC payloads.

**Section sources**
- [src/types/index.ts:3-224](file://src/types/index.ts#L3-L224)

### Enhanced Debug Logging Reference
The main process includes comprehensive debug logging for:
- File path resolution: `[Main] __dirname: ${__dirname}`
- File loading: `[Main] Loading index.html from: ${indexPath}`
- Error handling: Detailed console.error statements for file operations
- Plugin management: Enhanced logging for plugin loading and activation
- AI service operations: Console log statements for task execution

**Section sources**
- [src/main.ts:31-32](file://src/main.ts#L31-L32)
- [src/main.ts:90-103](file://src/main.ts#L90-L103)
- [src/main.ts:105-113](file://src/main.ts#L105-L113)
- [src/core/PluginManager.ts:102-106](file://src/core/PluginManager.ts#L102-L106)
- [src/core/AIServiceManager.ts:10](file://src/core/AIServiceManager.ts#L10)