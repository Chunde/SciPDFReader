# SciPDFReader 架构设计文档

## 1. 项目概述

### 1.1 项目愿景
构建一个类似 Adobe Acrobat Reader 的跨平台 PDF 阅读器，集成 AI 辅助功能，支持高亮标注、翻译和背景信息自动标注。采用类似 VS Code 的插件架构，提供可扩展的开发平台。

### 1.2 核心特性
- **PDF 阅读与渲染**: 高质量的 PDF 文件渲染引擎
- **标注系统**: 支持高亮、下划线、删除线等标注功能
- **AI 智能标注**: 
  - 自动翻译标注
  - 相关背景信息标注
  - 关键概念提取与标注
  - 智能摘要生成
- **插件系统**: 类似 VS Code 的可扩展架构
- **跨平台支持**: Windows、macOS、Linux

## 2. 技术架构

### 2.1 技术栈选型

#### 基础框架
```
Electron + TypeScript + React
```

**理由**:
- Electron 提供跨平台桌面应用能力
- TypeScript 提供类型安全和开发体验
- React 提供现代化的 UI 组件化开发
- 与 VS Code 相同的技术栈，便于借鉴和复用

#### PDF 渲染引擎
```
PDF.js (Mozilla)
```

**理由**:
- 成熟的 Web 端 PDF 渲染库
- 良好的性能和兼容性
- 支持自定义渲染和交互

#### AI 服务集成
```
- OpenAI API / Azure OpenAI Service
- 本地 AI 模型 (ONNX Runtime)
- 自定义 AI 服务接口
```

### 2.2 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    SciPDFReader                          │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              插件层 (Plugin Layer)                   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │ │
│  │  │ AI 翻译   │ │ 背景信息  │ │ 自定义    │            │ │
│  │  │ 插件     │ │ 插件     │ │ 插件     │            │ │
│  │  └──────────┘ └──────────┘ └──────────┘            │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              应用核心层 (Core Layer)                 │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │ │
│  │  │ 标注管理  │ │ AI 服务   │ │ 插件管理  │            │ │
│  │  │ 器      │ │ 管理器   │ │ 器      │            │ │
│  │  └──────────┘ └──────────┘ └──────────┘            │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │ │
│  │  │ 文档管理  │ │ 用户界面  │ │ 配置管理  │            │ │
│  │  │ 器      │ │ 管理器   │ │ 器      │            │ │
│  │  └──────────┘ └──────────┘ └──────────┘            │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              基础设施层 (Infrastructure)             │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │ │
│  │  │ PDF.js   │ │ Electron │ │ SQLite   │            │ │
│  │  │ 渲染引擎  │ │ 运行时   │ │ 数据库   │            │ │
│  │  └──────────┘ └──────────┘ └──────────┘            │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 3. 核心模块设计

### 3.1 PDF 渲染模块 (PDFRenderer)

```typescript
interface IPDFRenderer {
  // 加载 PDF 文档
  loadDocument(filePath: string): Promise<PDFDocument>;
  
  // 渲染指定页面
  renderPage(pageNumber: number, options: RenderOptions): Promise<void>;
  
  // 获取页面信息
  getPageInfo(pageNumber: number): PageInfo;
  
  // 文本选择与提取
  selectText(range: TextRange): void;
  extractText(pageNumber: number): string;
  
  // 视图控制
  setZoom(level: number): void;
  scrollTo(position: Position): void;
}
```

### 3.2 标注系统 (Annotation System)

```typescript
// 标注类型
enum AnnotationType {
  HIGHLIGHT = 'highlight',
  UNDERLINE = 'underline',
  STRIKETHROUGH = 'strikethrough',
  NOTE = 'note',
  TRANSLATION = 'translation',
  BACKGROUND_INFO = 'background_info',
  CUSTOM = 'custom'
}

// 标注数据结构
interface Annotation {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  content: string;           // 被标注的文本内容
  annotationText?: string;   // 标注文本（如翻译、备注等）
  position: AnnotationPosition;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: AnnotationMetadata;
}

interface AnnotationPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  textOffsets?: TextOffset[];  // 文本在页面上的精确位置
}

interface AnnotationManager {
  // 创建标注
  createAnnotation(annotation: Annotation): Promise<Annotation>;
  
  // 更新标注
  updateAnnotation(id: string, updates: Partial<Annotation>): Promise<void>;
  
  // 删除标注
  deleteAnnotation(id: string): Promise<void>;
  
  // 获取指定页面的标注
  getAnnotations(pageNumber: number): Promise<Annotation[]>;
  
  // 搜索标注
  searchAnnotations(query: string): Promise<Annotation[]>;
  
  // 导出标注
  exportAnnotations(format: ExportFormat): Promise<string>;
}
```

