import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

declare const window: any;

interface PDFViewerProps {
  document: any;
  onAnnotationCreate: (annotation: any) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ document, onAnnotationCreate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // Set worker source - use relative path from renderer/index.html location
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/build/pdf.worker.min.js';
  }, []);

  useEffect(() => {
    console.log('[PDFViewer] Document prop changed:', document);
    if (document?.path) {
      console.log('[PDFViewer] Loading PDF from path:', document.path);
      loadPDF(document.path);
    }
  }, [document]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [currentPage, scale, pdfDoc]);

  const loadPDF = async (path: string) => {
    console.log('[PDFViewer] loadPDF called with path:', path);
    try {
      setIsLoading(true);
      
      // Read file using Electron IPC
      console.log('[PDFViewer] Calling readFileAsArrayBuffer...');
      const arrayBuffer = await window.api?.readFileAsArrayBuffer(path);
      console.log('[PDFViewer] Array buffer received, length:', arrayBuffer?.byteLength);
      
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      console.log('[PDFViewer] PDF loaded, pages:', pdf.numPages);
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setIsLoading(false);
    } catch (error) {
      console.error('[PDFViewer] Error loading PDF:', error);
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d')!;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(scale + 0.25);
  };

  const handleZoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.25);
    }
  };

  const handleFitWidth = () => {
    if (!canvasRef.current?.parentElement) return;
    
    const containerWidth = canvasRef.current.parentElement.clientWidth - 40;
    if (pdfDoc && currentPage <= totalPages) {
      pdfDoc.getPage(currentPage).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        const newScale = containerWidth / viewport.width;
        setScale(newScale);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!pdfDoc) {
    return (
      <div className="pdf-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2>No PDF Opened</h2>
          <p>Open a PDF file to start reading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-content">
      <div className="pdf-page-wrapper">
        <canvas 
          ref={canvasRef} 
          className="pdf-page"
          style={{ cursor: 'crosshair' }}
        />
        <div className="annotation-layer">
          {/* Annotations will be rendered here */}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
