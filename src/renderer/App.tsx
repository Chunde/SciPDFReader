import * as React from 'react';
import { useEffect, useState } from 'react';
import PDFViewer from './components/PDFViewer';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import Toolbar from './components/Toolbar';

declare const window: any;

const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);

  useEffect(() => {
    // Listen for PDF load events from file menu
    const handleLoadPDF = (event: any, filePath: string) => {
      loadPDF(filePath);
    };

    window.api?.onLoadPDF(handleLoadPDF);

    return () => {
      // Cleanup
    };
  }, []);

  const loadPDF = async (filePath: string) => {
    try {
      const result = await window.api?.loadPDF(filePath);
      if (result) {
        setCurrentDocument(result);
      }
    } catch (error) {
      console.error('Failed to load PDF:', error);
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

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-title">SciPDFReader</div>
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
            onOpenFile={() => window.api?.openFileDialog()}
            onSave={() => console.log('Save')}
            onZoomChange={(zoom) => console.log('Zoom:', zoom)}
          />
          
          <PDFViewer 
            document={currentDocument}
            onAnnotationCreate={handleCreateAnnotation}
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
