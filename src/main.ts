import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
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
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Initialize managers
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
ipcMain.handle('load-pdf', async (event, filePath: string) => {
  // Handle PDF loading
  return { success: true, path: filePath };
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