### 3.3 AI 服务管理器 (AIServiceManager)

```typescript
interface AIServiceConfig {
  provider: 'openai' | 'azure' | 'local' | 'custom';
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
}

interface AITask {
  id: string;
  type: AITaskType;
  input: string;
  context?: string;
  options?: TaskOptions;
}

enum AITaskType {
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
  BACKGROUND_INFO = 'background_info',
  KEYWORD_EXTRACTION = 'keyword_extraction',
  QUESTION_ANSWERING = 'question_answering'
}

interface AIServiceManager {
  // 初始化 AI 服务
  initialize(config: AIServiceConfig): void;
  
  // 执行 AI 任务
  executeTask(task: AITask): Promise<AITaskResult>;
  
  // 批量处理
  batchExecute(tasks: AITask[]): Promise<AITaskResult[]>;
  
  // 取消任务
  cancelTask(taskId: string): void;
  
  // 获取任务状态
  getTaskStatus(taskId: string): TaskStatus;
}
```

### 3.4 插件系统 (PluginSystem)

参考 VS Code 的插件架构设计：

```typescript
// 插件定义
interface PluginManifest {
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
    annotations?: AnnotationType[];
    aiServices?: AIServiceDefinition[];
    commands?: CommandDefinition[];
    menus?: MenuDefinition[];
  };
  activationEvents?: string[];
}

// 插件上下文
interface PluginContext {
  subscriptions: Disposable[];
  annotations: AnnotationManager;
  pdfRenderer: IPDFRenderer;
  aiService: AIServiceManager;
  storage: PluginStorage;
}

// 插件接口
interface Plugin {
  activate(context: PluginContext): Promise<void>;
  deactivate?(): void;
}

// 插件管理器
interface PluginManager {
  // 加载插件
  loadPlugin(pluginPath: string): Promise<void>;
  
  // 启用/禁用插件
  enablePlugin(pluginId: string): void;
  disablePlugin(pluginId: string): void;
  
  // 卸载插件
  uninstallPlugin(pluginId: string): Promise<void>;
  
  // 获取已安装的插件列表
  getPlugins(): PluginInfo[];
  
  // 从市场安装插件
  installFromMarketplace(pluginId: string): Promise<void>;
}
```

### 3.5 数据存储模块 (DataStorage)

```typescript
interface DataStorage {
  // 保存文档元数据
  saveDocumentMetadata(docId: string, metadata: DocumentMetadata): Promise<void>;
  
  // 保存标注数据
  saveAnnotations(docId: string, annotations: Annotation[]): Promise<void>;
  
  // 加载文档数据
  loadDocument(docId: string): Promise<DocumentData>;
  
  // 搜索文档和标注
  search(query: string): Promise<SearchResult[]>;
  
  // 备份与同步
  backup(): Promise<void>;
  sync(cloudConfig: CloudConfig): Promise<void>;
}
```

## 4. 用户界面设计

### 4.1 主界面布局

```
┌────────────────────────────────────────────────────────────┐
│  标题栏 (Title Bar)                                         │
│  [菜单] [文档名称]                              [_ □ X]    │
├────────────────────────────────────────────────────────────┤
│  菜单栏 (Menu Bar)                                          │
│  文件 编辑 视图 标注 AI 工具 帮助                            │
├──────────┬───────────────────────────────────┬─────────────┤
│          │                                   │             │
│  侧边栏   │        PDF 阅读区域               │  标注面板   │
│          │                                   │             │
│  - 文档   │     [PDF 页面渲染区]               │  - 标注列表  │
│    大纲   │                                   │  - 搜索     │
│  - 书签   │                                   │  - 筛选     │
│  - 标注   │                                   │             │
│  - 搜索   │                                   │             │
│          │                                   │             │
├──────────┴───────────────────────────────────┴─────────────┤
│  状态栏 (Status Bar)                                        │
│  页面：1/50  缩放：100%  选中：第 3 行  AI 服务：就绪         │
└────────────────────────────────────────────────────────────┘
```

### 4.2 标注工具栏

