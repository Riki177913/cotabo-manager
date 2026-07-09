'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import ClientAutocomplete from '@/app/components/ClientAutocomplete'
import ProtectedButton from '@/app/components/ProtectedButton'

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
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">COTABO Manager</h1>
          <Link href="/" className="inline-flex items-center gap-2 text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Dispositivi Chiamataxi ({devices.length})</h2>
          <ProtectedButton
            roles={['admin', 'operator']}
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Aggiungi SIM
          </ProtectedButton>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : devices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <div key={device.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
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
                    <span className="font-mono text-sm font-semibold">{device.sim_number}</span>
                  </div>
                  {device.iccid && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ICCID:</span>
                      <span className="font-mono text-sm font-semibold">{device.iccid}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">PIN:</span>
                    <span className="font-mono text-sm font-semibold">{device.pin}</span>
                  </div>
                  {device.puk && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">PUK:</span>
                      <span className="font-mono text-sm font-semibold">{device.puk}</span>
                    </div>
                  )}
                  {device.delivery_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Consegna:</span>
                      <span>{new Date(device.delivery_date).toLocaleDateString('it-IT')}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <ProtectedButton
                    roles={['admin', 'operator']}
                    onClick={() => toggleDeviceStatus(device.id, device.is_active)}
                    className={`flex-1 px-3 py-1 rounded text-sm font-medium transition ${
                      device.is_active 
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {device.is_active ? 'Disattiva' : 'Attiva'}
                  </ProtectedButton>
                  <ProtectedButton
                    roles={['admin', 'operator']}
                    onClick={() => handleEdit(device)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition"
                  >
                    Modifica
                  </ProtectedButton>
                  <ProtectedButton
                    roles={['admin']}
                    onClick={() => handleDelete(device.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition"
                  >
                    Elimina
                  </ProtectedButton>
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

function AddDeviceModal({ clients, onClose, onSuccess }: { clients: any[], onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    sim_number: '',
    pin: '',
    puk: '',
    iccid: '',
    delivery_date: '',
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.client_id || formData.client_id.trim() === '') {
      alert('Errore: Seleziona un cliente dall\'elenco (clicca sul nome dopo aver digitato)')
      return
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(formData.client_id)) {
      alert('Errore: ID cliente non valido. Seleziona un cliente dall\'elenco a tendina.')
      return
    }
    
    setLoading(true)

    const { error } = await supabase.from('chiamataxi_devices').insert({
      client_id: formData.client_id,
      sim_number: formData.sim_number,
      pin: formData.pin,
      puk: formData.puk || null,
      iccid: formData.iccid || null,
      delivery_date: formData.delivery_date || null,
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">Aggiungi Nuova SIM</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientAutocomplete
            clients={clients}
            value={formData.client_id}
            onChange={(value) => setFormData({...formData, client_id: value})}
            label="Cliente"
            required={true}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numero SIM *</label>
            <input
              value={formData.sim_number}
              onChange={(e) => setFormData({...formData, sim_number: e.target.value})}
              type="text"
              required
              placeholder="89390123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ICCID</label>
            <input
              value={formData.iccid}
              onChange={(e) => setFormData({...formData, iccid: e.target.value})}
              type="text"
              placeholder="89390123456789012345"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Numero seriale della SIM (19-20 cifre)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN *</label>
            <input
              value={formData.pin}
              onChange={(e) => setFormData({...formData, pin: e.target.value})}
              type="text"
              required
              placeholder="1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PUK</label>
            <input
              value={formData.puk}
              onChange={(e) => setFormData({...formData, puk: e.target.value})}
              type="text"
              placeholder="12345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Codice PUK (8 cifre)</p>
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
              {loading ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

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
    puk: device.puk || '',
    iccid: device.iccid || '',
    delivery_date: device.delivery_date ? new Date(device.delivery_date).toISOString().split('T')[0] : '',
    is_active: device.is_active,
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.client_id || formData.client_id.trim() === '') {
      alert('Errore: Seleziona un cliente dall\'elenco')
      return
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(formData.client_id)) {
      alert('Errore: ID cliente non valido')
      return
    }
    
    setLoading(true)

    const { error } = await supabase
      .from('chiamataxi_devices')
      .update({
        client_id: formData.client_id,
        sim_number: formData.sim_number,
        pin: formData.pin,
        puk: formData.puk || null,
        iccid: formData.iccid || null,
        delivery_date: formData.delivery_date || null,
        is_active: formData.is_active,
      })
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">Modifica SIM</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientAutocomplete
            clients={clients}
            value={formData.client_id}
            onChange={(value) => setFormData({...formData, client_id: value})}
            label="Cliente"
            required={true}
          />

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
            <label className="block text-sm font-medium text-gray-700 mb-1">ICCID</label>
            <input
              value={formData.iccid}
              onChange={(e) => setFormData({...formData, iccid: e.target.value})}
              type="text"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">PUK</label>
            <input
              value={formData.puk}
              onChange={(e) => setFormData({...formData, puk: e.target.value})}
              type="text"
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
              id="is_active_edit"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="is_active_edit" className="text-sm font-medium text-gray-700">
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
              {loading ? 'Salvataggio...' : 'Aggiorna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}