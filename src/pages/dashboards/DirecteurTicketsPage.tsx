import { useState } from 'react'
import { MessageSquare, Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, XCircle, Eye, X, Send, User, Tag } from 'lucide-react'
import { mockTickets } from '../../data/phase3Data'
import type { TicketSupport } from '../../data/phase3Data'

export const DirecteurTicketsPage = () => {
  const [tickets, setTickets] = useState<TicketSupport[]>(mockTickets)
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterPriorite, setFilterPriorite] = useState('all')
  const [filterCategorie, setFilterCategorie] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState<TicketSupport | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [formData, setFormData] = useState({ titre: '', description: '', categorie: 'Administratif', priorite: 'Moyenne' })

  const filteredTickets = tickets.filter(t => {
    const matchesStatut = filterStatut === 'all' || t.statut === filterStatut
    const matchesPriorite = filterPriorite === 'all' || t.priorite === filterPriorite
    const matchesCategorie = filterCategorie === 'all' || t.categorie === filterCategorie
    return matchesStatut && matchesPriorite && matchesCategorie
  })

  const stats = {
    total: tickets.length,
    ouverts: tickets.filter(t => t.statut === 'Ouvert').length,
    enCours: tickets.filter(t => t.statut === 'En_cours').length,
    resolus: tickets.filter(t => t.statut === 'Resolu').length,
    urgents: tickets.filter(t => t.priorite === 'Urgente').length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTicket: TicketSupport = {
      id: Date.now(),
      ...formData,
      statut: 'Ouvert',
      demandeur: 'Moise Vita (DG)',
      date_creation: new Date().toISOString().split('T')[0],
      messages: [{ id: 1, auteur: 'Moise Vita (DG)', contenu: formData.description, date: new Date().toLocaleString('fr-FR'), est_interne: false }]
    }
    setTickets([newTicket, ...tickets])
    setShowCreateModal(false)
    setFormData({ titre: '', description: '', categorie: 'Administratif', priorite: 'Moyenne' })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return
    const message = {
      id: Date.now(),
      auteur: 'Moise Vita (DG)',
      contenu: newMessage,
      date: new Date().toLocaleString('fr-FR'),
      est_interne: false
    }
    setTickets(tickets.map(t => 
      t.id === selectedTicket.id ? { ...t, messages: [...t.messages, message], statut: 'En_cours' as const } : t
    ))
    setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, message], statut: 'En_cours' })
    setNewMessage('')
  }

  const handleResolve = (id: number) => {
    setTickets(tickets.map(t => 
      t.id === id ? { ...t, statut: 'Resolu' as const, date_resolution: new Date().toISOString().split('T')[0] } : t
    ))
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Ouvert': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'En_cours': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Resolu': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Ferme': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    }
    return colors[statut] || colors['Ouvert']
  }

  const getPrioriteColor = (priorite: string) => {
    const colors: Record<string, string> = {
      'Basse': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'Moyenne': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Haute': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Urgente': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    return colors[priorite] || colors['Moyenne']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Support & Tickets RH</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion des demandes et incidents</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouveau ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: MessageSquare, color: 'from-amber-500 to-orange-600' },
          { label: 'Ouverts', value: stats.ouverts, icon: AlertCircle, color: 'from-blue-500 to-cyan-600' },
          { label: 'En cours', value: stats.enCours, icon: Clock, color: 'from-amber-500 to-yellow-600' },
          { label: 'Resolus', value: stats.resolus, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
          { label: 'Urgents', value: stats.urgents, icon: XCircle, color: 'from-red-500 to-rose-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous statuts</option>
            <option value="Ouvert">Ouvert</option>
            <option value="En_cours">En cours</option>
            <option value="Resolu">Resolu</option>
            <option value="Ferme">Ferme</option>
          </select>
          <select value={filterPriorite} onChange={(e) => setFilterPriorite(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Toutes priorites</option>
            <option value="Basse">Basse</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Haute">Haute</option>
            <option value="Urgente">Urgente</option>
          </select>
          <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Toutes categories</option>
            <option value="Administratif">Administratif</option>
            <option value="Technique">Technique</option>
            <option value="Paie">Paie</option>
            <option value="Conges">Conges</option>
            <option value="Formation">Formation</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTickets.map(ticket => (
          <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer" onClick={() => { setSelectedTicket(ticket); setShowDetailModal(true) }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  ticket.priorite === 'Urgente' ? 'bg-red-100 dark:bg-red-900/30' :
                  ticket.priorite === 'Haute' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <MessageSquare className={`w-6 h-6 ${
                    ticket.priorite === 'Urgente' ? 'text-red-600' :
                    ticket.priorite === 'Haute' ? 'text-amber-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white">{ticket.titre}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatutColor(ticket.statut)}`}>
                      {ticket.statut.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPrioriteColor(ticket.priorite)}`}>
                      {ticket.priorite}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{ticket.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{ticket.demandeur}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>{ticket.categorie}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{ticket.date_creation}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{ticket.messages.length} messages</span>
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 flex-shrink-0">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedTicket.titre}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatutColor(selectedTicket.statut)}`}>
                    {selectedTicket.statut.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPrioriteColor(selectedTicket.priorite)}`}>
                    {selectedTicket.priorite}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{selectedTicket.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>De: {selectedTicket.demandeur}</span>
                  <span>•</span>
                  <span>Categorie: {selectedTicket.categorie}</span>
                  <span>•</span>
                  <span>Crée le: {selectedTicket.date_creation}</span>
                  {selectedTicket.assigne_a && <><span>•</span><span>Assigné à: {selectedTicket.assigne_a}</span></>}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-3">Conversation ({selectedTicket.messages.length})</h4>
                <div className="space-y-3">
                  {selectedTicket.messages.map(msg => (
                    <div key={msg.id} className={`p-4 rounded-xl ${msg.est_interne ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{msg.auteur[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{msg.auteur}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{msg.date}</p>
                          </div>
                        </div>
                        {msg.est_interne && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">Interne</span>}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{msg.contenu}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-slate-800 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex space-x-2">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ecrire une reponse..." className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                  <button onClick={handleSendMessage} className="px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {selectedTicket.statut !== 'Resolu' && (
                  <button onClick={() => handleResolve(selectedTicket.id)} className="w-full mt-3 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold">
                    Marquer comme resolu
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nouveau ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre *</label>
                <input type="text" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Categorie</label>
                  <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="Administratif">Administratif</option>
                    <option value="Technique">Technique</option>
                    <option value="Paie">Paie</option>
                    <option value="Conges">Conges</option>
                    <option value="Formation">Formation</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Priorite</label>
                  <select value={formData.priorite} onChange={(e) => setFormData({...formData, priorite: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="Basse">Basse</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Creer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}