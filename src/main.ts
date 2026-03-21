import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { PluginManager } from './core/PluginManager';
import { AnnotationManager } from './core/AnnotationManager';
import { AIServiceManager } from './core/AIServiceManager';

let mainWindow: BrowserWindow | null = null;
let pluginManager: PluginManager | null = null;
let annotationManager: AnnotationManager | null = null;
let aiServiceManager: AIServiceManager | null = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    frame: true,
    backgroundColor: '#f0f0f0'
  });

  // Load the index.html
  const indexPath = path.join(app.getAppPath(), 'src', 'renderer', 'index.html');
  mainWindow.loadFile(indexPath);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Initialize services
  initializeServices();
}

function initializeServices() {
  // Initialize Annotation Manager
  annotationManager = new AnnotationManager();
  
  // Initialize AI Service Manager
  aiServiceManager = new AIServiceManager();
  
  // Initialize Plugin Manager
  pluginManager = new PluginManager({
    annotations: annotationManager,
    aiService: aiServiceManager
  });

  // Auto-load plugins
  pluginManager.loadInstalledPlugins();
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for renderer process
ipcMain.handle('close-app', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('load-pdf', async (event, filePath: string) => {
  try {
    const data = fs.readFileSync(filePath);
    return { 
      success: true, 
      path: filePath,
      name: path.basename(filePath),
      size: data.length
    };
  } catch (error) {
    console.error('Error loading PDF:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file-as-array-buffer', async (event, filePath: string) => {
  try {
    const data = fs.readFileSync(filePath);
    return new Uint8Array(data).buffer;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    mainWindow?.webContents.send('load-pdf', filePath);
    return filePath;
  }
  
  return null;
});

ipcMain.handle('save-annotation', async (event, annotation: any) => {
  if (annotationManager) {
    return await annotationManager.createAnnotation(annotation);
  }
  throw new Error('Annotation manager not initialized');
});

ipcMain.handle('get-annotations', async (event, pageNumber: number) => {
  if (annotationManager) {
    return await annotationManager.getAnnotations(pageNumber);
  }
  return [];
});

ipcMain.handle('execute-ai-task', async (event, task: any) => {
  if (aiServiceManager) {
    return await aiServiceManager.executeTask(task);
  }
  throw new Error('AI Service manager not initialized');
});

// Plugin-related IPC handlers
ipcMain.handle('register-command', async (event, commandId: string, callback: any) => {
  if (pluginManager) {
    pluginManager.registerCommand(commandId, callback);
  }
});

ipcMain.handle('register-annotation-type', async (event, type: any) => {
  if (annotationManager) {
    annotationManager.registerAnnotationType(type);
  }
});
