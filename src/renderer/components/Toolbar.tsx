import * as React from 'react';
import { ViewMode } from './PDFViewer';

interface ToolbarProps {
  onOpenFile: () => void;
  onSave: () => void;
  onZoomChange: (zoom: number) => void;
  onZoomChangeExternal?: (zoom: number) => void; // For programmatic updates
  isProgrammaticUpdate?: React.MutableRefObject<boolean>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  zoom: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  pageDimensions: { width: number; height: number };
  containerDimensions: { width: number; height: number };
  onFitToWidth: () => void;
  onFitToHeight: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onOpenFile, 
  onSave, 
  onZoomChange, 
  onZoomChangeExternal,
  isProgrammaticUpdate,
  currentPage, 
  totalPages, 
  onPageChange, 
  zoom, 
  viewMode, 
  onViewModeChange,
  pageDimensions,
  containerDimensions,
  onFitToWidth,
  onFitToHeight
}) => {
  console.log('[Toolbar] Rendering - currentPage:', currentPage, 'totalPages:', totalPages, 'zoom:', zoom, 'viewMode:', viewMode);
  
  const [viewMenuOpen, setViewMenuOpen] = React.useState(false);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 25, 500);
    onZoomChange(newZoom); // User action - switch to manual mode
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 25, 1);
    onZoomChange(newZoom); // User action - switch to manual mode
  };

  const handleFitWidth = () => {
    onZoomChange(100);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={onOpenFile} title="Open File">
          <span>📁</span> Open
        </button>
        <button className="toolbar-button" onClick={onSave} title="Save">
          <span>💾</span> Save
        </button>
      </div>

      <div className="toolbar-group">
        <button 
          className="toolbar-button" 
          onClick={() => {
            console.log('[Toolbar] Prev button clicked');
            onPageChange(Math.max(1, currentPage - 1));
          }}
          title="Previous Page"
        >
          <span>◀</span>
        </button>
        <div className="page-info">
          <input 
            type="number" 
            className="page-input" 
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              console.log('[Toolbar] Page input changed to:', page);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            min={1}
            max={totalPages}
          />
          <span>/ {totalPages > 0 ? totalPages : '--'}</span>
        </div>
        <button 
          className="toolbar-button" 
          onClick={() => {
            console.log('[Toolbar] Next button clicked');
            onPageChange(Math.min(totalPages, currentPage + 1));
          }}
          title="Next Page"
        >
          <span>▶</span>
        </button>
      </div>
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={handleZoomOut} title="Zoom Out">
          <span>🔍</span> -
        </button>
        <input 
          type="number" 
          className="zoom-input"
          value={zoom}
          onChange={(e) => {
            // Allow typing any value - use external callback if available
            const newZoom = parseInt(e.target.value);
            if (!isNaN(newZoom) && newZoom > 0) {
              // Skip if this is a programmatic update
              if (isProgrammaticUpdate?.current) {
                return;
              }
              if (onZoomChangeExternal) {
                onZoomChangeExternal(newZoom);
              } else {
                onZoomChange(newZoom);
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              const newZoom = parseInt(input.value) || 100;
              // Constrain to valid range when user presses Enter
              const constrainedZoom = Math.min(500, Math.max(1, newZoom));
              // On Enter, this is a user commit - switch to manual mode
              onZoomChange(constrainedZoom);
              input.blur();
            }
          }}
          onBlur={(e) => {
            const input = e.target as HTMLInputElement;
            const newZoom = parseInt(input.value) || 100;
            // Constrain to valid range if user clicks away without pressing Enter
            const constrainedZoom = Math.min(500, Math.max(1, newZoom));
            if (constrainedZoom !== zoom) {
              // Skip if this is a programmatic update
              if (isProgrammaticUpdate?.current) {
                return;
              }
              // On blur without Enter, use external callback to avoid mode change
              if (onZoomChangeExternal) {
                onZoomChangeExternal(constrainedZoom);
              } else {
                onZoomChange(constrainedZoom);
              }
            }
          }}
          title="Zoom percentage"
        />
        <span className="zoom-label">%</span>
        <button className="toolbar-button" onClick={handleZoomIn} title="Zoom In">
          <span>🔍</span> +
        </button>
      </div>

      <div className="toolbar-group dropdown">
        <button 
          className="toolbar-button" 
          onClick={() => setViewMenuOpen(!viewMenuOpen)}
          title="View Options"
        >
          <span>👁</span> View
          <span style={{ fontSize: '10px' }}>▼</span>
        </button>
        
        {viewMenuOpen && (
          <div className="dropdown-menu show">
            <div 
              className="dropdown-item" 
              onClick={() => {
                console.log('[Toolbar] Single-page view selected');
                onViewModeChange('single');
                // Don't reset zoom - preserve current zoom when switching view modes
                setViewMenuOpen(false);
              }}
            >
              Single-page view
            </div>
            <div className="dropdown-item" onClick={() => {
              console.log('[Toolbar] Two-page view selected');
              onViewModeChange('two-page');
              // Don't reset zoom - preserve current zoom when switching view modes
              setViewMenuOpen(false);
            }}>
              Two-page view
            </div>
            <div className="dropdown-item" onClick={() => {
              console.log('[Toolbar] Enable scrolling selected');
              // onViewModeChange('scroll');
              // setViewMenuOpen(false);
            }}>
              Enable scrolling
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item" onClick={() => {
              console.log('[Toolbar] Actual size selected');
              onZoomChange(100);
              setViewMenuOpen(false);
            }}>
              Actual size
            </div>
            <div className="dropdown-item" onClick={() => {
              console.log('[Toolbar] Fit to width selected');
              onFitToWidth();
              setViewMenuOpen(false);
            }}>
              Fit to width
            </div>
            <div className="dropdown-item" onClick={() => {
              console.log('[Toolbar] Fit to height selected');
              onFitToHeight();
              setViewMenuOpen(false);
            }}>
              Fit to height
            </div>
          </div>
        )}
      </div>

      <div className="toolbar-group">
        <button className="toolbar-button" title="Highlight">
          <span style={{ color: '#FFFF00', fontWeight: 'bold' }}>A</span> Highlight
        </button>
        <button className="toolbar-button" title="Underline">
          <span style={{ textDecoration: 'underline' }}>U</span> Underline
        </button>
        <button className="toolbar-button" title="Note">
          <span>📝</span> Note
        </button>
        <button className="toolbar-button" title="Translate">
          <span>🌐</span> Translate
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
