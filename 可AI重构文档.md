# 心理医生可益2.01 可AI重构文档

> **元信息**
> - **一句话定位**：可意（Keyi）—— 基于 Vite 7 + React 19 + wouter + zustand + framer-motion 的 AI 心理陪伴助手纯前端应用，含对话阶段状态机、危机关键词检测干预、情绪调节资源组件。
> - **生成日期**：2026-07-28
> - **复现深度**：精确级（单凭本文档，AI 可完全复现该项目）
> - **关系声明**：
>   - 项目根目录的 `TASKS.md` 是开发任务清单（v1.1，2026-02-15），本文档第 1 章功能清单与其状态标注对齐；
>   - 项目根目录的《可意AI心理陪伴助手-工作流手册v2.0.md》（27.9KB）是产品逻辑与 prompt 话术的核心资产，本文档第 6 章提炼其要点并引用，**不整篇抄录**（该手册本身保留在项目内，复现时应连同保留）；
>   - 工作区内的 `keyi` 项目与本项目是**同一产品的前后代关系**（本项目为纯前端原型代，`keyi` 为含 backend/supabase/vercel 部署的后续代），本文档仅覆盖本项目。
> - **密钥零收录声明**：本文档不收录任何真实 API Key/密钥。源码中 API Key 仅通过环境变量 `VITE_AI_API_KEY` 引用，无任何硬编码真实值；文档中出现的密钥位置一律使用 `<占位>`。

---

## 1. 项目概述

### 1.1 定位

"可意"是一个面向中文用户的 **AI 心理陪伴助手** Web 前端（移动端优先布局）。核心理念来自工作流手册 v2.0：**"让普通人也能拥有'专业心理陪伴'般的情绪支持服务"**。产品边界声明（必须在 UI 中呈现）：

- ✅ 是 AI 情绪陪伴助手：倾听、陪伴、提供情绪管理技巧；
- ❌ 不是心理医生/咨询师/治疗师：不做临床诊断、不开药、不替代专业治疗；
- 🆘 出现自伤/自杀风险时立即提供危机干预资源。

当前版本为**纯前端原型**：AI 响应为本地 mock（关键词规则），真实 LLM API 调用代码已写好但被注释；无后端、无数据库，所有数据存 localStorage。

### 1.2 编号功能清单（与第 9 章验收标准一一对应）

| 编号 | 功能 | 实现状态 | 关键文件 |
|------|------|---------|---------|
| F01 | 欢迎首页：Logo、称呼输入、"开始聊聊"按钮、隐私承诺 | ✅ 已完成且接入 | `pages/welcome/index.tsx` |
| F02 | 知情同意弹窗：5 条服务说明 + 复选框同意 | ✅ 已完成且接入 | `components/welcome/ConsentModal.tsx` |
| F03 | 主对话页：消息列表、打字动画、AI mock 回复 | ✅ 已完成且接入 | `pages/chat/index.tsx` |
| F04 | 对话开场白：`/chat/intro` 路由播放欢迎语后转 `/chat` | ✅ 已完成且接入 | `pages/chat/index.tsx` |
| F05 | 输入区：自增长 textarea、快捷短语、发送/语音按钮 | ✅ 已完成且接入（语音为占位） | `components/chat/InputArea.tsx` |
| F06 | 结束页：温暖告别 + A/B/C/D 四档反馈收集 | ✅ 已完成且接入 | `pages/closing/index.tsx` |
| F07 | 对话阶段状态机（greeting→listening→exploring→guiding→intervention→closing） | ✅ 逻辑完成（`determinePhase` 按消息数切换） | `stores/chatStore.ts` |
| F08 | 危机关键词检测（红/黄两级 + 正则模式） | ✅ 逻辑完成，**未接入页面** | `stores/crisisStore.ts`、`services/riskService.ts` |
| F09 | 危机干预弹窗：全屏黑底、紧急热线卡片、180 秒倒计时锁定 | ✅ 组件完成，**未接入页面** | `components/crisis/CrisisModal.tsx` |
| F10 | 风险提示条（中/高风险横幅） | ✅ 组件完成，**未接入页面** | `components/crisis/RiskBanner.tsx` |
| F11 | 4-7-8 呼吸练习（圆形缩放动画） | ✅ 组件完成，**未接入页面** | `components/resources/BreathingExercise.tsx` |
| F12 | 5-4-3-2-1 着陆练习（分步交互） | ✅ 组件完成，**未接入页面** | `components/resources/GroundingExercise.tsx` |
| F13 | 情绪日记（7 种情绪 + 备注 + 历史） | ✅ 组件完成，**未接入页面** | `components/resources/MoodTracker.tsx` |
| F14 | zustand 三大 store（chat/user/crisis）+ localStorage 持久化 | ✅ 完成（页面仅部分使用） | `stores/*` |
| F15 | AI 服务层：OpenAI 风格请求体构建、6 阶段 system prompt、mock 响应、兜底响应 | ✅ 完成（真实调用被注释） | `services/aiService.ts` |
| F16 | 本地存储服务（前缀/TTL/伪加密） | ✅ 完成，**未被调用** | `services/storageService.ts` |
| F17 | 分析服务（事件追踪/统计） | ✅ 完成，**未被调用** | `services/analyticsService.ts` |
| F18 | 通用 UI 组件库（Button/Input/Modal/Loading） | ✅ 完成 | `components/common/*` |

> **重要架构事实**：F08–F13、F16、F17 是"已写好但未在路由页面中挂载"的模块（详见第 7、10 章）。复现时必须原样保留这一状态，或按第 9 章可选步骤接线。

### 1.3 与 keyi 项目的前后代关系

- 本项目（心理医生可益2.01）：纯前端原型，AI mock，git 仓库位于 `frontend/` 子目录内；
- 工作区 `keyi/` 项目：同一产品后续代，含 `backend/`、`supabase/`、`frontend/`、vercel/render 部署配置；
- 两者共享产品概念（可意人格、危机干预、阶段化对话），代码不共享；本文档不覆盖 keyi。

---

## 2. 技术栈与环境

### 2.1 精确版本表（逐字收录自 `frontend/package.json`）

**dependencies：**

| 包 | 版本 |
|----|------|
| @tailwindcss/vite | ^4.1.18 |
| clsx | ^2.1.1 |
| framer-motion | ^12.34.0 |
| react | ^19.2.0 |
| react-dom | ^19.2.0 |
| tailwind-merge | ^3.4.0 |
| tailwindcss | ^4.1.18 |
| wouter | ^3.9.0 |
| zustand | ^5.0.11 |

**devDependencies：**

| 包 | 版本 |
|----|------|
| @eslint/js | ^9.39.1 |
| @types/node | ^24.10.1 |
| @types/react | ^19.2.7 |
| @types/react-dom | ^19.2.3 |
| @vitejs/plugin-react | ^5.1.1 |
| eslint | ^9.39.1 |
| eslint-plugin-react-hooks | ^7.0.1 |
| eslint-plugin-react-refresh | ^0.4.24 |
| globals | ^16.5.0 |
| typescript | ~5.9.3 |
| typescript-eslint | ^8.48.0 |
| vite | ^7.3.1 |

**package.json 其他字段**：`"name": "frontend"`、`"private": true`、`"version": "0.0.0"`、`"type": "module"`。

**scripts（逐字）**：

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

> 注意：**wouter 在 package.json 中已声明但源码实际未 import 其 API 用于导航**（仅 `router.tsx` 用了 `Route`/`Switch`，编程式导航是手写的 pushState，见第 8 章）。TASKS.md 中提到的 Radix UI 实际**未安装未使用**。

### 2.2 vite 配置要点（`frontend/vite.config.ts` 逐字收录）

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

要点：Tailwind CSS v4 通过 `@tailwindcss/vite` 插件接入（**无 tailwind.config.js**，主题在 `src/index.css` 的 `@theme` 块中定义）；路径别名 `@` → `./src`（需与 tsconfig.app.json 的 `paths` 保持一致）。

### 2.3 TypeScript 配置要点

`tsconfig.json` 为引用式空壳，references 指向 `tsconfig.app.json` 与 `tsconfig.node.json`。`tsconfig.app.json` 关键项：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

> `verbatimModuleSyntax: true` 意味着所有仅类型导入必须写 `import type`（源码已遵守，复现时不可省略）。

### 2.4 ESLint 配置（`eslint.config.js`）

flat config：`globalIgnores(['dist'])` + 对 `**/*.{ts,tsx}` 应用 `js.configs.recommended`、`tseslint.configs.recommended`、`reactHooks.configs.flat.recommended`、`reactRefresh.configs.vite`，`ecmaVersion: 2020`，`globals.browser`。

### 2.5 安装 / 运行 / 构建命令

```powershell
cd frontend
npm install          # 或 pnpm install
npm run dev          # 开发服务器，默认 http://localhost:5173
npm run build        # tsc -b && vite build → 产物在 dist/
npm run preview      # 预览构建产物
npm run lint         # ESLint 检查
```

### 2.6 环境变量表（仅键名 + 占位值）

| 键名 | 用途 | 默认行为 | 占位示例 |
|------|------|---------|---------|
| `VITE_AI_API_ENDPOINT` | LLM 聊天补全端点 URL | 未设置时回退 `/api/ai/chat` | `<你的API端点>` |
| `VITE_AI_API_KEY` | LLM API 鉴权密钥（Bearer） | 未设置时请求不带 Authorization 头 | `<你的API密钥>` |

项目**无 `.env` 文件**（未提交）；当前 mock 模式下两个变量均可不配置。

<!-- SECTION 2 END -->

---

## 3. 目录结构

带中文注释目录树（排除 `node_modules/`、`dist/`、`frontend/public/`+`src/assets/` 中的模板 svg、以及 16 个 `tmpclaude-*` 残留文件——残留清单见第 10 章）：

```
心理医生可益2.01/
├── TASKS.md                                # 前端开发任务清单 v1.1（技术栈决策+12 类任务表）
├── 可意AI心理陪伴助手-工作流手册v2.0.md      # 产品核心资产：8 阶段工作流+prompt 话术+危机干预规范（27.9KB，保留原文件）
├── 可AI重构文档.md                          # 本文档（不入 git，git 仓库在 frontend/ 内）
└── frontend/                               # Vite + React 前端（git 仓库根）
    ├── index.html                          # 入口 HTML（title 为 "frontend"，Vite 模板默认值）
    ├── package.json                        # 依赖与脚本（见 2.1）
    ├── package-lock.json                   # npm 锁文件
    ├── vite.config.ts                      # Vite 配置：react + tailwindcss 插件 + @ 别名
    ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json   # TS 项目引用配置
    ├── eslint.config.js                    # ESLint flat config
    ├── README.md                           # Vite 模板默认 README（无项目内容）
    ├── .gitignore                          # 标准 Vite 模板 gitignore
    ├── public/
    │   └── vite.svg                        # Vite 模板图标（favicon）
    └── src/
        ├── main.tsx                        # 入口：createRoot + StrictMode 渲染 <App/>
        ├── App.tsx                         # 仅渲染 <Router/>
        ├── router.tsx                      # wouter 路由表 + 手写 navigate()
        ├── index.css                       # Tailwind v4 @theme 主题变量 + 全局样式（见 8.4）
        ├── assets/
        │   └── react.svg                   # 模板资源（未使用）
        ├── styles/                         # 空目录（预留）
        ├── types/
        │   ├── chat.ts                     # 全部领域类型定义（见第 4 章）
        │   └── index.ts                    # export * from './chat'
        ├── utils/
        │   └── helpers.ts                  # cn/generateId/formatTime/formatDate/delay/capitalize/truncate/isEmpty
        ├── stores/                         # zustand 状态管理
        │   ├── chatStore.ts                # 对话状态 + determinePhase 阶段机
        │   ├── userStore.ts                # 用户/偏好/情绪历史（persist）
        │   ├── crisisStore.ts              # 危机状态 + 关键词检测 + 紧急联系人
        │   └── index.ts                    # 桶导出
        ├── services/                       # 服务层（类 + 单例导出）
        │   ├── aiService.ts                # AI 请求体构建/6 阶段 system prompt/mock/兜底
        │   ├── riskService.ts              # 独立风险检测服务（关键词+正则，未接线）
        │   ├── storageService.ts           # localStorage 封装（前缀/TTL/base64 伪加密，未接线）
        │   ├── analyticsService.ts         # 事件追踪统计（未接线）
        │   └── index.ts                    # 桶导出
        ├── hooks/
        │   ├── useChat.ts                  # useChat/useUser/useCrisis 三个 hook + mockAIResponse
        │   └── index.ts                    # 桶导出
        ├── pages/
        │   ├── welcome/index.tsx           # 欢迎首页（F01）
        │   ├── chat/index.tsx              # 主对话页（F03/F04）
        │   └── closing/index.tsx           # 结束+反馈页（F06）
        └── components/
            ├── common/                     # 通用组件库
            │   ├── Button.tsx              # Button + LoadingButton
            │   ├── Input.tsx               # Input + Textarea
            │   ├── Modal.tsx               # Modal + ConfirmModal
            │   ├── Loading.tsx             # Spinner/LoadingText/FullPageLoader/Skeleton/MessageBubbleSkeleton
            │   └── index.ts
            ├── chat/
            │   ├── MessageBubble.tsx       # 消息气泡 + TypingContent + WelcomeBubble（含本地 Message 接口）
            │   └── InputArea.tsx           # 输入区 + EndChatButton
            ├── welcome/
            │   └── ConsentModal.tsx        # 知情同意弹窗（CONSENT_ITEMS 常量）
            ├── crisis/                     # 危机干预模块（未挂载到页面）
            │   ├── CrisisManager.tsx       # 包装器：RiskBanner + children + CrisisModal
            │   ├── CrisisModal.tsx         # 全屏危机弹窗（倒计时锁定）
            │   ├── RiskBanner.tsx          # 风险横幅
            │   └── index.ts
            └── resources/                  # 情绪调节资源（未挂载到页面）
                ├── BreathingExercise.tsx   # 4-7-8 呼吸练习 + QuickBreathing
                ├── GroundingExercise.tsx   # 5-4-3-2-1 着陆练习 + QuickGrounding
                ├── MoodTracker.tsx         # 情绪日记 + MoodHistory
                └── index.ts
```

统计：`src/` 下业务文件 **37 个**（33 个 .ts/.tsx 模块 + main/App/router/index.css），第 7 章逐一说明。

<!-- SECTION 3 END -->

---

## 4. 数据模型

### 4.1 领域类型定义（`src/types/chat.ts` 逐字收录）

```ts
/**
 * 对话阶段类型
 */
export type SessionPhase =
  | 'greeting'      // 问候阶段
  | 'listening'     // 倾听阶段
  | 'exploring'     // 探索阶段
  | 'guiding'       // 引导阶段
  | 'intervention'   // 干预阶段
  | 'closing';       // 结束阶段

/**
 * 风险等级类型
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * 消息类型
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  typing?: boolean;
  metadata?: {
    phase?: SessionPhase;
    riskLevel?: RiskLevel;
  };
}

/**
 * 用户类型
 */
export interface User {
  id: string;
  name: string;
  agreedToTerms: boolean;
  createdAt: string;
  totalSessions: number;
  preferences: UserPreferences;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  notifications: boolean;
  soundEnabled: boolean;
  autoTyping: boolean;
}

/**
 * 对话会话类型
 */
export interface Session {
  id: string;
  startTime: string;
  endTime?: string;
  phase: SessionPhase;
  riskLevel: RiskLevel;
  messageCount: number;
  feedback?: SessionFeedback;
}

/**
 * 对话反馈类型
 */
export interface SessionFeedback {
  rating: 'A' | 'B' | 'C' | 'D';
  comment?: string;
  submittedAt: string;
}

/**
 * 危机事件类型
 */
export interface CrisisEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  level: RiskLevel;
  triggerText: string;
  resolved: boolean;
}

/**
 * 情绪类型
 */
export type MoodType =
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'anxious'
  | 'sad'
  | 'angry'
  | 'overwhelmed';

/**
 * 情绪记录类型
 */
export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
  note?: string;
}

/**
 * AI响应类型
 */
export interface AIResponse {
  content: string;
  newPhase?: SessionPhase;
  riskLevel?: RiskLevel;
  suggestedActions?: string[];
}
```

