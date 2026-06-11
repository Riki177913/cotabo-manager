'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type InterventoStatus = 'in_corso' | 'completato' | 'annullato'
type InterventoTipo = 'sostituzione_chiamataxi' | 'sostituzione_sim_chiamataxi' | 'sostituzione_batteria_caricabatteria' | 'assistenza_web' | 'consegna_materiale' | 'altro'

interface Intervento {
  id: string
  client_id: string
  tipo: InterventoTipo
  titolo: string
  descrizione: string | null
  status: InterventoStatus
  tecnico_nome: string | null
  data_intervento: string
  data_completamento: string | null
  note: string | null
  created_at: string
}

const TIPO_LABELS: Record<InterventoTipo, string> = {
  sostituzione_chiamataxi: '🔄 Sostituzione Chiamataxi',
  sostituzione_sim_chiamataxi: '📱 Sostituzione SIM Chiamataxi',
  sostituzione_batteria_caricabatteria: '🔋 Sostituzione Batteria/Caricabatteria',
  assistenza_web: '💻 Assistenza Web',
  consegna_materiale: '📦 Consegna Materiale',
  altro: '📋 Altro',
}

const TIPO_ICONS: Record<InterventoTipo, string> = {
  sostituzione_chiamataxi: '🔄',
  sostituzione_sim_chiamataxi: '📱',
  sostituzione_batteria_caricabatteria: '🔋',
  assistenza_web: '💻',
  consegna_materiale: '📦',
  altro: '📋',
}

export default function ClienteInterventiPage() {
  const params = useParams()
  const clientId = params.id as string
  
  const [interventi, setInterventi] = useState<Intervento[]>([])
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<InterventoStatus | 'all'>('all')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: clientData } = await supabase
      .from('clients')
      .select('company_name')
      .eq('id', clientId)
      .single()

    const { data: interventiData } = await supabase
      .from('interventi')
      .select('*')
      .eq('client_id', clientId)
      .order('data_intervento', { ascending: false })

    setClient(clientData)
    setInterventi(interventiData || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo intervento?')) return

    const { error } = await supabase
      .from('interventi')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      alert('Intervento eliminato con successo!')
      loadData()
    }
  }

  const filteredInterventi = filterStatus === 'all' 
    ? interventi 
    : interventi.filter(i => i.status === filterStatus)

  const getStatusBadge = (status: InterventoStatus) => {
    switch (status) {
      case 'completato':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completato</span>
      case 'in_corso':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">In Corso</span>
      case 'annullato':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Annullato</span>
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/D'
    return new Date(date).toLocaleDateString('it-IT')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">COTABO Manager</h1>
            <p className="text-sm text-blue-100">{client?.company_name}</p>
          </div>
          <Link href={`/clienti/${clientId}`} className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
            ← Torna al cliente
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📋 Storico Interventi</h2>
            <p className="text-gray-600 text-sm mt-1">
              {filteredInterventi.length} intervento{filteredInterventi.length !== 1 ? 'i' : ''} trovato{filteredInterventi.length !== 1 ? 'i' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>+</span> Nuovo Intervento
          </button>
        </div>

        {/* Filtri */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tutti ({interventi.length})
            </button>
            <button
              onClick={() => setFilterStatus('in_corso')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'in_corso'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Corso ({interventi.filter(i => i.status === 'in_corso').length})
            </button>
            <button
              onClick={() => setFilterStatus('completato')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'completato'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completati ({interventi.filter(i => i.status === 'completato').length})
            </button>
            <button
              onClick={() => setFilterStatus('annullato')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'annullato'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Annullati ({interventi.filter(i => i.status === 'annullato').length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : filteredInterventi.length > 0 ? (
          <div className="space-y-4">
            {filteredInterventi.map((intervento) => (
              <div key={intervento.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">
                        {TIPO_ICONS[intervento.tipo]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {intervento.titolo}
                        </h3>
                        <p className="text-sm text-orange-600 font-medium mb-2">
                          {TIPO_LABELS[intervento.tipo]}
                        </p>
                        {intervento.descrizione && (
                          <p className="text-gray-600 text-sm mb-2">
                            {intervento.descrizione}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {getStatusBadge(intervento.status)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Data: {formatDate(intervento.data_intervento)}</span>
                      </div>
                      {intervento.tecnico_nome && (
                        <div className="flex items-center gap-2">
                          <span></span>
                          <span>Tecnico: {intervento.tecnico_nome}</span>
                        </div>
                      )}
                      {intervento.data_completamento && (
                        <div className="flex items-center gap-2">
                          <span>✅</span>
                          <span>Completato: {formatDate(intervento.data_completamento)}</span>
                        </div>
                      )}
                    </div>

                    {intervento.note && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Note:</strong> {intervento.note}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDelete(intervento.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 text-lg mb-2">Nessun intervento trovato</p>
            <p className="text-sm text-gray-400">
              {filterStatus === 'all' 
                ? 'Clicca su "+ Nuovo Intervento" per aggiungere il primo intervento' 
                : 'Nessun intervento con lo stato selezionato'}
            </p>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddInterventoModal
          clientId={clientId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

function AddInterventoModal({ clientId, onClose, onSuccess }: { 
  clientId: string
  onClose: () => void
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tipo: 'sostituzione_chiamataxi' as InterventoTipo,
    titolo: '',
    descrizione: '',
    status: 'in_corso' as InterventoStatus,
    tecnico_nome: '',
    data_intervento: new Date().toISOString().split('T')[0],
    data_completamento: '',
    note: '',
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('interventi').insert({
      client_id: clientId,
      tipo: formData.tipo,
      titolo: formData.titolo,
      descrizione: formData.descrizione || null,
      status: formData.status,
      tecnico_nome: formData.tecnico_nome || null,
      data_intervento: formData.data_intervento,
      data_completamento: formData.data_completamento || null,
      note: formData.note || null,
    })

    if (error) {
      alert('Errore: ' + error.message)
      setLoading(false)
    } else {
      alert('Intervento aggiunto con successo!')
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4"> Nuovo Intervento</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipologia Intervento *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value as InterventoTipo})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="sostituzione_chiamataxi"> Sostituzione Chiamataxi</option>
              <option value="sostituzione_sim_chiamataxi">📱 Sostituzione SIM Chiamataxi</option>
              <option value="sostituzione_batteria_caricabatteria"> Sostituzione Batteria/Caricabatteria</option>
              <option value="assistenza_web">💻 Assistenza Web</option>
              <option value="consegna_materiale"> Consegna Materiale</option>
              <option value="altro">📋 Altro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo *
            </label>
            <input
              type="text"
              value={formData.titolo}
              onChange={(e) => setFormData({...formData, titolo: e.target.value})}
              required
              placeholder="es. Sostituzione SIM guasta per dispositivo #1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              value={formData.descrizione}
              onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
              rows={3}
              placeholder="Descrivi l'intervento effettuato..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stato *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as InterventoStatus})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="in_corso">In Corso</option>
                <option value="completato">Completato</option>
                <option value="annullato">Annullato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tecnico
              </label>
              <input
                type="text"
                value={formData.tecnico_nome}
                onChange={(e) => setFormData({...formData, tecnico_nome: e.target.value})}
                placeholder="Nome del tecnico"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Intervento *
              </label>
              <input
                type="date"
                value={formData.data_intervento}
                onChange={(e) => setFormData({...formData, data_intervento: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Completamento
              </label>
              <input
                type="date"
                value={formData.data_completamento}
                onChange={(e) => setFormData({...formData, data_completamento: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              rows={2}
              placeholder="Note aggiuntive..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : '💾 Salva Intervento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}