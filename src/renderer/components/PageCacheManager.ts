import * as pdfjsLib from 'pdfjs-dist';

interface CachedPage {
  pageNum: number;
  viewport: { width: number; height: number };
  scale: number;
}

interface PageCacheEntry {
  page: pdfjsLib.PDFPageProxy;
  viewport: { width: number; height: number };
  lastAccessed: number;
}

export class PageCacheManager {
  private cache: Map<number, PageCacheEntry> = new Map();
  private pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
  private maxCacheSize: number;
  
  constructor(maxCacheSize: number = 10) {
    this.maxCacheSize = maxCacheSize;
  }
  
  setDocument(pdfDoc: pdfjsLib.PDFDocumentProxy) {
    this.pdfDoc = pdfDoc;
    this.clearCache();
  }
  
  clearCache() {
    this.cache.clear();
  }
  
  async getPage(pageNum: number, scale: number = 1): Promise<{ page: pdfjsLib.PDFPageProxy; viewport: { width: number; height: number } } | null> {
    if (!this.pdfDoc) return null;
    
    const cacheKey = pageNum;
    const entry = this.cache.get(cacheKey);
    
    if (entry) {
      entry.lastAccessed = Date.now();
      return { page: entry.page, viewport: entry.viewport };
    }
    
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 }); // Always get original dimensions
      
      const pageEntry: PageCacheEntry = {
        page,
        viewport: { width: viewport.width, height: viewport.height },
        lastAccessed: Date.now()
      };
      
      this.cache.set(cacheKey, pageEntry);
      this.cleanup();
      
      return { page, viewport: pageEntry.viewport };
    } catch (error) {
      console.error(`[PageCache] Failed to load page ${pageNum}:`, error);
      return null;
    }
  }
  
  getPageDimensions(pageNum: number): { width: number; height: number } | null {
    const entry = this.cache.get(pageNum);
    if (entry) {
      return entry.viewport;
    }
    return null;
  }
  
  getOriginalPageWidth(pageNum: number): number {
    return this.getPageDimensions(pageNum)?.width || 595; // Default PDF width
  }
  
  getOriginalPageHeight(pageNum: number): number {
    return this.getPageDimensions(pageNum)?.height || 842; // Default PDF height
  }
  
  private cleanup() {
    if (this.cache.size <= this.maxCacheSize) return;
    
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }
  
  getCacheSize(): number {
    return this.cache.size;
  }
}

export default PageCacheManager;
