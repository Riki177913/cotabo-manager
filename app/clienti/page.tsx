'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import ProtectedButton from '@/app/components/ProtectedButton'

export default function ClientiPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
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
      console.error('Errore caricamento clienti:', error)
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      setClients(clients.filter(c => c.id !== id))
      alert('Cliente eliminato con successo!')
    }
  }

  const filteredClients = clients.filter(client =>
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.vat_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.codice_abbonato?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h2 className="text-2xl font-bold text-gray-800">Clienti ({filteredClients.length})</h2>
            <p className="text-gray-600 text-sm mt-1">Gestione aziende e contratti</p>
          </div>
          <ProtectedButton
            roles={['admin', 'operator']}
            onClick={() => window.location.href = '/clienti/nuovo'}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Nuovo Cliente
          </ProtectedButton>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Cerca cliente, P.IVA, email o codice abbonato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : filteredClients.length > 0 ? (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Codice Abbonato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P.IVA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Link 
                            href={`/clienti/${client.id}`} 
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {client.company_name}
                          </Link>
                          {client.contact_name && (
                            <p className="text-xs text-gray-500">{client.contact_name}</p>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.codice_abbonato ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {client.codice_abbonato}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">N/D</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.contact_email ? (
                          <a href={`mailto:${client.contact_email}`} className="text-sm text-blue-600 hover:underline">
                            {client.contact_email}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">N/D</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.vat_number || 'N/D'}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          client.status === 'Attivo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {client.status || 'Attivo'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link
                            href={`/clienti/${client.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Dettagli
                          </Link>
                          <ProtectedButton
                            roles={['admin', 'operator']}
                            onClick={() => window.location.href = `/clienti/${client.id}/modifica`}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Modifica
                          </ProtectedButton>
                          <ProtectedButton
                            roles={['admin']}
                            onClick={() => handleDelete(client.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Elimina
                          </ProtectedButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 text-lg mb-2">Nessun cliente trovato</p>
            <p className="text-sm text-gray-400">
              {searchTerm ? 'Prova a cercare con termini diversi' : 'Clicca su "Nuovo Cliente" per aggiungere il primo cliente'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}