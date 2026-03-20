import { AIServiceConfig, AITask, AITaskResult, AITaskType } from '../types';

export class AIServiceManager {
  private config: AIServiceConfig | null = null;
  private taskQueue: Map<string, AITask> = new Map();
  private taskResults: Map<string, AITaskResult> = new Map();

  public initialize(config: AIServiceConfig): void {
    this.config = config;
    console.log(`AI Service initialized with provider: ${config.provider}`);
  }

  public async executeTask(task: AITask): Promise<AITaskResult> {
    if (!this.config) {
      throw new Error('AI Service not initialized. Call initialize() first.');
    }

    this.taskQueue.set(task.id, task);

    try {
      let result: AITaskResult;

      switch (task.type) {
        case AITaskType.TRANSLATION:
          result = await this.executeTranslation(task);
          break;
        
        case AITaskType.SUMMARIZATION:
          result = await this.executeSummarization(task);
          break;
        
        case AITaskType.BACKGROUND_INFO:
          result = await this.executeBackgroundInfo(task);
          break;
        
        case AITaskType.KEYWORD_EXTRACTION:
          result = await this.executeKeywordExtraction(task);
          break;
        
        case AITaskType.QUESTION_ANSWERING:
          result = await this.executeQuestionAnswering(task);
          break;
        
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      this.taskResults.set(task.id, result);
      this.taskQueue.delete(task.id);
      
      return result;
    } catch (error) {
      this.taskQueue.delete(task.id);
      throw error;
    }
  }

  public async batchExecute(tasks: AITask[]): Promise<AITaskResult[]> {
    const results: AITaskResult[] = [];
    
    for (const task of tasks) {
      try {
        const result = await this.executeTask(task);
        results.push(result);
      } catch (error) {
        console.error(`Task ${task.id} failed:`, error);
        results.push({
          output: '',
          metadata: { error: error.message }
        });
      }
    }
    
    return results;
  }

  public cancelTask(taskId: string): void {
    if (this.taskQueue.has(taskId)) {
      this.taskQueue.delete(taskId);
      console.log(`Task ${taskId} cancelled`);
    }
  }

  public getTaskStatus(taskId: string): 'pending' | 'completed' | 'failed' {
    if (this.taskQueue.has(taskId)) {
      return 'pending';
    }
    if (this.taskResults.has(taskId)) {
      return 'completed';
    }
    return 'failed';
  }

  // Task execution implementations
  
  private async executeTranslation(task: AITask): Promise<AITaskResult> {
    const targetLanguage = task.options?.targetLanguage || 'en';
    
    // If using OpenAI or Azure
    if (this.config?.provider === 'openai' || this.config?.provider === 'azure') {
      return await this.executeWithOpenAI(task, targetLanguage);
    }
    
    // Local model or custom implementation
    return {
      output: `[Translation to ${targetLanguage}] ${task.input}`,
      metadata: { model: 'mock-translation', language: targetLanguage }
    };
  }

  private async executeSummarization(task: AITask): Promise<AITaskResult> {
    const maxLength = task.options?.maxLength || 200;
    
    if (this.config?.provider === 'openai' || this.config?.provider === 'azure') {
      return await this.executeWithOpenAI(task, undefined, maxLength);
    }
    
    // Simple extractive summarization (mock)
    const sentences = task.input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.';
    
    return {
      output: summary,
      metadata: { method: 'extractive', sentences: sentences.length }
    };
  }

  private async executeBackgroundInfo(task: AITask): Promise<AITaskResult> {
    if (this.config?.provider === 'openai' || this.config?.provider === 'azure') {
      return await this.executeWithOpenAI(task);
    }
    
    return {
      output: `[Background information about: ${task.input}]`,
      metadata: { entity: task.input }
    };
  }

  private async executeKeywordExtraction(task: AITask): Promise<AITaskResult> {
    // Simple keyword extraction based on frequency
    const words = task.input.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    const sortedKeywords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
    
    return {
      output: JSON.stringify(sortedKeywords),
      metadata: { totalWords: words.length, uniqueWords: wordFreq.size }
    };
  }

  private async executeQuestionAnswering(task: AITask): Promise<AITaskResult> {
    if (this.config?.provider === 'openai' || this.config?.provider === 'azure') {
      return await this.executeWithOpenAI(task);
    }
    
    return {
      output: '[Answer would be generated by AI model]',
      metadata: { question: task.input, context: task.context }
    };
  }

  // OpenAI API integration
  private async executeWithOpenAI(
    task: AITask, 
    targetLanguage?: string,
    maxLength?: number
  ): Promise<AITaskResult> {
    // This would make actual API calls to OpenAI
    // For now, return mock response
    
    const prompt = this.buildPrompt(task, targetLanguage, maxLength);
    
    // Mock implementation - replace with actual OpenAI API call
    return {
      output: `[OpenAI response for: ${prompt}]`,
      metadata: { 
        model: this.config?.model || 'gpt-3.5-turbo',
        provider: 'openai',
        prompt
      }
    };
  }

  private buildPrompt(task: AITask, targetLanguage?: string, maxLength?: number): string {
    switch (task.type) {
      case AITaskType.TRANSLATION:
        return `Translate the following text to ${targetLanguage}: "${task.input}"`;
      
      case AITaskType.SUMMARIZATION:
        return `Summarize the following text in ${maxLength} words or less: "${task.input}"`;
      
      case AITaskType.BACKGROUND_INFO:
        return `Provide background information about: "${task.input}". Context: ${task.context || 'N/A'}`;
      
      case AITaskType.QUESTION_ANSWERING:
        return `Answer the question: "${task.input}". Context: ${task.context || 'N/A'}`;
      
      default:
        return task.input;
    }
  }
}
