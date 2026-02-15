import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserPreferences, MoodEntry } from '@/types';
import { generateId } from '@/utils/helpers';

/**
 * 用户状态类型
 */
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

/**
 * 默认用户偏好
 */
const defaultPreferences: UserPreferences = {
  notifications: true,
  soundEnabled: true,
  autoTyping: true,
};

/**
 * 创建持久化存储
 */
const createPersistStorage = <T>() =>
  ({
    name: 'keyi-user-storage',
    storage: createJSONStorage(() => localStorage),
  } as const);

/**
 * 用户状态管理 Store
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      preferences: defaultPreferences,
      moodHistory: [],

      // 设置用户名
      setUserName: (name: string) => {
        const { user } = get();

        if (user) {
          set({
            user: { ...user, name },
          });
        } else {
          const newUser: User = {
            id: generateId('user'),
            name,
            agreedToTerms: false,
            createdAt: new Date().toISOString(),
            totalSessions: 0,
            preferences: defaultPreferences,
          };
          set({ user: newUser });
        }

        // 同时保存到 localStorage（兼容旧代码）
        localStorage.setItem('keyi_user_name', name);
      },

      // 同意条款
      agreeToTerms: () => {
        const { user } = get();

        if (user) {
          set({
            user: { ...user, agreedToTerms: true },
          });
        }
      },

      // 更新偏好
      updatePreferences: (prefs: Partial<UserPreferences>) => {
        const { preferences } = get();

        set({
          preferences: { ...preferences, ...prefs },
          user: get().user
            ? {
                ...get().user!,
                preferences: { ...preferences, ...prefs },
              }
            : null,
        });
      },

      // 添加情绪记录
      addMoodEntry: (entry: Omit<MoodEntry, 'id' | 'date'>) => {
        const newEntry: MoodEntry = {
          ...entry,
          id: generateId('mood'),
          date: new Date().toISOString(),
        };

        const { moodHistory } = get();

        // 只保留最近30天的记录
        const recentHistory = [newEntry, ...moodHistory].slice(0, 30);

        set({ moodHistory: recentHistory });
      },

      // 登出/重置
      logout: () => {
        set({
          user: null,
          moodHistory: [],
        });
        localStorage.removeItem('keyi_user_name');
      },
    }),
    createPersistStorage<UserState>()
  )
);

/**
 * 获取用户名便捷函数
 */
export function getUserName(): string {
  // 先从 store 获取
  const store = useUserStore.getState();
  if (store.user?.name) {
    return store.user.name;
  }

  // 兼容旧 localStorage
  const saved = localStorage.getItem('keyi_user_name');
  return saved || '';
}

/**
 * 检查是否首次使用
 */
export function isFirstVisit(): boolean {
  const store = useUserStore.getState();
  return !store.user;
}

/**
 * 检查是否已同意条款
 */
export function hasAgreedTerms(): boolean {
  const store = useUserStore.getState();
  return store.user?.agreedToTerms || false;
}