> ⚠️ **第二处 Message 定义**：`components/chat/MessageBubble.tsx` 内又导出了一个本地 `Message` 接口（同名但无 `metadata` 字段），且 `pages/chat/index.tsx` 使用的是**这个本地版本**而非 `types/chat.ts` 的版本。复现时必须保留这一重复（两者字段：`id/role/content/timestamp/typing?`）。

### 4.2 zustand Store 结构（类型定义逐字收录）

#### ChatState（`stores/chatStore.ts`）

```ts
export interface ChatState {
  // 当前会话
  currentSession: Session | null;
  messages: Message[];
  isTyping: boolean;
  phase: SessionPhase;

  // 会话历史
  sessionHistory: Session[];

  // 操作方法
  startSession: () => void;
  endSession: () => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  setTyping: (typing: boolean) => void;
  setPhase: (phase: SessionPhase) => void;
  setAIResponse: (response: AIResponse) => void;
  resetChat: () => void;
}
```

持久化配置（逐字）：

```ts
const createPersistStorage = <T>() =>
  ({
    name: 'keyi-chat-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state: ChatState) => ({
      sessionHistory: state.sessionHistory,
      currentSession: state.currentSession,
    }),
  } as const);
```

初始状态：`currentSession: null, messages: [], isTyping: false, phase: 'greeting', sessionHistory: []`。

阶段判断辅助函数（逐字，**核心状态机阈值**）：

```ts
export function determinePhase(messageCount: number): SessionPhase {
  if (messageCount < 3) return 'listening';
  if (messageCount < 8) return 'exploring';
  if (messageCount < 15) return 'guiding';
  if (messageCount < 25) return 'intervention';
  return 'closing';
}
```

#### UserState（`stores/userStore.ts`）

```ts
export interface UserState {
  // 当前用户
  user: User | null;

  // 用户偏好
  preferences: UserPreferences;

  // 情绪历史
  moodHistory: MoodEntry[];

  // 操作方法
  setUserName: (name: string) => void;
  agreeToTerms: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addMoodEntry: (mood: Omit<MoodEntry, 'id' | 'date'>) => void;
  logout: () => void;
}
```

默认偏好（逐字）：`{ notifications: true, soundEnabled: true, autoTyping: true }`。
持久化：`name: 'keyi-user-storage'`，`createJSONStorage(() => localStorage)`，**无 partialize**（全量持久化）。
行为要点：`setUserName` 若无 user 则创建新 User（`generateId('user')`，`agreedToTerms: false`，`totalSessions: 0`），并**同时写 `localStorage.setItem('keyi_user_name', name)`（兼容旧代码）**；`addMoodEntry` 头插并 `slice(0, 30)` 只留 30 条；`logout` 清 user、moodHistory 并 `removeItem('keyi_user_name')`。

#### CrisisState（`stores/crisisStore.ts`）

```ts
export interface CrisisState {
  // 当前风险等级
  riskLevel: RiskLevel;

  // 是否触发危机模式
  isTriggered: boolean;

  // 干预倒计时（秒）
  countdown: number;

  // 危机事件历史
  crisisHistory: CrisisEvent[];

  // 上次检测文本
  lastTriggerText: string;

  // 操作方法
  detectRisk: (text: string) => RiskLevel;
  triggerCrisis: (triggerText: string) => void;
  dismissCrisis: () => void;
  resetCrisis: () => void;
  decrementCountdown: () => void;
}
```

初始状态：`riskLevel: 'low', isTriggered: false, countdown: 180 /* 3分钟 */, crisisHistory: [], lastTriggerText: ''`。**不持久化**（普通 create，无 persist 中间件）。

### 4.3 localStorage 键位总表

| 键 | 写入方 | 内容结构 |
|----|--------|---------|
| `keyi-chat-storage` | chatStore persist | `{ state: { sessionHistory: Session[], currentSession: Session\|null }, version: 0 }` |
| `keyi-user-storage` | userStore persist | `{ state: { user, preferences, moodHistory }, version: 0 }` |
| `keyi_user_name` | WelcomePage / userStore.setUserName | 纯字符串（用户称呼），ChatPage 读取用于欢迎语 |
| `keyi_analytics_events` | analyticsService | `AnalyticsEvent[]`（JSON，最多保留最近 1000 条） |
| `keyi_<key>` | storageService（前缀 `keyi_`） | `{ value, expires, createdAt }`（JSON，可选 base64 伪加密；TTL 默认 30 天） |

### 4.4 服务层内部数据结构（规格化描述）

- `AIConfig`（aiService）：`{ apiEndpoint: string; apiKey?: string; model: string; timeout: number }`；
- `ChatContext`（aiService）：`{ messages: Message[]; phase: SessionPhase; userName: string; messageCount: number }`；
- `RiskKeywords`（riskService）：`{ red: string[]; yellow: string[]; patterns: RegExp[] }`；
- `RiskResult`（riskService）：`{ level: RiskLevel; matchedKeywords: string[]; isCrisis: boolean; suggestedAction?: string }`；
- `StorageConfig`（storageService）：`{ prefix: string; encrypt: boolean; ttl: number }`，默认 `{ prefix: 'keyi_', encrypt: false, ttl: 30*24*60*60*1000 }`；
- `AnalyticsEvent`：`{ id, type: EventType, timestamp, sessionId?, data: Record<string, unknown> }`，`EventType = 'page_view' | 'session_start' | 'session_end' | 'message_sent' | 'message_received' | 'crisis_triggered' | 'feedback_submitted' | 'resource_used'`；
- `ChatStatistics`：`{ totalSessions, totalMessages, averageSessionLength, averageMessagesPerSession, crisisEvents, topTopics: Record<string, number> }`；
- `UserBehavior`：`{ pageViews, sessionsCompleted, averageSessionDuration, commonExitPoints: string[], lastActiveAt }`。

<!-- SECTION 4 END -->

---

## 5. API 契约

### 5.1 总览

当前版本**没有任何真实网络请求发生**。`aiService.getResponse()` 中真实调用被注释，走 `mockResponse()`。但请求协议已完整定义，复现必须逐字保留以便一键切换。

### 5.2 LLM 聊天端点（唯一后端契约）

| 项 | 值 |
|----|-----|
| URL | `import.meta.env.VITE_AI_API_ENDPOINT \|\| '/api/ai/chat'` |
| 方法 | POST |
| Header | `Content-Type: application/json`；若配置了 apiKey 则加 `Authorization: Bearer <占位:VITE_AI_API_KEY>` |
| 模型名 | `'gpt-4'`（`defaultConfig.model` 硬编码） |
| 超时 | `30000` ms，通过 `AbortSignal.timeout(this.config.timeout)` 实现 |
| 流式协议 | **无**——一次性 JSON 响应，非 SSE/流式 |

**请求体 shape（OpenAI Chat Completions 风格，由 `buildRequestBody` 构建，逐字）**：

```ts
{
  model: this.config.model,          // 'gpt-4'
  messages: [
    { role: 'system', content: this.getSystemPrompt(context.phase) },
    ...context.messages.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: userMessage },
  ],
  temperature: 0.7,
  max_tokens: 1000,
}
```

**响应处理**：`response.ok` 为 false 时抛 `` `API调用失败: ${response.status}` ``；`parseResponse(response)` 为**未实现的桩**，返回 `{ content: '' }` 并注释"根据实际API响应格式调整"。任何异常统一走 `getFallbackResponse()`（见 6.3 兜底文案）。

### 5.3 模拟层（当前生效的"API"）

存在**两套等价的 mock 实现**（复现须都保留）：

1. `services/aiService.ts` 私有方法 `mockResponse(userMessage, context)`——被 `pages/chat/index.tsx` 实际使用（经由 `aiService.getResponse`），无人工延迟；
2. `hooks/useChat.ts` 模块级函数 `mockAIResponse(userMessage, context)`——被 `useChat().sendMessage` 使用（该 hook 未被页面调用），有 `1000 + Math.random() * 1000` ms 模拟延迟。

两者关键词规则一致（内容逐字见 6.3）：焦虑/紧张→exploring；难过/伤心→listening；工作/上班→exploring；谢谢/再见→closing；默认→`determinePhase(messageCount + 1)`。

### 5.4 其他外部"端点"

- 警示音资源：`new Audio('/sounds/crisis-alert.mp3')`，音量 0.5，播放失败静默降级（`public/` 下**并无此文件**，属已知缺失资产，见第 10 章）；
- 紧急电话拨打：`<a href="tel:...">`，号码表见 6.4；
- analyticsService 的 `sendToServer` 为占位（仅 console.log，实际调用处已注释）。

### 5.5 鉴权方式

仅 Bearer Token（`Authorization: Bearer <VITE_AI_API_KEY>`），无 Cookie/Session/OAuth。密钥仅存于构建时环境变量，**零硬编码**。

<!-- SECTION 5 END -->

---

## 6. 核心业务逻辑

### 6.1 对话状态机（完整状态与转移条件）

**状态集合**（`SessionPhase`）：`greeting → listening → exploring → guiding → intervention → closing`。

**转移机制有两条并行路径**：

A. **消息数驱动**（`determinePhase(messageCount)`，主路径）：

| 消息数 n | 阶段 |
|---------|------|
| n < 3 | listening |
| 3 ≤ n < 8 | exploring |
| 8 ≤ n < 15 | guiding |
| 15 ≤ n < 25 | intervention |
| n ≥ 25 | closing |

（初始 phase 为 `greeting`，首次调用 determinePhase 后即离开 greeting，不再回退。）

B. **关键词驱动**（mock 响应中的 `newPhase` 覆盖）：AI mock 命中关键词时直接指定 newPhase（焦虑→exploring、难过→listening、谢谢/再见→closing），`ChatPage` 收到后调用 `useChatStore.getState().setPhase(response.newPhase)`。

**页面级状态机**：`/`（welcome）→ `/chat/intro`（播放开场白 1.5s，自动 `navigate('/chat')`）→ `/chat`（对话；消息 > 3 条后出现"今天就到这里"按钮）→ `/closing`（告别 → 反馈 → 0.5s 后回 `/`）。

**危机分支**（逻辑已实现、UI 未挂载）：`useChat().sendMessage` 中，若 `shouldTriggerIntervention(content)` 为 true 则 `triggerCrisis(content)` 并 **return（不发送该消息、不请求 AI）**；`CrisisManager` 监听 `isTriggered` 弹出 `CrisisModal`，倒计时 180 秒归零前不可关闭。

### 6.2 AI Prompt 字符串原文（全部逐字收录，来自 `aiService.getSystemPrompt`）

**greeting：**

```
你是可意，一个温暖、专业的AI心理陪伴助手。
用户刚刚开始和你聊天。
问候用户，让用户感到被接纳。
用简洁、自然的方式开场，不要太长。
```

**listening：**

```
现在是倾听阶段。
用户正在表达自己的困扰。
你的任务是：
1. 认真倾听
2. 适当复述确认（"我听到你说..."）
3. 标注情绪（"听起来你很..."）
4. 不急着给建议，先让用户说够
5. 用温暖、接纳的语气
```

**exploring：**

```
现在是探索阶段。
用户已经初步表达了困扰。
你的任务是：
1. 帮助用户深入理解问题
2. 用开放式提问探索（"能说说更多吗？"）
3. 识别潜在的模式
4. 不要跳跃到解决方案
```

**guiding：**

```
现在是引导阶段。
用户的问题已经比较清晰。
你的任务是：
1. 温和地提供新视角
2. 用苏格拉底式提问引导用户思考
3. 帮助用户发现自己的优势和资源
4. 避免说教，允许用户不同意你的观点
```

**intervention：**

```
现在是干预阶段。
用户可能需要具体的情绪调节帮助。
你的任务是：
1. 提供实用的技巧（呼吸练习、着陆技术等）
2. 给予小步行动建议
3. 确认用户是否准备好尝试
```

**closing：**

```
现在是结束阶段。
对话即将结束。
你的任务是：
1. 温暖地总结今天的对话（如果需要）
2. 肯定用户的勇气和努力
3. 开放地邀请下次再来
4. 简短告别
```

### 6.3 固定话术/文案字符串（逐字收录）

**mock 关键词响应**（aiService.mockResponse 与 useChat.mockAIResponse 共用文案）：

| 触发词（lowerMessage.includes） | 回复原文 | newPhase |
|---|---|---|
| `焦虑` 或 `紧张` | `嗯，我听到你说自己有点焦虑。\n\n这种感觉确实不好受。\n\n能说说是什么让你感到焦虑吗？` | exploring |
| `难过` 或 `伤心` | `听起来你现在很难过。\n\n谢谢你愿意告诉我。\n\n如果想说的话，我在这里听着。` | listening |
| `工作` 或 `上班` | `工作上的事情确实会让人很有压力。\n\n方便说说是什么让你感到困扰吗？` | exploring |
| `谢谢` 或 `再见` | `不客气。记住，任何时候想聊天，我都在这里。` | closing |
| （默认） | `嗯，我听到了。\n\n谢谢你愿意分享这些。\n\n你继续说，我在这里陪着你。` | `determinePhase(messageCount + 1)` |

**兜底响应**（aiService.getFallbackResponse）：

```
抱歉，我现在有点不在状态，请再说一次？

或者我们可以先休息一下。
```

（`useChat` 与 `ChatPage` 的 catch 分支使用短版：`抱歉，我现在有点不在状态，请再说一次？`）

**开场欢迎语**（ChatPage，1.5s 打字动画后显示；有称呼时前缀 `你好，${userName}。很高兴你来到这里。`，无称呼时 `你好，很高兴你来到这里。`）：

```
你好，很高兴你来到这里。

我是可意，你的AI陪伴助手。

无论你现在想倾诉什么，或者只是想找人说说话，我都在。
不用担心说错话，这里没有评判，只有理解。
```

**结束页告别语**（ClosingPage）：

```
今天谢谢你愿意分享这么多。
我能感受到你的信任，这对我很重要。

记住，任何时候想聊天，我都在这里。
照顾好自己。
```

**反馈问题**：`今天的对话对你有帮助吗？`；**反馈选项**（逐字）：

```ts
const feedbackOptions = [
  { value: 'A', emoji: '😊', label: '好多了', desc: '压力明显减轻' },
  { value: 'B', emoji: '🙂', label: '好一些', desc: '有点帮助' },
  { value: 'C', emoji: '😐', label: '没变化', desc: '和之前差不多' },
  { value: 'D', emoji: '😔', label: '更糟了', desc: '感觉更差了' },
];
```

**快捷短语**（InputArea）：`['我最近心情不太好', '想聊聊工作', '不知道从何说起', '有点焦虑']`；输入框 placeholder：`想说什么都可以...`。

**知情同意条目**（ConsentModal 的 `CONSENT_ITEMS`，逐字）：

```ts
const CONSENT_ITEMS = [
  { icon: '🤖', title: '我的身份',
    content: '我是可意，一个AI心理陪伴助手（不是持证心理咨询师或医生）' },
  { icon: '💬', title: '我能做的',
    content: '倾听你的困扰、陪伴你度过情绪低谷、提供情绪管理技巧' },
  { icon: '🚫', title: '我不能做的',
    content: '不能做临床诊断、不能开药、不能替代专业心理治疗' },
  { icon: '🔒', title: '你的隐私',
    content: '对话加密存储，仅用于改进服务，不会泄露给第三方' },
  { icon: '🆘', title: '紧急情况',
    content: '如果出现自伤/自杀风险，我会立即提供危机干预资源' },
];
```

**危机弹窗文案**：头部 `紧急情况` / `请立即寻求帮助`；正文 `根据你描述的情况，我们非常担心你的安全。<br/>这已经超出了我能帮助的范围。`；信息卡 `你不是一个人` / `帮助是存在的，请让别人知道你现在的状态`；按钮 `` `${minutes}:${seconds.toString().padStart(2, '0')} 后可关闭` `` / `我理解了（关闭）`。

**风险横幅文案**：medium → `我注意到你提到了一些让人担心的事`（⚠️ warning 色系）；high → `我非常担心你的安全`（🆘 danger 色系）。

