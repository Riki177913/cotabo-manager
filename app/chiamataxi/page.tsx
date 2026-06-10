'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ChiamataxiPage() {
  const [devices, setDevices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDevice, setEditingDevice] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: devicesData, error: devicesError } = await supabase
      .from('chiamataxi_devices')
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

    if (devicesError) {
      console.error('Errore caricamento dispositivi:', devicesError)
    } else {
      setDevices(devicesData || [])
    }
    setClients(clientsData || [])
    setLoading(false)
  }

  async function toggleDeviceStatus(deviceId: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('chiamataxi_devices')
      .update({ is_active: !currentStatus })
      .eq('id', deviceId)

    if (error) {
      alert('Errore durante l\'aggiornamento: ' + error.message)
    } else {
      setDevices(devices.map(d => 
        d.id === deviceId ? { ...d, is_active: !currentStatus } : d
      ))
    }
  }

  async function handleDelete(deviceId: string) {
    if (!confirm('Sei sicuro di voler eliminare questo dispositivo?')) return

    const { error } = await supabase
      .from('chiamataxi_devices')
      .delete()
      .eq('id', deviceId)

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      setDevices(devices.filter(d => d.id !== deviceId))
      alert('Dispositivo eliminato con successo!')
    }
  }

  function handleEdit(device: any) {
    setEditingDevice(device)
    setShowEditModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold"> COTABO Manager</h1>
          <Link href="/" className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
            ← Home
          </Link>
        </div>
      </header>

      {/* Contenuto */}
      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📱 Dispositivi Chiamataxi ({devices.length})</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Aggiungi SIM
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : devices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <div key={device.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">📱</span>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        SIM {device.sim_number?.slice(-4)}
                      </h3>
                      <Link 
                        href={`/clienti/${device.clients?.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {device.clients?.company_name || 'Cliente non trovato'}
                      </Link>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    device.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {device.is_active ? 'Attiva' : 'Inattiva'}
                  </span>
                </div>

                <div className="space-y-2 bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Numero SIM:</span>
                    <span className="font-mono font-semibold">{device.sim_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">PIN:</span>
                    <span className="font-mono font-semibold">{device.pin}</span>
                  </div>
                  {device.delivery_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Consegna:</span>
                      <span>{new Date(device.delivery_date).toLocaleDateString('it-IT')}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleDeviceStatus(device.id, device.is_active)}
                    className={`flex-1 px-3 py-1 rounded text-sm font-medium transition ${
                      device.is_active 
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {device.is_active ? '⏸️ Disattiva' : '▶️ Attiva'}
                  </button>
                  <button
                    onClick={() => handleEdit(device)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition"
                  >
                    ️
                  </button>
                  <button
                    onClick={() => handleDelete(device.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 text-lg mb-2">Nessun dispositivo registrato</p>
            <p className="text-sm text-gray-400">Clicca su "Aggiungi SIM" per inserire il primo dispositivo</p>
          </div>
        )}
      </main>

      {/* Modal Aggiungi SIM */}
      {showAddModal && (
        <AddDeviceModal
          clients={clients}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadData()
          }}
        />
      )}

      {/* Modal Modifica SIM */}
      {showEditModal && editingDevice && (
        <EditDeviceModal
          device={editingDevice}
          clients={clients}
          onClose={() => {
            setShowEditModal(false)
            setEditingDevice(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setEditingDevice(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// Componente Modal per aggiungere dispositivo
function AddDeviceModal({ clients, onClose, onSuccess }: { clients: any[], onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const { error } = await supabase.from('chiamataxi_devices').insert({
      client_id: formData.get('client_id'),
      sim_number: formData.get('sim_number'),
      pin: formData.get('pin'),
      delivery_date: formData.get('delivery_date') || null,
      is_active: true,
    })

    if (error) {
      alert('Errore: ' + error.message)
      setLoading(false)
    } else {
      alert('Dispositivo aggiunto con successo!')
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📱 Aggiungi Nuova SIM</h3>
        
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Numero SIM *</label>
            <input
              name="sim_number"
              type="text"
              required
              placeholder="89390123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN *</label>
            <input
              name="pin"
              type="text"
              required
              placeholder="1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Consegna</label>
            <input
              name="delivery_date"
              type="date"
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
              {loading ? 'Salvataggio...' : '💾 Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente Modal per modificare dispositivo
function EditDeviceModal({ device, clients, onClose, onSuccess }: { 
  device: any, 
  clients: any[], 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: device.client_id,
    sim_number: device.sim_number,
    pin: device.pin,
    delivery_date: device.delivery_date ? new Date(device.delivery_date).toISOString().split('T')[0] : '',
    is_active: device.is_active,
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('chiamataxi_devices')
      .update(formData)
      .eq('id', device.id)

    if (error) {
      alert('Errore: ' + error.message)
      setLoading(false)
    } else {
      alert('Dispositivo aggiornato con successo!')
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">️ Modifica SIM</h3>
        
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Numero SIM *</label>
            <input
              value={formData.sim_number}
              onChange={(e) => setFormData({...formData, sim_number: e.target.value})}
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN *</label>
            <input
              value={formData.pin}
              onChange={(e) => setFormData({...formData, pin: e.target.value})}
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Consegna</label>
            <input
              value={formData.delivery_date}
              onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Dispositivo attivo
            </label>
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