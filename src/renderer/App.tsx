import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import PDFViewer from './components/PDFViewer';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import Toolbar from './components/Toolbar';

declare const window: any;

const App: React.FC = () => {
  console.log('[App] Component rendered');
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [zoom, setZoom] = useState(100);
  const [scrollMode, setScrollMode] = useState<'fit-height' | 'scroll'>('fit-height');
  const [pageDimensions, setPageDimensions] = useState<{width: number, height: number}>({width: 0, height: 0});
  const [containerDimensions, setContainerDimensions] = useState<{width: number, height: number}>({width: 800, height: 600});
  const [zoomMode, setZoomMode] = useState<'manual' | 'fit-width' | 'fit-height' | 'auto'>('manual');
  const isProgrammaticUpdate = useRef(false);
  
  console.log('[App] Rendering - currentPage:', currentPage, 'totalPages:', totalPages, 'scrollMode:', scrollMode, 'zoomMode:', zoomMode);

  console.log('[App] State initialized');
  console.log('[App] window object available:', typeof window !== 'undefined');
  console.log('[App] window.api:', window?.api);

  useEffect(() => {
    // Listen for PDF load events from file menu
    const handleLoadPDF = (event: any, filePath: string) => {
      loadPDF(filePath);
    };

    window.api?.onLoadPDF(handleLoadPDF);

    // Close file menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.file-menu-container')) {
        setFileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Always recalculate scale when zoomMode is fit-width, fit-height, or auto
  useEffect(() => {
    if (pageDimensions.width <= 0 || pageDimensions.height <= 0 || 
        containerDimensions.width <= 0 || containerDimensions.height <= 0) {
      return;
    }

    const padding = 40;

    if (zoomMode === 'fit-width') {
      const newScale = (containerDimensions.width - padding) / pageDimensions.width;
      const newZoom = Math.round(newScale * 100);
      console.log('[App] useEffect fit-width recalc: container:', containerDimensions.width, 'page:', pageDimensions.width, 'scale:', newScale, 'zoom:', newZoom);
      isProgrammaticUpdate.current = true;
      setScale(newScale);
      setZoom(newZoom);
    } else if (zoomMode === 'fit-height') {
      const newScale = (containerDimensions.height - padding) / pageDimensions.height;
      const newZoom = Math.round(newScale * 100);
      console.log('[App] useEffect fit-height recalc: container:', containerDimensions.height, 'page:', pageDimensions.height, 'scale:', newScale, 'zoom:', newZoom);
      isProgrammaticUpdate.current = true;
      setScale(newScale);
      setZoom(newZoom);
    } else if (zoomMode === 'auto') {
      const fitWidthScale = (containerDimensions.width - padding) / pageDimensions.width;
      const fitHeightScale = (containerDimensions.height - padding) / pageDimensions.height;
      const autoScale = Math.min(fitWidthScale, fitHeightScale);
      const newZoom = Math.round(autoScale * 100);
      console.log('[App] useEffect auto recalc: fitWidth:', fitWidthScale, 'fitHeight:', fitHeightScale, 'scale:', autoScale, 'zoom:', newZoom);
      isProgrammaticUpdate.current = true;
      setScale(autoScale);
      setZoom(newZoom);
    }
    // zoomMode === 'manual' - don't recalculate
  }, [pageDimensions, containerDimensions, zoomMode]);

  // Reset programmatic flag after state updates
  useEffect(() => {
    if (isProgrammaticUpdate.current) {
      const timeout = setTimeout(() => {
        isProgrammaticUpdate.current = false;
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [zoom]);

  const loadPDF = async (filePath: string) => {
    console.log('[App] Loading PDF from:', filePath);
    try {
      const result = await window.api?.loadPDF(filePath);
      console.log('[App] Load result:', result);
      if (result && result.success) {
        setCurrentDocument(result);
        setCurrentPage(1);
        setPageDimensions({width: 0, height: 0});
        setZoom(100);
        setScale(1); // Start at 100% to get original page dimensions
        setZoomMode('auto'); // Will auto-fit after page dimensions are known
        console.log('[App] Document set successfully - auto-fit will be calculated');
      } else {
        console.error('[App] Failed to load PDF:', result?.error);
      }
    } catch (error) {
      console.error('[App] Failed to load PDF:', error);
    }
  };

  const handleAnnotationClick = async (annotationId: string) => {
    // Navigate to annotation position
    console.log('Navigate to annotation:', annotationId);
  };

  const handleCreateAnnotation = async (annotation: any) => {
    try {
      const newAnnotation = await window.api?.saveAnnotation(annotation);
      setAnnotations([...annotations, newAnnotation]);
    } catch (error) {
      console.error('Failed to create annotation:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleRightPanel = () => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  };

  const handleOpenFile = () => {
    console.log('[FileMenu] Open File clicked');
    console.log('[FileMenu] window object:', window);
    console.log('[FileMenu] window.api:', window.api);
    
    if (!window.api) {
      console.error('[FileMenu] window.api is undefined!');
      setFileMenuOpen(false);
      return;
    }
    
    if (!window.api.openFileDialog) {
      console.error('[FileMenu] window.api.openFileDialog is undefined!');
      console.log('[FileMenu] Available api methods:', Object.keys(window.api || {}));
      setFileMenuOpen(false);
      return;
    }
    
    console.log('[FileMenu] Calling openFileDialog...');
    const promise = window.api.openFileDialog();
    console.log('[FileMenu] Got promise:', promise);
    
    if (!promise || typeof promise.then !== 'function') {
      console.error('[FileMenu] openFileDialog did not return a valid promise!');
      setFileMenuOpen(false);
      return;
    }
    
    promise.then((result: any) => {
      console.log('[FileMenu] OpenFileDialog SUCCESS result:', result);
      if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        console.log('[FileMenu] Selected file:', filePath);
        loadPDF(filePath);
      } else {
        console.log('[FileMenu] Dialog was canceled or no file selected');
      }
      setFileMenuOpen(false);
    }).catch((error: any) => {
      console.error('[FileMenu] OpenFileDialog ERROR:', error);
      setFileMenuOpen(false);
    });
  };

  const handleSave = () => {
    console.log('[FileMenu] Save clicked');
    setFileMenuOpen(false);
  };

  const handleSaveAs = () => {
    console.log('[FileMenu] Save As clicked');
    setFileMenuOpen(false);
  };

  const handleClose = () => {
    console.log('[FileMenu] Close clicked');
    setCurrentDocument(null);
    setFileMenuOpen(false);
  };

  const handleExit = () => {
    console.log('[FileMenu] Exit clicked');
    window.api?.closeApp();
    setFileMenuOpen(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="app-title">SciPDFReader</div>
          <div className="file-menu-container">
            <button 
              className="hamburger-btn"
              onClick={() => {
                console.log('[FileMenu] Hamburger clicked, current state:', fileMenuOpen);
                setFileMenuOpen(!fileMenuOpen);
              }}
              title="File Menu"
            >
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
            </button>
            {fileMenuOpen && (
              <div className="file-dropdown-menu show" style={{ position: 'fixed', top: '60px', left: '10px' }}>
                <div className="dropdown-item" onClick={handleOpenFile}>
                  <span>📁</span> Open PDF File...
                </div>
                <div className="dropdown-item" onClick={handleSave}>
                  <span>💾</span> Save
                </div>
                <div className="dropdown-item" onClick={handleSaveAs}>
                  <span>💾</span> Save As...
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleClose}>
                  <span>❌</span> Close
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleExit}>
                  <span>🚪</span> Exit
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="header-actions">
          {/* Additional header actions can go here */}
        </div>
      </header>

      <div className="main-content">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
          document={currentDocument}
        />

        <div className="pdf-viewer-container">
          <Toolbar 
            onOpenFile={handleOpenFile}
            onSave={() => console.log('Save')}
            onZoomChange={(newZoom) => {
              console.log('[App] Zoom changed (user action):', newZoom);
              setZoom(newZoom);
              setScale(newZoom / 100);
              setZoomMode('manual'); // User action - switch to manual mode
            }}
            onZoomChangeExternal={(newZoom) => {
              console.log('[App] Zoom changed (external):', newZoom);
              setZoom(newZoom);
              setScale(newZoom / 100);
              // Does NOT change zoomMode - preserves current mode
            }}
            isProgrammaticUpdate={isProgrammaticUpdate}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            zoom={zoom}
            scrollMode={scrollMode}
            onScrollModeChange={setScrollMode}
            pageDimensions={pageDimensions}
            containerDimensions={containerDimensions}
            onFitToWidth={() => {
              console.log('[App] Fit to width clicked');
              setZoomMode('fit-width'); // useEffect will calculate the actual zoom
            }}
            onFitToHeight={() => {
              console.log('[App] Fit to height clicked');
              setZoomMode('fit-height'); // useEffect will calculate the actual zoom
            }}
          />
          
          <PDFViewer 
            document={currentDocument}
            onAnnotationCreate={handleCreateAnnotation}
            currentPage={currentPage}
            onCurrentPageChange={setCurrentPage}
            onTotalPagesChange={setTotalPages}
            scale={scale}
            scrollMode={scrollMode}
            onPageDimensionsChange={(width, height) => {
              console.log('[App] Page dimensions changed:', width, 'x', height);
              setPageDimensions({width, height});
              // Recalculation handled by useEffect
            }}
            onContainerDimensionsChange={(width, height) => {
              console.log('[App] Container dimensions changed:', width, 'x', height);
              setContainerDimensions({width, height});
              // Recalculation handled by useEffect
            }}
          />
        </div>

        <RightPanel 
          collapsed={rightPanelCollapsed}
          onToggle={toggleRightPanel}
          annotations={annotations}
          onAnnotationClick={handleAnnotationClick}
        />
      </div>
    </div>
  );
};

export default App;
