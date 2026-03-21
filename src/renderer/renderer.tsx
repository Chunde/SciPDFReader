import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Initialize React app
console.log('[Renderer] Starting renderer process...');
const container = document.getElementById('root');
if (container) {
  console.log('[Renderer] Found root element, rendering App...');
  const root = createRoot(container);
  root.render(<App />);
  console.log('[Renderer] App rendered successfully!');
} else {
  console.error('[Renderer] Root element not found!');
}