### 6.4 危机检测规则（关键词表逐字收录）

**crisisStore.ts 的两级关键词**（实际接入 `detectRisk`/`shouldTriggerIntervention` 的表）：

```ts
const RED_KEYWORDS = [
  '不想活了', '活着没意义', '自杀', '自残', '解脱',
  '一了百了', '死了算了', '太累了', '结束一切', '不想活了',
];
// 注意：'不想活了' 重复出现两次，原样保留

const YELLOW_KEYWORDS = [
  '崩溃', '失控', '活不下去', '没办法', '控制不住',
  '太痛苦了', '撑不住了', '想死', '活够了', '没有意义',
];
```

匹配算法：`text.toLowerCase()` 后 `includes(keyword.toLowerCase())`；命中红色→`'high'`，否则命中黄色→`'medium'`，否则 `'low'`。`shouldTriggerIntervention` **只检查红色表**。

**riskService.ts 的独立关键词配置**（更全，未接入页面）：

```ts
const defaultKeywords: RiskKeywords = {
  red: [
    '不想活了', '活着没意义', '想死', '自杀', '自残', '解脱', '一了百了',
    '死了算了', '太累了', '结束一切', '活够了', '没意思', '死了好',
    '不想活', '去死',
  ],
  yellow: [
    '崩溃', '失控', '活不下去', '没办法', '控制不住', '太痛苦了',
    '撑不住了', '没有意义', '绝望', '无望', '孤独', '空虚',
  ],
  patterns: [
    /.*(?:想|要|去)死.*/,
    /.*(?:结束|没了|完了).*/,
    /.*(?:压力|负担).*大.*/,
  ],
};
```

分级：红色命中→`high` 且 `isCrisis: true`；黄色或正则命中→`medium`。建议操作文案：medium→`建议更多关注用户的情绪状态，温和地询问具体情况`；high→`立即触发危机干预流程，提供紧急资源联系信息`。

**riskService 导出的 keywordGroups**（逐字）：`suicide: ['不想活了','活着没意义','想死','自杀','解脱','一了百了']`；`selfHarm: ['自残','割腕','撞墙','伤害自己']`；`hopelessness: ['绝望','无望','没有希望','看不到希望','太绝望了']`；`pain: ['太痛苦了','撑不住了','活不下去了','受不了了']`。

**analyticsService 内部检测表**：`['不想活了', '活着没意义', '自杀', '解脱']`。

**紧急联系人表**（crisisStore.getEmergencyContacts，逐字）：

```ts
[
  { name: '急救电话', phone: '120', description: '24小时急救', icon: '🚑', action: 'tel:120' },
  { name: '心理危机热线', phone: '400-161-9995', description: '24小时免费', icon: '📞', action: 'tel:4001619995' },
  { name: '北京心理危机干预中心', phone: '010-82951332', description: '24小时', icon: '🏥', action: 'tel:01082951332' },
  { name: '上海心理援助热线', phone: '021-12320-5', description: '24小时', icon: '📱', action: 'tel:021123205' },
]
```

**危机触发流程**（crisisStore.triggerCrisis）：创建 `CrisisEvent`（`generateId('crisis')`，sessionId 用 `generateId('session')` 简化处理，`level` 取**当前** riskLevel）→ set `{ riskLevel: 'high', isTriggered: true, countdown: 180 }` 并头插事件 → `playAlertSound()`（`/sounds/crisis-alert.mp3`，vol 0.5，失败静默）→ `console.warn('[Crisis] 危机触发:', {...})`。`dismissCrisis`：将 crisisHistory[0] 标记 `resolved: true`，重置为 low/false/180/''。`decrementCountdown`：`isTriggered && countdown > 0` 时减 1；`countdown === 1` 时自动 `dismissCrisis()`。

### 6.5 工作流手册 v2.0 产品流程要点提炼（引用，不抄录）

手册路径：`可意AI心理陪伴助手-工作流手册v2.0.md`（v2.0，2026-02-14，MiniMax Agent 编制，含 AIGC 元数据头）。共 8 阶段 + 4 附录，与代码的映射：

| 手册章节 | 要点 | 代码落点 |
|---------|------|---------|
| 第零阶段 知情同意 | 首次使用必读：身份/能做/不能做/隐私/紧急情况 5 要素 | ConsentModal 的 CONSENT_ITEMS（5 条一一对应） |
| 第一阶段 接入破冰 | 欢迎话术"你好，很高兴你来到这里…没有评判，只有理解"；尊重匿名称呼 | ChatPage 开场白、WelcomePage 称呼输入（"也可以留空"） |
| 第二阶段 倾听共情 | PEERE 模型（复述/情绪标注/具体化/肯定/共情）；AI 不得假装有人类情感 | listening 阶段 system prompt 第 2、3 条 |
| 第三阶段 问题探索 | 四象限模型（事件/情绪/认知/行为）、"为何是现在"技巧、模式识别 | exploring 阶段 prompt（开放式提问、识别模式） |
| 第四阶段 引导反馈 | 苏格拉底式提问、认知扭曲识别（全或无/灾难化/读心术/情绪推理）、资源激活 | guiding 阶段 prompt |
| 第五阶段 干预行动 | 着陆技术 5-4-3-2-1、4-7-8 呼吸法、情绪打包、小步行动原则 | intervention prompt、GroundingExercise、BreathingExercise |
| 第六阶段 结案延续 | 温暖告别话术（被 ClosingPage 逐字采用）、每 3 次对话后 A/B/C/D 评估 | ClosingPage 告别语与 feedbackOptions 与手册 6.3 完全对应 |
| 第七阶段 风险危机 | 红/黄预警关键词、C-SSRS 简化版 5 问评估、高危强制干预页"3 分钟内无法关闭"、热线 400-161-9995/010-82951332/021-12320-5 | crisisStore 关键词表、CrisisModal 180 秒锁定、紧急联系人表 |
| 第八阶段 长期陪伴 | 关系分级（初识 1-3 次/稳定 4-10 次/维护 10+）、防过度依赖、"毕业"机制 | **未实现**（后续代 keyi 方向） |
| 附录A 人格 | 温暖/专业/智慧/边界/真诚五特质 | greeting prompt "温暖、专业" |
| 附录B 禁用话术 | 禁"我能感同身受""一切都会好起来的""你应该…""别想太多"等 8 条+替代表达 | 接真实 LLM 时应并入 system prompt（当前未并入，缺口） |
| 附录C 文化适配 | 中国污名化应对、家庭议题敏感处理 | 未实现 |
| 附录D 技术建议 | 上下文记忆≥5轮、关键词实时监测、高风险案例100%人工审核 | 部分实现（全量 messages 入请求体、关键词检测） |

### 6.6 边界条件汇总

1. **空输入**：InputArea `handleSubmit` 中 `!value.trim() || disabled` 直接 return；发送按钮同条件禁用。
2. **Enter 发送 / Shift+Enter 换行**：`e.key === 'Enter' && !e.shiftKey` 时 preventDefault 并提交。
3. **textarea 高度**：自动增长，`Math.min(scrollHeight, 120)`，minHeight 48px。
4. **称呼可留空**：欢迎语无名字时用无称呼版本；`getUserName()` 先查 store 再回退 `keyi_user_name`。
5. **危机命中即拦截**：`useChat.sendMessage` 中危机触发后 return，用户消息不进入列表也不请求 AI（仅 hook 路径；ChatPage 实际路径无此拦截——已知缺口）。
6. **倒计时边界**：`decrementCountdown` 在 `countdown === 1` 时自动解除；但**无任何 setInterval 调用它**（若挂载 CrisisManager，弹窗将永不自动解锁，见第 10 章坑 K4）。
7. **CrisisModal 阻止 ESC**：keydown 监听 Escape 并 preventDefault；通用 Modal 则相反（ESC 关闭 + 锁 body overflow）。
8. **结束按钮出现条件**：`!isIntro && !isEnded && messages.length > 3`。
9. **情绪记录上限**：30 条；analytics 事件上限 1000 条（超限截断，写入失败清空）。
10. **storageService TTL**：读取时 `Date.now() > data.expires` 则删除并返回默认值；`getRemainingSpace()` 按 UTF-16 双字节估算，5MB 上限，剩余 <1MB 判定接近上限。
11. **AI 超时**：30s AbortSignal；任何异常走兜底文案，不中断 UI。
12. **`/chat/intro` 判定**：`window.location.pathname === '/chat/intro'` 仅在组件渲染时求值；1.5s 后 `navigate('/chat')` 替换 URL。

<!-- SECTION 6 END -->

---

## 7. 核心文件逐一说明【文档主体】

> 说明格式：**路径 | 职责 | 实现要点 | 关键片段 | 边界条件**。prompt/常量/正则已在第 4、6 章逐字收录者此处标注"见 §x.x"不重复。共覆盖 37 个业务文件。

### 7.1 入口与路由（4 文件）

#### `src/main.tsx`（10 行）
- **职责**：应用入口。
- **实现**：`createRoot(document.getElementById('root')!)` 渲染 `<StrictMode><App/></StrictMode>`；导入 `./index.css` 与 `./App.tsx`（**带 .tsx 扩展名**，依赖 `allowImportingTsExtensions`）。

#### `src/App.tsx`（7 行）
- **职责**：仅返回 `<Router />`。无 Provider、无全局布局——这就是 CrisisManager 未生效的直接原因（它需要在此处包裹 Router 才起作用）。

#### `src/router.tsx`（30 行）
- **职责**：wouter 路由表 + 手写编程式导航。
- **关键片段（逐字，路由表白名单）**：

```tsx
<Switch>
  <Route path="/" component={WelcomePage} />
  <Route path="/chat/intro" component={ChatPage} />
  <Route path="/chat" component={ChatPage} />
  <Route path="/closing" component={ClosingPage} />
  <Route>
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <p className="text-warm-600">页面未找到</p>
    </div>
  </Route>
</Switch>
```

```ts
// 导出 navigate 用于编程式导航
export const navigate = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
```

- **要点**：未使用 wouter 的 `useLocation` 返回值做导航（虽 import 了 `useLocation` 但未调用其结果）；手写 pushState + 派发 popstate 让 wouter 感知路由变化。404 兜底为无 path 的 Route。

#### `frontend/index.html`（13 行）
- `lang="en"`、`<title>frontend</title>`（模板默认未改）、favicon `/vite.svg`、挂载点 `#root`、入口 `/src/main.tsx`。

### 7.2 类型与工具（3 文件）

#### `src/types/chat.ts`（117 行）
- **职责**：全部领域类型。**已在 §4.1 逐字收录**。
- **边界**：`Message.timestamp` 是 `Date` 类型——经 JSON 持久化后还原为字符串，代码未做反序列化处理（chatStore 的 partialize 恰好不持久化 messages，规避了该问题）。

#### `src/types/index.ts`（1 行）
- `export * from './chat';`

