# SciPDFReader Testing Guide

## Quick Test (Recommended) ⚡

The fastest way to test SciPDFReader:

```bash
npm run test-app
```

This single command will:
1. ✅ Create a sample PDF (`test-sample.pdf`)
2. ✅ Compile TypeScript code
3. ✅ Launch the application

## Step-by-Step Testing

### 1. Installation & Setup

```bash
# Clone and install
git clone https://github.com/Chunde/SciPDFReader.git
cd SciPDFReader
npm install

# Compile
npm run compile
```

### 2. Create Test PDF

```bash
npm run create-sample
```

This creates `test-sample.pdf` with:
- 2 pages of content
- Feature list for testing
- Text suitable for annotation testing

### 3. Run Application

```bash
npm start
```

Or use the development mode:

```bash
npm run dev
```

## Features to Test

### 📖 PDF Rendering
- [ ] Open PDF file (File → Open or toolbar button)
- [ ] Check rendering quality
- [ ] Navigate between pages using:
  - Previous/Next buttons
  - Page number input
  - Keyboard arrow keys (if implemented)

### 🔍 Zoom Controls
- [ ] Zoom In (toolbar button)
- [ ] Zoom Out (toolbar button)
- [ ] Select zoom levels from dropdown (50% - 300%)
- [ ] Fit to Width functionality

### 📝 Annotation System
Test creating different annotation types:
- [ ] Highlight text
- [ ] Underline text
- [ ] Add notes
- [ ] Translation annotations (requires AI setup)
- [ ] Background information (requires AI setup)

### 🎨 UI Components
- [ ] Left sidebar (document outline)
- [ ] Right panel (annotations list)
- [ ] Toolbar responsiveness
- [ ] View options dropdown menu

## Using the Sample PDF

The included `test-sample.pdf` contains:

**Page 1:**
- Title and introduction
- Feature list with 8 items to test
- Clear, readable text

**Page 2:**
- Additional content
- Multi-page navigation test
- More text for annotation practice

## Testing Checklist

### Basic Functionality
- [ ] Application launches without errors
- [ ] Can open PDF files
- [ ] PDF renders correctly
- [ ] Page navigation works
- [ ] Zoom controls function properly

### UI/UX
- [ ] All buttons are clickable
- [ ] Menus open and close correctly
- [ ] Sidebar panels collapse/expand
- [ ] No visual glitches or overlapping elements

### Advanced Features (If configured)
- [ ] Annotations can be created
- [ ] Annotations are saved
- [ ] Annotations display in right panel
- [ ] AI features work (if API key configured)

## Troubleshooting

### Application won't start

**Error: Cannot find module**
```bash
npm install
npm run compile
```

**Error: ERR_FILE_NOT_FOUND**
Check that `src/renderer/index.html` exists

### Compilation errors

```bash
# Clean and recompile
rm -rf out/
npm run compile
```

### PDF not loading

- Ensure the file path doesn't contain special characters
- Try the sample PDF: `test-sample.pdf`
- Check Electron console for errors (Ctrl+Shift+I)

## Development Mode

For active development with hot reload:

```bash
# Watch mode for TypeScript
npm run watch

# In another terminal, start Electron
npm start
```

## Performance Testing

Test with different PDF sizes:
- Small PDF (< 1MB) ✅
- Medium PDF (1-10MB) ✅
- Large PDF (> 10MB) ⚠️

Monitor:
- Memory usage
- Rendering speed
- Scroll smoothness

## Next Steps

After basic testing:
1. Configure AI services (OpenAI/Azure) for smart features
2. Install plugins from marketplace (when available)
3. Create custom plugins using PLUGIN-GUIDE.md
4. Test annotation export (JSON, Markdown, HTML)

## Reporting Issues

When reporting bugs, include:
- Operating system version
- Node.js version (`node -v`)
- npm version (`npm -v`)
- Error messages from console
- Steps to reproduce

---

**Happy Testing! 🎉**

For questions or issues, visit: https://github.com/Chunde/SciPDFReader
