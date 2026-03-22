import * as React from 'react';

interface ToolbarProps {
  onOpenFile: () => void;
  onSave: () => void;
  onZoomChange: (zoom: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  zoom: number;
  scrollMode: 'fit-height' | 'scroll';
  onScrollModeChange: (mode: 'fit-height' | 'scroll') => void;
  pageDimensions: { width: number; height: number };
  containerDimensions: { width: number; height: number };
  onFitToWidth: () => void;
  onFitToHeight: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onOpenFile, 
  onSave, 
  onZoomChange, 
  currentPage, 
  totalPages, 
  onPageChange, 
  zoom, 
  scrollMode, 
  onScrollModeChange,
  pageDimensions,
  containerDimensions,
  onFitToWidth,
  onFitToHeight
}) => {
  console.log('[Toolbar] Rendering - currentPage:', currentPage, 'totalPages:', totalPages, 'zoom:', zoom, 'scrollMode:', scrollMode);
  
  const [viewMenuOpen, setViewMenuOpen] = React.useState(false);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 25, 300);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 25, 50);
    onZoomChange(newZoom);
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
          min={10}
          max={500}
          step={10}
          onChange={(e) => {
            const newZoom = parseInt(e.target.value) || 100;
            if (newZoom >= 10 && newZoom <= 500) {
              onZoomChange(newZoom);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              const newZoom = parseInt(input.value) || 100;
              if (newZoom >= 10 && newZoom <= 500) {
                onZoomChange(newZoom);
              }
              input.blur();
            }
          }}
          title="Zoom percentage (10-500%)"
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
                onScrollModeChange('fit-height');
                onZoomChange(100);
                setViewMenuOpen(false);
              }}
            >
              Single-page view
            </div>
            <div className="dropdown-item" onClick={() => {
              console.log('[Toolbar] Two-page view selected - not implemented');
              setViewMenuOpen(false);
            }}>
              Two-page view
            </div>
            <div className="dropdown-item" onClick={() => {
              console.log('[Toolbar] Enable scrolling selected');
              onScrollModeChange('scroll');
              setViewMenuOpen(false);
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
