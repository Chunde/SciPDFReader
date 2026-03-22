import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

declare const window: any;

interface PDFViewerProps {
  document: any;
  onAnnotationCreate: (annotation: any) => void;
  currentPage: number;
  onCurrentPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
  scale: number;
  scrollMode: 'fit-height' | 'scroll';
  onPageDimensionsChange?: (width: number, height: number) => void;
  onContainerDimensionsChange?: (width: number, height: number) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ document, onAnnotationCreate, currentPage, onCurrentPageChange, onTotalPagesChange, scale, scrollMode, onPageDimensionsChange, onContainerDimensionsChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  let lastWheelTime = useRef(0);
  
  console.log('[PDFViewer] Rendering - currentPage:', currentPage, 'scale:', scale, 'scrollMode:', scrollMode);

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
      console.log('[PDFViewer] Setting total pages to:', pdf.numPages);
      onTotalPagesChange(pdf.numPages);
      console.log('[PDFViewer] Total pages set successfully');
      onCurrentPageChange(1);
      setIsLoading(false);
      
      // Report initial page dimensions
      if (pdf && onPageDimensionsChange) {
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });
        console.log('[PDFViewer] First page dimensions:', viewport.width, 'x', viewport.height);
        onPageDimensionsChange(viewport.width, viewport.height);
      }
    } catch (error) {
      console.error('[PDFViewer] Error loading PDF:', error);
      setIsLoading(false);
    }
  };

  // Render all pages for scroll mode
  const renderAllPages = async () => {
    if (!pdfDoc || !containerRef.current) return;
    
    console.log('[PDFViewer] Rendering all pages, total:', pdfDoc.numPages);
    const container = containerRef.current;
    
    // Clear existing canvases
    container.innerHTML = '';
    
    // Render each page
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvasWrapper = document.createElement('div');
      canvasWrapper.className = 'pdf-page-wrapper-scroll';
      canvasWrapper.style.marginBottom = '20px';
      canvasWrapper.style.position = 'relative';
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = 'block';
      canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      canvas.style.backgroundColor = 'white';
      
      const context = canvas.getContext('2d');
      if (!context) continue;
      
      canvasWrapper.appendChild(canvas);
      container.appendChild(canvasWrapper);
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      console.log(`[PDFViewer] Page ${pageNum} rendered`);
    }
  };

  // Report container dimensions when they change using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    const updateContainerDimensions = () => {
      if (container && onContainerDimensionsChange) {
        const rect = container.getBoundingClientRect();
        console.log('[PDFViewer] Container dimensions changed:', rect.width, 'x', rect.height);
        onContainerDimensionsChange(rect.width, rect.height);
      }
    };

    // Use ResizeObserver for better resize detection
    const resizeObserver = new ResizeObserver(() => {
      console.log('[PDFViewer] ResizeObserver triggered');
      updateContainerDimensions();
    });
    
    resizeObserver.observe(container);
    
    // Initial measurement
    updateContainerDimensions();

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []); // Empty dependency array - only run once on mount/unmount

  // Handle scroll mode rendering - render all pages when mode changes
  useEffect(() => {
    if (scrollMode === 'scroll' && pdfDoc) {
      console.log('[PDFViewer] Scroll mode enabled, rendering all pages');
      renderAllPages();
    }
  }, [scrollMode, pdfDoc, scale]);

  // Smart wheel/page navigation for single-page mode
  useEffect(() => {
    if (scrollMode !== 'fit-height' || !pdfDoc || !containerRef.current) return;

    const container = containerRef.current;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      
      // Check if rendering is in progress - don't change page while rendering
      if (isRendering) {
        e.preventDefault();
        console.log('[PDFViewer] Skipping wheel - rendering in progress');
        return;
      }
      
      // Throttle wheel events - one page change per 500ms
      if (now - lastWheelTime.current < 500) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const pageFits = scrollHeight <= clientHeight;
      
      // If page fits perfectly, change pages immediately
      if (pageFits) {
        e.preventDefault();
        lastWheelTime.current = now;
        if (e.deltaY > 0 && currentPage < pdfDoc.numPages) {
          console.log('[PDFViewer] Page fits - loading next page:', currentPage + 1);
          onCurrentPageChange(currentPage + 1);
        } else if (e.deltaY < 0 && currentPage > 1) {
          console.log('[PDFViewer] Page fits - loading previous page:', currentPage - 1);
          onCurrentPageChange(currentPage - 1);
        }
        return;
      }
      
      // Page is scrollable - check if at edges
      const atBottom = scrollTop >= scrollHeight - clientHeight - 10;
      const atTop = scrollTop <= 10;
      
      // At bottom edge and scrolling down - go to next page
      if (e.deltaY > 0 && atBottom && currentPage < pdfDoc.numPages) {
        e.preventDefault();
        console.log('[PDFViewer] At bottom edge - loading next page:', currentPage + 1);
        lastWheelTime.current = now;
        onCurrentPageChange(currentPage + 1);
        return;
      }
      
      // At top edge and scrolling up - go to previous page
      if (e.deltaY < 0 && atTop && currentPage > 1) {
        e.preventDefault();
        console.log('[PDFViewer] At top edge - loading previous page:', currentPage - 1);
        lastWheelTime.current = now;
        onCurrentPageChange(currentPage - 1);
        return;
      }
      
      // Not at edge - let native scroll handle it (don't prevent default)
      console.log('[PDFViewer] Scrolling within page - scrollTop:', scrollTop);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scrollMode, pdfDoc, currentPage, onCurrentPageChange, isRendering]);

  // Handle rendering - properly cancel previous render tasks
  useEffect(() => {
    if (scrollMode !== 'fit-height' && scrollMode !== 'scroll') return;
    if (!pdfDoc || currentPage < 1 || !canvasRef.current) return;
    
    // Cancel any existing render task
    if (renderTaskRef.current) {
      console.log('[PDFViewer] Cancelling previous render task');
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const renderPage = async () => {
      setIsRendering(true);
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        
        await renderTask.promise;
        renderTaskRef.current = null;
        
        // Report ORIGINAL page dimensions (unscaled) - only when scale is 1 or when first loading
        // This prevents infinite loops where changing scale changes dimensions which recalculates scale
        if (onPageDimensionsChange && (scale === 1 || currentPage === 1)) {
          const originalViewport = page.getViewport({ scale: 1 });
          console.log('[PDFViewer] Reporting ORIGINAL page dimensions:', originalViewport.width, 'x', originalViewport.height);
          onPageDimensionsChange(originalViewport.width, originalViewport.height);
        }
        
        console.log('[PDFViewer] Page', currentPage, 'rendered successfully at scale:', scale);
      } catch (error: any) {
        if (error?.name !== 'RenderingCancelledException') {
          console.error('[PDFViewer] Error rendering page:', error);
        }
      } finally {
        setIsRendering(false);
      }
    };
    
    renderPage();
    
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      setIsRendering(false);
    };
  }, [scrollMode, pdfDoc, currentPage, scale]);

  const handleFitWidth = () => {
    if (!canvasRef.current?.parentElement) return;
    
    const containerWidth = canvasRef.current.parentElement.clientWidth - 40;
    if (pdfDoc && currentPage >= 1) {
      pdfDoc.getPage(currentPage).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        const newScale = containerWidth / viewport.width;
        // Trigger re-render with fit-width scale - parent should handle this
        console.log('[PDFViewer] Fit width calculated scale:', newScale);
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
    <div 
      className="pdf-content" 
      ref={containerRef}
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'smooth'
      }}
    >
      {scrollMode === 'fit-height' ? (
        // Fit-height mode: single page centered, scrollbar on container edge
        <div 
          className="pdf-page-container" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '100%',
            padding: '20px'
          }}
        >
          <div className="pdf-page-wrapper" style={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            backgroundColor: 'white'
          }}>
            <canvas 
              ref={canvasRef} 
              className="pdf-page"
              style={{ cursor: 'crosshair', display: 'block' }}
            />
          </div>
        </div>
      ) : (
        // Scroll mode: all pages stacked vertically
        <div 
          ref={containerRef}
          className="pdf-scroll-container"
          style={{ 
            height: '100%', 
            overflow: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        />
      )}
      <div className="annotation-layer">
        {/* Annotations will be rendered here */}
      </div>
    </div>
  );
};

export default PDFViewer;
