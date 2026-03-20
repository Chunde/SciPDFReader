import * as React from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  document: any;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, document }) => {
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
            <div style={{ marginBottom: '8px' }}>
              <strong>Author:</strong> {document.author || 'Unknown'}
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '13px' }}>Bookmarks</h4>
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                <li style={{ padding: '6px 0', fontSize: '13px', cursor: 'pointer' }}>
                  No bookmarks
                </li>
              </ul>
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '13px' }}>Annotations</h4>
              <div style={{ color: '#666', fontSize: '13px' }}>
                No annotations yet
              </div>
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
