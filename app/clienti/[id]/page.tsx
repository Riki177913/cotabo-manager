'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function ClienteDettaglioPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  
  const [client, setClient] = useState<any>(null)
  const [devices, setDevices] = useState<any[]>([])
  const [btaxiCredentials, setBtaxiCredentials] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('generale')
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
      
      const { data: devicesData } = await supabase
        .from('chiamataxi_devices')
        .select('*')
        .eq('client_id', clientId)
      
      const { data: btaxiData } = await supabase
        .from('btaxi_credentials')
        .select('*')
        .eq('client_id', clientId)
        .single()

      setClient(clientData)
      setDevices(devicesData || [])
      setBtaxiCredentials(btaxiData)
      setLoading(false)
    }

    if (clientId) {
      loadData()
    }
  }, [clientId])

  const handleDelete = async () => {
    setDeleting(true)
    
    try {
      await supabase.from('chiamataxi_devices').delete().eq('client_id', clientId)
      await supabase.from('btaxi_credentials').delete().eq('client_id', clientId)
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) {
        alert('Errore durante l\'eliminazione: ' + error.message)
      } else {
        alert('Cliente eliminato con successo!')
        router.push('/clienti')
      }
    } catch (err) {
      alert('Errore imprevisto durante l\'eliminazione')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/D'
    return new Date(date).toLocaleDateString('it-IT')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cliente non trovato</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">COTABO Manager</h1>
          <Link href="/clienti" className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
            ← Torna ai clienti
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.company_name}</h1>
            <p className="text-gray-600">P.IVA: {client.vat_number || 'N/D'}</p>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                client.status === 'Attivo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {client.status}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link 
              href={`/clienti/${clientId}/modifica`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Modifica
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Elimina
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Conferma eliminazione</h3>
                <p className="text-gray-600 mb-4">
                  Sei sicuro di voler eliminare il cliente <strong>"{client.company_name}"</strong>?
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {deleting ? 'Eliminazione...' : 'Elimina definitivamente'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 border-b">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('generale')}
              className={`pb-3 px-4 font-medium transition whitespace-nowrap ${
                activeTab === 'generale' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Dati Generali
            </button>
            <button
              onClick={() => setActiveTab('contratto')}
              className={`pb-3 px-4 font-medium transition whitespace-nowrap ${
                activeTab === 'contratto' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Contratto Chiamataxi
            </button>
            <button
              onClick={() => setActiveTab('chiamataxi')}
              className={`pb-3 px-4 font-medium transition whitespace-nowrap ${
                activeTab === 'chiamataxi' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Chiamataxi ({devices.length})
            </button>
            <button
              onClick={() => setActiveTab('btaxi')}
              className={`pb-3 px-4 font-medium transition whitespace-nowrap ${
                activeTab === 'btaxi' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              bTaxi Web
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          {activeTab === 'generale' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Informazioni di Contatto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome Contatto</p>
                  <p className="font-medium">{client.contact_name || 'N/D'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefono</p>
                  <p className="font-medium">{client.contact_phone || 'N/D'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{client.contact_email || 'N/D'}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 border-b pb-2 pt-4">Date Forniture</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Avvio Contratto Chiamataxi</p>
                  <p className="text-lg font-bold text-blue-900">{formatDate(client.chiamataxi_start_date)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Fornitura bTaxi Web</p>
                  <p className="text-lg font-bold text-green-900">{formatDate(client.btaxi_web_date)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Consegna Materiale</p>
                  <p className="text-lg font-bold text-purple-900">{formatDate(client.material_delivery_date)}</p>
                  {client.deliverer_name && (
                    <p className="text-sm text-purple-700 mt-1">da: {client.deliverer_name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contratto' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Gestione Contratto Chiamataxi</h3>
                <Link 
                  href={`/clienti/${clientId}/modifica`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Modifica Date
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg">
                  <div className="mb-3">
                    <p className="text-sm text-blue-100 font-medium">Sottoscrizione Contratto</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatDate(client.chiamataxi_contract_date)}
                  </p>
                  <p className="text-xs text-blue-200 mt-2">
                    Data firma del contratto
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg">
                  <div className="mb-3">
                    <p className="text-sm text-green-100 font-medium">Decorrenza Pagamenti</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatDate(client.chiamataxi_payment_start_date)}
                  </p>
                  <p className="text-xs text-green-200 mt-2">
                    Da quando si pagano i canoni
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-lg">
                  <div className="mb-3">
                    <p className="text-sm text-purple-100 font-medium">Ultimo Pagamento</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatDate(client.chiamataxi_last_payment_date)}
                  </p>
                  <p className="text-xs text-purple-200 mt-2">
                    Data ultimo pagamento ricevuto
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">Stato Contratto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${client.chiamataxi_contract_date ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-700">
                      Contratto: {client.chiamataxi_contract_date ? 'Sottoscritto' : 'Non sottoscritto'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${client.chiamataxi_payment_start_date ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-700">
                      Pagamenti: {client.chiamataxi_payment_start_date ? 'Attivi' : 'Non attivi'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <div className={`w-3 h-3 rounded-full ${client.chiamataxi_last_payment_date ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-sm text-gray-700">
                      Ultimo pagamento: {client.chiamataxi_last_payment_date ? formatDate(client.chiamataxi_last_payment_date) : 'Nessun pagamento registrato'}
                    </span>
                  </div>
                </div>
              </div>

              {(!client.chiamataxi_contract_date || !client.chiamataxi_payment_start_date || !client.chiamataxi_last_payment_date) && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Attenzione:</strong> Alcune informazioni sul contratto non sono state inserite. Clicca su "Modifica Date" per completarle.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chiamataxi' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Dispositivi Chiamataxi</h3>
                <Link 
                  href="/chiamataxi"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  + Aggiungi SIM
                </Link>
              </div>

              {devices.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {devices.map((device) => (
                    <div key={device.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-bold text-gray-900">SIM {device.sim_number?.slice(-4)}</p>
                            <p className="text-xs text-gray-500">
                              Consegnata: {formatDate(device.delivery_date)}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          device.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {device.is_active ? 'Attiva' : 'Non attiva'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 bg-gray-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Numero SIM:</span>
                          <span className="font-mono text-sm font-semibold">{device.sim_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">PIN:</span>
                          <span className="font-mono text-sm font-semibold">{device.pin}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nessun dispositivo Chiamataxi registrato</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'btaxi' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Credenziali di Accesso</h3>
              
              {btaxiCredentials ? (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Username</p>
                      <p className="text-xl font-mono font-bold">{btaxiCredentials.username || 'N/D'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Password</p>
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-mono font-bold">
                          {showPassword ? btaxiCredentials.password : '••••••••••••'}
                        </p>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-blue-200 hover:text-white"
                        >
                          {showPassword ? 'Nascondi' : 'Mostra'}
                        </button>
                      </div>
                    </div>
                    {btaxiCredentials.access_url && (
                      <div>
                        <p className="text-sm text-blue-100 mb-1">URL di Accesso</p>
                        <a 
                          href={btaxiCredentials.access_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-200 underline hover:text-white"
                        >
                          {btaxiCredentials.access_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nessuna credenziale bTaxi Web registrata</p>
                </div>
              )}

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota di Sicurezza:</strong> Le credenziali sono visibili solo al personale autorizzato.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}