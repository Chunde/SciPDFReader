import * as React from 'react';
import { useEffect, useState } from 'react';

interface OutlineItem {
  title: string;
  dest: any;
  items?: OutlineItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  document: any;
  onPageChange?: (page: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, document, onPageChange }) => {
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  useEffect(() => {
    const loadOutline = async () => {
      if (!document?.pdfDoc) {
        setOutline([]);
        return;
      }

      try {
        const outlineData = await document.pdfDoc.getOutline();
        console.log('[Sidebar] Loaded outline:', outlineData);
        setOutline(outlineData || []);
      } catch (error) {
        console.error('[Sidebar] Failed to load outline:', error);
        setOutline([]);
      }
    };

    loadOutline();
  }, [document]);

  const handleOutlineClick = async (item: OutlineItem) => {
    if (!document?.pdfDoc || !onPageChange) return;

    try {
      let dest = item.dest;
      
      // If dest is a string, resolve it first
      if (typeof dest === 'string') {
        dest = await document.pdfDoc.getDestination(dest);
      }
      
      if (dest && dest[0]) {
        const pageRef = dest[0];
        const pageNumber = await document.pdfDoc.getPageIndex(pageRef);
        console.log('[Sidebar] Navigating to page:', pageNumber + 1);
        onPageChange(pageNumber + 1);
      }
    } catch (error) {
      console.error('[Sidebar] Failed to navigate:', error);
    }
  };

  const renderOutlineItems = (items: OutlineItem[], level: number = 0) => {
    return items.map((item, index) => (
      <li key={index} style={{ 
        padding: '4px 0',
        paddingLeft: `${level * 12}px`,
        fontSize: '13px'
      }}>
        <div 
          onClick={() => handleOutlineClick(item)}
          style={{ 
            cursor: item.dest ? 'pointer' : 'default',
            color: item.dest ? '#0066cc' : '#666',
            wordBreak: 'break-word'
          }}
        >
          {item.title || 'Untitled'}
        </div>
        {item.items && item.items.length > 0 && (
          <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '4px' }}>
            {renderOutlineItems(item.items, level + 1)}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Document Outline</span>
          <button 
            onClick={onToggle}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>
      
      <div className="sidebar-content">
        {document ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Title:</strong> {document.title || 'Untitled'}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Pages:</strong> {document.numPages || 0}
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '13px' }}>Outline</h4>
              {outline.length > 0 ? (
                <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                  {renderOutlineItems(outline)}
                </ul>
              ) : (
                <div style={{ color: '#666', fontSize: '13px' }}>
                  No outline available
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
            <p style={{ fontSize: '13px' }}>No document opened</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Open a PDF file to see outline</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
