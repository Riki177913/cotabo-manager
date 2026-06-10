'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function BTaxiPage() {
  const [credentials, setCredentials] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCredential, setEditingCredential] = useState<any>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<{[key: string]: boolean}>({})
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: credsData, error } = await supabase
      .from('btaxi_credentials')
      .select(`
        *,
        clients (
          id,
          company_name,
          vat_number
        )
      `)
      .order('created_at', { ascending: false })

    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, company_name')
      .order('company_name', { ascending: true })

    if (error) {
      console.error('Errore caricamento credenziali:', error)
    } else {
      setCredentials(credsData || [])
    }
    setClients(clientsData || [])
    setLoading(false)
  }

  function togglePassword(id: string) {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  async function handleDelete(id: string) {
    if (!confirm('Sei sicuro di voler eliminare queste credenziali?')) return

    const { error } = await supabase
      .from('btaxi_credentials')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      setCredentials(credentials.filter(c => c.id !== id))
      alert('Credenziali eliminate con successo!')
    }
  }

  function handleEdit(cred: any) {
    setEditingCredential(cred)
    setShowEditModal(true)
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
          <h2 className="text-2xl font-bold text-gray-800">🌐 Credenziali bTaxi Web ({credentials.length})</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Aggiungi Credenziali
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : credentials.length > 0 ? (
          <div className="grid gap-4">
            {credentials.map((cred) => (
              <div key={cred.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌐</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {cred.clients?.company_name || 'Cliente non trovato'}
                      </h3>
                      <Link 
                        href={`/clienti/${cred.clients?.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Vedi dettagli cliente →
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cred)}
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition"
                    >
                      ✏️ Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(cred.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition"
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-blue-600 font-medium mb-1">Username</p>
                    <p className="font-mono font-semibold text-gray-900">{cred.username || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium mb-1">Password</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-semibold text-gray-900">
                        {visiblePasswords[cred.id] ? cred.password : '••••••••••••'}
                      </p>
                      <button
                        onClick={() => togglePassword(cred.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {visiblePasswords[cred.id] ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  {cred.access_url && (
                    <div>
                      <p className="text-sm text-blue-600 font-medium mb-1">URL Accesso</p>
                      <a 
                        href={cred.access_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-700 underline hover:text-blue-900 text-sm"
                      >
                        {cred.access_url}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <span>📅</span>
                  <span>Inserito il: {new Date(cred.created_at).toLocaleDateString('it-IT')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 text-lg mb-2">Nessuna credenziale registrata</p>
            <p className="text-sm text-gray-400">Clicca su "Aggiungi Credenziali" per inserire le prime credenziali</p>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Nota di Sicurezza:</strong> Le password sono mascherate per default. Clicca sull'icona 👁️ per visualizzarle.
          </p>
        </div>
      </main>

      {/* Modal Aggiungi Credenziali */}
      {showAddModal && (
        <AddCredentialsModal
          clients={clients}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadData()
          }}
        />
      )}

      {/* Modal Modifica Credenziali */}
      {showEditModal && editingCredential && (
        <EditCredentialsModal
          cred={editingCredential}
          clients={clients}
          onClose={() => {
            setShowEditModal(false)
            setEditingCredential(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setEditingCredential(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// Componente Modal per aggiungere credenziali
function AddCredentialsModal({ clients, onClose, onSuccess }: { clients: any[], onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const { error } = await supabase.from('btaxi_credentials').insert({
      client_id: formData.get('client_id'),
      username: formData.get('username'),
      password: formData.get('password'),
      access_url: formData.get('access_url') || null,
    })

    if (error) {
      alert('Errore: ' + error.message)
      setLoading(false)
    } else {
      alert('Credenziali aggiunte con successo!')
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🌐 Aggiungi Credenziali bTaxi Web</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select
              name="client_id"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Seleziona un cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.company_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              name="password"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL di Accesso</label>
            <input
              name="access_url"
              type="url"
              placeholder="https://web.btaxi.it/login"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : ' Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente Modal per modificare credenziali
function EditCredentialsModal({ cred, clients, onClose, onSuccess }: { 
  cred: any, 
  clients: any[], 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: cred.client_id,
    username: cred.username,
    password: cred.password,
    access_url: cred.access_url || '',
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('btaxi_credentials')
      .update(formData)
      .eq('id', cred.id)

    if (error) {
      alert('Errore: ' + error.message)
      setLoading(false)
    } else {
      alert('Credenziali aggiornate con successo!')
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">✏️ Modifica Credenziali bTaxi Web</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.company_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL di Accesso</label>
            <input
              value={formData.access_url}
              onChange={(e) => setFormData({...formData, access_url: e.target.value})}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : '💾 Aggiorna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}