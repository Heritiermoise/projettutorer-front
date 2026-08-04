import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertTriangle, Check, Mic, MicOff, PauseCircle, RefreshCcw, Send, ShieldCheck, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { AssistantMark } from './AssistantMark'
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

const PUBLIC_QUESTIONS = ['Comment créer un compte ?', 'Comment consulter les offres ?', 'Comment récupérer mon mot de passe ?']
const PRIVATE_QUESTIONS = ['Combien avons-nous d’employés actifs ?', 'Quels congés sont en attente ?', 'Résume la situation RH actuelle.']

type SpeechRecognitionEventLike = Event & {
  results: ArrayLike<{ 0: { transcript: string } }>
}

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

export const ChatWidget: React.FC = () => {
  const location = useLocation()
  const session = useMemo(() => {
    const authenticated = Boolean(localStorage.getItem('auth_token') || localStorage.getItem('token'))
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      return { authenticated, role: String(user?.role || 'utilisateur').toLowerCase() }
    } catch {
      return { authenticated, role: 'utilisateur' }
    }
  }, [location.pathname])

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = chatAPI.getHistoryFromStorage()
    return stored.length > 0 ? stored : [WELCOME_MESSAGE]
  })
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationMode, setConversationMode] = useState<ConversationMode>('metier')
  const [conversationId, setConversationId] = useState<string | null>(() => chatAPI.getConversationId())
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(session.authenticated ? PRIVATE_QUESTIONS : PUBLIC_QUESTIONS)
  const [debugMeta, setDebugMeta] = useState<{ source?: string; warning?: string } | null>(null)
  const [isFallbackMode, setIsFallbackMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const speechRecognitionSupported = typeof window !== 'undefined' && Boolean(
    (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
    (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition
  )

  useEffect(() => {
    chatAPI.saveHistory(messages)
  }, [messages])

  useEffect(() => {
    const scopedHistory = chatAPI.getHistoryFromStorage()
    setMessages(scopedHistory.length > 0 ? scopedHistory : [{
      ...WELCOME_MESSAGE,
      id: `welcome_${session.authenticated ? session.role : 'visitor'}`,
      text: session.authenticated
        ? `Bonjour. NOVA RH est connecté à votre espace ${session.role} et limite ses réponses à vos autorisations.`
        : 'Bonjour. Je suis NOVA RH. Je peux vous guider sur les offres, l’inscription et les fonctionnalités publiques.',
      timestamp: new Date(),
    }])
    setConversationId(chatAPI.getConversationId())
    setSuggestedQuestions(session.authenticated ? PRIVATE_QUESTIONS : PUBLIC_QUESTIONS)
    setDebugMeta(null)
    setIsFallbackMode(false)
  }, [session.authenticated, session.role])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [isOpen])

  useEffect(() => () => {
    recognitionRef.current?.stop()
    window.speechSynthesis?.cancel()
  }, [])

  const buildIntroMessage = (mode: ConversationMode) => {
    if (mode === 'pause') {
      return 'Pause détente activée. Je reste utile, mais avec un ton plus léger. Revenez au mode métier à tout moment.'
    }
    return 'Mode métier activé. Je réponds en priorité avec des données RH et opérationnelles.'
  }

  const speak = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    utterance.rate = 1
    window.speechSynthesis.speak(utterance)
  }

  const toggleListening = () => {
    if (!speechRecognitionSupported) return
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.lang = 'fr-FR'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || ''
      setInputValue(transcript)
      inputRef.current?.focus()
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
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

    const response = await chatAPI.sendMessage(content, {
      conversationId: conversationId || undefined,
      mode: conversationMode === 'pause' ? 'fun' : 'assistant',
    })
    const reply = response.reply || response.response || ''
    const source = response.source || 'unknown'
    const warning = response.warning || ''

    setIsTyping(false)
    setDebugMeta({ source, warning })
    setIsFallbackMode(source === 'local-fallback')
    if (response.conversationId) setConversationId(response.conversationId)
    if (response.suggestions?.length) setSuggestedQuestions(response.suggestions)

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
      speak(reply)
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
    setConversationId(null)
    setSuggestedQuestions(session.authenticated ? PRIVATE_QUESTIONS : PUBLIC_QUESTIONS)
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
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 grid h-16 w-16 place-items-center rounded-lg shadow-2xl transition-transform duration-200 hover:scale-105 ${isOpen ? 'bg-slate-900 text-white' : 'bg-transparent'}`}
        aria-label={isOpen ? 'Fermer NOVA RH' : 'Ouvrir NOVA RH'}
      >
        {isOpen ? <X className="h-7 w-7" /> : <AssistantMark />}
      </button>

      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>NOVA RH</span>
          <span className="text-slate-400">{session.authenticated ? 'Connecté' : 'Visiteur'}</span>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(78vh,720px)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:right-6 sm:w-[440px]">
          <div className="flex items-center justify-between bg-slate-950 p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <AssistantMark compact />
              <div>
                <h3 className="text-base font-bold">NOVA RH</h3>
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300"></span>
                  <span>{session.authenticated ? `Accès ${session.role}` : 'Accès public sécurisé'}</span>
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
                {suggestedQuestions.map((question) => (
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
              <button
                type="button"
                onClick={toggleListening}
                disabled={!speechRecognitionSupported || isTyping}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isListening ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}`}
                title={speechRecognitionSupported ? (isListening ? 'Arrêter l’écoute' : 'Dicter la question') : 'Reconnaissance vocale non disponible'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
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
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Envoyer"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Données limitées à vos autorisations</span>
              <button type="button" onClick={() => setSpeechEnabled((current) => !current)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900" title={speechEnabled ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'}>
                {speechEnabled ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
            {debugMeta?.warning && !isFallbackMode && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  <ShieldCheck className="h-3 w-3" />
                  {debugMeta.warning}
                </span>
              </div>
            )}
          </div>
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
