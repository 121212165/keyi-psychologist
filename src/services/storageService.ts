/**
 * 本地存储服务
 * - 封装 localStorage 操作
 * - 提供数据加密
 */

import { generateId } from '@/utils/helpers';

/**
 * 存储配置
 */
interface StorageConfig {
  prefix: string;
  encrypt: boolean;
  ttl: number; // Time to live in milliseconds
}

/**
 * 默认配置
 */
const defaultConfig: StorageConfig = {
  prefix: 'keyi_',
  encrypt: false, // 实际项目中可设为 true
  ttl: 30 * 24 * 60 * 60 * 1000, // 30天
};

/**
 * 存储服务类
 */
class StorageService {
  private config: StorageConfig;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 生成带前缀的键名
   */
  private getKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  /**
   * 设置值
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const fullKey = this.getKey(key);
    const data = {
      value,
      expires: ttl ? Date.now() + ttl : Date.now() + this.config.ttl,
      createdAt: Date.now(),
    };

    // 加密处理（如果启用）
    const storedValue = this.config.encrypt
      ? this.encrypt(JSON.stringify(data))
      : JSON.stringify(data);

    try {
      localStorage.setItem(fullKey, storedValue);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  /**
   * 获取值
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    const fullKey = this.getKey(key);

    try {
      const stored = localStorage.getItem(fullKey);
      if (!stored) return defaultValue;

      // 解密处理（如果启用）
      const dataStr = this.config.encrypt
        ? this.decrypt(stored)
        : stored;

      const data = JSON.parse(dataStr);

      // 检查是否过期
      if (data.expires && Date.now() > data.expires) {
        this.remove(key);
        return defaultValue;
      }

      return data.value as T;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  /**
   * 删除值
   */
  remove(key: string): void {
    const fullKey = this.getKey(key);
    localStorage.removeItem(fullKey);
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.config.prefix)
    );

    keys.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    const fullKey = this.getKey(key);
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.config.prefix))
      .map((key) => key.replace(this.config.prefix, ''));
  }

  /**
   * 批量获取
   */
  getMany<T>(keys: string[]): Record<string, T | undefined> {
    const result: Record<string, T | undefined> = {};

    keys.forEach((key) => {
      result[key] = this.get<T>(key);
    });

    return result;
  }

  /**
   * 批量设置
   */
  setMany<T>(entries: Record<string, T>): void {
    Object.entries(entries).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * 获取剩余空间（近似值）
   */
  getRemainingSpace(): number {
    let total = 0;

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total +=
          (localStorage[key].length + key.length) * 2; // UTF-16
      }
    }

    // localStorage 限制约 5MB
    return 5 * 1024 * 1024 - total;
  }

  /**
   * 检查是否接近限制
   */
  isNearLimit(): boolean {
    return this.getRemainingSpace() < 1024 * 1024; // 1MB
  }

  /**
   * 加密（简易实现，实际项目请使用专业加密库）
   */
  private encrypt(data: string): string {
    // 注意：这是一个简易实现
    // 实际项目中应使用 crypto-js 或 Web Crypto API
    return btoa(encodeURIComponent(data));
  }

  /**
   * 解密
   */
  private decrypt(data: string): string {
    // 注意：这是一个简易实现
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data;
    }
  }
}

// 创建默认实例
export const storageService = new StorageService();

// 导出类
export { StorageService };
