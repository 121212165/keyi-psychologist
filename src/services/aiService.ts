import type { AIResponse, SessionPhase, Message } from '@/types';
import { determinePhase } from '@/stores';

/**
 * AI服务配置
 */
interface AIConfig {
  apiEndpoint: string;
  apiKey?: string;
  model: string;
  timeout: number;
}

/**
 * 对话上下文
 */
interface ChatContext {
  messages: Message[];
  phase: SessionPhase;
  userName: string;
  messageCount: number;
}

/**
 * 默认配置
 */
const defaultConfig: AIConfig = {
  apiEndpoint: import.meta.env.VITE_AI_API_ENDPOINT || '/api/ai/chat',
  apiKey: import.meta.env.VITE_AI_API_KEY,
  model: 'gpt-4',
  timeout: 30000,
};

/**
 * AI服务类
 */
class AIService {
  private config: AIConfig;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 获取AI响应
   */
  async getResponse(
    userMessage: string,
    context: ChatContext
  ): Promise<AIResponse> {
    try {
      // 构建请求体
      const requestBody = this.buildRequestBody(userMessage, context);

      // 调用API（实际项目中取消注释）
      // const response = await this.callAPI(requestBody);
      // return this.parseResponse(response);

      // 模拟响应（开发阶段）
      return this.mockResponse(userMessage, context);
    } catch (error) {
      console.error('AI服务调用失败:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * 构建请求体
   */
  private buildRequestBody(
    userMessage: string,
    context: ChatContext
  ): object {
    return {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(context.phase),
        },
        ...context.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    };
  }

  /**
   * 获取系统提示词（根据阶段）
   */
  private getSystemPrompt(phase: SessionPhase): string {
    const prompts = {
      greeting: `你是可意，一个温暖、专业的AI心理陪伴助手。
用户刚刚开始和你聊天。
问候用户，让用户感到被接纳。
用简洁、自然的方式开场，不要太长。`,

      listening: `现在是倾听阶段。
用户正在表达自己的困扰。
你的任务是：
1. 认真倾听
2. 适当复述确认（"我听到你说..."）
3. 标注情绪（"听起来你很..."）
4. 不急着给建议，先让用户说够
5. 用温暖、接纳的语气`,

      exploring: `现在是探索阶段。
用户已经初步表达了困扰。
你的任务是：
1. 帮助用户深入理解问题
2. 用开放式提问探索（"能说说更多吗？"）
3. 识别潜在的模式
4. 不要跳跃到解决方案`,

      guiding: `现在是引导阶段。
用户的问题已经比较清晰。
你的任务是：
1. 温和地提供新视角
2. 用苏格拉底式提问引导用户思考
3. 帮助用户发现自己的优势和资源
4. 避免说教，允许用户不同意你的观点`,

      intervention: `现在是干预阶段。
用户可能需要具体的情绪调节帮助。
你的任务是：
1. 提供实用的技巧（呼吸练习、着陆技术等）
2. 给予小步行动建议
3. 确认用户是否准备好尝试`,

      closing: `现在是结束阶段。
对话即将结束。
你的任务是：
1. 温暖地总结今天的对话（如果需要）
2. 肯定用户的勇气和努力
3. 开放地邀请下次再来
4. 简短告别`,
    };

    return prompts[phase];
  }

  /**
   * 调用API
   */
  private async callAPI(requestBody: object): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    return response;
  }

  /**
   * 解析响应
   */
  private parseResponse(response: Response): AIResponse {
    // 根据实际API响应格式调整
    return {
      content: '',
    };
  }

  /**
   * 模拟响应（开发阶段）
   */
  private mockResponse(userMessage: string, context: ChatContext): AIResponse {
    const lowerMessage = userMessage.toLowerCase();
    const messageCount = context.messageCount;

    // 根据关键词返回响应
    if (
      lowerMessage.includes('焦虑') ||
      lowerMessage.includes('紧张')
    ) {
      return {
        content:
          '嗯，我听到你说自己有点焦虑。\n\n这种感觉确实不好受。\n\n能说说是什么让你感到焦虑吗？',
        newPhase: 'exploring',
      };
    }

    if (
      lowerMessage.includes('难过') ||
      lowerMessage.includes('伤心')
    ) {
      return {
        content:
          '听起来你现在很难过。\n\n谢谢你愿意告诉我。\n\n如果想说的话，我在这里听着。',
        newPhase: 'listening',
      };
    }

    if (
      lowerMessage.includes('工作') ||
      lowerMessage.includes('上班')
    ) {
      return {
        content:
          '工作上的事情确实会让人很有压力。\n\n方便说说是什么让你感到困扰吗？',
        newPhase: 'exploring',
      };
    }

    if (
      lowerMessage.includes('谢谢') ||
      lowerMessage.includes('再见')
    ) {
      return {
        content: '不客气。记住，任何时候想聊天，我都在这里。',
        newPhase: 'closing',
      };
    }

    // 默认回应
    const newPhase = determinePhase(messageCount + 1);
    return {
      content:
        '嗯，我听到了。\n\n谢谢你愿意分享这些。\n\n你继续说，我在这里陪着你。',
      newPhase,
    };
  }

  /**
   * 获取兜底响应
   */
  private getFallbackResponse(userMessage: string): AIResponse {
    return {
      content:
        '抱歉，我现在有点不在状态，请再说一次？\n\n或者我们可以先休息一下。',
    };
  }
}

// 创建单例实例
export const aiService = new AIService();

// 导出类（便于测试）
export { AIService };
