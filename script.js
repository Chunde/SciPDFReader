// sciPDFReader - JavaScript PDF Reader using PDF.js
document.addEventListener('DOMContentLoaded', function() {
    // Set the worker path for PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // DOM elements
    const fileInput = document.getElementById('fileInput');
    const canvas = document.getElementById('pdfCanvas');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumberInput = document.getElementById('pageNumber');
    const pageCountSpan = document.getElementById('pageCount');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const fitWidthBtn = document.getElementById('fitWidth');
    const loadingMessage = document.getElementById('loadingMessage');

    // Variables
    let pdfDoc = null;
    let currentPage = 1;
    let scale = 1.0;
    let pageRendering = false;
    let pageNumPending = null;

    // Initialize event listeners
    initEventListeners();

    function initEventListeners() {
        // File input change event
        fileInput.addEventListener('change', handleFileSelect);

        // Page navigation
        prevPageBtn.addEventListener('click', showPrevPage);
        nextPageBtn.addEventListener('click', showNextPage);

        // Page number input
        pageNumberInput.addEventListener('change', function() {
            const newPageNumber = parseInt(this.value);
            if (!isNaN(newPageNumber)) {
                queueRenderPage(newPageNumber);
            }
        });

        // Zoom controls
        zoomInBtn.addEventListener('click', function() {
            scale *= 1.2;
            renderPage(currentPage);
        });
        
        zoomOutBtn.addEventListener('click', function() {
            scale /= 1.2;
            renderPage(currentPage);
        });
        
        fitWidthBtn.addEventListener('click', function() {
            scale = (canvas.parentElement.clientWidth - 40) / canvas.width;
            renderPage(currentPage);
        });
    }

    // Handle file selection
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            return;
        }

        showLoading(true);
        
        const fileReader = new FileReader();
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                pdfDoc = pdf;
                document.title = `sciPDFReader - ${pdfDoc.metadata?.info.Title || file.name}`;
                
                // Show first page
                pageCountSpan.textContent = pdf.numPages;
                showPage(1);
                showLoading(false);
            }).catch(function(error) {
                console.error('Error loading PDF:', error);
                alert('Error loading PDF: ' + error.message);
                showLoading(false);
            });
        };
        
        fileReader.readAsArrayBuffer(file);
    }

    // Show loading message
    function showLoading(show) {
        if (show) {
            loadingMessage.classList.add('loading');
        } else {
            loadingMessage.classList.remove('loading');
        }
    }

    // Render a specific page
    function renderPage(num) {
        if (!pdfDoc) return;

        pageRendering = true;
        
        // Using promise to handle page rendering
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            
            // Set canvas dimensions
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };
            
            const renderTask = page.render(renderContext);
            
            renderTask.promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    // New page rendering is pending
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
                
                // Update page number input
                currentPage = num;
                pageNumberInput.value = currentPage;
            }).catch(function(error) {
                console.error('Error rendering page:', error);
                pageRendering = false;
            });
        }).catch(function(error) {
            console.error('Error getting page:', error);
            pageRendering = false;
        });
    }

    // Queue page rendering - handles case where rendering is in progress
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            showPage(num);
        }
    }

    // Show a specific page
    function showPage(num) {
        if (!pdfDoc || num < 1 || num > pdfDoc.numPages) {
            return;
        }

        currentPage = num;
        renderPage(num);
    }

    // Show previous page
    function showPrevPage() {
        if (currentPage <= 1) return;
        queueRenderPage(currentPage - 1);
    }

    // Show next page
    function showNextPage() {
        if (!pdfDoc || currentPage >= pdfDoc.numPages) return;
        queueRenderPage(currentPage + 1);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && currentPage > 1) {
            queueRenderPage(currentPage - 1);
        } else if (e.key === 'ArrowRight' && pdfDoc && currentPage < pdfDoc.numPages) {
            queueRenderPage(currentPage + 1);
        } else if (e.key === '+' || e.key === '=') {
            scale *= 1.2;
            renderPage(currentPage);
        } else if (e.key === '-' || e.key === '_') {
            scale /= 1.2;
            renderPage(currentPage);
        }
    });
});