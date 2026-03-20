const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createSamplePDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a page
  const page = pdfDoc.addPage([612, 792]);

  // Draw text
  page.drawText('SciPDFReader - Sample PDF', {
    x: 50,
    y: 750,
    size: 24,
    color: rgb(0, 0.53, 0.71),
  });

  page.drawText('This is a sample PDF file for testing the SciPDFReader application.', {
    x: 50,
    y: 700,
    size: 14,
  });

  page.drawText('Features to test:', {
    x: 50,
    y: 660,
    size: 16,
    color: rgb(0.2, 0.2, 0.2),
  });

  const features = [
    '1. PDF rendering with PDF.js',
    '2. Page navigation (previous/next)',
    '3. Zoom controls (50% - 300%)',
    '4. Fit-to-width functionality',
    '5. Annotation system (highlight, underline, notes)',
    '6. AI-powered translation',
    '7. Background information lookup',
    '8. Plugin architecture'
  ];

  features.forEach((feature, index) => {
    page.drawText(feature, {
      x: 70,
      y: 630 - (index * 25),
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  // Add another page
  const page2 = pdfDoc.addPage([612, 792]);
  
  page2.drawText('Page 2 - More Content', {
    x: 50,
    y: 750,
    size: 20,
    color: rgb(0, 0.53, 0.71),
  });

  page2.drawText('This demonstrates multi-page PDF support.', {
    x: 50,
    y: 700,
    size: 14,
  });

  page2.drawText('You can test:', {
    x: 50,
    y: 660,
    size: 14,
  });

  page2.drawText('- Page navigation buttons', {
    x: 70,
    y: 630,
    size: 12,
  });

  page2.drawText('- Keyboard shortcuts (arrow keys)', {
    x: 70,
    y: 605,
    size: 12,
  });

  page2.drawText('- Zoom in/out functionality', {
    x: 70,
    y: 580,
    size: 12,
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  
  // Write to file
  const outputPath = path.join(__dirname, '..', 'test-sample.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  
  console.log('✅ Sample PDF created successfully!');
  console.log(`📄 Location: ${outputPath}`);
  console.log('');
  console.log('You can now open this file in SciPDFReader to test the application.');
}

// Run if called directly
if (require.main === module) {
  createSamplePDF().catch(console.error);
}

module.exports = { createSamplePDF };
