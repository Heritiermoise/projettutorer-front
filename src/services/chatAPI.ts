import { API_BASE_URL } from '../config/api';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatResponse {
  success: boolean;
  message: string;
  response?: string;
  suggestions?: string[];
}

export const chatAPI = {
  // Envoyer un message à l'assistant
  sendMessage: async (message: string, sessionId?: string): Promise<ChatResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId || localStorage.getItem('chat_session_id'),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Sauvegarder le session_id si c'est la première fois
      if (data.session_id && !localStorage.getItem('chat_session_id')) {
        localStorage.setItem('chat_session_id', data.session_id);
      }

      return {
        success: true,
        message: 'Message envoyé',
        response: data.response,
        suggestions: data.suggestions,
      };
    } catch (error: any) {
      console.error('Chat API Error:', error);
      return {
        success: false,
        message: error.message || 'Erreur de connexion',
      };
    }
  },

  // Récupérer l'historique de la conversation
  getHistory: async (sessionId?: string): Promise<ChatMessage[]> => {
    try {
      const sid = sessionId || localStorage.getItem('chat_session_id');
      if (!sid) return [];

      const response = await fetch(`${API_BASE_URL}/chat/history?session_id=${sid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Chat History Error:', error);
      return [];
    }
  },

  // Effacer la conversation
  clearHistory: async (): Promise<void> => {
    localStorage.removeItem('chat_session_id');
  },
};