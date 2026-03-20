# SciPDFReader Plugin Development Guide

This guide shows you how to create plugins for SciPDFReader, following the VS Code extension model.

## Architecture Overview

SciPDFReader uses a plugin architecture inspired by VS Code, allowing developers to extend functionality through:

- Custom annotation types
- AI service integrations
- Custom commands
- UI extensions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- TypeScript knowledge
- Understanding of the SciPDFReader API

### Project Setup

1. Create a new directory for your plugin:
```bash
mkdir my-pdf-plugin
cd my-pdf-plugin
npm init -y
```

2. Install dependencies:
```bash
npm install --save-dev typescript @types/node
```

3. Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "dist",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## Plugin Structure

A basic plugin has this structure:

```
my-pdf-plugin/
├── src/
│   └── extension.ts
├── package.json
├── tsconfig.json
└── README.md
```

### package.json

```json
{
  "name": "my-pdf-plugin",
  "displayName": "My PDF Plugin",
  "version": "0.0.1",
  "description": "My first SciPDFReader plugin",
  "publisher": "YourName",
  "engines": {
    "scipdfreader": "^1.0.0"
  },
  "main": "./dist/extension.js",
  "contributes": {
    "annotations": [
      {
        "type": "custom_annotation",
        "label": "Custom Annotation",
        "color": "#FF5733",
        "icon": "⭐"
      }
    ],
    "commands": [
      {
        "command": "myplugin.dosomething",
        "title": "Do Something",
        "category": "My Plugin"
      }
    ]
  },
  "activationEvents": ["onStartupFinished"]
}
```

### extension.ts

```typescript
import * as scipdf from 'scipdfreader-api';

export function activate(context: scipdf.PluginContext) {
  console.log('SciPDFReader plugin is now active!');
  
  // Register a command
  const disposable = scipdf.commands.registerCommand(
    'myplugin.dosomething',
    async (selectedText: string) => {
      // Get current selection
      const selection = context.pdfRenderer.getSelection();
      
      // Create an annotation
      await context.annotations.createAnnotation({
        type: 'custom_annotation',
        content: selection.text,
        position: selection.ranges[0],
        pageNumber: selection.pageNumber || 1
      });
      
      // Show information message
      scipdf.window.showInformationMessage('Annotation created!');
    }
  );
  
  context.subscriptions.push(disposable);
  
  // You can also register custom annotation types
  context.annotations.registerAnnotationType({
    type: 'custom_annotation',
    label: 'Custom Annotation',
    color: '#FF5733'
  });
}

export function deactivate() {
  // Cleanup resources
}
```

## Plugin APIs

### Annotations API

Create and manage annotations:

```typescript
// Create annotation
await context.annotations.createAnnotation({
  type: 'highlight',
  content: 'Selected text',
  pageNumber: 1,
  position: { x: 100, y: 200, width: 300, height: 20 },
  color: '#FFFF00'
});

// Update annotation
await context.annotations.updateAnnotation(id, {
  annotationText: 'Updated note'
});

// Delete annotation
await context.annotations.deleteAnnotation(id);

// Get annotations for a page
const annotations = await context.annotations.getAnnotations(pageNumber);

// Search annotations
const results = await context.annotations.searchAnnotations('keyword');

// Export annotations
const json = await context.annotations.exportAnnotations('json');
```

### AI Service API

Use AI capabilities:

```typescript
// Initialize AI service
context.aiService.initialize({
  provider: 'openai',
  apiKey: 'your-api-key',
  model: 'gpt-3.5-turbo'
});

// Translation task
const translation = await context.aiService.executeTask({
  type: AITaskType.TRANSLATION,
  input: 'Hello world',
  options: { targetLanguage: 'zh-CN' }
});

// Summarization task
const summary = await context.aiService.executeTask({
  type: AITaskType.SUMMARIZATION,
  input: longText,
  options: { maxLength: 200 }
});

// Background information
const backgroundInfo = await context.aiService.executeTask({
  type: AITaskType.BACKGROUND_INFO,
  input: 'Quantum Computing',
  context: documentText
});

// Keyword extraction
const keywords = await context.aiService.executeTask({
  type: AITaskType.KEYWORD_EXTRACTION,
  input: documentText
});
```

### PDF Renderer API

Interact with PDF documents:

