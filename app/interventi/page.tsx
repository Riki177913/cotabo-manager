'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

type InterventoStatus = 'in_corso' | 'completato' | 'annullato'
type InterventoTipo = 'sostituzione_chiamataxi' | 'sostituzione_sim_chiamataxi' | 'sostituzione_batteria_caricabatteria' | 'assistenza_web' | 'consegna_materiale' | 'altro'

interface InterventoWithClient {
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
  clients?: {
    company_name: string
  }
}

const TIPO_LABELS: Record<InterventoTipo, string> = {
  sostituzione_chiamataxi: '🔄 Sost. Chiamataxi',
  sostituzione_sim_chiamataxi: '📱 Sost. SIM',
  sostituzione_batteria_caricabatteria: '🔋 Batteria/Caricab.',
  assistenza_web: '💻 Assistenza Web',
  consegna_materiale: '📦 Consegna Materiale',
  altro: '📋 Altro',
}

export default function InterventiPage() {
  const [interventi, setInterventi] = useState<InterventoWithClient[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<InterventoStatus | 'all'>('all')
  const [filterTipo, setFilterTipo] = useState<InterventoTipo | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data } = await supabase
      .from('interventi')
      .select(`
        *,
        clients (
          company_name
        )
      `)
      .order('data_intervento', { ascending: false })

    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, company_name')
      .order('company_name', { ascending: true })

    setInterventi(data || [])
    setClients(clientsData || [])
    setLoading(false)
  }

  const filteredInterventi = interventi.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false
    if (filterTipo !== 'all' && i.tipo !== filterTipo) return false
    return true
  })

  const getStatusBadge = (status: InterventoStatus) => {
    switch (status) {
      case 'completato':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completato</span>
      case 'in_corso':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">In Corso</span>
      case 'annullato':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Annullato</span>
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
          <h1 className="text-xl font-bold">COTABO Manager</h1>
          <Link href="/" className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
            ← Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">🔧 Riepilogo Interventi</h2>
            <p className="text-gray-600">Storico completo di tutti gli interventi tecnici</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>+</span> Nuovo Intervento
          </button>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Totale Interventi</p>
            <p className="text-2xl font-bold text-gray-900">{interventi.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">In Corso</p>
            <p className="text-2xl font-bold text-blue-600">{interventi.filter(i => i.status === 'in_corso').length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Completati</p>
            <p className="text-2xl font-bold text-green-600">{interventi.filter(i => i.status === 'completato').length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-gray-400">
            <p className="text-sm text-gray-600">Annullati</p>
            <p className="text-2xl font-bold text-gray-600">{interventi.filter(i => i.status === 'annullato').length}</p>
          </div>
        </div>

        {/* Filtri */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as InterventoStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Tutti gli stati</option>
                <option value="in_corso">In Corso</option>
                <option value="completato">Completati</option>
                <option value="annullato">Annullati</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value as InterventoTipo | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Tutte le tipologie</option>
                <option value="sostituzione_chiamataxi">Sost. Chiamataxi</option>
                <option value="sostituzione_sim_chiamataxi">Sost. SIM</option>
                <option value="sostituzione_batteria_caricabatteria">Batteria/Caricab.</option>
                <option value="assistenza_web">Assistenza Web</option>
                <option value="consegna_materiale">Consegna Materiale</option>
                <option value="altro">Altro</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : filteredInterventi.length > 0 ? (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipologia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titolo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tecnico</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInterventi.map((intervento) => (
                    <tr key={intervento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(intervento.data_intervento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/clienti/${intervento.client_id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {intervento.clients?.company_name || 'N/D'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {TIPO_LABELS[intervento.tipo]}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {intervento.titolo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {intervento.tecnico_nome || 'N/D'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(intervento.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/clienti/${intervento.client_id}/interventi`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Dettagli →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 text-lg mb-2">Nessun intervento trovato</p>
            <p className="text-sm text-gray-400">
              {filterStatus !== 'all' || filterTipo !== 'all'
                ? 'Prova a modificare i filtri'
                : 'Clicca su "+ Nuovo Intervento" per aggiungere il primo'}
            </p>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddInterventoModal
          clients={clients}
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

function AddInterventoModal({ clients, onClose, onSuccess }: { 
  clients: any[]
  onClose: () => void
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
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

    if (!formData.client_id) {
      alert('Seleziona un cliente')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('interventi').insert({
      client_id: formData.client_id,
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">🔧 Nuovo Intervento</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente *
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">-- Seleziona un cliente --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </select>
          </div>

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
              <option value="consegna_materiale">📦 Consegna Materiale</option>
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