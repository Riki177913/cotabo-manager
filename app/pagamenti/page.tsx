'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function PagamentiPage() {
  const [clients, setClients] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [showPaidOnly, setShowPaidOnly] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [selectedYear])

  async function loadData() {
    setLoading(true)

    // Carica tutti i clienti con Chiamataxi
    const { data: clientsData } = await supabase
      .from('clients')
      .select(`
        id,
        company_name,
        vat_number,
        is_premium,
        chiamataxi_start_date,
        chiamataxi_contract_date,
        chiamataxi_payment_start_date,
        chiamataxi_last_payment_date
      `)
      .order('company_name', { ascending: true })

    // Carica i pagamenti dell'anno selezionato
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*')
      .eq('year', selectedYear)

    setClients(clientsData || [])
    setPayments(paymentsData || [])
    setLoading(false)
  }

  async function togglePaymentStatus(clientId: string, isPaid: boolean) {
    const existingPayment = payments.find(p => p.client_id === clientId)

    if (existingPayment) {
      // Aggiorna pagamento esistente
      const { error } = await supabase
        .from('payments')
        .update({
          is_paid: isPaid,
          paid_date: isPaid ? new Date().toISOString().split('T')[0] : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPayment.id)

      if (error) {
        alert('Errore: ' + error.message)
        return
      }
    } else {
      // Crea nuovo pagamento
      const { error } = await supabase.from('payments').insert({
        client_id: clientId,
        year: selectedYear,
        amount: 70.00,
        is_exempt: false,
        is_paid: isPaid,
        invoice_date: new Date().toISOString().split('T')[0],
        paid_date: isPaid ? new Date().toISOString().split('T')[0] : null
      })

      if (error) {
        alert('Errore: ' + error.message)
        return
      }
    }

    // Ricarica i dati
    loadData()
  }

  async function togglePremiumStatus(clientId: string, isPremium: boolean) {
    const { error } = await supabase
      .from('clients')
      .update({ is_premium: isPremium })
      .eq('id', clientId)

    if (error) {
      alert('Errore: ' + error.message)
      return
    }

    // Se diventa premium, segna come esente dal pagamento
    if (isPremium) {
      const existingPayment = payments.find(p => p.client_id === clientId)
      if (existingPayment) {
        await supabase
          .from('payments')
          .update({ is_exempt: true, is_paid: false })
          .eq('id', existingPayment.id)
      }
    }

    loadData()
  }

  // Filtra clienti
  let filteredClients = clients.filter(client => {
    // Mostra solo clienti con Chiamataxi
    const hasChiamataxi = client.chiamataxi_start_date || client.chiamataxi_contract_date
    
    if (showPremiumOnly) {
      return hasChiamataxi && client.is_premium
    }
    
    if (showPaidOnly) {
      const payment = payments.find(p => p.client_id === client.id)
      return hasChiamataxi && payment?.is_paid
    }
    
    return hasChiamataxi
  })

  // Calcola statistiche
  const totalClients = filteredClients.length
  const paidClients = filteredClients.filter(c => {
    const payment = payments.find(p => p.client_id === c.id)
    return payment?.is_paid
  }).length
  const unpaidClients = filteredClients.filter(c => {
    const payment = payments.find(p => p.client_id === c.id)
    return payment && !payment.is_paid && !payment.is_exempt
  }).length
  const premiumClients = filteredClients.filter(c => c.is_premium).length
  const totalRevenue = paidClients * 70

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestione Pagamenti Chiamataxi</h2>
          <p className="text-gray-600">Canone annuale: 70€ + IVA (esclusi clienti premium fidelizzati)</p>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Totale Clienti</p>
            <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Pagati</p>
            <p className="text-2xl font-bold text-green-600">{paidClients}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Da Pagare</p>
            <p className="text-2xl font-bold text-red-600">{unpaidClients}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Premium (Esenti)</p>
            <p className="text-2xl font-bold text-purple-600">{premiumClients}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Incassato ({selectedYear})</p>
            <p className="text-2xl font-bold text-yellow-600">{totalRevenue}€</p>
          </div>
        </div>

        {/* Filtri */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anno di riferimento</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="showPremiumOnly"
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="showPremiumOnly" className="text-sm font-medium text-gray-700">
                Solo Premium
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="showPaidOnly"
                type="checkbox"
                checked={showPaidOnly}
                onChange={(e) => setShowPaidOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="showPaidOnly" className="text-sm font-medium text-gray-700">
                Solo Pagati
              </label>
            </div>

            <button
              onClick={() => {
                setShowPremiumOnly(false)
                setShowPaidOnly(false)
              }}
              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Reset Filtri
            </button>
          </div>
        </div>

        {/* Tabella */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Caricamento...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P.IVA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Fornitura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ultima Fattura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Premium
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => {
                    const payment = payments.find(p => p.client_id === client.id)
                    const isPaid = payment?.is_paid || false
                    const isExempt = client.is_premium || payment?.is_exempt || false

                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {client.company_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{client.vat_number || 'N/D'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(client.chiamataxi_start_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {payment?.invoice_date ? formatDate(payment.invoice_date) : 'N/D'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={client.is_premium}
                              onChange={(e) => togglePremiumStatus(client.id, e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {client.is_premium ? 'Sì' : 'No'}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isExempt ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              Esente (Premium)
                            </span>
                          ) : isPaid ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Pagato
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Da Pagare
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {!isExempt && (
                            <button
                              onClick={() => togglePaymentStatus(client.id, !isPaid)}
                              className={`px-3 py-1 rounded text-sm font-medium transition ${
                                isPaid
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {isPaid ? 'Segna come NON pagato' : 'Segna come PAGATO'}
                            </button>
                          )}
                          {isExempt && (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Nessun cliente trovato con i filtri selezionati
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}