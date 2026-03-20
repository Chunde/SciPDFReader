import { Annotation, AnnotationType } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class AnnotationManager {
  private annotations: Map<string, Annotation> = new Map();
  private annotationTypes: Map<string, any> = new Map();
  private dataPath: string;

  constructor() {
    // Initialize default annotation types
    this.registerDefaultAnnotationTypes();
    
    // Set up data storage path
    const userDataPath = process.env.APPDATA || process.env.HOME || '.';
    this.dataPath = path.join(userDataPath, '.scipdfreader', 'annotations');
    this.ensureDataDirectory();
  }

  private registerDefaultAnnotationTypes() {
    const defaultTypes = [
      { type: AnnotationType.HIGHLIGHT, label: 'Highlight', color: '#FFFF00', icon: '🖍️' },
      { type: AnnotationType.UNDERLINE, label: 'Underline', color: '#00FF00', icon: '📏' },
      { type: AnnotationType.STRIKETHROUGH, label: 'Strikethrough', color: '#FF0000', icon: '❌' },
      { type: AnnotationType.NOTE, label: 'Note', color: '#FFA500', icon: '📝' },
      { type: AnnotationType.TRANSLATION, label: 'Translation', color: '#87CEEB', icon: '🌐' },
      { type: AnnotationType.BACKGROUND_INFO, label: 'Background Info', color: '#DDA0DD', icon: 'ℹ️' }
    ];

    defaultTypes.forEach(type => {
      this.annotationTypes.set(type.type, type);
    });
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  public registerAnnotationType(typeInfo: any) {
    this.annotationTypes.set(typeInfo.type, typeInfo);
  }

  public async createAnnotation(annotation: Annotation): Promise<Annotation> {
    const id = uuidv4();
    const newAnnotation: Annotation = {
      ...annotation,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.annotations.set(id, newAnnotation);
    await this.saveAnnotations();
    
    return newAnnotation;
  }

  public async updateAnnotation(id: string, updates: Partial<Annotation>): Promise<void> {
    const annotation = this.annotations.get(id);
    if (!annotation) {
      throw new Error(`Annotation ${id} not found`);
    }

    const updated = { ...annotation, ...updates, updatedAt: new Date() };
    this.annotations.set(id, updated);
    await this.saveAnnotations();
  }

  public async deleteAnnotation(id: string): Promise<void> {
    this.annotations.delete(id);
    await this.saveAnnotations();
  }

  public async getAnnotations(pageNumber: number): Promise<Annotation[]> {
    const allAnnotations = Array.from(this.annotations.values());
    return allAnnotations.filter(ann => ann.pageNumber === pageNumber);
  }

  public async getAllAnnotations(): Promise<Annotation[]> {
    return Array.from(this.annotations.values());
  }

  public async searchAnnotations(query: string): Promise<Annotation[]> {
    const allAnnotations = Array.from(this.annotations.values());
    const lowerQuery = query.toLowerCase();
    
    return allAnnotations.filter(ann => 
      ann.content.toLowerCase().includes(lowerQuery) ||
      (ann.annotationText && ann.annotationText.toLowerCase().includes(lowerQuery))
    );
  }

  public async exportAnnotations(format: 'json' | 'markdown' | 'html'): Promise<string> {
    const annotations = Array.from(this.annotations.values());
    
    switch (format) {
      case 'json':
        return JSON.stringify(annotations, null, 2);
      
      case 'markdown':
        return this.exportToMarkdown(annotations);
      
      case 'html':
        return this.exportToHTML(annotations);
      
      default:
        return JSON.stringify(annotations, null, 2);
    }
  }

  private exportToMarkdown(annotations: Annotation[]): string {
    let markdown = '# SciPDFReader Annotations\n\n';
    
    annotations.forEach((ann, index) => {
      markdown += `## ${index + 1}. ${ann.type.toUpperCase()}\n`;
      markdown += `**Page**: ${ann.pageNumber}\n`;
      markdown += `**Content**: ${ann.content}\n`;
      
      if (ann.annotationText) {
        markdown += `**Annotation**: ${ann.annotationText}\n`;
      }
      
      markdown += `**Created**: ${ann.createdAt.toISOString()}\n\n`;
    });
    
    return markdown;
  }

  private exportToHTML(annotations: Annotation[]): string {
    let html = `<!DOCTYPE html>
<html>
<head><title>SciPDFReader Annotations</title></head>
<body>
<h1>Annotations</h1>
`;
    
    annotations.forEach(ann => {
      html += `
<div style="border-left: 3px solid ${ann.color || '#ccc'}; padding-left: 10px; margin: 10px 0;">
  <strong>${ann.type}</strong> - Page ${ann.pageNumber}<br/>
  <em>${ann.content}</em><br/>
  ${ann.annotationText ? `<p>${ann.annotationText}</p>` : ''}
</div>`;
    });
    
    html += '</body></html>';
    return html;
  }

  private async saveAnnotations(): Promise<void> {
    const filePath = path.join(this.dataPath, 'annotations.json');
    const data = Array.from(this.annotations.values());
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  public async loadAnnotations(): Promise<void> {
    const filePath = path.join(this.dataPath, 'annotations.json');
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const annotations = JSON.parse(data);
      
      annotations.forEach((ann: Annotation) => {
        this.annotations.set(ann.id, ann);
      });
    }
  }
}
