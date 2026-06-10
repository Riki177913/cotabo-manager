'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NuovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    company_name: '',
    vat_number: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    status: 'Attivo',
    chiamataxi_start_date: '',
    btaxi_web_date: '',
    material_delivery_date: '',
    deliverer_name: '',
    chiamataxi_contract_date: '',
    chiamataxi_payment_start_date: '',
    chiamataxi_last_payment_date: '',
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const dataToInsert: any = {
      company_name: formData.company_name,
      vat_number: formData.vat_number || null,
      contact_name: formData.contact_name || null,
      contact_phone: formData.contact_phone || null,
      contact_email: formData.contact_email || null,
      status: 'Attivo',
      deliverer_name: formData.deliverer_name || null,
    }

    if (formData.chiamataxi_start_date) dataToInsert.chiamataxi_start_date = formData.chiamataxi_start_date
    if (formData.btaxi_web_date) dataToInsert.btaxi_web_date = formData.btaxi_web_date
    if (formData.material_delivery_date) dataToInsert.material_delivery_date = formData.material_delivery_date
    if (formData.chiamataxi_contract_date) dataToInsert.chiamataxi_contract_date = formData.chiamataxi_contract_date
    if (formData.chiamataxi_payment_start_date) dataToInsert.chiamataxi_payment_start_date = formData.chiamataxi_payment_start_date
    if (formData.chiamataxi_last_payment_date) dataToInsert.chiamataxi_last_payment_date = formData.chiamataxi_last_payment_date

    const { error } = await supabase
      .from('clients')
      .insert(dataToInsert)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      alert('Cliente aggiunto con successo!')
      router.push('/clienti')
    }
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

      <main className="container mx-auto p-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuovo Cliente</h2>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informazioni Aziendali</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ragione Sociale *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Es. Taxi Roma Sud SRL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partita IVA
                </label>
                <input
                  type="text"
                  value={formData.vat_number}
                  onChange={(e) => setFormData({...formData, vat_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="IT12345678901"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Contatti</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Contatto</label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Contratto Chiamataxi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Sottoscrizione</label>
                <input
                  type="date"
                  value={formData.chiamataxi_contract_date}
                  onChange={(e) => setFormData({...formData, chiamataxi_contract_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decorrenza Pagamenti</label>
                <input
                  type="date"
                  value={formData.chiamataxi_payment_start_date}
                  onChange={(e) => setFormData({...formData, chiamataxi_payment_start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ultimo Pagamento</label>
                <input
                  type="date"
                  value={formData.chiamataxi_last_payment_date}
                  onChange={(e) => setFormData({...formData, chiamataxi_last_payment_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Date Forniture</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avvio Chiamataxi</label>
                <input
                  type="date"
                  value={formData.chiamataxi_start_date}
                  onChange={(e) => setFormData({...formData, chiamataxi_start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornitura bTaxi Web</label>
                <input
                  type="date"
                  value={formData.btaxi_web_date}
                  onChange={(e) => setFormData({...formData, btaxi_web_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consegna Materiale</label>
                <input
                  type="date"
                  value={formData.material_delivery_date}
                  onChange={(e) => setFormData({...formData, material_delivery_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Altro</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consegnato da</label>
                <input
                  type="text"
                  value={formData.deliverer_name}
                  onChange={(e) => setFormData({...formData, deliverer_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nome di chi ha consegnato"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : 'Salva Cliente'}
            </button>
            <Link
              href="/clienti"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium text-center transition"
            >
              Annulla
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}