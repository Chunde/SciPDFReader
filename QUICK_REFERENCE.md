# 🚀 SciPDFReader - Quick Reference Card

## One-Command Test ⚡
```bash
npm run test-app
```

## Essential Commands

| Command | What It Does |
|---------|-------------|
| `npm run test-app` | **Best option** - Creates sample PDF, compiles, and runs |
| `npm start` | Run the application (requires prior compilation) |
| `npm run dev` | Compile and run in one step |
| `npm run create-sample` | Create a test PDF file |
| `npm run compile` | Compile TypeScript code |
| `npm run watch` | Watch mode for development |

## Quick Start Scripts

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
./start-dev.sh
```

## Testing Checklist ✅

### Basic Test (2 minutes)
1. Run `npm run test-app`
2. Click "Open PDF File" button
3. Select `test-sample.pdf`
4. Try zooming in/out
5. Navigate between pages

### Full Test (10 minutes)
- [ ] Open PDF file
- [ ] Navigate pages (Previous/Next buttons)
- [ ] Test all zoom levels (50%, 100%, 200%, etc.)
- [ ] Try "Fit to Width"
- [ ] Open View menu dropdown
- [ ] Collapse/expand sidebars
- [ ] Test annotation buttons (highlight, note, etc.)

## Keyboard Shortcuts (When Implemented)

| Key | Action |
|-----|--------|
| `Ctrl+O` | Open PDF |
| `Ctrl+S` | Save |
| `←` / `→` | Previous/Next page |
| `+` / `-` | Zoom in/out |
| `F11` | Full screen |

## Project Structure (Quick Ref)

```
src/
├── main.ts          ← Electron backend
├── preload.ts       ← IPC bridge
└── renderer/        ← React frontend
    ├── App.tsx
    └── components/
        ├── PDFViewer.tsx
        ├── Toolbar.tsx
        ├── Sidebar.tsx
        └── RightPanel.tsx
```

## Troubleshooting (30 seconds)

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

## Next Steps

1. ✅ Test basic functionality
2. ⏳ Configure AI services (optional)
3. 📦 Install plugins (when available)
4. 🔌 Create custom plugins

## Documentation Quick Links

- [`TESTING.md`](TESTING.md) - Detailed testing guide
- [`DESIGN.md`](DESIGN.md) - Architecture overview
- [`PLUGIN-GUIDE.md`](PLUGIN-GUIDE.md) - Plugin development
- [`README.md`](README.md) - Getting started

## Support

- GitHub: https://github.com/Chunde/SciPDFReader
- Issues: https://github.com/Chunde/SciPDFReader/issues

---

**Happy Testing! 🎉**

Start now: `npm run test-app`
