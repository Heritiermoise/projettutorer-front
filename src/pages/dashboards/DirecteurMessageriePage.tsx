import { useState } from 'react'
import { Search, Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft, Check, CheckCheck } from 'lucide-react'
import { mockConversations, mockMessages } from '../../data/phase5Data'
import type { Conversation, Message } from '../../data/phase5Data'

export const DirecteurMessageriePage = () => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredConvs = conversations.filter(c => 
    c.titre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConv) return
    const msg: Message = {
      id: Date.now(),
      conversation_id: selectedConv.id,
      expediteur: 'Moi',
      contenu: newMessage,
      date: new Date().toLocaleString('fr-FR'),
      lu: false,
      type: 'texte'
    }
    setMessages([...messages, msg])
    setNewMessage('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Messagerie</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Communication en temps reel</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-[calc(100vh-250px)]">
        <div className="flex h-full">
          {/* Liste des conversations */}
          <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.map(conv => (
                <div key={conv.id} onClick={() => setSelectedConv(conv)} className={`p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedConv?.id === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{conv.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-800 dark:text-white truncate">{conv.titre}</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{conv.date_dernier_message.split(' ')[1]}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{conv.dernier_message}</p>
                    </div>
                    {conv.non_lus > 0 && (
                      <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">{conv.non_lus}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone de conversation */}
          <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
            {selectedConv ? (
              <>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{selectedConv.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedConv.titre}</p>
                      <p className="text-xs text-green-600">En ligne</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Video className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.filter(m => m.conversation_id === selectedConv.id).map(msg => (
                    <div key={msg.id} className={`flex ${msg.expediteur === 'Moi' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-2xl ${msg.expediteur === 'Moi' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'}`}>
                        <p className="text-sm">{msg.contenu}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 ${msg.expediteur === 'Moi' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                          <span className="text-xs">{msg.date.split(' ')[1]}</span>
                          {msg.expediteur === 'Moi' && (msg.lu ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Paperclip className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Smile className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ecrire un message..." className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm" onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                    <button onClick={handleSendMessage} className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><Send className="w-5 h-5" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">Selectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}