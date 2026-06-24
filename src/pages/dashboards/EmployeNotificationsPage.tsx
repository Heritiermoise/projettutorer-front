import { useState, useRef } from 'react'
import { Mail, Send, Inbox, Star, Trash2, Archive, Search, Paperclip, MessageSquare, ArrowLeft, Bold, Italic, Smile } from 'lucide-react'
import { EmojiPicker } from '../../components/EmojiPicker'
import { employeNotifications } from '../../data/notifications'

export const EmployeNotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts' | 'templates'>('inbox')
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [sentMessages, setSentMessages] = useState<any[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const messages = employeNotifications.map((n, i) => ({
    id: n.id,
    from: n.type === 'error' ? 'Systeme RH' : 'Service RH',
    email: 'rh@entreprise.com',
    subject: n.title,
    preview: n.message,
    date: n.date,
    read: n.read,
    starred: i === 0,
  }))

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return
    const newSent = {
      id: Date.now(),
      to: selectedMessage.from,
      email: selectedMessage.email,
      subject: 'Re: ' + selectedMessage.subject,
      preview: replyText,
      date: 'A l\'instant',
      read: true,
    }
    setSentMessages([newSent, ...sentMessages])
    setReplyText('')
    setShowEmojiPicker(false)
    alert('Message envoye au service RH avec succes !')
  }

  const insertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const newText = replyText.substring(0, start) + emoji + replyText.substring(end)
      setReplyText(newText)
      setTimeout(() => {
        textareaRef.current?.focus()
        textareaRef.current?.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setReplyText(replyText + emoji)
    }
  }

  const filteredMessages = messages.filter(m => 
    m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.from.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentMessages = activeTab === 'sent' ? sentMessages : filteredMessages

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Mes Messages</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Communication avec le service RH</p>
        </div>
        <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 text-sm">
          <Mail className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau message</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="lg:hidden p-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
          {selectedMessage ? (
            <button onClick={() => { setSelectedMessage(null); setShowEmojiPicker(false) }} className="flex items-center space-x-2 text-secondary-600">
              <ArrowLeft className="w-5 h-5" /><span>Retour</span>
            </button>
          ) : (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm" />
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(100vh-300px)] lg:h-[600px]">
          <div className={`lg:w-80 lg:border-r border-slate-200 dark:border-slate-700 flex flex-col ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
            <div className="hidden lg:block p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
              {[
                { id: 'inbox', label: 'Recus', count: messages.filter(m => !m.read).length, icon: Inbox },
                { id: 'sent', label: 'Envoyes', count: sentMessages.length, icon: Send },
                { id: 'drafts', label: 'Brouillons', count: 1, icon: Paperclip },
                { id: 'templates', label: 'Modeles', count: 2, icon: MessageSquare },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center space-x-1 py-3 px-2 text-xs sm:text-sm font-semibold whitespace-nowrap ${activeTab === tab.id ? 'text-secondary-600 border-b-2 border-secondary-600' : 'text-slate-600 dark:text-slate-400'}`}>
                  <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
                  {tab.count > 0 && <span className="ml-1 px-1.5 py-0.5 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-full text-xs">{tab.count}</span>}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'templates' ? (
                <div className="p-2 space-y-1">
                  {['Demande de conge', 'Question sur la paie'].map((t, i) => (
                    <div key={i} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer">
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">{t}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Modele employe...</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {currentMessages.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                      <Mail className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucun message</p>
                    </div>
                  ) : (
                    currentMessages.map((msg: any) => (
                      <div key={msg.id} onClick={() => { setSelectedMessage(msg); setShowEmojiPicker(false) }} className={`p-3 sm:p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedMessage?.id === msg.id ? 'bg-secondary-50 dark:bg-secondary-900/20 border-l-4 border-secondary-500' : ''} ${!msg.read ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm truncate ${!msg.read ? 'font-bold text-slate-800 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>{msg.from || msg.to}</p>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">{msg.date}</span>
                        </div>
                        <p className={`text-sm truncate ${!msg.read ? 'font-semibold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{msg.subject}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{msg.preview}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={`flex-1 flex flex-col ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
            {selectedMessage ? (
              <>
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white truncate">{selectedMessage.subject}</h2>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Star className={`w-5 h-5 ${selectedMessage.starred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} /></button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Archive className="w-5 h-5 text-slate-400" /></button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Trash2 className="w-5 h-5 text-slate-400" /></button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{(selectedMessage.from || selectedMessage.to || '?')[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedMessage.from || selectedMessage.to}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{selectedMessage.email} • {selectedMessage.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                    <p>{selectedMessage.preview}</p>
                    <p className="mt-4">Cordialement,<br/>{selectedMessage.from || selectedMessage.to}</p>
                  </div>
                </div>
                <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4 mb-3 relative">
                    <textarea
                      ref={textareaRef}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Ecrire une reponse..."
                      className="w-full h-20 sm:h-24 bg-transparent border-0 focus:ring-0 resize-none text-sm sm:text-base"
                    />
                    {showEmojiPicker && (
                      <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmojiPicker(false)} />
                    )}
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Bold className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Italic className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Paperclip className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ${showEmojiPicker ? 'bg-secondary-100 dark:bg-secondary-900/30' : ''}`}>
                        <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      </button>
                    </div>
                    <button onClick={handleSendReply} disabled={!replyText.trim()} className="px-4 sm:px-6 py-2 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 flex items-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send className="w-4 h-4" /><span>Envoyer</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg text-slate-500 dark:text-slate-400">Selectionnez un message</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}