```typescript
// Load PDF document
const doc = await context.pdfRenderer.loadDocument('/path/to/file.pdf');

// Render a page
await context.pdfRenderer.renderPage(1, { scale: 1.5 });

// Extract text from page
const text = await context.pdfRenderer.extractText(1);

// Get page info
const pageInfo = context.pdfRenderer.getPageInfo(1);

// Set zoom level
context.pdfRenderer.setZoom(1.2);

// Get current selection
const selection = context.pdfRenderer.getSelection();
```

## Example Plugins

### 1. Translation Plugin

Automatically translate selected text:

```typescript
import * as scipdf from 'scipdfreader-api';

export function activate(context: scipdf.PluginContext) {
  context.subscriptions.push(
    scipdf.commands.registerCommand('translate.selected', async () => {
      const selection = context.pdfRenderer.getSelection();
      
      if (!selection.text) {
        scipdf.window.showWarningMessage('Please select text to translate');
        return;
      }
      
      const result = await context.aiService.executeTask({
        type: AITaskType.TRANSLATION,
        input: selection.text,
        options: { targetLanguage: 'zh-CN' }
      });
      
      await context.annotations.createAnnotation({
        type: 'translation',
        content: selection.text,
        annotationText: result.output,
        position: selection.ranges[0],
        pageNumber: selection.pageNumber
      });
      
      scipdf.window.showInformationMessage('Translation added!');
    })
  );
}
```

### 2. Auto Background Info Plugin

Automatically add background information for key concepts:

```typescript
import * as scipdf from 'scipdfreader-api';

export function activate(context: scipdf.PluginContext) {
  // Process current page
  const processPage = async (pageNumber: number) => {
    const text = await context.pdfRenderer.extractText(pageNumber);
    
    // Extract keywords
    const keywordsResult = await context.aiService.executeTask({
      type: AITaskType.KEYWORD_EXTRACTION,
      input: text
    });
    
    const keywords = JSON.parse(keywordsResult.output);
    
    // Add background info for each keyword
    for (const keyword of keywords.slice(0, 5)) {
      const bgInfo = await context.aiService.executeTask({
        type: AITaskType.BACKGROUND_INFO,
        input: keyword,
        context: text
      });
      
      await context.annotations.createAnnotation({
        type: 'background_info',
        content: keyword,
        annotationText: bgInfo.output,
        metadata: { autoGenerated: true }
      });
    }
  };
  
  context.subscriptions.push(
    scipdf.commands.registerCommand('auto.background', () => {
      // Get current page number (implementation dependent)
      processPage(1);
    })
  );
}
```

### 3. Summary Generator Plugin

Generate summaries of PDF pages:

```typescript
import * as scipdf from 'scipdfreader-api';

export function activate(context: scipdf.PluginContext) {
  context.subscriptions.push(
    scipdf.commands.registerCommand('generate.summary', async () => {
      const pageNumber = 1; // Get current page
      const text = await context.pdfRenderer.extractText(pageNumber);
      
      const summary = await context.aiService.executeTask({
        type: AITaskType.SUMMARIZATION,
        input: text,
        options: { 
          maxLength: 150,
          language: 'en'
        }
      });
      
      await context.annotations.createAnnotation({
        type: 'note',
        content: 'Page Summary',
        annotationText: summary.output,
        position: { x: 50, y: 50, width: 300, height: 100 },
        pageNumber
      });
      
      scipdf.window.showInformationMessage('Summary generated!');
    })
  );
}
```

## Testing Your Plugin

1. Compile your plugin:
```bash
npm run compile
```

2. Install the plugin in SciPDFReader:
```bash
scipdf-cli install ./dist
```

3. Reload SciPDFReader and test the functionality

## Publishing

1. Package your plugin:
```bash
npm run package
```

2. Publish to the marketplace:
```bash
scipdf-cli publish
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **User Feedback**: Provide clear messages to users
3. **Performance**: Avoid blocking the UI thread
4. **Resource Management**: Clean up subscriptions in deactivate()
5. **Documentation**: Document your plugin's features and usage

## Debugging

Enable debug logging:

```typescript
console.log('Debug info:', someVariable);

try {
  // Some operation
} catch (error) {
  console.error('Plugin error:', error);
  scipdf.window.showErrorMessage('Something went wrong');
}
```

## Community Resources

- GitHub Repository: https://github.com/Chunde/SciPDFReader
- Design Document: See DESIGN.md in the main repository
- Issue Tracker: Report bugs and request features on GitHub

---

**Version**: 1.0  
**Last Updated**: 2026-02-10
