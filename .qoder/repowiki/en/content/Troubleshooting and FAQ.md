# Troubleshooting and FAQ

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [src/main.ts](file://src/main.ts)
- [src/preload.ts](file://src/preload.ts)
- [src/core/AnnotationManager.ts](file://src/core/AnnotationManager.ts)
- [src/core/AIServiceManager.ts](file://src/core/AIServiceManager.ts)
- [src/core/PluginManager.ts](file://src/core/PluginManager.ts)
- [src/types/index.ts](file://src/types/index.ts)
- [src/renderer/App.tsx](file://src/renderer/App.tsx)
- [src/renderer/components/PDFViewer.tsx](file://src/renderer/components/PDFViewer.tsx)
- [src/renderer/components/RightPanel.tsx](file://src/renderer/components/RightPanel.tsx)
- [webpack.config.js](file://webpack.config.js)
- [PLUGIN-GUIDE.md](file://PLUGIN-GUIDE.md)
</cite>

## Update Summary
**Changes Made**
- Enhanced debugging guidance section with comprehensive console logging infrastructure details
- Added detailed troubleshooting steps for Electron's development tools and console logging
- Expanded error handling documentation with specific logging patterns and diagnostic approaches
- Updated plugin loading failures section with improved error logging and validation
- Enhanced performance troubleshooting with logging-based diagnostics

## Table of Contents
1. [Introduction](#introduction)
2. [Installation Troubleshooting](#installation-troubleshooting)
3. [Plugin Loading Failures](#plugin-loading-failures)
4. [Performance Issues](#performance-issues)
5. [Platform-Specific Problems](#platform-specific-problems)
6. [Debugging Guidance](#debugging-guidance)
7. [Frequently Asked Questions](#frequently-asked-questions)
8. [Recovery Procedures](#recovery-procedures)
9. [Performance Tuning Recommendations](#performance-tuning-recommendations)
10. [Conclusion](#conclusion)

## Introduction
This Troubleshooting and FAQ section provides practical guidance for resolving common issues encountered by SciPDFReader users and developers. It covers installation problems, plugin loading failures, performance issues, platform-specific challenges, debugging techniques, and recovery procedures. The content is grounded in the repository's source files and aims to help users diagnose and fix problems efficiently.

**Updated** Enhanced with comprehensive console logging infrastructure and improved error handling throughout the application for better troubleshooting and diagnostics.

## Installation Troubleshooting
Common installation issues often stem from environment mismatches, dependency conflicts, and permission errors. Follow these steps to resolve them systematically.

- Verify prerequisites
  - Ensure Node.js 18+ and npm are installed. Confirm by running the respective commands in your terminal or command prompt.
  - Confirm git is available if cloning from source.

- Install dependencies
  - Run the dependency installer to fetch required packages. This installs Electron, PDF.js, React, sqlite3, uuid, and devDependencies.
  - If dependency conflicts occur, clear the cache and reinstall:
    - Remove node_modules and package-lock.json.
    - Reinstall dependencies.
  - If permission errors occur during installation, adjust file permissions or run as administrator (Windows) or with sudo (macOS/Linux).

- Compile TypeScript
  - Compile the project using the provided script. If compilation fails, check for TypeScript version mismatches and update accordingly.

- Run the application
  - Start the application using the provided script. If the app does not launch, check for missing native dependencies and rebuild them if necessary.

- Platform-specific notes
  - On Windows, ensure antivirus or security software is not blocking Electron or node modules.
  - On macOS, verify that Gatekeeper settings allow Electron apps and that Xcode command-line tools are installed if native modules are involved.
  - On Linux, ensure required libraries are present (e.g., libnotify, libnss, alsa) and that the runtime environment supports Electron.

**Section sources**
- [README.md:31-60](file://README.md#L31-L60)
- [package.json:16-33](file://package.json#L16-L33)

## Plugin Loading Failures
Plugin loading failures typically arise from invalid manifests, API compatibility issues, or security restrictions. Use the diagnostic steps below to identify and fix the problem.

- Validate plugin manifest
  - Ensure the plugin's manifest includes required fields such as name, displayName, version, publisher, engines.scipdfreader, and main.
  - Verify the engines field specifies a compatible SciPDFReader version.
  - Confirm activationEvents are correctly defined (e.g., wildcard or startup events).

- Check plugin directory and permissions
  - Plugins are loaded from a user-specific directory under the application data folder. Ensure the directory exists and is writable.
  - On Windows, check that the user profile path resolves correctly.
  - On macOS and Linux, confirm the home directory resolves and the path is accessible.

- Review plugin activation logs
  - The application logs plugin load and activation attempts. Look for error messages indicating failure to load or activate the plugin.
  - If a plugin fails to activate, verify that the plugin's main entry point exports an activate function and that it handles the plugin context correctly.

- Resolve API compatibility
  - Ensure the plugin targets the correct API surface. The plugin context exposes annotations, pdfRenderer, aiService, and storage APIs.
  - Validate that the plugin uses the correct types and interfaces defined in the shared type definitions.

- Security restrictions
  - Plugins run in a sandboxed environment. Avoid direct Node.js filesystem access from plugins; use the provided APIs instead.
  - If a plugin requires external resources, ensure they are packaged or fetched securely.

**Updated** Enhanced with improved error logging infrastructure for better plugin troubleshooting.

**Section sources**
- [src/core/PluginManager.ts:48-104](file://src/core/PluginManager.ts#L48-L104)
- [src/core/PluginManager.ts:37-46](file://src/core/PluginManager.ts#L37-L46)
- [src/types/index.ts:86-103](file://src/types/index.ts#L86-L103)
- [PLUGIN-GUIDE.md:65-97](file://PLUGIN-GUIDE.md#L65-L97)

## Performance Issues
Performance problems can manifest as slow PDF rendering, memory leaks in annotation processing, or AI service timeouts. Apply the following strategies to optimize behavior.

- Slow PDF rendering
  - Optimize rendering by leveraging virtualization and incremental loading. While the renderer is not fully implemented yet, plan for lazy loading of pages and caching rendered content.
  - Reduce unnecessary re-renders by batching UI updates and minimizing DOM manipulations.

- Memory leaks in annotation processing
  - Ensure annotations are stored efficiently and cleaned up when no longer needed. The annotation manager persists annotations to disk; verify that cleanup routines remove stale entries.
  - Monitor memory usage during heavy annotation sessions and implement periodic garbage collection strategies.

- AI service timeouts
  - Implement retry logic with exponential backoff for AI requests.
  - Batch multiple AI tasks to reduce overhead and improve throughput.
  - Provide fallback mechanisms when AI services are unavailable (e.g., local summarization).

- Resource management
  - Limit concurrent operations to prevent CPU and memory saturation.
  - Use streaming for large file operations to reduce peak memory usage.

**Updated** Enhanced with comprehensive console logging infrastructure for performance diagnostics and monitoring.

**Section sources**
- [src/core/AnnotationManager.ts:153-170](file://src/core/AnnotationManager.ts#L153-L170)
- [src/core/AIServiceManager.ts:58-75](file://src/core/AIServiceManager.ts#L58-L75)

## Platform-Specific Problems
Platform differences can cause file path issues, executable permissions, and system integration challenges. Address them as follows.

- Windows
  - File paths: Use forward slashes or normalized paths to avoid path separator issues.
  - Executable permissions: Ensure Electron can execute required binaries. If using native modules, rebuild them for the target architecture.
  - System integration: Confirm that antivirus or security software is not blocking Electron or plugin installations.

- macOS
  - File paths: Use POSIX-style paths and ensure the home directory resolves correctly.
  - Executable permissions: Verify that downloaded plugins are not quarantined by Gatekeeper. Unquarantine if necessary.
  - System integration: Confirm that Xcode command-line tools are installed for building native dependencies.

- Linux
  - File paths: Normalize paths and ensure the home directory resolves correctly.
  - Executable permissions: Ensure the application and plugins have executable permissions where required.
  - System integration: Install required runtime libraries (e.g., libnotify, libnss, alsa) for Electron.

**Section sources**
- [src/core/PluginManager.ts:37-40](file://src/core/PluginManager.ts#L37-L40)
- [src/core/AnnotationManager.ts:15-19](file://src/core/AnnotationManager.ts#L15-L19)

## Debugging Guidance
Effective debugging involves using Electron's development tools, console logging, and structured error analysis. The application now features comprehensive console logging infrastructure for enhanced troubleshooting.

- Enable Developer Tools
  - Developer Tools open automatically in development mode. Use them to inspect the renderer process, network requests, and console logs.
  - Access via main window menu or by pressing F12 in development mode.

- Console logging infrastructure
  - **Main process logging**: The main process logs critical operations including window creation, file operations, plugin loading, and AI service initialization.
  - **Renderer process logging**: Comprehensive logging throughout the React components including PDF loading, annotation operations, and user interactions.
  - **IPC communication logging**: Detailed logging of inter-process communication between main and renderer processes.
  - **Plugin lifecycle logging**: Complete plugin loading, activation, and deactivation lifecycle events are logged for debugging.

- Key logging patterns to look for:
  - `[Main]` - Main process operations and file system interactions
  - `[App]` - React component lifecycle and user interactions
  - `[PDFViewer]` - PDF loading and rendering operations
  - `[PluginManager]` - Plugin loading and activation status
  - `[AnnotationManager]` - Annotation CRUD operations
  - `[AIServiceManager]` - AI service initialization and task execution

- Error analysis
  - Inspect thrown errors and their stack traces. Pay attention to file read/write errors, plugin load errors, and AI service exceptions.
  - Validate input parameters passed to managers (e.g., annotation creation, AI task execution) to ensure they match expected types.

- IPC communication
  - Use the IPC handlers to communicate between main and renderer processes. Verify that events are sent and received correctly and that error responses are handled gracefully.

**Updated** Significantly enhanced with comprehensive console logging infrastructure and improved error handling throughout the application.

**Section sources**
- [src/main.ts:32-35](file://src/main.ts#L32-L35)
- [src/main.ts:80-156](file://src/main.ts#L80-L156)
- [src/preload.ts:5-34](file://src/preload.ts#L5-L34)
- [src/renderer/App.tsx:10-25](file://src/renderer/App.tsx#L10-L25)
- [src/renderer/components/PDFViewer.tsx:27-58](file://src/renderer/components/PDFViewer.tsx#L27-L58)

## Frequently Asked Questions
This section answers common questions about AI service configuration, annotation export formats, plugin marketplace access, and cross-platform compatibility.

- How do I configure the AI service?
  - Configure the AI service by setting provider, API key, endpoint, and model in the configuration file. Ensure the configuration aligns with the chosen provider and model.

- What annotation export formats are supported?
  - Annotations can be exported to JSON, Markdown, and HTML. Use the export function to generate the desired format.

- How do I access the plugin marketplace?
  - The plugin marketplace is planned for future releases. For now, install plugins manually by placing them in the plugins directory and ensuring the manifest is valid.

- Is SciPDFReader cross-platform?
  - Yes, the project targets Windows, macOS, and Linux. Distribution targets are configured for NSIS (Windows), AppImage (Linux), and macOS categories.

**Section sources**
- [README.md:120-139](file://README.md#L120-L139)
- [src/core/AnnotationManager.ts:96-112](file://src/core/AnnotationManager.ts#L96-L112)
- [package.json:34-54](file://package.json#L34-L54)

## Recovery Procedures
Address common user scenarios such as corrupted annotation data, plugin conflicts, and configuration file corruption with the following recovery steps.

- Corrupted annotation data
  - Locate the annotation storage directory under the user data folder.
  - Back up the existing annotations file, then delete it to reset the annotation database.
  - Restart the application to recreate the annotations file.

- Plugin conflicts
  - Disable conflicting plugins by removing them from the plugins directory or marking them disabled.
  - Reload the application and re-enable plugins one by one to isolate the problematic plugin.
  - Verify plugin manifests and ensure they target compatible versions.

- Configuration file corruption
  - Locate the configuration file path and back it up.
  - Replace the corrupted configuration with a known-good template from the documentation.
  - Restart the application to apply the corrected configuration.

**Section sources**
- [src/core/AnnotationManager.ts:159-170](file://src/core/AnnotationManager.ts#L159-L170)
- [src/core/PluginManager.ts:174-190](file://src/core/PluginManager.ts#L174-L190)
- [README.md:120-139](file://README.md#L120-L139)

## Performance Tuning Recommendations
Optimize application behavior through targeted tuning and resource management strategies.

- Rendering optimization
  - Implement virtual scrolling and incremental page loading to reduce memory usage.
  - Separate PDF content rendering from annotation overlays to minimize redraws.

- AI service optimization
  - Batch AI tasks to reduce network overhead and improve throughput.
  - Cache AI responses to avoid repeated calls for identical inputs.
  - Provide local fallback processing when external services are unavailable.

- Data storage optimization
  - Persist annotations incrementally and compress data where feasible.
  - Index frequently searched fields to speed up query performance.

- Memory management
  - Periodically clear caches and dispose of unused resources.
  - Monitor memory usage during intensive operations and adjust concurrency limits.

**Section sources**
- [src/core/AIServiceManager.ts:58-75](file://src/core/AIServiceManager.ts#L58-L75)

## Conclusion
By following the troubleshooting steps, diagnostic techniques, and recovery procedures outlined in this document, users and developers can effectively resolve common SciPDFReader issues. Address installation problems early, validate plugin manifests rigorously, monitor performance closely, and adopt platform-specific best practices. For persistent issues, leverage Electron's development tools and structured error analysis to pinpoint root causes and implement targeted fixes.

**Updated** Enhanced debugging capabilities and comprehensive console logging infrastructure provide unprecedented visibility into application behavior, enabling faster diagnosis and resolution of complex issues across all application layers.