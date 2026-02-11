# sciPDFReader - Cross-Platform PDF Reader

A lightweight, cross-platform PDF reader built with JavaScript using the PDF.js library. This application runs in any modern web browser and provides essential PDF viewing functionality.

## Features

- View PDF files directly in the browser
- Navigate between pages
- Zoom in/out functionality
- Fit page to width
- Responsive design for mobile and desktop
- Keyboard shortcuts for navigation
- File metadata display

## Keyboard Shortcuts

- Left Arrow: Previous page
- Right Arrow: Next page
- `+` or `=`: Zoom in
- `-` or `_`: Zoom out

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Click the file input button to select a PDF file
4. Start reading!

### Development

If you want to run a local development server:

```bash
npm install
npm start
```

Or use npx to run without installing:

```bash
npx serve .
```

Then navigate to `http://localhost:3000` in your browser.

## Built With

- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering library by Mozilla
- HTML5 Canvas - For rendering PDF content
- Vanilla JavaScript - No additional frameworks required

## How It Works

The application uses PDF.js to parse and render PDF files in the browser. PDF.js is a portable PDF reading library that doesn't require any third-party plugins. It uses web technologies like HTML5 Canvas to render PDFs.

## Security Note

All processing happens client-side in your browser. Your PDF files are not uploaded to any server, ensuring privacy and security.

## Contributing

Feel free to fork this repository and submit pull requests for improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to Mozilla for developing PDF.js
- Thanks to the open-source community for making web-based PDF reading possible