import { PluginManifest, PluginContext, Disposable } from '../types';
import { AnnotationManager } from './AnnotationManager';
import { AIServiceManager } from './AIServiceManager';
import * as fs from 'fs';
import * as path from 'path';

interface PluginInfo {
  id: string;
  manifest: PluginManifest;
  path: string;
  enabled: boolean;
  exports?: any;
  subscriptions: Disposable[];
}

export class PluginManager {
  private plugins: Map<string, PluginInfo> = new Map();
  private commands: Map<string, Function> = new Map();
  private pluginContext: PluginContext;
  private pluginsPath: string;

  constructor(dependencies: {
    annotations: AnnotationManager;
    aiService: AIServiceManager;
  }) {
    this.pluginsPath = this.getPluginsPath();
    
    // Create plugin context with APIs exposed to plugins
    this.pluginContext = {
      subscriptions: [],
      annotations: this.createAnnotationAPI(dependencies.annotations),
      pdfRenderer: this.createPDFRendererAPI(),
      aiService: this.createAIServiceAPI(dependencies.aiService),
      storage: this.createPluginStorage()
    };
  }

  private getPluginsPath(): string {
    const userDataPath = process.env.APPDATA || process.env.HOME || '.';
    return path.join(userDataPath, '.scipdfreader', 'plugins');
  }

  private ensurePluginsDirectory() {
    if (!fs.existsSync(this.pluginsPath)) {
      fs.mkdirSync(this.pluginsPath, { recursive: true });
    }
  }

  public async loadInstalledPlugins(): Promise<void> {
    this.ensurePluginsDirectory();
    
    if (fs.existsSync(this.pluginsPath)) {
      const pluginDirs = fs.readdirSync(this.pluginsPath);
      
      for (const dir of pluginDirs) {
        const pluginPath = path.join(this.pluginsPath, dir);
        const manifestPath = path.join(pluginPath, 'package.json');
        
        if (fs.existsSync(manifestPath)) {
          try {
            const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestContent);
            await this.loadPlugin(pluginPath, manifest);
          } catch (error) {
            console.error(`Failed to load plugin ${dir}:`, error);
          }
        }
      }
    }
  }

  public async loadPlugin(pluginPath: string, manifest: PluginManifest): Promise<void> {
    const pluginId = `${manifest.publisher}.${manifest.name}`;
    
    if (this.plugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} is already loaded`);
      return;
    }

    try {
      // Load the plugin module
      const mainPath = path.join(pluginPath, manifest.main);
      const pluginModule = require(mainPath);
      
      const pluginInfo: PluginInfo = {
        id: pluginId,
        manifest,
        path: pluginPath,
        enabled: true,
        exports: undefined,
        subscriptions: []
      };

      this.plugins.set(pluginId, pluginInfo);

      // Activate the plugin if activation events are met
      if (!manifest.activationEvents || manifest.activationEvents.includes('*') || 
          manifest.activationEvents.includes('onStartupFinished')) {
        await this.activatePlugin(pluginId, pluginModule);
      }

      console.log(`Plugin ${pluginId} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load plugin ${pluginId}:`, error);
      throw error;
    }
  }

  private async activatePlugin(pluginId: string, pluginModule: any): Promise<void> {
    const pluginInfo = this.plugins.get(pluginId);
    if (!pluginInfo) return;

    try {
      // Call the activate function
      const exports = await pluginModule.activate(this.pluginContext);
      pluginInfo.exports = exports;
      console.log(`Plugin ${pluginId} activated`);
    } catch (error) {
      console.error(`Failed to activate plugin ${pluginId}:`, error);
    }
  }

  public registerCommand(commandId: string, callback: Function): Disposable {
    if (this.commands.has(commandId)) {
      console.warn(`Command ${commandId} is already registered`);
    }

    this.commands.set(commandId, callback);

    return {
      dispose: () => {
        this.commands.delete(commandId);
      }
    };
  }

  public async executeCommand(commandId: string, ...args: any[]): Promise<any> {
    const command = this.commands.get(commandId);
    
    if (!command) {
      throw new Error(`Command ${commandId} not found`);
    }

    return await command(...args);
  }

  public enablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.enabled = true;
    // Re-activate the plugin
    const pluginPath = path.join(plugin.path, plugin.manifest.main);
    const pluginModule = require(pluginPath);
    this.activatePlugin(pluginId, pluginModule);
  }

  public disablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.enabled = false;
    
    // Call deactivate if exists
    if (plugin.exports && typeof plugin.exports.deactivate === 'function') {
      plugin.exports.deactivate();
    }

    // Dispose all subscriptions
    plugin.subscriptions.forEach((sub: any) => sub.dispose());
  }

  public async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Disable first
    this.disablePlugin(pluginId);

    // Remove from disk
    const pluginDir = path.dirname(plugin.path);
    if (fs.existsSync(pluginDir)) {
      fs.rmSync(pluginDir, { recursive: true, force: true });
    }

    this.plugins.delete(pluginId);
  }

  public getPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values());
  }

  public getEnabledPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled);
  }

  // Helper methods to create APIs for plugins
  
  private createAnnotationAPI(annotationManager: AnnotationManager) {
    return {
      createAnnotation: (annotation: any) => annotationManager.createAnnotation(annotation),
      updateAnnotation: (id: string, updates: any) => annotationManager.updateAnnotation(id, updates),
      deleteAnnotation: (id: string) => annotationManager.deleteAnnotation(id),
      getAnnotations: (pageNumber: number) => annotationManager.getAnnotations(pageNumber),
      searchAnnotations: (query: string) => annotationManager.searchAnnotations(query),
      exportAnnotations: (format: 'json' | 'markdown' | 'html') => annotationManager.exportAnnotations(format)
    };
  }

  private createAIServiceAPI(aiService: AIServiceManager) {
    return {
      initialize: (config: any) => aiService.initialize(config),
      executeTask: (task: any) => aiService.executeTask(task),
      batchExecute: (tasks: any[]) => aiService.batchExecute(tasks),
      cancelTask: (taskId: string) => aiService.cancelTask(taskId)
    };
  }

  private createPDFRendererAPI() {
    // This will be implemented when we have the PDF renderer
    return {
      loadDocument: async (filePath: string) => ({ id: 'temp', path: filePath, numPages: 0 }),
      renderPage: async (pageNumber: number, options: any) => {},
      getPageInfo: (pageNumber: number) => ({ pageNumber, width: 0, height: 0, rotation: 0 }),
      extractText: async (pageNumber: number) => '',
      getSelection: () => ({ text: '', ranges: [] }),
      setZoom: (level: number) => {}
    };
  }

  private createPluginStorage() {
    return {
      get: async (key: string) => {
        // Implement storage retrieval
        return null;
      },
      put: async (key: string, value: any) => {
        // Implement storage saving
      },
      keys: async () => []
    };
  }
}
