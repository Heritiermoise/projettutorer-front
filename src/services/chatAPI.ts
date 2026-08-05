import { API_BASE_URL } from '../config/api';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  source?: string;
  warning?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  reply?: string;
  response?: string;
  source?: string;
  warning?: string;
  suggestions?: string[];
  conversationId?: string;
  access?: {
    authenticated: boolean;
    scope: string;
  };
}

export interface SendMessageOptions {
  conversationId?: string;
  mode?: 'assistant' | 'strict' | 'fun';
}

const STORAGE_KEY = 'rh_chat_history';
const CONVERSATION_KEY = 'rh_ai_conversation_id';

const getStorageScope = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) return 'visitor';

  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return `user_${user?.id || user?.email || 'authenticated'}`;
  } catch {
    return 'user_authenticated';
  }
};

const scopedKey = (key: string) => `${key}_${getStorageScope()}`;

const readHistory = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(scopedKey(STORAGE_KEY));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed)
      ? parsed.map((message) => ({
          ...message,
          timestamp: new Date(message.timestamp),
        }))
      : [];
  } catch {
    return [];
  }
};

const writeHistory = (messages: ChatMessage[]) => {
  localStorage.setItem(scopedKey(STORAGE_KEY), JSON.stringify(messages));
};

export const chatAPI = {
  getHistoryFromStorage: (): ChatMessage[] => readHistory(),

  saveHistory: (messages: ChatMessage[]) => {
    writeHistory(messages);
  },

  // Envoyer un message à l'assistant RH
  getConversationId: (): string | null => localStorage.getItem(scopedKey(CONVERSATION_KEY)),

  sendMessage: async (message: string, options: SendMessageOptions = {}): Promise<ChatResponse> => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const endpoint = token ? '/ai/chat' : '/public/ai/chat';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          conversation_id: options.conversationId || localStorage.getItem(scopedKey(CONVERSATION_KEY)) || undefined,
          ...(token ? {
            mode: options.mode || 'assistant',
            include_suggestions: true,
          } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        const errorMessage = errorData?.message || `HTTP ${response.status}`;
        const error = new Error(errorMessage) as Error & { payload?: unknown; status?: number };
        error.status = response.status;
        error.payload = errorData;
        throw error;
      }

      const data = await response.json();

      const reply = data.reply || data.response || data.message || '';
      const source = data.source || data.data?.source;
      const warning = data.warning || data.data?.warning;
      const conversationId = data.conversation_id || data.data?.conversation_id;

      if (conversationId) {
        localStorage.setItem(scopedKey(CONVERSATION_KEY), conversationId);
      }

      return {
        success: true,
        message: 'Message envoyé',
        reply,
        response: reply,
        source,
        warning,
        suggestions: data.suggested_questions || data.suggestions,
        conversationId,
        access: data.access,
      };
    } catch (error: any) {
      console.error('Chat API Error:', error);
      return {
        success: false,
        message: error?.message || 'Erreur de connexion',
        source: 'unavailable',
        warning: 'Le service IA est temporairement indisponible.',
      };
    }
  },

  // Effacer la conversation
  clearHistory: async (): Promise<void> => {
    localStorage.removeItem(scopedKey(STORAGE_KEY));
    localStorage.removeItem(scopedKey(CONVERSATION_KEY));
  },
};