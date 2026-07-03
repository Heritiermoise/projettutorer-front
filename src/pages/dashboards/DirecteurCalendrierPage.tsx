import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, X } from 'lucide-react'
import { mockEvenements } from '../../data/phase5Data'
import type { EvenementCalendrier } from '../../data/phase5Data'

export const DirecteurCalendrierPage = () => {
  const [evenements] = useState<EvenementCalendrier[]>(mockEvenements)
  const [currentMonth, setCurrentMonth] = useState(6)
  const [currentYear, setCurrentYear] = useState(2026)
  const [filterType, setFilterType] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<EvenementCalendrier | null>(null)

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
  const monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

  const filteredEvents = evenements.filter(e => filterType === 'all' || e.type === filterType)

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filteredEvents.filter(e => e.date_debut <= dateStr && e.date_fin >= dateStr)
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'conge': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'entretien': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'formation': 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
      'ferie': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'reunion': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    }
    return colors[type] || colors['reunion']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Calendrier Partage</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Vue d'ensemble des evenements</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvel evenement</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: evenements.length, color: 'bg-primary-500' },
          { label: 'Conges', value: evenements.filter(e => e.type === 'conge').length, color: 'bg-green-500' },
          { label: 'Entretiens', value: evenements.filter(e => e.type === 'entretien').length, color: 'bg-amber-500' },
          { label: 'Formations', value: evenements.filter(e => e.type === 'formation').length, color: 'bg-purple-500' },
          { label: 'Reunions', value: evenements.filter(e => e.type === 'reunion').length, color: 'bg-blue-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-12 ${stat.color} rounded-full`}></div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentMonth(currentMonth === 1 ? 12 : currentMonth - 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{monthNames[currentMonth - 1]} {currentYear}</h2>
            <button onClick={() => setCurrentMonth(currentMonth === 12 ? 1 : currentMonth + 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">
            <option value="all">Tous les types</option>
            <option value="conge">Conges</option>
            <option value="entretien">Entretiens</option>
            <option value="formation">Formations</option>
            <option value="ferie">Jours feries</option>
            <option value="reunion">Reunions</option>
          </select>
        </div>

        <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-700/50">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 border-b border-r border-slate-100 dark:border-slate-700"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const events = getEventsForDay(day)
            return (
              <div key={day} className="h-24 border-b border-r border-slate-100 dark:border-slate-700 p-1 overflow-hidden">
                <div className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{day}</div>
                <div className="space-y-1">
                  {events.slice(0, 2).map(event => (
                    <div key={event.id} onClick={() => setSelectedEvent(event)} className={`text-xs px-1 py-0.5 rounded cursor-pointer truncate ${getTypeColor(event.type)}`}>
                      {event.titre}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">+{events.length - 2} autres</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedEvent.titre}</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(selectedEvent.type)}`}>
                {selectedEvent.type}
              </div>
              <p className="text-slate-600 dark:text-slate-400">{selectedEvent.description}</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-800 dark:text-white">Du {selectedEvent.date_debut} au {selectedEvent.date_fin}</span>
                </div>
                {selectedEvent.lieu && (
                  <div className="text-sm text-slate-800 dark:text-white">Lieu: {selectedEvent.lieu}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}