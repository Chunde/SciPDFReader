import * as React from 'react';

interface RightPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  annotations: any[];
  onAnnotationClick: (annotationId: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  collapsed, 
  onToggle, 
  annotations, 
  onAnnotationClick 
}) => {
  const [activeTab, setActiveTab] = React.useState<'annotations' | 'search'>('annotations');
  const [searchQuery, setSearchQuery] = React.useState('');

  const getAnnotationTypeLabel = (type: string) => {
    const labels: any = {
      highlight: 'Highlight',
      underline: 'Underline',
      strikethrough: 'Strikethrough',
      note: 'Note',
      translation: 'Translation',
      background_info: 'Background Info'
    };
    return labels[type] || type;
  };

  const getAnnotationColor = (type: string) => {
    const colors: any = {
      highlight: '#FFFF00',
      underline: '#00FF00',
      strikethrough: '#FF0000',
      note: '#FFA500',
      translation: '#87CEEB',
      background_info: '#DDA0DD'
    };
    return colors[type] || '#ccc';
  };

  return (
    <div className={`right-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="panel-header">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('annotations')}
            style={{
              padding: '4px 8px',
              border: 'none',
              background: activeTab === 'annotations' ? '#0078d4' : '#f0f0f0',
              color: activeTab === 'annotations' ? 'white' : '#333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Annotations
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '4px 8px',
              border: 'none',
              background: activeTab === 'search' ? '#0078d4' : '#f0f0f0',
              color: activeTab === 'search' ? 'white' : '#333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Search
          </button>
        </div>
        <button 
          onClick={onToggle}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {collapsed ? '◀' : '▶'}
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'annotations' && (
          <div>
            {annotations.length > 0 ? (
              <ul className="annotation-list">
                {annotations.map((annotation, index) => (
                  <li 
                    key={annotation.id}
                    className="annotation-item"
                    onClick={() => onAnnotationClick(annotation.id)}
                  >
                    <span 
                      className="annotation-type"
                      style={{ 
                        backgroundColor: getAnnotationColor(annotation.type),
                        color: '#333'
                      }}
                    >
                      {getAnnotationTypeLabel(annotation.type)}
                    </span>
                    <div className="annotation-content">
                      {annotation.content?.substring(0, 100)}...
                    </div>
                    {annotation.annotationText && (
                      <div className="annotation-note">
                        {annotation.annotationText}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                      Page {annotation.pageNumber}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
                <p style={{ fontSize: '13px' }}>No annotations yet</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Select text and use the toolbar to add annotations
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <input
              type="text"
              placeholder="Search in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                marginBottom: '12px'
              }}
            />
            
            {searchQuery.length > 0 ? (
              <div style={{ color: '#666', fontSize: '13px' }}>
                Search results will appear here
              </div>
            ) : (
              <div style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
                <p style={{ fontSize: '13px' }}>Search in PDF</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Enter text to search through the document
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