```
┌─────────────────────────────────────────────────────────┐
│  T  高亮  下划线  删除线  注释  翻译  背景  更多...       │
└─────────────────────────────────────────────────────────┘
```

### 4.3 AI 功能面板

```
┌─────────────────────────────────────────────────────────┐
│  AI 助手                                                  │
├─────────────────────────────────────────────────────────┤
│  快捷操作：                                              │
│  [翻译选中内容] [解释概念] [提供背景] [生成摘要]          │
│                                                         │
│  自动标注设置：                                          │
│  ☑ 自动翻译专业术语                                      │
│  ☑ 自动添加背景信息                                      │
│  ☐ 自动生成页面摘要                                      │
│                                                         │
│  AI 服务状态：● 在线                                     │
└─────────────────────────────────────────────────────────┘
```

## 5. AI 功能详细设计

### 5.1 自动翻译标注

**工作流程**:
1. 用户选择文本或设置自动翻译规则
2. 系统检测专业术语或设定的语言对
3. 调用 AI 服务进行翻译
4. 创建翻译标注并显示在侧边栏
5. 鼠标悬停时显示翻译结果

**实现示例**:
```typescript
class TranslationPlugin implements Plugin {
  async activate(context: PluginContext) {
    // 注册翻译命令
    context.subscriptions.push(
      registerCommand('scipdf.translate', async (selectedText: string) => {
        const result = await context.aiService.executeTask({
          type: AITaskType.TRANSLATION,
          input: selectedText,
          options: { targetLanguage: 'zh-CN' }
        });
        
        await context.annotations.createAnnotation({
          type: AnnotationType.TRANSLATION,
          content: selectedText,
          annotationText: result.output,
          // ... 其他属性
        });
      })
    );
  }
}
```

### 5.2 背景信息自动标注

**工作流程**:
1. 分析文档内容，识别关键概念、人名、地名、事件等
2. 调用 AI 服务获取相关背景信息
3. 自动创建背景信息标注
4. 以非侵入式方式展示（如侧边栏、悬停提示）

**实现示例**:
```typescript
class BackgroundInfoPlugin implements Plugin {
  private async processPage(pageNumber: number) {
    const text = await this.context.pdfRenderer.extractText(pageNumber);
    
    // 提取关键实体
    const entities = await this.context.aiService.executeTask({
      type: AITaskType.KEYWORD_EXTRACTION,
      input: text
    });
    
    // 为每个实体获取背景信息
    for (const entity of entities.output) {
      const backgroundInfo = await this.context.aiService.executeTask({
        type: AITaskType.BACKGROUND_INFO,
        input: entity,
        context: text
      });
      
      await this.context.annotations.createAnnotation({
        type: AnnotationType.BACKGROUND_INFO,
        content: entity,
        annotationText: backgroundInfo.output,
        metadata: { source: 'auto-generated' }
      });
    }
  }
}
```

### 5.3 智能摘要生成

```typescript
interface SummaryConfig {
  autoGenerate: boolean;
  summaryLength: 'short' | 'medium' | 'long';
  includeKeywords: boolean;
  language: string;
}

class SummaryGenerator {
  async generatePageSummary(pageNumber: number): Promise<Summary> {
    const text = await this.pdfRenderer.extractText(pageNumber);
    
    return await this.aiService.executeTask({
      type: AITaskType.SUMMARIZATION,
      input: text,
      options: {
        maxLength: 200,
        language: 'zh-CN'
      }
    });
  }
}
```

## 6. 插件开发指南

### 6.1 创建第一个插件

**项目结构**:
```
my-plugin/
├── src/
│   └── extension.ts
├── package.json
└── tsconfig.json
```

**package.json**:
```json
{
  "name": "my-pdf-plugin",
  "displayName": "My PDF Plugin",
  "version": "0.0.1",
  "description": "我的第一个 SciPDFReader 插件",
  "engines": {
    "scipdfreader": "^1.0.0"
  },
  "main": "./dist/extension.js",
  "contributes": {
    "annotations": [
      {
        "type": "custom_annotation",
        "label": "自定义标注"
      }
    ],
    "commands": [
      {
        "command": "myplugin.dosomething",
        "title": "执行操作"
      }
    ]
  },
  "activationEvents": ["onStartupFinished"]
}
```

