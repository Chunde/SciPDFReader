# SciPDFReader - AI-Powered PDF Reader

A modern, extensible PDF reader with AI-powered annotation capabilities, built on Electron with a VS Code-inspired plugin architecture.

## 🚀 Quick Start

**Try it now in one command:**
```bash
npm run test-app
```

This will create a sample PDF, compile the code, and launch the application!

See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for more quick start options.

## Features

- 📖 **PDF Reading** - High-quality PDF rendering using PDF.js
- ✏️ **Annotation System** - Highlight, underline, notes, and custom annotations
- 🤖 **AI Integration** - Automatic translation, background information, summarization
- 🔌 **Plugin System** - Extensible architecture inspired by VS Code
- 💻 **Cross-Platform** - Windows, macOS, Linux support

## Project Structure

```
SciPDFReader/
├── src/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Preload script for security
│   ├── renderer/            # React-based UI
│   ├── core/                # Core modules
│   │   ├── AnnotationManager.ts
│   │   ├── PluginManager.ts
│   │   └── AIServiceManager.ts
│   └── types/               # TypeScript type definitions
├── package.json
├── tsconfig.json
└── DESIGN.md                # Architecture design document
```

## Getting Started

### Quick Start (Recommended)

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Manual Installation

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

### Quick Test

To quickly test the application with a sample PDF:

```bash
npm run test-app
```

This will:
1. Create a sample PDF file (`test-sample.pdf`)
2. Compile the TypeScript code
3. Launch the SciPDFReader application

The sample PDF will demonstrate:
- Multi-page PDF rendering
- Text content for annotation testing
- Feature list overview

## Development

### Build Commands

- `npm run compile` - Compile TypeScript
- `npm run watch` - Watch mode for development
- `npm start` - Start the application
- `npm run package` - Package the application for distribution
- `npm run lint` - Run ESLint

### Creating Plugins

See [PLUGIN-GUIDE.md](./PLUGIN-GUIDE.md) for detailed instructions on creating plugins.

Example plugin structure:

```typescript
import * as scipdf from 'scipdfreader-api';

export function activate(context: scipdf.PluginContext) {
  console.log('Plugin activated');
  
  // Register a command
  context.subscriptions.push(
    scipdf.commands.registerCommand('myplugin.translate', async (text: string) => {
      const result = await context.aiService.executeTask({
        type: 'translation',
        input: text,
        options: { targetLanguage: 'zh-CN' }
      });
      
      await context.annotations.createAnnotation({
        type: 'translation',
        content: text,
        annotationText: result.output
      });
    })
  );
}

export function deactivate() {
  // Cleanup
}
```

## AI Features

### Translation
Select any text and get instant translation using OpenAI or Azure AI services.

### Background Information
Automatically detect and provide context for key concepts, names, and events.

### Summarization
Generate concise summaries of pages or sections.

### Smart Annotations
AI-powered automatic annotation based on document content.

## Configuration

Create a configuration file at `~/.scipdfreader/config.json`:

```json
{
  "ai": {
    "provider": "openai",
    "apiKey": "your-api-key",
    "model": "gpt-3.5-turbo"
  },
  "annotations": {
    "defaultColor": "#FFFF00",
    "autoSave": true
  },
  "plugins": {
    "autoLoad": true
  }
}
```

## Roadmap

- [x] Project initialization and architecture design
- [x] Core modules implementation
- [ ] PDF rendering integration
- [ ] Complete annotation system
- [ ] AI service integration
- [ ] Plugin marketplace
- [ ] Cross-platform builds
- [ ] Performance optimization

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

MIT License - See [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [VS Code](https://github.com/microsoft/vscode) - For inspiring the plugin architecture
- [PDF.js](https://mozilla.github.io/pdf.js/) - Mozilla's PDF rendering library
- [Electron](https://www.electronjs.org/) - Cross-platform desktop app framework

---

**Version**: 0.0.1  
**Status**: Early Development