#### `src/utils/helpers.ts`（71 行）
- **职责**：8 个纯工具函数。
- **关键片段（逐字，核心两个）**：

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
```

- 其余：`formatTime`（zh-CN，2-digit 时:分）、`formatDate`（zh-CN，年月日 long）、`delay(ms)`、`capitalize`、`truncate(str, maxLength)`（截断补 `...`，含 3 字符预留）、`isEmpty`（null/undefined/空白串）。

### 7.3 状态管理（4 文件）

#### `src/stores/chatStore.ts`（192 行）
- **职责**：会话生命周期 + 消息列表 + 阶段 + 打字状态；persist 到 `keyi-chat-storage`。
- **类型/持久化/阶段函数已在 §4.2 逐字收录**。行为细节：
  - `startSession`：新建 Session（`generateId('session')`、ISO startTime、phase greeting、riskLevel low、messageCount 0），清空 messages；
  - `endSession`：补 endTime 后头插入 sessionHistory，currentSession 置 null；
  - `addUserMessage`：追加消息并 messageCount+1；`addAssistantMessage`：追加并 `isTyping: false`；
  - `setAIResponse`：构造带 `metadata: { phase: response.newPhase, riskLevel: response.riskLevel }` 的 AI 消息，`phase: response.newPhase || get().phase`；
  - `resetChat`：恢复初始（不清 sessionHistory）。
- **边界**：messages/isTyping/phase 不持久化（partialize），刷新即失。

#### `src/stores/userStore.ts`（164 行）
- **职责**：用户信息/偏好/情绪历史；persist 到 `keyi-user-storage`。**类型已在 §4.2 收录**。
- **要点**：`updatePreferences` 同时更新顶层 preferences 与 user.preferences 两处副本；模块级辅助函数 `getUserName()`（store 优先，回退 `keyi_user_name`）、`isFirstVisit()`（`!store.user`）、`hasAgreedTerms()`。
- **边界**：`createPersistStorage<T>()` 的泛型参数 T 未被使用（原样保留）。

#### `src/stores/crisisStore.ts`（245 行）
- **职责**：危机检测与干预状态机。**类型、关键词表、紧急联系人、触发/解除流程均已在 §4.2 与 §6.4 逐字收录**。
- **附加实现**：模块级 `playAlertSound()`（try/catch 双层降级，console.log `'[Crisis] 无法播放警示音'` / `'[Crisis] 警示音不可用'`）；`shouldTriggerIntervention(text)` 仅红表匹配。
- **已知缺陷（原样保留）**：`triggerCrisis` 中 `event.level` 取**触发前**的 riskLevel（通常 'low'），set 之后才变 'high'——事件记录等级偏低；红表含重复项 `'不想活了'`。

#### `src/stores/index.ts`（9 行）
- 桶导出：`useChatStore, determinePhase` / `useUserStore, getUserName, isFirstVisit, hasAgreedTerms` / `useCrisisStore, shouldTriggerIntervention, getEmergencyContacts` + 三个 State 类型。

### 7.4 服务层（5 文件）

#### `src/services/aiService.ts`（260 行）
- **职责**：AI 对话服务类（单例 `aiService` + 类导出）。
- **配置常量（逐字）**：

```ts
const defaultConfig: AIConfig = {
  apiEndpoint: import.meta.env.VITE_AI_API_ENDPOINT || '/api/ai/chat',
  apiKey: import.meta.env.VITE_AI_API_KEY,
  model: 'gpt-4',
  timeout: 30000,
};
```

- **方法结构**：`getResponse`（try：buildRequestBody → *注释掉的* `callAPI`/`parseResponse` → `mockResponse`；catch：`getFallbackResponse`）；`buildRequestBody` 见 §5.2；`getSystemPrompt` 6 段 prompt 见 §6.2；`callAPI`（fetch + Bearer + AbortSignal.timeout，见 §5.2/5.5）；`parseResponse` 桩返回 `{ content: '' }`；`mockResponse` 文案见 §6.3；`getFallbackResponse` 见 §6.3。
- **边界**：构造函数接受 `Partial<AIConfig>` 便于测试注入；`getResponse` 里构建的 requestBody 在 mock 模式下实际未使用（变量赋值后闲置，原样保留）。

#### `src/services/riskService.ts`（265 行）
- **职责**：独立、可配置的风险检测服务（未接线，为接真实后端预留）。
- **关键词/正则/keywordGroups 已在 §6.4 逐字收录**。
- **方法**：`detect(text)` 返回 RiskResult（红/黄命中列表 + 正则命中 → level 判定 → suggestedAction）；`isHighRisk` / `isMediumOrHigher`；`createCrisisEvent(text, sessionId, level)`（支持 eventCallback 回调通知）；`addRedKeywords/addYellowKeywords/addPatterns`（运行时扩表）；`clearKeywords`（测试用）；`setEventCallback`。
- **边界**：正则用原文本 `pattern.test(text)`（不 lower），关键词用 lower 匹配；`matchedKeywords` 只含关键词不含正则命中。

#### `src/services/storageService.ts`（205 行）
- **职责**：localStorage 封装（前缀 `keyi_`、TTL、伪加密）。默认配置见 §4.4。
- **实现要点**：`set` 包裹 `{ value, expires, createdAt }`；`get` 过期即删并返回默认值；`clear/keys` 按前缀过滤；`getMany/setMany` 批量；`getRemainingSpace`（UTF-16 ×2 估算，5MB 基准）与 `isNearLimit`（<1MB）；`encrypt = btoa(encodeURIComponent(data))`、`decrypt` 反向且 catch 后返回原文——**代码注释明确标注为简易实现，实际项目应换 crypto-js / Web Crypto**。
- **边界**：`encrypt: false` 默认关闭；set 失败仅 console.error。

#### `src/services/analyticsService.ts`（386 行）
- **职责**：本地事件追踪与统计（未接线）。事件类型/结构见 §4.4。
- **实现要点**：构造时 `loadEvents()` 从 `keyi_analytics_events` 恢复；`track` 追加事件→`saveEvents`（`slice(-1000)`，写入失败清空数组）→ 发送服务器调用被注释；专用方法 `startSession/endSession/trackMessageSent（含 contentLength 与 hasCrisisKeywords）/trackMessageReceived/trackCrisis（triggerText 截前 100 字符）/trackFeedback/trackPageView`；统计方法 `getChatStatistics/getUserBehavior`（遍历配对 session_start/session_end 求平均时长）；`exportData/clear`。
- **硬编码占位数据（原样保留）**：`calculateTopTopics()` 返回 `{ 工作: 45, 情感: 38, 家庭: 25, 焦虑: 52, 抑郁: 18, 人际关系: 31 }`；`calculateExitPoints()` 返回 `['对话结束页', '首页', '直接关闭浏览器']`。
- 便捷导出：`trackEvent/startAnalyticsSession/endAnalyticsSession`。

#### `src/services/index.ts`（17 行）
- 桶导出四个服务的单例、类及便捷函数（逐字清单见文件，含 `keywordGroups`）。

### 7.5 Hooks（2 文件）

#### `src/hooks/useChat.ts`（272 行）
- **职责**：三个组合 hook——`useChat`（对话全流程）、`useUser`、`useCrisis`；以及模块级 `mockAIResponse`。
- **useChat 流程（sendMessage 七步，注释原样）**：① `crisisStore.detectRisk(content)` 得 riskLevel；② `shouldTriggerIntervention(content)` 为 true 则 `triggerCrisis(content)` 并 return；③ `addUserMessage`；④ `setTyping(true)`；⑤ `await mockAIResponse(...)`（1–2s 随机延迟，文案同 §6.3）；⑥ `determinePhase(messageCount+1)` 后 `setAIResponse({...response, newPhase, riskLevel})`；⑦ catch 时兜底短文案。另含自动滚动 `messagesEndRef`（依赖 messages.length 与 isTyping）。
- **返回值**：状态（messages/isTyping/phase/currentSession/sessionHistory/riskLevel/isCrisisTriggered/countdown）+ 方法（startSession/sendMessage/endSession/resetChat）+ messagesEndRef + getEmergencyContacts。
- **⚠️ 现状**：`useChat`/`useUser`/`useCrisis` 中，页面**只用到了间接依赖**——ChatPage 自己维护本地 state 而未调用 useChat；useUser 被 MoodTracker 使用；useCrisis 被 CrisisManager 使用（而 CrisisManager 未挂载）。复现时原样保留。
- **边界**：`addMood` 中 `mood as any` 类型断言（原样保留）。

#### `src/hooks/index.ts`（1 行）
- `export { useChat, useUser, useCrisis } from './useChat';`

<!-- SECTION 7 (part 1) END -->

### 7.6 页面（3 文件）

#### `src/pages/welcome/index.tsx`（192 行）—— F01 欢迎首页

- **职责**：产品入口页。Logo（🌿 圆形底 + "可意" 标题 + "AI心理陪伴" 副标题）、服务说明入口卡片、称呼输入、"开始聊聊"按钮、隐私承诺、ConsentModal 挂载点。
- **本地 state**：`showConsent`（弹窗开关）、`consentAgreed`（是否已同意）、`userName`（称呼输入值）、`isEntering`（进入中过渡）。
- **`handleStart` 逻辑（逐字要点）**：`setIsEntering(true)` → 若 `userName.trim()` 非空则 `localStorage.setItem('keyi_user_name', userName.trim())` → `setTimeout(() => navigate('/chat/intro'), 800)`。
- **⚠️ 边界**：**同意与否不阻断进入**——即使未点开/未同意 ConsentModal，"开始聊聊"仍可直接进入对话（`consentAgreed` 仅切换说明卡形态：未同意时白色引导卡 `在开始之前，请先了解我们的服务说明和隐私政策` + `约1分钟阅读` + `了解详情 →`；已同意时绿色卡 `已同意服务说明` + `查看详情`）。且**未调用 `userStore.setUserName`/`agreeToTerms`**，只写裸 localStorage 键。
- **动画**：Logo 区 `initial {opacity:0,y:20} → animate {opacity:1,y:0}`，duration 0.6；说明卡 delay 0.2；称呼输入 delay 0.4（仅 opacity）；开始按钮 delay 0.5，且 `isEntering` 时动画到 `opacity:0, y:20`（淡出）。
- **进入中态**：按钮内联 SVG spinner（`animate-spin`）+ 文案 `正在进入...`；正常文案 `开始聊聊`；按钮样式 `w-full py-4 bg-primary-600 text-white rounded-xl shadow-lg active:scale-[0.98]`。
- **文案（逐字）**：称呼输入 placeholder `你想让我怎么称呼你？`、helpText `也可以留空`（用 common `Input` 组件，`size="lg"`、`className="text-center"`）；隐私承诺 `你的对话完全保密`（配锁形 SVG 小图标）。
- **ConsentModal 包裹在 `<AnimatePresence>` 中**，`onAgree` → `setConsentAgreed(true); setShowConsent(false)`。

#### `src/pages/chat/index.tsx`（178 行）—— F03/F04 主对话页

- **职责**：`/chat/intro` 与 `/chat` 共用的对话页；开场白播放、消息列表、AI mock 回复、结束按钮。
- **⚠️ 核心架构事实**：消息用**本地 `useState<Message[]>`**（`MessageBubble.tsx` 导出的本地 Message 类型），**不使用 chatStore.messages**；仅通过 `useChatStore.getState().phase / setPhase` 与 store 交互。**无任何危机检测调用**（`useCrisisStore` 虽被 import 但未使用其方法）。
- **intro 判断**：`const isIntro = window.location.pathname === '/chat/intro';`（直接读 pathname，非路由参数）。
- **开场白 effect**（依赖 `[isIntro, userName]`）：isIntro 时先塞入一条 `typing: true` 空消息 → `setTimeout` **1500ms** 后替换为欢迎语全文（有称呼时前缀 `你好，${userName}。很高兴你来到这里。`，正文见 §6.3）并 `navigate('/chat')`；清理函数 `clearTimeout`。
- **⚠️ 边界**：`userName` 从 `localStorage.getItem('keyi_user_name')` 读取（独立 effect）；开场白 effect 依赖 userName，**userName 就绪会导致 effect 重跑**（残留行为，原样保留）。
- **`handleSendMessage`（useCallback，依赖 `[messages, userName]`）**：① 构造 user Message（`generateId()`）追加入列表；② `setIsTyping(true)`；③ `await aiService.getResponse(content, { messages, phase: useChatStore.getState().phase, userName, messageCount: messages.length })`；④ 成功则追加 assistant 消息，若 `response.newPhase` 则 `useChatStore.getState().setPhase(response.newPhase)`；⑤ catch 则追加固定错误消息 `抱歉，我现在有点不在状态，请再说一次？` 并 `console.error('获取AI响应失败:', error)`；⑥ finally `setIsTyping(false)`。
- **渲染结构**：顶栏（白底、居中 `可意`）→ 消息区（`max-w-lg mx-auto space-y-6`；isIntro 时渲染 `<WelcomeBubble name={userName}/>`；messages.map 渲染 MessageBubble；isTyping 时渲染一条 `id:'typing', typing:true` 的临时气泡；`!isIntro && !isEnded && messages.length > 3` 时渲染 `<EndChatButton/>`；末尾 `messagesEndRef` 锚点 div）→ 底部 `!isEnded && <InputArea onSend={handleSendMessage}/>`。
- **滚动**：effect 依赖 `[messages]`，`messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })`。
- **结束**：`handleEndChat` → `setIsEnded(true); navigate('/closing')`。

#### `src/pages/closing/index.tsx`（186 行）—— F06 结束页

- **职责**：两屏切换（`AnimatePresence mode="wait"`）：告别确认屏 ↔ 反馈收集屏。
- **state**：`showFeedback`、`feedback`（'A'|'B'|'C'|'D'|null）、`customFeedback`、`isSubmitting`。
- **告别屏**：复用 MessageBubble 显示告别语（原文见 §6.3，消息 id `closing-1`）→ delay 1.5s 淡入按钮 `今天的对话结束了` → `setShowFeedback(true)`。
- **反馈屏**：MessageBubble 提问 `今天的对话对你有帮助吗？`（id `feedback-question`）→ 2×2 网格渲染 `feedbackOptions`（逐字见 §6.3；选中态 `border-primary-500 bg-primary-50`）→ 可选 textarea（label `有什么想对我说的吗？（可选）`，placeholder `任何建议或想法...`，rows 3）→ `结束对话` 按钮（`bg-warm-800 text-white`；提交中 spinner + `保存中...`）。
- **`handleEnd` 逻辑**：开头守卫 `if (showFeedback && !feedback) { setShowFeedback(true); return; }`（未选评分时拦截提交）；随后构造 `feedbackData = { rating: feedback, comment: customFeedback, timestamp: new Date().toISOString() }` 仅 `console.log('保存反馈:', feedbackData)`（**不落任何存储**，注释"实际项目中保存到服务器"）；`setTimeout(() => navigate('/'), 500)`。
- **⚠️ 边界**：不调用 `chatStore.endSession`、不写 `SessionFeedback` 类型——反馈数据刷新即丢（见第 10 章 K9）。
- **动画**：两屏均 `initial {opacity:0,y:20} / exit {opacity:0,y:-20}`。

### 7.7 chat 组件（2 文件）

#### `src/components/chat/MessageBubble.tsx`（162 行）

- **职责**：消息气泡（`memo` 包裹）、打字点动画 `TypingContent`、欢迎气泡 `WelcomeBubble`；并导出**本地 Message 接口**（第二处定义，逐字）：

```ts
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  typing?: boolean;
}
```

- **MessageBubble props**：`{ message, showAvatar = true, showTimestamp = true }`。effect 依赖 `[message.id]`：`bubbleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })`。
- **样式规则**：user 侧 `flex-row-reverse`、头像 👤 `bg-warm-200`、气泡 `bg-warm-800 text-white rounded-tr-sm`；assistant 侧头像 🌿 `bg-primary-100`、气泡 `bg-white text-warm-700 border border-warm-100 rounded-tl-sm shadow-sm`；气泡最大宽 `max-w-[75%]`；正文 `text-sm leading-relaxed whitespace-pre-wrap`（文案中的 `\n` 换行靠此生效）；时间戳 `formatTime(message.timestamp)`。
- **入场动画**：`initial {opacity:0, y:20, scale:0.95} → animate {opacity:1, y:0, scale:1}`，duration 0.4，ease 'easeOut'。
- **TypingContent**：3 个 `w-2 h-2 bg-warm-400 rounded-full` 圆点，`animate {y:[0,-6,0], opacity:[0.5,1,0.5]}`，duration 0.8，`repeat: Infinity`，`delay: i * 0.15`。
- **WelcomeBubble**：AI 头像 + 三段 `<p>`（文案同 §6.3 开场白，分三段渲染，有称呼时首段 `你好，{displayName}。很高兴你来到这里。`），气泡 `max-w-[85%]`，动画 delay 0.2。**⚠️ 与 ChatPage 的开场白消息并存**——isIntro 时页面同时渲染 WelcomeBubble 和 1.5s 后的欢迎消息（视觉上重复两条，复现时保留该冗余）。

#### `src/components/chat/InputArea.tsx`（199 行）

- **职责**：`InputArea`（快捷短语 + 语音占位按钮 + 自增长 textarea + 发送按钮）与 `EndChatButton`。
- **props**：`{ onSend, disabled = false, placeholder = '想说什么都可以...', autoFocus = false }`。
- **自增长**：effect 依赖 `[value]`——先 `height='auto'` 再 `height=Math.min(scrollHeight, 120)px`；textarea `rows={1}`，行内样式 `minHeight: '48px', maxHeight: '120px'`。
- **键盘**：Enter 发送（`!e.shiftKey` 时 `preventDefault()` + submit），Shift+Enter 换行。
- **快捷短语（逐字）**：`['我最近心情不太好', '想聊聊工作', '不知道从何说起', '有点焦虑']`；仅 `!value.trim()` 时显示（AnimatePresence 高度折叠 `height: 0 ↔ 'auto'`）；点击后 `setValue(phrase)` 并聚焦。
- **语音按钮**：纯占位（麦克风 SVG，无 onClick），`aria-label="语音输入"`。
- **发送按钮**：`disabled={!value.trim() || disabled}`；可用态 `bg-primary-600 text-white shadow-md`，禁用态 `bg-warm-200 text-warm-400 cursor-not-allowed`；`aria-label="发送消息"`；纸飞机 SVG。
- **EndChatButton**：`motion.button`（`initial/exit {opacity:0,y:20}`），文案 `今天就到这里`，样式 `mx-auto mt-4 text-xs text-warm-400 hover:text-warm-600`。

### 7.8 welcome 组件（1 文件）

#### `src/components/welcome/ConsentModal.tsx`（120 行）—— F02

- **职责**：知情同意弹窗，两态：简短介绍 → 完整说明（`showFull`）；勾选复选框后"继续"按钮才可用。
- **CONSENT_ITEMS 常量**：5 条（🤖我的身份/💬我能做的/🚫我不能做的/🔒你的隐私/🆘紧急情况），原文已逐字收录于 §6.3，第 5 条 content 为 `如果出现自伤/自杀风险，我会立即提供危机干预资源`。
- **交互**：初始态显示 `在我们开始之前，请允许我简短地介绍自己：` + `查看完整说明 →` 按钮；showFull 后列出 5 条 + 底部同意区（checkbox `我理解并同意以上内容` + `继续` 按钮，`disabled={!agreed}`）；`handleAgree` 仅当 agreed 时 `onAgree(); onClose();`。
- **实现**：基于 common `Modal`（`title="服务说明"`，`size="md"`，`className="overflow-hidden"`）。
- **⚠️ 边界**：同意状态仅存在于 WelcomePage 组件 state，**未持久化**（`userStore.agreeToTerms` 从未被调用），刷新即失。

### 7.9 crisis 组件（4 文件，全部未挂载到页面）

#### `src/components/crisis/CrisisManager.tsx`（53 行）

- **职责**：危机 UI 编排包装器：`<RiskBanner/> + {children} + 条件渲染 <CrisisModal/>`。
- **逻辑**：`useCrisis()` 取状态；effect 监听 `crisis.isTriggered` 为 true 时 `setShowModal(true)`；`handleCloseModal` = `setShowModal(false); crisis.dismiss()`（useCallback 依赖 `[crisis]`）。
- **⚠️ 现状**：设计意图是包裹 ChatPage（`<CrisisManager><ChatPage/></CrisisManager>`），但 router 中**未使用**。复现时原样保留未接线状态（接线为第 9 章可选步骤）。

#### `src/components/crisis/CrisisModal.tsx`（134 行）—— F09

- **职责**：全屏危机干预弹窗（`fixed inset-0 bg-black z-50`），不可最小化、倒计时锁定。
- **props**：`{ countdown: number; onClose: () => void }`——**倒计时数值由外部传入**（来自 crisisStore.countdown），组件自身不计时。
- **结构**：红色警告头（⚠️ 图标心跳动画 + `紧急情况` / `请立即寻求帮助`）→ 主文案 `根据你描述的情况，我们非常担心你的安全。`（`<br/>`）`这已经超出了我能帮助的范围。` → `getEmergencyContacts()` 渲染热线卡片（`<a href={contact.action}>` 即 `tel:` 链接；`bg-white/10 backdrop-blur`；入场 `x:-20→0`，delay `0.2 + index * 0.1`）→ 安抚卡（`你不是一个人` / `帮助是存在的，请让别人知道你现在的状态`）→ 关闭按钮。
- **关闭按钮逻辑（逐字要点）**：`animate={{ opacity: countdown === 0 ? 1 : 0 }}`；文案 countdown>0 时为 `${minutes}:${seconds.toString().padStart(2, '0')} 后可关闭`，否则 `我理解了（关闭）`；`minutes = Math.floor(countdown / 60)`、`seconds = countdown % 60`。
- **ESC 拦截**：effect 注册 window keydown，`e.key === 'Escape'` 时 `preventDefault()`。
- **内容延迟显示**：`setTimeout(() => setShowContent(true), 300)`（等入场动画）。
- **⚠️ 边界**：countdown>0 时关闭按钮 opacity 为 0 但**仍可点击**（未 disabled、未挡 pointer-events）；且 store 的 `decrementCountdown` 无 interval 驱动（见第 10 章 K6/K7）。

#### `src/components/crisis/RiskBanner.tsx`（100 行）—— F10

- **职责**：中/高风险横幅。`level === 'low'` 直接 `return null`。
- **config（逐字要点）**：medium `{ icon:'⚠️', bg:'bg-warning-50', border:'border-warning-200', text:'text-warning-700', title:'我注意到你提到了一些让人担心的事' }`；high `{ icon:'🆘', bg:'bg-danger-50', border:'border-danger-200', text:'text-danger-700', title:'我非常担心你的安全' }`。
- **交互**：叉按钮 → `setIsVisible(false); onDismiss()`；level 变化（≠low）时 effect 重新 `setIsVisible(true)`；AnimatePresence 高度折叠动画（duration 0.3）。
- **⚠️ 注释写"自动隐藏"但实际无任何定时隐藏逻辑**（原样保留）。

#### `src/components/crisis/index.ts`（3 行）

- `export { CrisisManager } from './CrisisManager';` + `export { CrisisModal } from './CrisisModal';` + `export { RiskBanner } from './RiskBanner';`

### 7.10 resources 组件（4 文件，全部未挂载到页面）

#### `src/components/resources/BreathingExercise.tsx`（283 行）—— F11

- **职责**：4-7-8 呼吸练习（圆形缩放 + SVG 进度环 + 阶段文案），附 `QuickBreathing` 折叠入口。
- **类型与配置（逐字）**：

```ts
type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const defaultConfig: BreathingConfig = {
  inhaleDuration: 4000,
  holdDuration: 7000,
  exhaleDuration: 8000,
  cycles: 3,
};
```

- **主循环**：`isActive` 时 async `runCycle`——for 循环 `cycles` 次：`animatePhase('inhale', ...)` → `setCycle(i+1)` → `animatePhase('hold', ...)` → `animatePhase('exhale', ...)`；结束调 `complete()`（重置并 `onComplete?.()`）；`stop()` 清定时并 `onCancel?.()`。
- **animatePhase**：Promise 包装的 `requestAnimationFrame` 循环，按 `elapsed/duration` 更新 `progress`（0→1）。**⚠️ 类型混用**：`timeoutRef` 声明为 `ReturnType<typeof setTimeout> | null` 却被赋 `requestAnimationFrame` 返回值、用 `clearTimeout` 清理（原样保留，勿"修复"）。
- **缩放规则**：idle→1；inhale→`1 + progress * 0.5`；hold→1.5；exhale→`1.5 - progress * 0.5`；外圈另 ×1.2、idle 时 opacity 0.5。
- **进度环**：SVG circle `cx=96 cy=96 r=92 strokeWidth=4`，`strokeDasharray={579}`，`strokeDashoffset={579 * (1 - progress)}`，容器 `-rotate-90`。
- **文案（逐字）**：阶段名 `准备`/`吸气`/`屏住`/`呼气`；提示 `准备好了吗？` 或 `${Math.ceil(duration / 1000)} 秒...`；轮次 `第 {cycle} / {cycles} 轮`；按钮 `开始练习`/`跳过`/`停止`；底注 `4-7-8 呼吸法可以帮助放松身心，缓解焦虑。`
- **QuickBreathing**：折叠按钮 `🫁 试试呼吸练习`（`bg-primary-50 text-primary-700`），展开后 `<BreathingExercise config={{ cycles: 1 }}/>`。

#### `src/components/resources/GroundingExercise.tsx`（232 行）—— F12

- **职责**：5-4-3-2-1 着陆练习（5 步分步交互），附 `QuickGrounding`。
- **defaultSteps（逐字要点）**：5 步 `{label, icon, items, color}`——`看到的`👁️`5个你能看到的东西`(blue)；`触摸的`✋`4个你能触摸到的东西`(green)；`听到的`👂`3个你能听到的声音`(yellow)；`闻到的`👃`2个你能闻到的气味`(orange)；`感受`💭`1个你现在的感受`(purple)。color 结构 `{ bg:'bg-blue-50', border:'border-blue-200', text:'text-blue-700' }` 按色系类推。
- **交互**：进度指示器 5 圆点（完成✓`bg-primary-500 text-white`、当前 `bg-primary-100 ring-2 ring-primary-300`、未到 `bg-warm-100 text-warm-400`）；每步提示 `{step.items[0]}，然后慢慢告诉我你注意到了什么。` + textarea（placeholder `在这里写下你注意到的事物...`，**输入不校验不保存**，仅引导）；`继续`/最后一步 `完成` 推进（`completeStep` 记录 completedSteps），`跳过` 跳步（最后一步跳过触发 `onCancel`）；有完成步骤后显示 `重新开始`（`reset`）；底注 `着陆技术可以帮助你从焦虑中平静下来，回到当下。`
- **动画**：步骤卡 `AnimatePresence mode="wait"`，`x: 20 → 0 → -20`。
- **QuickGrounding**：折叠按钮 `🌿 试试着陆练习`（green 色系）。

#### `src/components/resources/MoodTracker.tsx`（289 行）—— F13

- **职责**：情绪日记（紧凑/展开两态）+ `MoodHistory` 历史列表；**全项目唯一实际消费 `useUser` hook 的组件**。
- **本地 MoodType**（与 types/chat.ts 重复定义，7 值相同——第三处类型重复点，原样保留）。**moodConfig（逐字要点）**：happy 😊`开心`(green) / calm 😌`平静`(blue) / neutral 😐`一般`(warm) / anxious 😰`焦虑`(yellow) / sad 😔`难过`(indigo) / angry 😤`生气`(red) / overwhelmed 😵`疲惫`(purple)，各含 `{ emoji, label, color:'text-X-600', bg:'bg-X-50 border-X-200' }`。
- **紧凑态**：标题 `今天感觉如何？` + `记录 →`；快速选择前 5 种情绪（`slice(0, 5)`）圆形按钮（hover scale-110）；保存成功绿色提示 `已记录今天的情绪 ✓`（2s 后重置 state）。
- **展开态**：标题 `记录今天的情绪`，`grid-cols-4` 7 情绪（选中 `ring-2 ring-primary-400 scale-105`）；选中后出现备注 textarea（label `想说什么？（可选）`，placeholder `今天发生了什么事...`）；`取消`/`保存` 按钮（未选情绪时保存禁用）。
- **保存**：`addMood({ mood: selectedMood, note: note || undefined })`（经 useUser → userStore.addMoodEntry，头插保留 30 条）+ `onSave?.({ mood, note })` 回调。
- **MoodHistory**：`{ limit = 7 }`；空态 `📊 还没有情绪记录`；列表项 emoji + label + note（truncate）+ `date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })`；`moodConfig[entry.mood as MoodType] || moodConfig.neutral` 兜底。
- **⚠️ 边界**：`MoodTracker` 解构了 `moodHistory` 但主体未使用（仅 MoodHistory 用）。

#### `src/components/resources/index.ts`（3 行）

- 桶导出：`BreathingExercise, QuickBreathing` / `GroundingExercise, QuickGrounding` / `MoodTracker, MoodHistory`。

### 7.11 common 组件（5 文件）

#### `src/components/common/Button.tsx`（149 行）

- **导出**：`Button`（forwardRef）+ `LoadingButton`（`motion(forwardRef(...))` 包装，props 增 `loadingText = '加载中...'`，内部渲染 `<Button loading disabled>`）。
- **ButtonProps**：`variant?: 'primary'|'secondary'|'ghost'|'danger'`、`size?: 'sm'|'md'|'lg'`、`loading/disabled/children/icon/iconPosition('left'|'right')/fullWidth`。
- **样式规格**：base `inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 active:scale-[0.98]`；primary `bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg`；secondary `bg-primary-100 text-primary-700 hover:bg-primary-200`；ghost `text-primary-600 hover:bg-primary-50`；danger `bg-danger-500 text-white hover:bg-danger-600`。sizes：sm `px-3 py-1.5 text-sm` / md `px-5 py-3 text-sm` / lg `px-6 py-4 text-base`。
- **loading 态**：spinner SVG + `加载中...`；`disabled={disabled || loading}`。**⚠️ `{...(props as any)}` 类型断言原样保留**（motion 与 button 事件类型冲突的规避写法）。
- **⚠️ 现状**：页面均手写 `<button>`，Button 实际未被页面引用（组件库完备性资产）。

#### `src/components/common/Input.tsx`（205 行）

- **导出**：`Input`（forwardRef，props = `Omit<InputHTMLAttributes,'size'>` + `label/error/helpText/size('sm'|'md'|'lg')/loading/leftIcon/rightIcon`）与 `Textarea`（`label/error/helpText/autoResize`——**⚠️ autoResize 声明未实现**）。
- **要点**：`useId()` 生成 id 关联 label；sizes = sm `px-3 py-2 text-sm` / md `px-4 py-3 text-sm` / lg `px-5 py-4 text-base`；error 态 `border-danger-300 focus:ring-danger-200 focus:border-danger-400`；leftIcon 加 `pl-10`、rightIcon 加 `pr-10`；loading 时右侧 spinner；底部单行提示 `error || helpText`（error 优先，`text-danger-500` vs `text-warm-400`）。
- **被使用处**：仅 WelcomePage 称呼输入用 `Input`；`Textarea` 无人使用。

#### `src/components/common/Modal.tsx`（296 行）

- **导出**：`Modal` 与 `ConfirmModal`。
- **ModalProps**：`isOpen/onClose/title/children/footer/size('sm'|'md'|'lg'|'xl'|'full')/closeOnOverlayClick=true/showCloseButton=true/hasOverlay=true/position('center'|'bottom')/className`。
- **行为**：ESC 关闭（document keydown）；打开时 `document.body.style.overflow = 'hidden'`，清理复原；点击遮罩（`e.target === e.currentTarget` 且 closeOnOverlayClick）关闭；`role="dialog" aria-modal="true"`。
- **动画（逐字要点）**：遮罩 opacity 0↔1（`bg-black/40 backdrop-blur-sm`）；弹窗 variants——hidden `{ opacity:0, y: position==='bottom' ? '100%' : 20, scale:0.95 }`，visible spring `{ type:'spring', damping:25, stiffness:300 }`，exit `{ duration: 0.2 }`；variants 需 `as MotionProps['variants']` 断言。sizes：sm `max-w-sm`/md `max-w-md`/lg `max-w-lg`/xl `max-w-xl`/full `max-w-[90vw]`；容器 `rounded-t-3xl sm:rounded-3xl max-h-[90vh]`；footer 区 `bg-warm-50 rounded-b-3xl`。
- **ConfirmModal**：默认 `title='确认操作'/content='确定要执行此操作吗？'/confirmText='确定'/cancelText='取消'/variant('danger'|'primary')/loading`；圆形警示图标 + 双按钮（loading 时 `处理中...`）。**无人使用**。
- **被使用处**：仅 ConsentModal 使用 `Modal`。

#### `src/components/common/Loading.tsx`（139 行）

- **导出 5 个**：`Spinner`（size sm/md/lg = h-4/h-6/h-8，color primary/white/gray）、`LoadingText`（Spinner sm + 文本，默认 `加载中...`）、`FullPageLoader`（`fixed inset-0 bg-warm-50 z-50` 全屏）、`Skeleton`（variant text/circular/rectangular，`animate-pulse bg-warm-200`，text 默认高 `1em`）、`MessageBubbleSkeleton`（32×32 圆形头像骨架 + 矩形气泡骨架）。**全部未被页面使用**。

#### `src/components/common/index.ts`（4 行）

- 桶导出：`Button, LoadingButton` / `Input, Textarea` / `Modal, ConfirmModal` / `Spinner, LoadingText, FullPageLoader, Skeleton, MessageBubbleSkeleton`。

### 7.12 第 7 章覆盖统计

共精讲 **37 个业务文件**：入口 3（main/App/router）+ 样式 1（index.css，详见 8.4）+ 类型 2 + 工具 1 + stores 4 + services 5 + hooks 2 + pages 3 + components 16（chat 2 / welcome 1 / crisis 4 / resources 4 / common 5）。

<!-- SECTION 7 END -->

---

## 8. UI 与交互

### 8.1 wouter 路由表（`src/router.tsx` 逐字收录）

```tsx
import { Route, Switch, useLocation } from 'wouter';
import WelcomePage from '@/pages/welcome';
import ChatPage from '@/pages/chat';
import ClosingPage from '@/pages/closing';

