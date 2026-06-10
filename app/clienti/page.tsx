'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ClientiPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('company_name', { ascending: true })

    if (error) {
      console.error('Errore nel caricamento:', error)
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(clientId: string, clientName: string) {
    if (!confirm(`Sei sicuro di voler eliminare "${clientName}"? Questa azione è irreversibile.`)) {
      return
    }

    try {
      // Elimina prima i dati correlati
      await supabase.from('chiamataxi_devices').delete().eq('client_id', clientId)
      await supabase.from('btaxi_credentials').delete().eq('client_id', clientId)
      
      // Elimina il cliente
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) {
        alert('Errore durante l\'eliminazione: ' + error.message)
      } else {
        // Rimuovi dalla lista senza ricaricare
        setClients(clients.filter(c => c.id !== clientId))
        alert('Cliente eliminato con successo!')
      }
    } catch (err) {
      alert('Errore imprevisto')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">🚖 COTABO Manager</h1>
          <Link href="/" className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
            ← Home
          </Link>
        </div>
      </header>

      {/* Contenuto */}
      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📋 Elenco Clienti ({clients.length})</h2>
          <Link 
            href="/clienti/nuovo" 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Nuovo Cliente
          </Link>
        </div>

        {/* Lista Clienti */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Caricamento...</p>
          </div>
        ) : clients.length > 0 ? (
          <div className="grid gap-4">
            {clients.map((client) => (
              <div 
                key={client.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <Link 
                    href={`/clienti/${client.id}`}
                    className="flex-1 block"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-700">
                      {client.company_name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <p><span className="font-semibold">P.IVA:</span> {client.vat_number || 'N/D'}</p>
                      <p><span className="font-semibold">Contatto:</span> {client.contact_name || 'N/D'}</p>
                      <p><span className="font-semibold">Tel:</span> {client.contact_phone || 'N/D'}</p>
                    </div>
                  </Link>
                  
                  <div className="flex flex-col gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full text-center ${
                      client.status === 'Attivo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.status}
                    </span>
                    <button
                      onClick={() => handleDelete(client.id, client.company_name)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                      title="Elimina cliente"
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 text-lg mb-2">Nessun cliente nel database</p>
            <p className="text-sm text-gray-400">
              Clicca su "Nuovo Cliente" per aggiungere il primo cliente
            </p>
          </div>
        )}
      </main>
    </div>
  )
}