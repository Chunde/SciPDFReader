// Simple static server for sciPDFReader
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`sciPDFReader server running at http://localhost:${PORT}`);
    console.log('Open your browser and navigate to the URL above to use the PDF reader.');
});