/**
 * 路由配置
 */
export function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/chat/intro" component={ChatPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/closing" component={ClosingPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-primary-50">
          <p className="text-warm-600">页面未找到</p>
        </div>
      </Route>
    </Switch>
  );
}

// 导出 navigate 用于编程式导航
export const navigate = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
```

要点：兜底路由渲染 `页面未找到`；`useLocation` 被 import 但未使用（原样保留）；编程式导航全靠手写 `navigate`（pushState + 手动派发 popstate 让 wouter 感知路径变化）。

### 8.2 页面状态机

```
[/] WelcomePage
  ├─ (可选) 点说明卡 → ConsentModal(简介态 → 完整态 → 勾选 → 继续) → consentAgreed=true
  └─ 开始聊聊 → isEntering(800ms) → navigate('/chat/intro')

[/chat/intro] ChatPage(isIntro=true)
  └─ typing 气泡(1500ms) → 欢迎语替换 + navigate('/chat')

[/chat] ChatPage
  ├─ 发送消息 ⇄ isTyping(等待 aiService.getResponse)
  ├─ messages.length > 3 → 显示"今天就到这里"
  └─ 点击结束 → isEnded=true → navigate('/closing')

[/closing] ClosingPage
  ├─ 告别屏(1.5s 后出现"今天的对话结束了") → showFeedback=true
  └─ 反馈屏(选 A/B/C/D + 可选评论) → 结束对话 → console.log → 500ms → navigate('/')

