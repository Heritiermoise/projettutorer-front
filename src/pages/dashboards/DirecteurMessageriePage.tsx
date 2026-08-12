import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, CheckCheck, MapPin, Phone, Search, Send, Video, X } from 'lucide-react'
import { internalMessagingAPI } from '../../services/api'

type Contact = { id: number; nom: string; prenom: string; email: string }
type Conversation = { id: number; contact_id: number; contact_nom: string; contact_prenom: string; dernier_message: string | null; date_dernier_message: string | null; non_lus: number }
type Message = { id: number; sender_id: number; body: string; read_at: string | null; created_at: string }
type CallSignal = { conversation_id: number; sender_id: number; type: 'offer' | 'answer' | 'ice-candidate' | 'hangup' | 'reject'; payload: string | Record<string, unknown> | null }
type IncomingCall = { conversationId: number; mode: 'audio' | 'video'; payload: RTCSessionDescriptionInit }

const initials = (firstName: string, lastName: string) => `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
const time = (value: string | null) => value ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : ''

export const DirecteurMessageriePage = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [feedback, setFeedback] = useState('Les messages et appels sont réservés aux collègues de votre entreprise.')
  const [sharingLocation, setSharingLocation] = useState(false)
  const [callMode, setCallMode] = useState<'audio' | 'video' | null>(null)
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const selectedConversationRef = useRef<Conversation | null>(null)

  const loadConversations = async () => {
    const response = await internalMessagingAPI.getConversations()
    setConversations(response.conversations || [])
  }

  const loadMessages = async (conversationId: number) => {
    const response = await internalMessagingAPI.getMessages(conversationId)
    setMessages(response.messages || [])
  }

  useEffect(() => {
    void Promise.all([internalMessagingAPI.getContacts(), loadConversations()])
      .then(([contactsResponse]) => setContacts(contactsResponse.contacts || []))
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Impossible de charger la messagerie.'))
  }, [])

  useEffect(() => {
    selectedConversationRef.current = selectedConversation
    if (selectedConversation) void loadMessages(selectedConversation.id).catch(() => undefined)
  }, [selectedConversation])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadConversations().catch(() => undefined)
      if (selectedConversationRef.current) void loadMessages(selectedConversationRef.current.id).catch(() => undefined)
      void receiveSignals()
    }, 3000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current
  }, [callMode])

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
  }, [remoteStream])

  const shareLocation = () => {
    if (!navigator.geolocation) {
      setFeedback('La géolocalisation n’est pas disponible sur cet appareil.')
      return
    }

    setSharingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await internalMessagingAPI.updateLocation(position.coords.latitude, position.coords.longitude)
          setFeedback('Position partagée avec succès.')
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : 'Impossible d’enregistrer votre position.')
        } finally {
          setSharingLocation(false)
        }
      },
      () => {
        setSharingLocation(false)
        setFeedback('La position est nécessaire pour sécuriser les échanges à moins de 200 m.')
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
    )
  }

  const openConversation = async (contact: Contact) => {
    try {
      const response = await internalMessagingAPI.createConversation(contact.id)
      const conversationId = response.conversation.id as number
      await loadConversations()
      setSelectedConversation({
        id: conversationId,
        contact_id: contact.id,
        contact_nom: contact.nom,
        contact_prenom: contact.prenom,
        dernier_message: null,
        date_dernier_message: null,
        non_lus: 0,
      })
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible d’ouvrir cette conversation.')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    try {
      await internalMessagingAPI.sendMessage(selectedConversation.id, newMessage.trim())
      setNewMessage('')
      await Promise.all([loadMessages(selectedConversation.id), loadConversations()])
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Message non envoyé.')
    }
  }

  const createPeerConnection = (conversationId: number) => {
    const iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]
    if (import.meta.env.VITE_WEBRTC_TURN_URL) {
      iceServers.push({
        urls: import.meta.env.VITE_WEBRTC_TURN_URL,
        username: import.meta.env.VITE_WEBRTC_TURN_USERNAME,
        credential: import.meta.env.VITE_WEBRTC_TURN_CREDENTIAL,
      })
    }
    const peerConnection = new RTCPeerConnection({ iceServers })
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) void internalMessagingAPI.sendSignal(conversationId, 'ice-candidate', event.candidate.toJSON()).catch(() => undefined)
    }
    peerConnection.ontrack = (event) => setRemoteStream(event.streams[0])
    peerConnectionRef.current = peerConnection
    return peerConnection
  }

  const startCall = async (mode: 'audio' | 'video') => {
    if (!selectedConversation) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === 'video' })
      localStreamRef.current = stream
      setCallMode(mode)
      const peerConnection = createPeerConnection(selectedConversation.id)
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream))
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      await internalMessagingAPI.sendSignal(selectedConversation.id, 'offer', { sdp: offer.sdp, type: offer.type, mode })
      setFeedback(`Appel ${mode === 'video' ? 'vidéo' : 'audio'} lancé. En attente de la réponse du destinataire.`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de démarrer l’appel. Vérifiez vos autorisations et la proximité.')
      endCall(false)
    }
  }

  const acceptIncomingCall = async () => {
    if (!incomingCall) return

    const { conversationId, mode, payload } = incomingCall
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === 'video' })
      localStreamRef.current = stream
      setCallMode(mode)
      const peerConnection = createPeerConnection(conversationId)
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream))
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload))
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      await internalMessagingAPI.sendSignal(conversationId, 'answer', { sdp: answer.sdp, type: answer.type })
      setIncomingCall(null)
      setFeedback(`Appel ${mode === 'video' ? 'vidéo' : 'audio'} accepté.`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible d’accepter l’appel. Vérifiez les autorisations du microphone ou de la caméra.')
      endCall(false)
    }
  }

  const rejectIncomingCall = async () => {
    if (!incomingCall) return
    try {
      await internalMessagingAPI.sendSignal(incomingCall.conversationId, 'reject')
    } catch {
      // The caller will stop on its next signaling refresh if the network is temporarily unavailable.
    }
    setIncomingCall(null)
    setFeedback('Appel refusé.')
  }

  const receiveSignals = async () => {
    try {
      const response = await internalMessagingAPI.getSignals()
      for (const signal of (response.signals || []) as CallSignal[]) {
        const payload = typeof signal.payload === 'string' ? JSON.parse(signal.payload) : signal.payload || {}
        if (signal.type === 'offer') {
          const mode = payload.mode === 'video' ? 'video' : 'audio'
          setIncomingCall({ conversationId: signal.conversation_id, mode, payload: payload as RTCSessionDescriptionInit })
          setFeedback(`Appel ${mode === 'video' ? 'vidéo' : 'audio'} entrant.`)
        }
        if (signal.type === 'answer' && peerConnectionRef.current) await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload as RTCSessionDescriptionInit))
        if (signal.type === 'ice-candidate' && peerConnectionRef.current) await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload as RTCIceCandidateInit))
        if (signal.type === 'hangup') endCall(false)
        if (signal.type === 'reject') {
          endCall(false)
          setFeedback('Le destinataire a refusé l’appel.')
        }
      }
    } catch {
      // The polling loop retries after a temporary network or permission failure.
    }
  }

  const endCall = (notify = true) => {
    const conversation = selectedConversationRef.current
    if (notify && conversation) void internalMessagingAPI.sendSignal(conversation.id, 'hangup').catch(() => undefined)
    peerConnectionRef.current?.close()
    peerConnectionRef.current = null
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null
    setRemoteStream(null)
    setCallMode(null)
  }

  const visibleContacts = contacts.filter((contact) => `${contact.prenom} ${contact.nom}`.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Messagerie interne</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Échanges et appels entre collègues de la même entreprise.</p>
        </div>
        <button onClick={shareLocation} disabled={sharingLocation} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60">
          <MapPin className="w-4 h-4" />
          {sharingLocation ? 'Partage en cours...' : 'Partager ma position'}
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">{feedback}</p>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-[calc(100vh-280px)] min-h-[520px]">
        <div className="flex h-full">
          <aside className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Rechercher un collègue" className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {visibleContacts.map((contact) => {
                const conversation = conversations.find((item) => item.contact_id === contact.id)
                return (
                  <button key={contact.id} onClick={() => conversation ? setSelectedConversation(conversation) : void openConversation(contact)} className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedConversation?.contact_id === contact.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">{initials(contact.prenom, contact.nom)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-800 dark:text-white truncate">{contact.prenom} {contact.nom}</span>
                        <span className="block text-sm text-slate-600 dark:text-slate-400 truncate">{conversation?.dernier_message || 'Démarrer une conversation'}</span>
                      </span>
                      {conversation && conversation.non_lus > 0 && <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">{conversation.non_lus}</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          <main className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversation ? <>
              <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Retour"><ArrowLeft className="w-5 h-5" /></button>
                  <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">{initials(selectedConversation.contact_prenom, selectedConversation.contact_nom)}</span>
                  <div><p className="font-semibold text-slate-800 dark:text-white">{selectedConversation.contact_prenom} {selectedConversation.contact_nom}</p><p className="text-xs text-slate-500">Collègue de votre entreprise</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => void startCall('audio')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Appel audio"><Phone className="w-5 h-5" /></button>
                  <button onClick={() => void startCall('video')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Appel vidéo"><Video className="w-5 h-5" /></button>
                </div>
              </header>

              {callMode && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-900">
                {callMode === 'video' && <video ref={localVideoRef} autoPlay muted playsInline className="w-full max-h-40 object-cover rounded-lg" />}
                {callMode === 'video' && <video ref={remoteVideoRef} autoPlay playsInline className="w-full max-h-40 object-cover rounded-lg" />}
                {callMode === 'audio' && <p className="text-white text-sm">Appel audio en cours</p>}
                <button onClick={() => endCall()} className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg"><X className="w-4 h-4" />Raccrocher</button>
              </div>}

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => <div key={message.id} className={`flex ${message.sender_id === selectedConversation.contact_id ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-2xl ${message.sender_id === selectedConversation.contact_id ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white' : 'bg-blue-600 text-white'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                    <div className="flex justify-end items-center gap-1 mt-1 text-xs opacity-75"><span>{time(message.created_at)}</span>{message.sender_id !== selectedConversation.contact_id && (message.read_at ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}</div>
                  </div>
                </div>)}
              </div>

              <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                <input value={newMessage} onChange={(event) => setNewMessage(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void sendMessage()} placeholder="Écrire un message" className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm" />
                <button onClick={() => void sendMessage()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" aria-label="Envoyer"><Send className="w-5 h-5" /></button>
              </footer>
            </> : <div className="flex-1 grid place-items-center p-6 text-center text-slate-600 dark:text-slate-400"><div><Send className="w-12 h-12 mx-auto mb-3 text-slate-400" /><p>Sélectionnez un collègue pour commencer un échange réel.</p></div></div>}
          </main>
        </div>
      </div>
      {incomingCall && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800"><p className="text-sm text-slate-500">Appel entrant</p><h2 className="mt-1 text-xl font-bold text-slate-800 dark:text-white">Appel {incomingCall.mode === 'video' ? 'vidéo' : 'audio'}</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Acceptez pour activer votre microphone{incomingCall.mode === 'video' ? ' et votre caméra' : ''}.</p><div className="mt-6 flex gap-3"><button type="button" onClick={() => void rejectIncomingCall()} className="flex-1 rounded-lg border border-red-300 px-4 py-2.5 font-semibold text-red-700">Refuser</button><button type="button" onClick={() => void acceptIncomingCall()} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white">Accepter</button></div></div></div>}
    </div>
  )
}
