# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [QUICK_REFERENCE.md](file://QUICK_REFERENCE.md)
- [package.json](file://package.json)
- [start-dev.sh](file://start-dev.sh)
- [start-dev.bat](file://start-dev.bat)
- [scripts/create-sample-pdf.js](file://scripts/create-sample-pdf.js)
- [src/main.ts](file://src/main.ts)
- [src/core/AnnotationManager.ts](file://src/core/AnnotationManager.ts)
- [src/core/PluginManager.ts](file://src/core/PluginManager.ts)
- [src/core/AIServiceManager.ts](file://src/core/AIServiceManager.ts)
- [src/types/index.ts](file://src/types/index.ts)
- [DESIGN.md](file://DESIGN.md)
- [PLUGIN-GUIDE.md](file://PLUGIN-GUIDE.md)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive coverage of the new QUICK_REFERENCE.md resource
- Enhanced quick start options with streamlined one-command testing
- Updated development workflow with improved scripts and automation
- Added practical testing checklist and troubleshooting guidance
- Streamlined installation process with automated dependency management

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Quick Start Options](#quick-start-options)
4. [Manual Installation](#manual-installation)
5. [Initial Configuration](#initial-configuration)
6. [Basic Usage Walkthrough](#basic-usage-walkthrough)
7. [System Requirements](#system-requirements)
8. [Architecture Overview](#architecture-overview)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Verification Steps](#verification-steps)
11. [Conclusion](#conclusion)

## Introduction
SciPDFReader is an AI-powered PDF reader with annotation and plugin support, built on Electron with a VS Code-inspired plugin architecture. It enables intelligent PDF reading with features like translation, background information, summarization, and customizable annotations across Windows, macOS, and Linux.

**Section sources**
- [README.md:1-4](file://README.md#L1-L4)

## Prerequisites
Before installing SciPDFReader, ensure your system meets the following requirements:
- Node.js 18+ and npm
- Git
- Platform-specific build tools (varies by OS)

These prerequisites are required for building and running the Electron application locally.

**Section sources**
- [README.md:33-36](file://README.md#L33-L36)

## Quick Start Options
SciPDFReader provides multiple streamlined approaches to get you started quickly:

### One-Command Testing (Recommended)
The fastest way to test SciPDFReader is with a single command:
```bash
npm run test-app
```

This command creates a sample PDF, compiles the TypeScript code, and launches the application automatically!

### Platform-Specific Quick Start Scripts
**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

These scripts automatically handle dependency installation, TypeScript compilation, and application startup.

**Section sources**
- [README.md:5-14](file://README.md#L5-L14)
- [README.md:44-55](file://README.md#L44-L55)
- [QUICK_REFERENCE.md:3-8](file://QUICK_REFERENCE.md#L3-L8)
- [QUICK_REFERENCE.md:19-29](file://QUICK_REFERENCE.md#L19-L29)

## Manual Installation
For manual control over the installation process:

1. Clone the repository:
```bash
git clone https://github.com/Chunde/SciPDFReader.git
cd SciPDFReader
```

2. Install dependencies:
```bash
npm install
```

3. Compile TypeScript:
```bash
npm run compile
```

4. Run the application:
```bash
npm start
```

**Section sources**
- [README.md:57-78](file://README.md#L57-L78)

## Initial Configuration
Create a configuration file at `~/.scipdfreader/config.json` with the following structure:
- AI provider settings (provider, API key, model)
- Annotation preferences (default color, auto-save)
- Plugin configurations (auto-load)

This configuration file controls AI service integration, annotation behavior, and plugin loading.

**Section sources**
- [README.md:157-176](file://README.md#L157-L176)

## Basic Usage Walkthrough
Once launched, you can:
- Load PDF files using the application interface
- Navigate pages using the built-in navigation controls
- Perform simple annotations by selecting text and choosing annotation types (highlight, underline, note, etc.)

The application initializes core managers for annotations, AI services, and plugins automatically upon startup.

**Section sources**
- [src/main.ts:45-60](file://src/main.ts#L45-L60)

## System Requirements
SciPDFReader supports the following platforms:
- Windows (via NSIS installer)
- macOS (category configured for productivity)
- Linux (AppImage target)

Build targets are defined in the project configuration for cross-platform distribution.

**Section sources**
- [package.json:41-61](file://package.json#L41-L61)

## Architecture Overview
SciPDFReader follows a layered architecture with Electron as the runtime, TypeScript for type safety, and React for the UI. The core modules include:
- AnnotationManager: Manages annotations and persistence
- AIServiceManager: Handles AI tasks and provider integration
- PluginManager: Loads and manages plugins from the user directory

```mermaid
graph TB
App["Electron App<br/>src/main.ts"] --> Managers["Core Managers"]
Managers --> AM["AnnotationManager<br/>src/core/AnnotationManager.ts"]
Managers --> AIM["AIServiceManager<br/>src/core/AIServiceManager.ts"]
Managers --> PM["PluginManager<br/>src/core/PluginManager.ts"]
PM --> Plugins["User Plugins<br/>~/.scipdfreader/plugins"]
AM --> Storage["Local Storage<br/>~/.scipdfreader/annotations"]
```

**Diagram sources**
- [src/main.ts:45-60](file://src/main.ts#L45-L60)
- [src/core/AnnotationManager.ts:15-19](file://src/core/AnnotationManager.ts#L15-L19)
- [src/core/PluginManager.ts:37-46](file://src/core/PluginManager.ts#L37-L46)

**Section sources**
- [DESIGN.md:19-84](file://DESIGN.md#L19-L84)
- [src/main.ts:45-60](file://src/main.ts#L45-L60)

## Troubleshooting Guide
Common setup issues and solutions:

### Quick Troubleshooting Commands
**App won't start?**
```bash
npm install && npm run compile && npm start
```

**Compilation errors?**
```bash
rm -rf out/ && npm run compile
```

**PDF not loading?**
Use the included `test-sample.pdf`

### Development Script Issues
- Node.js version mismatch: Ensure Node.js 18+ is installed
- Missing dependencies: Run `npm install` to install all required packages
- TypeScript compilation errors: Verify `npm run compile` succeeds
- Application fails to start: Check `npm start` logs for errors
- Plugin loading failures: Confirm plugin manifests are valid JSON and located in the plugins directory

If encountering permission issues on Unix-like systems, ensure the configuration and plugin directories are writable.

**Section sources**
- [QUICK_REFERENCE.md:74-88](file://QUICK_REFERENCE.md#L74-L88)
- [src/core/PluginManager.ts:48-69](file://src/core/PluginManager.ts#L48-L69)
- [src/core/AnnotationManager.ts:36-40](file://src/core/AnnotationManager.ts#L36-L40)

## Verification Steps
After installation, verify your setup:

### Quick Test Checklist
1. Run `npm run test-app` to create sample PDF and launch application
2. Click "Open PDF File" button
3. Select `test-sample.pdf`
4. Try zooming in/out
5. Navigate between pages

### Full Verification Process
1. Confirm TypeScript compiles without errors
2. Launch the application and check for UI initialization
3. Verify configuration file exists at the expected path
4. Test basic annotation creation and retrieval
5. Ensure plugin directory is created and accessible

**Section sources**
- [QUICK_REFERENCE.md:31-48](file://QUICK_REFERENCE.md#L31-L48)
- [package.json:8-17](file://package.json#L8-L17)
- [src/main.ts:62-77](file://src/main.ts#L62-L77)
- [src/core/AnnotationManager.ts:159-170](file://src/core/AnnotationManager.ts#L159-L170)

## Conclusion
You are now ready to use SciPDFReader. Start by loading PDFs, creating annotations, and exploring AI-powered features. For advanced customization, refer to the plugin development guide and adjust the configuration file to match your preferences.

The new QUICK_REFERENCE.md provides a comprehensive quick start guide with essential commands, testing checklists, and troubleshooting resources for rapid development and testing workflows.

**Section sources**
- [QUICK_REFERENCE.md:89-113](file://QUICK_REFERENCE.md#L89-L113)
- [README.md:197-207](file://README.md#L197-L207)