[危机分支·未接线] 用户输入 → detectRisk → red 命中 → CrisisModal(180s 锁定) → 倒计时归零 → 可关闭
```

### 8.3 framer-motion 动画要点总表

| 位置 | 动画 | 参数 |
|------|------|------|
| WelcomePage Logo/卡片/输入/按钮 | 淡入上移 | duration 0.6，delay 0/0.2/0.4/0.5 阶梯 |
| MessageBubble 入场 | opacity+y+scale | `{opacity:0,y:20,scale:0.95}→{1,0,1}`，0.4s easeOut |
| TypingContent 三点 | y 弹跳 + 呼吸 | `y:[0,-6,0]` `opacity:[0.5,1,0.5]`，0.8s 无限循环，delay i×0.15 |
| InputArea 快捷短语 | 高度折叠 | `height: 0 ↔ 'auto'`（AnimatePresence） |
| Modal | 遮罩淡入 + 弹窗 spring | spring damping 25 / stiffness 300；exit 0.2s |
| ClosingPage 两屏切换 | AnimatePresence mode="wait" | `y: 20 → 0 → -20` |
| CrisisModal ⚠️ 图标 | 心跳缩放 | `scale:[1,1.2,1]`，1s 无限循环 |
| CrisisModal 热线卡 | 逐条滑入 | `x:-20→0`，delay 0.2+i×0.1 |
| RiskBanner | 高度折叠 | 0.3s |
| BreathingExercise 圆 | scale 跟随 progress | 外圈 ×1.2，transition 0.3s；进度环 strokeDashoffset |
| GroundingExercise 步骤卡 | 水平切换 | `x: 20 → 0 → -20`，mode="wait" |
| MoodTracker 保存提示 | 淡入淡出 | `y: 10 → 0 → -10` |

### 8.4 样式约定（`src/index.css` @theme 逐字收录）

Tailwind v4：`@import "tailwindcss";` + `@theme` 块定义色板（无 tailwind.config.js）：

```css
@theme {
  /* 温暖色调主题 */
  --color-primary-50: #fdf8f5;
  --color-primary-100: #f5ebe0;
  --color-primary-200: #e8d5c4;
  --color-primary-300: #d4b496;
  --color-primary-400: #c09878;
  --color-primary-500: #a67c52;
  --color-primary-600: #8b6242;
  --color-primary-700: #6b4a35;
  --color-primary-800: #5a3d2e;
  --color-primary-900: #4a3328;

  /* 中性色 - 温暖灰 */
  --color-warm-50: #faf9f7;
  --color-warm-100: #f5f3ef;
  --color-warm-200: #ebe6dd;
  --color-warm-300: #d9d2c5;
  --color-warm-400: #b8afa0;
  --color-warm-500: #979081;
  --color-warm-600: #7a7266;
  --color-warm-700: #605a4e;
  --color-warm-800: #4e483e;
  --color-warm-900: #403a33;

  /* 安全状态色 */
  --color-safe-50: #f0fdf4;
  --color-safe-100: #dcfce7;
  --color-safe-500: #22c55e;
  --color-safe-600: #16a34a;

  /* 警告状态色 */
  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;

  /* 危险状态色 */
  --color-danger-50: #fef2f2;
  --color-danger-100: #fee2e2;
  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;
}
```

**全局样式要点**（同文件，规格化）：
- 通配 reset（margin/padding 0 + border-box）；html `font-size: 16px` + 字体平滑；
- body 字体栈：`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`；`line-height: 1.6`；`color: var(--color-warm-800)`；`background-color: var(--color-warm-50)`；`min-height: 100vh`；
- input/textarea/button 继承字体；button 去边框背景加 pointer；a 继承色去下划线；
- 自定义滚动条：宽/高 6px、thumb `--color-warm-300` 圆角 3px、hover `--color-warm-400`、track 透明；
- keyframes：`fadeIn`（0.3s）、`slideUp`/`slideDown`（±20px，0.4s）、`typing`（opacity 1↔0.5，1.5s 无限），对应类 `.animate-fadeIn/.animate-slideUp/.animate-slideDown/.animate-typing`（均未被组件使用，framer-motion 接管了动画）；
- **`scrollbar-hide` 类被 InputArea 使用但从未定义**（无效类名，无视觉影响，原样保留）。

**布局约定**：移动端优先，内容列宽 `max-w-lg mx-auto`（对话/结束页）与 `max-w-xs`/`max-w-md`（欢迎页卡片/练习组件）；页面骨架 `h-screen flex flex-col`（chat）或 `min-h-screen`（welcome/closing）；圆角体系 rounded-xl（按钮/输入）/ rounded-2xl（卡片气泡）/ rounded-full（头像圆点）。

<!-- SECTION 8 END -->

---

## 9. 从零复现步骤

> 本章为编号执行手册。每一步给出**操作**与**验收标准**；验收标准与第 1 章 F01–F18 功能清单一一对应。所有代码细节（类型定义、prompt、store、组件实现）在第 4–8 章均已逐字或规格化给出，本章只指路不重复贴码。
>
> **复现总则**：
> 1. 严格按步骤顺序执行（类型 → 工具 → store → service → hook → 组件 → 页面 → 路由）。
> 2. 未接线模块（F08–F13、F16、F17）**照写但不挂载**——复现目标是当前仓库状态，不是理想状态。若需接线，见 9.15 可选步骤。
> 3. 全程不需要任何后端：aiService 处于 mock 模式，`getResponse` 内对 `callAPI`/`parseResponse` 的调用保持注释状态。
> 4. 文档所在项目根不是 git 仓库；git 仓库在 `frontend/` 内。复现时可 `git init` 于 frontend/，也可完全不使用 git。

**模块依赖关系图**（箭头方向 = 被依赖，决定了步骤顺序）：

```
types/chat.ts
  ├──◀─ stores/（chatStore/userStore/crisisStore）
  │     └──◀─ services/aiService（import determinePhase from '@/stores'）
  ├──◀─ services/（riskService/storageService/analyticsService）
  └──◀─ hooks/useChat（依赖 stores + services）

