// Type definitions for SciPDFReader

export enum AnnotationType {
  HIGHLIGHT = 'highlight',
  UNDERLINE = 'underline',
  STRIKETHROUGH = 'strikethrough',
  NOTE = 'note',
  TRANSLATION = 'translation',
  BACKGROUND_INFO = 'background_info',
  CUSTOM = 'custom'
}

export interface AnnotationPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  textOffsets?: TextOffset[];
}

export interface TextOffset {
  start: number;
  end: number;
  top: number;
  left: number;
}

export interface AnnotationMetadata {
  source?: string;
  aiModel?: string;
  confidence?: number;
  tags?: string[];
  [key: string]: any;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  content: string;
  annotationText?: string;
  position: AnnotationPosition;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: AnnotationMetadata;
}

export interface AIServiceConfig {
  provider: 'openai' | 'azure' | 'local' | 'custom';
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
}

export enum AITaskType {
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
  BACKGROUND_INFO = 'background_info',
  KEYWORD_EXTRACTION = 'keyword_extraction',
  QUESTION_ANSWERING = 'question_answering'
}

export interface AITask {
  id: string;
  type: AITaskType;
  input: string;
  context?: string;
  options?: TaskOptions;
}

export interface TaskOptions {
  targetLanguage?: string;
  maxLength?: number;
  language?: string;
  [key: string]: any;
}

export interface AITaskResult {
  output: string;
  metadata?: any;
  confidence?: number;
}

export interface PluginManifest {
  name: string;
  displayName: string;
  version: string;
  description: string;
  publisher: string;
  engines: {
    scipdfreader: string;
  };
  main: string;
  contributes?: {
    annotations?: AnnotationTypeDefinition[];
    aiServices?: AIServiceDefinition[];
    commands?: CommandDefinition[];
    menus?: MenuDefinition[];
  };
  activationEvents?: string[];
}

export interface AnnotationTypeDefinition {
  type: string;
  label: string;
  color?: string;
  icon?: string;
}

export interface AIServiceDefinition {
  name: string;
  type: string;
  endpoint?: string;
}

export interface CommandDefinition {
  command: string;
  title: string;
  category?: string;
  icon?: string;
}

export interface MenuDefinition {
  id: string;
  items: MenuItemDefinition[];
}

export interface MenuItemDefinition {
  command: string;
  title: string;
  group?: string;
}

export interface PluginContext {
  subscriptions: Disposable[];
  annotations: AnnotationManagerAPI;
  pdfRenderer: PDFRendererAPI;
  aiService: AIServiceAPI;
  storage: PluginStorage;
}

export interface Disposable {
  dispose(): void;
}

export interface AnnotationManagerAPI {
  createAnnotation(annotation: Annotation): Promise<Annotation>;
  updateAnnotation(id: string, updates: Partial<Annotation>): Promise<void>;
  deleteAnnotation(id: string): Promise<void>;
  getAnnotations(pageNumber: number): Promise<Annotation[]>;
  searchAnnotations(query: string): Promise<Annotation[]>;
  exportAnnotations(format: string): Promise<string>;
}

export interface PDFRendererAPI {
  loadDocument(filePath: string): Promise<PDFDocument>;
  renderPage(pageNumber: number, options: RenderOptions): Promise<void>;
  getPageInfo(pageNumber: number): PageInfo;
  extractText(pageNumber: number): Promise<string>;
  getSelection(): SelectionInfo;
  setZoom(level: number): void;
}

export interface AIServiceAPI {
  initialize(config: AIServiceConfig): void;
  executeTask(task: AITask): Promise<AITaskResult>;
  batchExecute(tasks: AITask[]): Promise<AITaskResult[]>;
  cancelTask(taskId: string): void;
}

export interface PluginStorage {
  get(key: string): Promise<any>;
  put(key: string, value: any): Promise<void>;
  keys(): Promise<string[]>;
}

export interface PDFDocument {
  id: string;
  path: string;
  numPages: number;
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}

export interface RenderOptions {
  scale?: number;
  viewport?: Viewport;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export interface SelectionInfo {
  text: string;
  ranges: TextRange[];
  pageNumber?: number;
}

export interface TextRange {
  start: number;
  end: number;
}
