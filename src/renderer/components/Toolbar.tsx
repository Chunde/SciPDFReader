import * as React from 'react';

interface ToolbarProps {
  onOpenFile: () => void;
  onSave: () => void;
  onZoomChange: (zoom: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onOpenFile, onSave, onZoomChange, currentPage, totalPages, onPageChange }) => {
  console.log('[Toolbar] Rendering - currentPage:', currentPage, 'totalPages:', totalPages);
  
  const [zoom, setZoom] = React.useState(100);
  const [viewMenuOpen, setViewMenuOpen] = React.useState(false);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 25, 300);
    setZoom(newZoom);
    onZoomChange(newZoom / 100);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 25, 50);
    setZoom(newZoom);
    onZoomChange(newZoom / 100);
  };

  const handleFitWidth = () => {
    setZoom(100);
    onZoomChange(1);
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
        <select 
          className="zoom-select"
          value={zoom}
          onChange={(e) => {
            const newZoom = parseInt(e.target.value);
            setZoom(newZoom);
            onZoomChange(newZoom / 100);
          }}
        >
          <option value={50}>50%</option>
          <option value={75}>75%</option>
          <option value={100}>100%</option>
          <option value={125}>125%</option>
          <option value={150}>150%</option>
          <option value={200}>200%</option>
          <option value={300}>300%</option>
        </select>
        <button className="toolbar-button" onClick={handleZoomIn} title="Zoom In">
          <span>🔍</span> +
        </button>
        <button className="toolbar-button" onClick={handleFitWidth} title="Fit Width">
          <span>↔</span> Fit Width
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
            <div className="dropdown-item">Single-page view</div>
            <div className="dropdown-item">Two-page view</div>
            <div className="dropdown-item">Enable scrolling</div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item">Actual size</div>
            <div className="dropdown-item">Fit to width</div>
            <div className="dropdown-item">Fit to height</div>
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