**extension.ts**:
```typescript
import * as scipdf from 'scipdfreader-api';

export function activate(context: scipdf.PluginContext) {
  console.log('SciPDFReader 插件已激活');
  
  // 注册命令
  let disposable = scipdf.commands.registerCommand(
    'myplugin.dosomething',
    async () => {
      // 获取当前选中的文本
      const selection = context.pdfRenderer.getSelection();
      
      // 创建标注
      await context.annotations.createAnnotation({
        type: 'custom_annotation',
        content: selection.text,
        // ...
      });
      
      scipdf.window.showInformationMessage('操作完成!');
    }
  );
  
  context.subscriptions.push(disposable);
}

export function deactivate() {
  // 清理资源
}
```

### 6.2 插件发布

1. 打包插件：`npm run package`
2. 发布到插件市场：`scipdf-cli publish`
3. 用户安装：`scipdf-cli install my-pdf-plugin`

## 7. 性能优化策略

### 7.1 PDF 渲染优化
- **虚拟滚动**: 只渲染可见区域的页面
- **分层渲染**: 将标注层与 PDF 内容层分离
- **Web Worker**: 在后台线程处理 PDF 解析
- **缓存策略**: 缓存已渲染的页面和标注

### 7.2 AI 调用优化
- **请求批处理**: 合并多个 AI 请求
- **结果缓存**: 缓存 AI 响应结果
- **本地模型**: 使用 ONNX 部署轻量级本地模型
- **降级策略**: 网络不可用时使用本地处理

### 7.3 数据存储优化
- **增量存储**: 只存储变化的数据
- **压缩存储**: 对标注数据进行压缩
- **索引优化**: 为搜索建立倒排索引

## 8. 安全与隐私

### 8.1 数据安全
- 本地数据加密存储
- 安全的云同步协议
- 用户数据隔离

### 8.2 AI 服务隐私
- 可选的本地 AI 处理
- 匿名化 AI 请求
- 明确的隐私政策

### 8.3 插件安全
- 插件签名验证
- 权限控制机制
- 沙箱运行环境

## 9. 开发路线图

### Phase 1: 基础框架 (Month 1-2)
- [x] 项目初始化和技术选型
- [ ] Electron 应用框架搭建
- [ ] PDF.js 集成
- [ ] 基本 UI 框架
- [ ] 标注系统基础功能

### Phase 2: 核心功能 (Month 3-4)
- [ ] 完整的标注管理系统
- [ ] AI 服务集成 (OpenAI API)
- [ ] 翻译功能实现
- [ ] 背景信息标注
- [ ] 数据存储系统

### Phase 3: 插件系统 (Month 5-6)
- [ ] 插件架构设计与实现
- [ ] 插件 API 开发
- [ ] 插件市场基础设施
- [ ] 示例插件开发

### Phase 4: 优化与完善 (Month 7-8)
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 测试与 bug 修复
- [ ] 文档完善

### Phase 5: 发布与生态 (Month 9+)
- [ ] Beta 版本发布
- [ ] 开发者社区建设
- [ ] 插件生态培育
- [ ] 持续迭代更新

## 10. 技术挑战与解决方案

### 10.1 PDF 精确标注
**挑战**: PDF 文本坐标系统复杂，难以精确定位

**解决方案**:
- 使用 PDF.js 的文本层 (TextLayer) 功能
- 建立文本内容与坐标的映射关系
- 支持多种标注格式 (SVG、Canvas)

### 10.2 AI 响应准确性
**挑战**: AI 可能产生不准确的翻译或背景信息

**解决方案**:
- 提供人工审核和编辑功能
- 支持多个 AI 服务对比
- 建立用户反馈机制

### 10.3 大文件性能
**挑战**: 大型 PDF 文件（数百页）的性能问题

**解决方案**:
- 分页加载和渲染
- 后台预加载
- 标注数据懒加载

## 11. 总结

SciPDFReader 旨在创建一个现代化、智能化、可扩展的 PDF 阅读平台。通过借鉴 VS Code 的成功经验，结合 AI 技术，我们能够为学术研究者、学生和专业人士提供一个强大的 PDF 阅读和学习工具。

项目的核心竞争力：
1. **AI 增强**: 智能标注、自动翻译、背景信息补充
2. **插件生态**: 开放的平台，支持第三方扩展
3. **跨平台**: 一次开发，多平台运行
4. **开源开放**: 鼓励社区贡献，共同建设生态

---

**文档版本**: 1.0  
**创建日期**: 2026-02-10  
**作者**: SciPDFReader Team  
**状态**: 草稿
