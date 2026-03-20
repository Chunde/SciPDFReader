import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // PDF operations
  loadPDF: (filePath: string) => ipcRenderer.invoke('load-pdf', filePath),
  readFileAsArrayBuffer: (path: string) => ipcRenderer.invoke('read-file-as-array-buffer', path),
  
  // Annotation operations
  saveAnnotation: (annotation: any) => ipcRenderer.invoke('save-annotation', annotation),
  getAnnotations: (pageNumber: number) => ipcRenderer.invoke('get-annotations', pageNumber),
  
  // AI operations
  executeAITask: (task: any) => ipcRenderer.invoke('execute-ai-task', task),
  
  // File operations
  openFileDialog: () => ipcRenderer.invoke('show-open-dialog'),
  
  // Event listeners
  onLoadPDF: (callback: (event: any, filePath: string) => void) => {
    ipcRenderer.on('load-pdf', callback);
  },
  
  // Plugin operations
  registerCommand: (commandId: string, callback: any) => {
    ipcRenderer.invoke('register-command', commandId, callback);
  },
  
  registerAnnotationType: (type: any) => {
    ipcRenderer.invoke('register-annotation-type', type);
  }
});