utils/helpers.ts（cn）
  └──◀─ 几乎全部 components/*

components/common/*
  └──◀─ components/welcome/crisis/resources、pages/*

components/chat/MessageBubble（本地 Message 类型）
  └──◀─ pages/chat（消息类型的实际来源，见 K1）

router.tsx（navigate）
  └──◀─ pages/welcome/chat/closing（编程式跳转）

App.tsx ← router.tsx；main.tsx ← App.tsx + index.css
```

### 步骤 1：环境准备

**操作**：安装 Node.js ≥ 20.19（Vite 7 要求 20.19+/22.12+），npm ≥ 10。

**验收**：`node -v` 输出 ≥ v20.19；`npm -v` 正常输出。

### 步骤 2：脚手架与依赖安装

**操作**：
1. 创建目录结构：项目根 `心理医生可益2.01/`，其下 `frontend/`；
2. 在 `frontend/` 内按第 2.1 节**逐字**写入 `package.json`：`name "frontend"`、`private true`、`version "0.0.0"`、`type "module"`；dependencies：@tailwindcss/vite ^4.1.18、clsx ^2.1.1、framer-motion ^12.34.0、react ^19.2.0、react-dom ^19.2.0、tailwind-merge ^3.4.0、tailwindcss ^4.1.18、wouter ^3.9.0、zustand ^5.0.11；devDependencies：@eslint/js ^9.39.1、@types/node ^24.10.1、@types/react ^19.2.7、@types/react-dom ^19.2.3、@vitejs/plugin-react ^5.1.1、eslint ^9.39.1、eslint-plugin-react-hooks ^7.0.1、eslint-plugin-react-refresh ^0.4.24、globals ^16.5.0、typescript ~5.9.3、typescript-eslint ^8.48.0、vite ^7.3.1；scripts：dev `vite`、build `tsc -b && vite build`、lint `eslint .`、preview `vite preview`；
3. `npm install`。

**验收**：`node_modules/` 生成且无 peer 冲突报错；`npx vite --version` 输出 7.3.x；`package.json` 与 §2.1 逐字 diff 为零（注意：**tailwindcss/@tailwindcss/vite/tailwind-merge 在 dependencies 而非 devDependencies**，这是原仓库真实状态）。

### 步骤 3：构建配置

**操作**：按第 2.2/2.3 节写入：
1. `vite.config.ts`：逐字见 §2.2——plugins `[react(), tailwindcss()]` + `resolve.alias { '@': path.resolve(__dirname, './src') }`（**无 server 配置项，用 Vite 默认端口 5173**）；
2. `tsconfig.json`（引用 app/node 两个子配置）、`tsconfig.app.json`（`baseUrl: '.'`、`paths: { '@/*': ['./src/*'] }`、strict、verbatimModuleSyntax）、`tsconfig.node.json`；
3. `index.html`：Vite 模板默认结构——`<div id="root">`、`<script type="module" src="/src/main.tsx">`、title 保持模板默认值 `frontend`、`lang="en"`（**原样保留，未汉化**，见第 3 章目录树注释）；
4. 环境变量：仓库中**没有** `.env`/`.env.example` 文件——`VITE_AI_API_ENDPOINT`、`VITE_AI_API_KEY`（键名见第 2 章环境变量表，值一律 `<占位>`）仅被 aiService 读取，未配置时回退 `'/api/ai/chat'` 与 undefined；复现时**不创建**任何 env 文件。

**验收**：`npm run dev` 能启动空白页（默认 `http://localhost:5173/`）且无编译错误（此时 main.tsx 可暂用最小占位）。

### 步骤 4：类型层（对应 F14 前置）

**操作**：创建 `src/types/chat.ts`，逐字实现第 4.1 节的类型：`MessageRole`、`ConversationPhase`（6 阶段）、`RiskLevel`、`Message`、`QuickReply`、`ConversationState`、`RiskAssessment`、`MoodType`、`MoodRecord`、`UserProfile`、`FeedbackData`。

**验收**：`npx tsc --noEmit` 通过；类型与第 4.1 节逐字一致（含 `Message.metadata` 可选字段）。

### 步骤 5：常量与文案分布确认（重要：本项目**没有** `constants/` 目录）

**操作**：无独立建文操作，仅确认认知——本项目所有"常量类资产"都内联在宿主文件中，复现时**不得**新建 `src/constants/` 目录：
1. 6 段阶段 system prompt：内联于 `services/aiService.ts` 私有方法 `getSystemPrompt(phase)`（原文逐字见第 6.2 节）；
2. 危机关键词 `RED_KEYWORDS`（含重复项 `'不想活了'` 出现两次——**原样保留**）/`YELLOW_KEYWORDS`：模块级常量，位于 `stores/crisisStore.ts`；`services/riskService.ts` 另有一套独立的 keywordGroups/正则（逐字见 6.4）；
3. 热线表：内联于 `stores/crisisStore.ts`（`心理危机热线 400-161-9995`、`北京心理危机干预中心 010-82951332`/`tel:01082951332` 等，逐字见 6.3/6.4）；
4. 倒计时常量：`countdown: 180`（注释 `// 3分钟`）字面量，出现于 crisisStore 初始态与多处 reset；
5. API 配置：`services/aiService.ts` 的 `defaultConfig`（`apiEndpoint: import.meta.env.VITE_AI_API_ENDPOINT || '/api/ai/chat'`、`apiKey: import.meta.env.VITE_AI_API_KEY`、`model: 'gpt-4'`、`timeout: 30000`）。

**验收**：`src/constants/` 不存在；上述常量在对应宿主文件中与第 6 章逐字一致；无任何真实 API key 出现在代码中。

### 步骤 6：工具层

**操作**：`src/utils/helpers.ts`：8 个纯函数——`cn`（`twMerge(clsx(inputs))`，clsx + tailwind-merge 双层包装）、`generateId`（`` `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` ``，prefix 默认 `'id'`）、`formatTime`（`toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'})`）、`formatDate`、`delay`、`capitalize`、`truncate`、`isEmpty`（规格逐一见 7.4 节）。

**验收**：所有组件的 `import { cn } from '@/utils/helpers'` 可解析。

### 步骤 7：状态层（F07、F14）

**操作**：按第 4.2–4.4 节逐字实现三个 store：
1. `src/stores/chatStore.ts`：`ChatState` 接口 + `determinePhase`（<3 listening / <8 exploring / <15 guiding / <25 intervention / ≥25 closing）+ persist `keyi-chat-storage`（partialize 只存 messages/phase/sessionStartTime）；
2. `src/stores/userStore.ts`：`UserState` + persist `keyi-user-storage`（全量）；
3. `src/stores/crisisStore.ts`：`CrisisState`（riskLevel/isModalOpen/countdown/detectRisk/decrementCountdown 等），**不持久化**；`detectRisk` 命中红色词 → `riskLevel='high'` + 打开弹窗 + countdown=180。

**验收（F07/F14）**：在浏览器 console 手动调用 store：连续 addMessage 3/8/15/25 条后 `phase` 依次变为 exploring→guiding→intervention→closing（注意 determinePhase 以用户消息数为准，见 4.2 节）；刷新页面后 localStorage 中存在 `keyi-chat-storage`、`keyi-user-storage` 两键；`crisisStore.getState().detectRisk('我想自杀')` 返回 high 且 `isModalOpen === true`。

### 步骤 8：服务层（F15、F16、F17、F08 后半）

**操作**：按第 5 章与 7.5 节实现：
1. `src/services/aiService.ts`：`AIService` 类（构造函数接受 `Partial<AIConfig>`），方法结构：`getResponse`（try：`buildRequestBody` → *注释掉的* `callAPI`/`parseResponse` → `mockResponse`；catch：`getFallbackResponse`）、`buildRequestBody`（OpenAI 风格 body `{model:'gpt-4', messages:[system+历史+user], temperature:0.7, max_tokens:1000}`，逐字见 §5.2）、`getSystemPrompt`（6 段 prompt 逐字见 §6.2）、`callAPI`（fetch + `Authorization: Bearer` + `AbortSignal.timeout(30000)`——**调用处保持注释**）、`parseResponse` 桩（返回 `{ content: '' }`）、`mockResponse`（关键词分支：焦虑/紧张、难过/伤心、工作/上班、谢谢/再见，文案逐字见 §6.3，**无人工延迟**）、`getFallbackResponse`；尾部导出单例 `aiService` 与类 `AIService`；
2. `src/services/riskService.ts`：`assessRisk(text)` → `RiskAssessment`（关键词 + 正则双通道，红>黄优先级）；
3. `src/services/storageService.ts`：前缀 `keyi_`、TTL 包装、Base64 伪加密（`btoa/atob`）——**写完不接**；
4. `src/services/analyticsService.ts`：事件队列 + console 输出——**写完不接**。

**验收（F15）**：console 调用 `aiService.getResponse('我有点焦虑', { messages: [], phase: 'greeting', userName: '', messageCount: 0 })` 立即 resolve 出焦虑分支 mock 文案（此层无人工延迟，页面的"打字感"由 isTyping 状态提供）；异常路径返回兜底文案 `抱歉，我现在有点不在状态，请再说一次？\n\n或者我们可以先休息一下。`。**验收（F16/F17）**：全局搜索确认这两个 service 没有任何页面/组件 import（保持未接线）。

### 步骤 9：Hook 层

**操作**：`src/hooks/useChat.ts`：实现 `useChat`/`useUser`/`useCrisis` 三个 hook（双轨 mock 逻辑见 7.5 节），`src/hooks/index.ts` 桶导出。**注意：页面不使用它们，照写不接。**

**验收**：tsc 通过；`grep -r "useChat" src/pages` 无结果。

### 步骤 10：通用组件（F18）

**操作**：按第 7.11 节实现 `components/common/`：`Button.tsx`（4 变体×3 尺寸+loading+icon）、`Input.tsx`（Input/Textarea，Textarea 的 `autoResize` prop 声明但**不实现**——原样保留）、`Modal.tsx`（Modal+ConfirmModal，spring damping 25/stiffness 300）、`Loading.tsx`（Spinner/LoadingText/FullPageLoader/Skeleton/MessageBubbleSkeleton）、`index.ts` 桶导出。

**验收（F18）**：Storybook 式手测不需要；tsc 通过 + ChatPage/ClosingPage 中 Button 可正常渲染即算达标。

### 步骤 11：业务组件（F02、F05、F08–F13 组件半区）

**操作**：按第 7.7–7.10 节实现：
1. `components/chat/MessageBubble.tsx`（含**本地重复定义的 Message 接口**——原样保留，勿改为 import types/chat；同文件内导出打字指示内容 TypingContent 与欢迎气泡 WelcomeBubble）与 `InputArea.tsx`（快捷短语条、Enter 发送/Shift+Enter 换行、`scrollbar-hide` 未定义类原样写上；同文件导出 EndChatButton）——**chat/ 目录仅此两文件，无 index.ts 桶导出**；
2. `components/welcome/ConsentModal.tsx`（5 条服务说明 + 复选框，文案逐字见 7.8）；
3. `components/crisis/`：`CrisisManager.tsx`、`CrisisModal.tsx`（180 秒倒计时锁定、ESC preventDefault、右上角 `opacity-0` 隐形关闭按钮——原样保留）、`RiskBanner.tsx`；**均不挂载**；
4. `components/resources/`：`BreathingExercise.tsx`（4-7-8 配置 `{inhaleDuration:4000, holdDuration:7000, exhaleDuration:8000, cycles:3}`、进度环 strokeDasharray 579）、`GroundingExercise.tsx`（5-4-3-2-1 分步）、`MoodTracker.tsx`（7 情绪 + 本地第三份 MoodType 定义原样保留）、`index.ts`；**均不挂载**。

**验收（F02/F05）**：进入欢迎页能弹出知情同意弹窗、复选框可勾选；对话页输入框 Enter 发送、快捷短语点击即发送。**验收（F09–F13 半区）**：四个 crisis/resources 组件文件存在、tsc 通过、且 `grep -r "CrisisModal\|BreathingExercise" src/pages` 无结果（未接线状态达标）。

### 步骤 12：页面与路由（F01、F03、F04、F06）

**操作**：按第 7.6 与 8.1 节实现：
1. `pages/welcome/index.tsx`：Logo 渐入、称呼输入（存本地 state，**不调 userStore**——原样保留）、ConsentModal、"开始聊聊" navigate `/chat/intro`；
2. `pages/chat/index.tsx`：本地 `useState` 消息数组（**不用 chatStore.messages**——原样保留）、`isIntro = pathname === '/chat/intro'`、1500ms 后播开场白、发消息 → TypingIndicator → aiService mock 回复、错误文案 `抱歉，我现在有点不在状态，请再说一次？`、结束按钮 navigate `/closing`；
3. `pages/closing/index.tsx`：告别文案 + A/B/C/D 四档反馈 → `console.log('保存反馈:', feedbackData)` → 500ms 后回 `/`；
4. `src/router.tsx`：wouter Switch 路由表逐字（`/`、`/chat/intro`、`/chat`、`/closing`、兜底 `页面未找到`）+ 手写 `navigate`（pushState + `dispatchEvent(new PopStateEvent('popstate'))`）；
5. `src/App.tsx`（渲染 Router）、`src/main.tsx`（StrictMode + createRoot + `import './index.css'`）、`src/index.css`（第 8.4 节 @theme 色板逐字 + 全局样式）。

**验收（F01）**：打开 `http://localhost:5173/` 见 Logo + 称呼输入 + "开始聊聊"；**（F02）**首次进入弹知情同意；**（F04）**点击开始 → URL 变 `/chat/intro` → 约 1.5s 后出现可意开场白气泡；**（F03）**发送一条消息 → 出现打字指示器 → 1–2s 后收到 mock 回复，消息右蓝左白排布；**（F06）**点结束 → `/closing` 页可选 A–D 反馈，提交后 console 打印 `保存反馈:` 并自动回首页；直接访问 `/xxx` 显示 `页面未找到`。

### 步骤 13：项目根文件与静态资产

**操作**：
1. 项目根放置 `TASKS.md`（任务表，内容可从第 6.5 节手册映射重建概要）与 `可意AI心理陪伴助手-工作流手册v2.0.md`（27.9KB 产品手册——**本文档只提炼了要点，原件不可由本文档重建**，见第 10 章缺口清单）；
2. `frontend/public/` 下**不要**创建 `sounds/crisis-alert.mp3`（该文件在源码中被引用但仓库中缺失——原样保留缺失状态，CrisisModal 播放失败已被 try/catch 静默）。

**验收**：项目根存在两个 md 文件（或明确记录为缺口）；`frontend/public/sounds/` 不存在。

### 步骤 14：构建与总验收

**操作**：`npm run build`。

**验收**：`tsc -b && vite build` 零错误产出 `dist/`；随后逐项过 F01–F18 验收矩阵：

| 功能 | 验收方式 | 预期 |
| --- | --- | --- |
| F01 | 浏览器打开 `/` | 欢迎页完整渲染 |
| F02 | 首次进入 | 知情同意弹窗可勾选可关闭（不阻断——原样） |
| F03 | 对话收发 | mock 回复 + 打字动画 |
| F04 | `/chat/intro` | 1.5s 开场白后正常对话 |
| F05 | 输入区 | Enter 发送、快捷短语、语音按钮无功能占位 |
| F06 | `/closing` | 四档反馈 console.log 后回首页 |
| F07 | console 验证 store | determinePhase 阈值切换正确 |
| F08 | console 调 `detectRisk` | 红/黄关键词命中正确 |
| F09–F13 | 文件存在 + 未被页面 import | 未接线状态与源仓库一致 |
| F14 | localStorage 检查 | 两个持久化键存在、crisis 不持久化 |
| F15 | console 调 aiService.getResponse | 关键词分支 mock 回复 + 兜底 |
| F16/F17 | grep 引用 | 零引用 |
| F18 | 页面按钮/弹窗渲染 | 正常 |

**验收操作提示（store/service 的 console 验证方法）**：
- zustand store 与 aiService 是 ES 模块内部对象，浏览器 console 默认无法直接访问。验证 F07/F08/F15 时，可在 `main.tsx` 临时加一行 `(window as any).__debug = { useChatStore, useCrisisStore, aiService };`（需相应 import），验证完毕后**必须移除**以回到原样；
- 或使用 React DevTools 观察组件 state；
- localStorage 类验收（F14）直接在 DevTools → Application → Local Storage 检查 `keyi-chat-storage`、`keyi-user-storage`、`keyi_user_name` 三键；
- 未接线验收（F09–F13/F16/F17）用编辑器全局搜索即可，无需运行时操作。

**常见复现错误与规避**（按踩坑概率排序）：
1. **把 tailwind 系装进 devDependencies**——原仓库在 dependencies，逐字复现要求位置一致（构建结果相同，但 package.json diff 不为零）；
2. **新建 tailwind.config.js**——Tailwind v4 无需配置文件，主题全在 index.css `@theme` 块；建了就是多余文件；
3. **给 index.html 汉化 title**——原件是模板默认 `frontend`/`lang="en"`，不要"优化"；
4. **用 wouter 的 useLocation 做导航**——本项目编程式导航是 router.tsx 手写的 pushState+PopStateEvent，页面全部 import 这个 `navigate`；
5. **把 ChatPage 消息改接 chatStore**——会改变刷新行为（K4）；
6. **给 crisis/resources 组件加入口**——未接线是验收标准的一部分（K3）；
7. **修正 RED_KEYWORDS 重复项 / 隐形关闭按钮 / autoResize**——K 系列全部原样保留；
8. **忘记 `import type`**——verbatimModuleSyntax 下纯类型导入不写 type 会编译报错；
9. **创建 .env 文件**——仓库无 env 文件，mock 模式下不需要；
10. **给 chat/ 目录补 index.ts 桶导出**——该目录确实没有桶导出，页面直接深层 import。

### 附：复现文件核对总表（全量 52 项）

按创建顺序列出全部产物；"细节出处"指本文档中存放逐字/规格内容的章节。复现完成后逐行打钩即为终检。

| # | 文件 | 创建于步骤 | 细节出处 | 核对要点 |
| --- | --- | --- | --- | --- |
| 1 | `frontend/package.json` | 2 | §2.1 | 依赖版本逐字；name `frontend`；tailwind 系在 dependencies |
| 2 | `frontend/package-lock.json` | 2 | — | `npm install` 自动生成，不手写 |
| 3 | `frontend/vite.config.ts` | 3 | §2.2 | react+tailwindcss 插件、`@` 别名；无 server 配置 |
| 4 | `frontend/tsconfig.json` | 3 | §2.3 | 项目引用 app/node |
| 5 | `frontend/tsconfig.app.json` | 3 | §2.3 | `paths @/*`、strict |
| 6 | `frontend/tsconfig.node.json` | 3 | §2.3 | 模板默认 |
| 7 | `frontend/eslint.config.js` | 3 | §2.3 | Vite 模板 flat config |
| 8 | `frontend/index.html` | 3 | §2.2/§3 | title `frontend`、`lang="en"`（模板默认，未汉化） |
| 9 | `frontend/README.md` | 3 | §3 | Vite 模板默认内容 |
| 10 | `frontend/.gitignore` | 3 | §3 | Vite 模板默认 |
| 11 | `frontend/public/vite.svg` | 3 | §3 | 模板图标（favicon） |
| 12 | `src/assets/react.svg` | 3 | §3 | 模板资源，未使用 |
| 13 | `src/styles/`（空目录） | 3 | §3 | 预留空目录，保留 |
| 14 | `src/types/chat.ts` | 4 | §4.1 | 全部领域类型逐字 |
| 15 | `src/types/index.ts` | 4 | §7.2 | `export * from './chat'` |
| 16 | `src/utils/helpers.ts` | 6 | §7.4 | 8 个纯函数 |
| 17 | `src/stores/chatStore.ts` | 7 | §4.2 | determinePhase 阈值 + partialize |
| 18 | `src/stores/userStore.ts` | 7 | §4.3 | persist 全量 |
| 19 | `src/stores/crisisStore.ts` | 7 | §4.4/§6.3 | 关键词表逐字（含重复项）、热线表、countdown 180 |
| 20 | `src/stores/index.ts` | 7 | §7.3 | 桶导出 + determinePhase 导出 |
| 21 | `src/services/aiService.ts` | 8 | §5/§6.2/§6.3 | 6 段 prompt 逐字、mock 分支、注释态 callAPI |
| 22 | `src/services/riskService.ts` | 8 | §6.4 | keywordGroups/正则逐字 |
| 23 | `src/services/storageService.ts` | 8 | §7.5 | 前缀/TTL/base64；零引用 |
| 24 | `src/services/analyticsService.ts` | 8 | §7.5 | 事件队列；零引用 |
| 25 | `src/services/index.ts` | 8 | §7.5 | 桶导出 |
| 26 | `src/hooks/useChat.ts` | 9 | §7.5 | 三 hook + mockAIResponse；页面零引用 |
| 27 | `src/hooks/index.ts` | 9 | §7.5 | 桶导出 |
| 28 | `src/components/common/Button.tsx` | 10 | §7.11 | 4 变体/3 尺寸/LoadingButton |
| 29 | `src/components/common/Input.tsx` | 10 | §7.11 | autoResize 声明未实现（K14） |
| 30 | `src/components/common/Modal.tsx` | 10 | §7.11 | Modal+ConfirmModal、spring 25/300 |
| 31 | `src/components/common/Loading.tsx` | 10 | §7.11 | 5 个导出体 |
| 32 | `src/components/common/index.ts` | 10 | §7.11 | 桶导出 |
| 33 | `src/components/chat/MessageBubble.tsx` | 11 | §7.7 | 本地 Message 接口（K1）+TypingContent+WelcomeBubble |
| 34 | `src/components/chat/InputArea.tsx` | 11 | §7.7 | 快捷短语/EndChatButton/scrollbar-hide（K13） |
| 35 | `src/components/welcome/ConsentModal.tsx` | 11 | §7.8 | CONSENT_ITEMS 5 条逐字 |
| 36 | `src/components/crisis/CrisisManager.tsx` | 11 | §7.9 | 未挂载（K3） |
| 37 | `src/components/crisis/CrisisModal.tsx` | 11 | §7.9 | 倒计时/隐形关闭按钮（K6）/音频引用（K9） |
| 38 | `src/components/crisis/RiskBanner.tsx` | 11 | §7.9 | 注释与实现不符（K15） |
| 39 | `src/components/crisis/index.ts` | 11 | §7.9 | 桶导出 |
| 40 | `src/components/resources/BreathingExercise.tsx` | 11 | §7.10 | 4-7-8 配置/strokeDasharray 579/K12 |
| 41 | `src/components/resources/GroundingExercise.tsx` | 11 | §7.10 | 5-4-3-2-1 分步 |
| 42 | `src/components/resources/MoodTracker.tsx` | 11 | §7.10 | 7 情绪/本地 MoodType（K2） |
| 43 | `src/components/resources/index.ts` | 11 | §7.10 | 桶导出 |
| 44 | `src/pages/welcome/index.tsx` | 12 | §7.6 | 同意不阻断（K10） |
| 45 | `src/pages/chat/index.tsx` | 12 | §7.6 | 本地 useState（K4）/1500ms 开场白 |
| 46 | `src/pages/closing/index.tsx` | 12 | §7.6 | 反馈 console.log（K8） |
| 47 | `src/router.tsx` | 12 | §8.1 | 路由表逐字 + 手写 navigate |
| 48 | `src/App.tsx` | 12 | §7.1 | 仅渲染 Router |
| 49 | `src/main.tsx` | 12 | §7.1 | StrictMode + createRoot |
| 50 | `src/index.css` | 12 | §8.4 | @theme 色板逐字 |
| 51 | 根/`TASKS.md` | 13 | §6.5 | 复现缺口（见 10.6） |
| 52 | 根/`可意AI心理陪伴助手-工作流手册v2.0.md` | 13 | §6.5 | 复现缺口（见 10.6） |

### 9.15 可选接线步骤（复现原样时**跳过**本节）

若要把"已写未挂载"模块激活为可用产品（即向 keyi 后代项目演进），按以下顺序接线：
1. **危机检测**：在 ChatPage 的 `handleSend` 中，发送用户消息前调用 `useCrisisStore.getState().detectRisk(text)`；
2. **危机 UI**：在 `App.tsx` 根部挂载 `<CrisisManager />`（内部依据 crisisStore 渲染 CrisisModal/RiskBanner）；
3. **倒计时驱动**：CrisisManager 中补 `useEffect` + `setInterval(1000)` 调 `decrementCountdown`（当前源码缺此驱动，见 K5）；
4. **消息持久化**：ChatPage 改用 `useChatStore` 的 messages/addMessage 替换本地 useState；
5. **用户档案**：WelcomePage 提交称呼时调 `userStore.setNickname`，并将同意状态写入 `userStore.setConsent(true)`、未同意时禁用"开始聊聊"；
6. **资源工具入口**：在 ChatPage 头部菜单挂 BreathingExercise/GroundingExercise/MoodTracker 三个入口 Modal；
7. **补音频资产**：放置 `public/sounds/crisis-alert.mp3`；
8. **真实 AI**：取消 `getResponse` 中 `callAPI`/`parseResponse` 两行注释、补完 `parseResponse` 桩实现、配置 `.env` 两个变量，即切换真实通道。

> 以上 8 步全部完成后，产品形态即接近工作流手册 v2.0 描述的完整闭环；但那是 keyi 后代项目的方向，**不属于本项目的复现范围**。

<!-- SECTION 9 END -->

---

## 10. 不可文本化资产与已知问题

### 10.1 tmpclaude 残留文件清单（已从第 3 章目录树排除）

仓库中存在 **16 个** `tmpclaude-*-cwd` 残留文件（AI 编码工具的工作目录标记文件，无业务内容，与项目功能无关）。复现时**不需要创建**这些文件；清理原仓库时可安全删除。

| # | 位置 | 文件名 |
| --- | --- | --- |
| 1 | 项目根 | `tmpclaude-1814-cwd` |
| 2 | 项目根 | `tmpclaude-e5a2-cwd` |
| 3 | `frontend/` | `tmpclaude-048f-cwd` |
| 4 | `frontend/` | `tmpclaude-0a5e-cwd` |
| 5 | `frontend/` | `tmpclaude-22ca-cwd` |
| 6 | `frontend/` | `tmpclaude-28c7-cwd` |
| 7 | `frontend/` | `tmpclaude-713a-cwd` |
| 8 | `frontend/` | `tmpclaude-765b-cwd` |
| 9 | `frontend/` | `tmpclaude-9218-cwd` |
| 10 | `frontend/` | `tmpclaude-a352-cwd` |
| 11 | `frontend/` | `tmpclaude-a86d-cwd` |
| 12 | `frontend/` | `tmpclaude-b783-cwd` |
| 13 | `frontend/` | `tmpclaude-bddf-cwd` |
| 14 | `frontend/` | `tmpclaude-e0c4-cwd` |
| 15 | `frontend/src/` | `tmpclaude-d4df-cwd` |
| 16 | `frontend/src/` | `tmpclaude-ec81-cwd` |

### 10.2 不可文本化 / 缺失资产

| 资产 | 状态 | 影响与处置 |
| --- | --- | --- |
| `可意AI心理陪伴助手-工作流手册v2.0.md`（27.9KB） | 存在于项目根，本文档仅提炼要点（第 6.5 节） | **复现缺口**：手册全文无法由本文档重建；产品迭代时需保留原件。代码层面的复现不依赖它 |
| `TASKS.md`（项目根） | 存在，任务状态表 | 同上：仅影响项目管理信息，不影响代码复现 |
| `/sounds/crisis-alert.mp3` | **仓库中缺失** | CrisisModal 挂载时 `new Audio('/sounds/crisis-alert.mp3').play()` 失败，已被 try/catch 静默。复现时保持缺失 |
| 图片/字体资产 | 无 | 全部视觉元素由 CSS/emoji/inline SVG 实现，零二进制依赖 |
| git 历史（frontend/.git） | 存在但不影响运行 | 提交历史不可复现，与功能无关 |

### 10.3 外部服务依赖

| 依赖 | 当前状态 | 说明 |
| --- | --- | --- |
| LLM 后端（`VITE_AI_API_ENDPOINT`） | **未启用**（mock 模式） | `callRealAPI` 整体注释；启用需 OpenAI 兼容 `/api/ai/chat` 端点，Bearer 鉴权，model `gpt-4`（第 5 章契约） |
| 心理温线电话 | 静态文本 | HOTLINES 常量仅展示，`tel:` 链接拨号由系统处理，无 API 依赖 |
| 分析/埋点后端 | 无 | analyticsService 仅 console 输出，未对接任何平台 |

除以上外，项目**零外部运行时依赖**：无后端、无数据库、无 CDN、无第三方 SDK。

### 10.4 已知问题清单（K 系列，复现时必须**原样保留**）

> 这些是源仓库的真实状态。精确级复现的定义是"和原仓库一样"，因此以下问题不应在复现时"顺手修复"；修复路径已在 9.15 可选步骤中给出。

| 编号 | 问题 | 位置 | 影响 |
| --- | --- | --- | --- |
| K1 | `Message` 类型双重定义：`types/chat.ts` 与 `MessageBubble.tsx` 各有一份，字段不完全一致 | `types/chat.ts` / `components/chat/MessageBubble.tsx` | 类型漂移风险；页面实际用的是 MessageBubble 本地版 |
| K2 | `MoodType` 第三处重复定义 | `components/resources/MoodTracker.tsx` | 同 K1，三处定义需同步维护 |
| K3 | 危机模块整体未接线：CrisisManager/CrisisModal/RiskBanner 未被任何页面挂载，ChatPage 不调 `detectRisk` | `pages/chat/index.tsx` / `App.tsx` | **核心安全功能在产品中不生效**（仅代码就绪） |
| K4 | ChatPage 用本地 useState 存消息，不用 chatStore.messages | `pages/chat/index.tsx` | 刷新丢失对话；persist 的 `keyi-chat-storage` 形同虚设；阶段状态机实际未驱动 UI |
| K5 | `decrementCountdown` 无 interval 驱动：crisisStore 定义了递减动作，但无任何 setInterval 调用它 | `stores/crisisStore.ts` | 即使接线弹窗，180 秒倒计时也不会走 |
| K6 | CrisisModal 右上角关闭按钮 `opacity-0` 但仍可点击 | `components/crisis/CrisisModal.tsx` | 隐形可点区域，疑似有意设计（防冲动关闭）但无注释说明 |
| K7 | `RED_KEYWORDS` 中 `'不想活了'` 重复出现两次 | `stores/crisisStore.ts` | 无功能影响，但逐字复现时不可去重 |
| K8 | 反馈仅 `console.log('保存反馈:', feedbackData)`，不持久化不上报 | `pages/closing/index.tsx` | 反馈数据丢失；F06 验收以 console 输出为准 |
| K9 | `/sounds/crisis-alert.mp3` 被引用但仓库缺失 | `components/crisis/CrisisModal.tsx` | 播放失败静默；见 10.2 |
| K10 | WelcomePage 同意不阻断：未勾选同意也能点"开始聊聊"；称呼不写入 userStore | `pages/welcome/index.tsx` | 知情同意形同虚设；AI 无法拿到用户称呼 |
| K11 | WelcomeBubble 组件与开场白消息在 intro 流程重复渲染同一段欢迎语 | `pages/chat/index.tsx` / `components/chat/MessageBubble.tsx`（WelcomeBubble 导出于此） | 视觉重复；原样保留 |
| K12 | BreathingExercise `timeoutRef` 类型混用：`setTimeout` 类型的 ref 被存入 `requestAnimationFrame` 句柄 | `components/resources/BreathingExercise.tsx` | 清理逻辑理论上可能漏清 rAF；tsc 不报错（number 兼容） |
| K13 | `scrollbar-hide` 类被 InputArea 使用但全局未定义 | `components/chat/InputArea.tsx` / `index.css` | 无效类名，快捷短语条滚动条实际可见 |
| K14 | Textarea `autoResize` prop 声明了但没有任何实现逻辑 | `components/common/Input.tsx` | 自增长效果实际由 InputArea 自己的 onInput 实现 |
| K15 | RiskBanner 注释声称"自动隐藏"但无定时器实现；另有 `useLocation` import 未使用 | `components/crisis/RiskBanner.tsx` 等 | 死代码/注释与实现不符 |
| K16 | useChat hook 双轨 mock 实现与 aiService mock 并存，且 hook 全家未被页面使用 | `hooks/useChat.ts` | 两套 mock 逻辑平行演化，接线时需二选一 |

#### 10.4.1 重点问题详述（逐项：现象 / 成因 / 复现注意 / 修复方向）

**K1。Message 双重定义**
- 现象：`types/chat.ts` 定义了完整版 `Message`（含 metadata 可选字段）；`MessageBubble.tsx` 又导出一份本地 `Message` 接口，字段集更小（含 `typing?: boolean` 等 UI 专用字段）。
- 成因：组件先行开发、类型层后补，未回头统一。
- 复现注意：ChatPage import 的是 **MessageBubble 本地版**；若误用 types/chat 版会丢 `typing` 字段导致打字气泡失效。
- 修复方向（仅接线时）：以 types/chat 版为准，把 UI 字段并入 metadata。

**K3。危机模块未接线（本项目最重要的架构事实）**
- 现象：crisis/ 三组件、crisisStore.detectRisk、riskService 全部就绪，但 App/页面零挂载零调用；用户输入危机内容时产品**无任何响应**。
- 成因：TASKS.md 中危机干预为独立任务批次，开发到组件层后未进入集成批次。
- 复现注意：**不要**自作主张接线；验收标准是 grep 零引用（见步骤 11）。ChatPage 中 `useCrisisStore` 的 import 语句存在但未调用其方法，逐字保留。
- 修复方向：9.15 步骤 1–3。

**K4。ChatPage 不用 chatStore.messages**
- 现象：消息存本地 `useState<Message[]>`，刷新即清空；但 persist 中间件仍在写 `keyi-chat-storage`（只有 phase/sessionStartTime 实际变化）。
- 复现注意：ChatPage 与 store 的交互仅限 `useChatStore.getState().phase / setPhase`；若把消息写进 store 会改变刷新行为，就不是精确复现了。
- 修复方向：9.15 步骤 4。

**K5。倒计时无驱动**
- 现象：crisisStore 有 `decrementCountdown`，CrisisModal 只接收 `countdown` prop 展示；全仓库无 `setInterval` 调用该动作。
- 复现注意：不要在 CrisisModal 内部自行补定时器；组件保持"受控展示"设计。
- 修复方向：9.15 步骤 3（在 CrisisManager 层加 interval）。

**K6。隐形关闭按钮**
- 现象：CrisisModal 右上角按钮类名含 `opacity-0`，视觉不可见但可点击触发 `onClose`。
- 复现注意：这是危机干预交互的常见模式（降低冲动退出的可发现性，同时保留逃生口），虽无注释佐证，复现时按原样写 `opacity-0`，不要"修正"为可见或移除。

**K9。缺失音频**
- 现象：CrisisModal 挂载时 `new Audio('/sounds/crisis-alert.mp3')` 并 play，public 下无该文件；play() 的 rejection 被 catch 吞掉。
- 复现注意：保持缺失；若补文件反而与原仓库行为不一致（会真的发声）。

**K10。同意不阻断 + 称呼不入 store**
- 现象：WelcomePage 的"开始聊聊"不校验 ConsentModal 勾选状态；称呼写入 `localStorage.setItem('keyi_user_name', ...)`（裸 localStorage，非 userStore，非 storageService）。
- 复现注意：`keyi_user_name` 这个**裸键**是 ChatPage 读取称呼的唯一来源（见 §4.5 localStorage 键位表），三套存储机制（裸键/zustand persist/storageService）并存是本项目真实状态。

**K11。欢迎语重复渲染**
- 现象：intro 流程中 `isIntro && <WelcomeBubble/>` 与 1500ms 后插入的开场白消息文案同源，短暂同屏重复。
- 复现注意：两处文案均逐字见 §6.3；不要合并。

**K12–K15。小型不一致项**
- K12：BreathingExercise 用 `useRef<ReturnType<typeof setTimeout>>` 存 rAF 句柄，清理时用 clearTimeout；浏览器中两类句柄同为 number 故不报错，但语义错误——逐字照写。
- K13：`scrollbar-hide` 仅在 Tailwind 插件 tailwind-scrollbar-hide 中存在，本项目未安装该插件——类名照写、不装插件。
- K14：Textarea 的 `autoResize` 只在 props 解构中出现；真正的自增长在 InputArea 用 `style.height = 'auto'; style.height = scrollHeight + 'px'` 实现。
- K15：RiskBanner 文件头注释描述"X 秒后自动隐藏"，实现中无任何 timer；`useLocation` import 存在但未使用（verbatimModuleSyntax 下 lint 告警但不阻断构建）。

**K16。双轨 mock**
- 现象：`aiService.mockResponse`（无延迟，页面实际使用）与 `useChat.ts` 的 `mockAIResponse`（1–2s 随机延迟，无人使用）并存，关键词规则一致但实现独立。
- 复现注意：两套都要写（步骤 8 与步骤 9）；验收时用户可感知的"打字延迟"来自 ChatPage 的 isTyping 状态而非 mock 层延迟。

### 10.5 TODO 与演进方向

结合 TASKS.md 与代码状态，未完成事项（属于产品方向，不属于复现范围）：
1. 危机干预链路接线（K3/K5，对应 9.15 步骤 1–3）；
2. 对话持久化接线（K4，对应 9.15 步骤 4）；
3. 用户档案与同意门控（K10，对应 9.15 步骤 5）；
4. 资源工具（呼吸/着陆/情绪日记）入口（对应 9.15 步骤 6）；
5. 真实 LLM 后端对接（对应 9.15 步骤 8）；
6. 反馈数据持久化（K8）。

上述方向在工作区 `keyi/` 后代项目中已有不同程度的实现（含后端/supabase），本项目作为前代原型保持现状即可。

### 10.6 复现缺口汇总（单凭本文档无法 100% 重建的部分）

| 缺口 | 类型 | 影响面 |
| --- | --- | --- |
| 工作流手册 v2.0 全文（27.9KB） | 产品文档 | 不影响代码运行；影响后续产品迭代的 prompt/流程依据（要点已提炼在 6.5） |
| TASKS.md 全文 | 项目管理 | 不影响代码运行 |
| git 提交历史 | 版本历史 | 不影响代码运行 |
| `crisis-alert.mp3` | 二进制资产 | 本就缺失，复现后行为一致 |
| 白名单外文件的逐字级还原 | 代码细节 | 纯 UI 细节（内联 SVG path、个别 className 顺序）可能与原件有字符级差异，但行为/视觉等价；白名单内容（prompt/常量/类型/路由/依赖）为逐字级 |

> **结论**：除上表五项外，本文档对 frontend/src 全部 37 个业务文件、构建配置、数据模型、prompt 资产、路由与交互均达到可复现精度；按第 9 章步骤执行即可得到与原仓库行为一致的项目。

### 10.7 本文档生成时的自查记录（2026-07-28）

以下校验在文档定稿前逐项比对了源码与文档内容：

| 自查项 | 比对对象 | 结果 |
| --- | --- | --- |
| 依赖版本表 | §2.1 vs `frontend/package.json` | ✅ 逐字一致（含 name `frontend`、tailwind 系在 dependencies） |
| vite 配置 | §2.2 vs `vite.config.ts` | ✅ 逐字一致（无 server 配置项） |
| 路由表 | §8.1 vs `src/router.tsx` | ✅ 5 条路由 + 兜底 + 手写 navigate 一致 |
| determinePhase 阈值 | §4.2 vs `chatStore.ts` L186-192 | ✅ <3/<8/<15/<25/≥25 一致 |
| persist 键名 | §4.2/4.3 vs 源码 | ✅ `keyi-chat-storage`、`keyi-user-storage` |
| 6 段阶段 prompt | §6.2 vs `aiService.getSystemPrompt` | ✅ 逐字一致（greeting 段抽样比对确认） |
| 危机关键词/热线 | §6.3/6.4 vs `crisisStore.ts`/`riskService.ts` | ✅ 含 RED_KEYWORDS 重复项、400-161-9995/010-82951332 |
| 目录结构 | §3 vs 实际目录 | ✅ 无 constants/ 目录、chat/ 无 index.ts、无 env 文件、styles/ 为空 |
| tmpclaude 清单 | §10.1 vs 实际目录 | ✅ 16 个（根 2 + frontend 12 + src 2） |
| 第 7 章覆盖 | §7 vs src 文件清单 | ✅ 37/37 业务文件全覆盖 |
| 密钥扫描 | 全文 | ✅ 无任何真实 API key；环境变量仅键名+占位 |

修正记录：定稿前发现并修正了第 9 章初稿中 4 处与源码不符的描述（package.json 版本/name、vite server 端口、虚构的 constants/ 目录与 .env.example、chat 组件文件拆分），均已以源码为准对齐。

### 10.8 功能↔问题↔接线步骤交叉索引（总览矩阵）

供复现者与后续维护者快速定位：每个功能点当前状态、关联的已知问题、以及若要激活应走的 9.15 步骤。

| 功能 | 状态 | 关联问题 | 激活路径（9.15） |
| --- | --- | --- | --- |
| F01 欢迎页 | ✅ 可用 | K10（称呼不入 store） | 步骤 5 |
| F02 知情同意 | ⚠️ 可用但不阻断 | K10 | 步骤 5 |
| F03 主对话 | ✅ 可用（mock） | K1/K4/K11 | 步骤 4、8 |
| F04 开场白 | ✅ 可用 | K11 | — |
| F05 输入区 | ✅ 可用（语音占位） | K13/K14 | — |
| F06 结束反馈 | ⚠️ 可用但不持久化 | K8 | —（需后端） |
| F07 阶段状态机 | ⚠️ 逻辑就绪、UI 未驱动 | K4 | 步骤 4 |
| F08 危机检测 | ⚠️ 逻辑就绪、未调用 | K3/K7 | 步骤 1 |
| F09 危机弹窗 | ⚠️ 组件就绪、未挂载 | K3/K5/K6/K9 | 步骤 2、3、7 |
| F10 风险横幅 | ⚠️ 组件就绪、未挂载 | K3/K15 | 步骤 2 |
| F11 呼吸练习 | ⚠️ 组件就绪、无入口 | K12 | 步骤 6 |
| F12 着陆练习 | ⚠️ 组件就绪、无入口 | — | 步骤 6 |
| F13 情绪日记 | ⚠️ 组件就绪、无入口 | K2 | 步骤 6 |
| F14 三 store | ⚠️ 完成、页面部分使用 | K4 | 步骤 4、5 |
| F15 AI 服务层 | ✅ mock 可用 | K16 | 步骤 8 |
| F16 存储服务 | ⚠️ 完成、零调用 | — | （无预置路径，需自行接入） |
| F17 分析服务 | ⚠️ 完成、零调用 | — | （同上） |
| F18 通用组件 | ✅ 可用 | K14 | — |

**复现完成定义（Definition of Done）**：
1. `npm run build` 零错误；
2. F01–F06 交互链路在浏览器中与第 9 章验收描述逐项一致；
3. F07–F18 按验收矩阵逐项通过（含"未接线即达标"项）；
4. 白名单内容（§2.1 依赖表、§2.2 vite 配置、§4 类型/store、§6.2 prompt、§6.3/6.4 关键词与文案、§8.1 路由表、§8.4 @theme）与文档逐字 diff 为零；
5. K1–K16 全部原样存在（未被"顺手修复"）；
6. 仓库中不存在本文档未提及的多余产物（constants/、tailwind.config.js、env 文件、sounds/ 等）。

<!-- SECTION 10 END -->

---

*文档结束 —— 心理医生可益2.01 可AI重构文档（精确级，生成日期 2026-07-28）*
