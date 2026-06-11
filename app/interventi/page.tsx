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
  sostituzione_chiamataxi: ' Sost. Chiamataxi',
  sostituzione_sim_chiamataxi: '📱 Sost. SIM',
  sostituzione_batteria_caricabatteria: '🔋 Batteria/Caricab.',
  assistenza_web: '💻 Assistenza Web',
  consegna_materiale: '📦 Consegna Materiale',
  altro: ' Altro',
}

export default function InterventiPage() {
  const [interventi, setInterventi] = useState<InterventoWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<InterventoStatus | 'all'>('all')
  const [filterTipo, setFilterTipo] = useState<InterventoTipo | 'all'>('all')
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

    setInterventi(data || [])
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
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🔧 Riepilogo Interventi</h2>
          <p className="text-gray-600">Storico completo di tutti gli interventi tecnici</p>
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
                : 'Nessun intervento registrato'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}