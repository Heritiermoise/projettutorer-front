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
}

const STORAGE_KEY = 'rh_chat_history';

const readHistory = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
};

export const chatAPI = {
  getHistoryFromStorage: (): ChatMessage[] => readHistory(),

  saveHistory: (messages: ChatMessage[]) => {
    writeHistory(messages);
  },

  // Envoyer un message à l'assistant RH
  sendMessage: async (message: string): Promise<ChatResponse> => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
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

      return {
        success: true,
        message: 'Message envoyé',
        reply,
        response: reply,
        source,
        warning,
        suggestions: data.suggestions,
      };
    } catch (error: any) {
      console.error('Chat API Error:', error);
      return {
        success: false,
        message: error?.message || 'Erreur de connexion',
        source: 'local-fallback',
        warning: 'Mode secours activé',
      };
    }
  },

  // Effacer la conversation
  clearHistory: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
  },
};