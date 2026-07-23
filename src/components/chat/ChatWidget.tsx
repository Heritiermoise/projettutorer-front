import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import { Bot, PauseCircle, RefreshCcw, ShieldCheck, Sparkles, X, AlertTriangle, Copy, Check } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { chatAPI, type ChatMessage } from '../../services/chatAPI'

type ConversationMode = 'metier' | 'pause'

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  text: 'Bonjour. Je suis l’assistant RH. Posez-moi une question métier, ou passez en pause détente si vous voulez un ton plus léger.',
  sender: 'assistant',
  timestamp: new Date(),
  status: 'sent',
  source: 'welcome',
}

const QUICK_QUESTIONS = [
  'Comment devenir employé ?',
  'Quelles sont les conditions de recrutement ?',
  'Comment m’inscrire ?',
  'Quels services proposez-vous ?',
]

export const ChatWidget: React.FC = () => {
  const location = useLocation()
  const isProtectedRhArea = useMemo(() => {
    return Boolean(
      matchPath('/dashboard/rh/*', location.pathname) ||
      matchPath('/dashboard/directeur/*', location.pathname) ||
      matchPath('/dashboard/admin/*', location.pathname) ||
      matchPath('/dashboard/employe/*', location.pathname)
    )
  }, [location.pathname])

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = chatAPI.getHistoryFromStorage()
    return stored.length > 0 ? stored : [WELCOME_MESSAGE]
  })
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationMode, setConversationMode] = useState<ConversationMode>('metier')
  const [debugMeta, setDebugMeta] = useState<{ source?: string; warning?: string } | null>(null)
  const [isFallbackMode, setIsFallbackMode] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    chatAPI.saveHistory(messages)
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isProtectedRhArea) {
      setIsOpen(false)
    }
  }, [isProtectedRhArea])

  const buildIntroMessage = (mode: ConversationMode) => {
    if (mode === 'pause') {
      return 'Pause détente activée. Je reste utile, mais avec un ton plus léger. Revenez au mode métier à tout moment.'
    }
    return 'Mode métier activé. Je réponds en priorité avec des données RH et opérationnelles.'
  }

  const copyToClipboard = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldKey)
      window.setTimeout(() => setCopiedField(null), 1800)
    } catch {
      setDebugMeta((prev) => ({
        source: prev?.source,
        warning: 'Impossible de copier dans le presse-papiers',
      }))
    }
  }

  const handleSendMessage = async (messageOverride?: string) => {
    const content = (messageOverride ?? inputValue).trim()
    if (!content || isTyping) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    setDebugMeta(null)

    window.setTimeout(() => {
      setMessages((prev) => prev.map((message) => (message.id === userMessage.id ? { ...message, status: 'sent' } : message)))
    }, 350)

    const response = await chatAPI.sendMessage(content)
    const reply = response.reply || response.response || ''
    const source = response.source || 'unknown'
    const warning = response.warning || ''

    setIsTyping(false)
    setDebugMeta({ source, warning })
    setIsFallbackMode(source === 'local-fallback')

    if (response.success && reply) {
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        text: reply,
        sender: 'assistant',
        timestamp: new Date(),
        status: 'sent',
        source,
        warning,
      }
      setMessages((prev) => [...prev, assistantMessage])
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `error_${Date.now()}`,
        text: source === 'local-fallback'
          ? 'Mode secours actif. Je n’ai pas pu joindre le backend RH pour le moment.'
          : 'Désolé, une erreur est survenue. Veuillez réessayer.',
        sender: 'assistant',
        timestamp: new Date(),
        status: 'error',
        source,
        warning,
      },
    ])
  }

  const handleClearChat = () => {
    if (!window.confirm('Voulez-vous vraiment effacer la conversation ?')) return
    chatAPI.clearHistory()
    setMessages([{ ...WELCOME_MESSAGE, text: buildIntroMessage(conversationMode), timestamp: new Date() }])
    setDebugMeta(null)
    setIsFallbackMode(false)
  }

  const toggleMode = () => {
    setConversationMode((prev) => {
      const nextMode = prev === 'metier' ? 'pause' : 'metier'
      setMessages((current) => [
        ...current,
        {
          id: `mode_${Date.now()}`,
          text: buildIntroMessage(nextMode),
          sender: 'assistant',
          timestamp: new Date(),
          status: 'sent',
          source: 'mode-switch',
        },
      ])
      return nextMode
    })
  }

  return (
    <>
      {isProtectedRhArea && (
        <>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              isOpen
                ? 'bg-slate-800 text-white rotate-90'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
            }`}
            aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
          >
            {isOpen ? <X className="w-7 h-7" /> : <Bot className="w-8 h-8" />}
          </button>

          {!isOpen && (
            <div className="fixed bottom-20 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assistant RH disponible</span>
            </div>
          )}
        </>
      )}

      {isOpen && isProtectedRhArea && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[min(78vh,720px)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:w-[420px]">
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">Assistant RH</h3>
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300"></span>
                  <span>{conversationMode === 'pause' ? 'Pause détente' : 'Mode métier'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleMode} className="rounded-full p-2 transition-colors hover:bg-white/10" title="Basculer en pause détente">
                <PauseCircle className="h-5 w-5" />
              </button>
              <button type="button" onClick={handleClearChat} className="rounded-full p-2 transition-colors hover:bg-white/10" title="Effacer la conversation">
                <RefreshCcw className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-2 transition-colors hover:bg-white/10" title="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {isFallbackMode && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Mode secours activé. Le backend RH n’a pas répondu correctement, les réponses peuvent être limitées.</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900/80">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Suggestions rapides</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleSendMessage(question)}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSendMessage()
                  }
                }}
                placeholder={conversationMode === 'pause' ? 'Une petite question, sans stress...' : 'Tapez votre message RH...'}
                disabled={isTyping}
                className="flex-1 rounded-2xl border border-transparent bg-slate-100 px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => void handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
              <p>Propulsé par RH Manager AI</p>
              <p className="truncate">
                {debugMeta?.source ? `source: ${debugMeta.source}` : 'source: en attente'}{debugMeta?.warning ? ` • warning: ${debugMeta.warning}` : ''}
              </p>
            </div>
            {debugMeta?.warning && !isFallbackMode && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  <ShieldCheck className="h-3 w-3" />
                  {debugMeta.warning}
                </span>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={() => copyToClipboard('Mode métier prioritaire', 'mode')} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                {copiedField === 'mode' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                Debug
              </button>
            </div>
          </div>
        </div>
      )}

      {!isProtectedRhArea && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          Le chat RH est disponible après connexion dans la zone protégée.
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
