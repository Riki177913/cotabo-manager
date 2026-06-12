'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function PagamentiPage() {
  const [clients, setClients] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [showPaidOnly, setShowPaidOnly] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [selectedYear])

  async function loadData() {
    setLoading(true)

    const { data: clientsData } = await supabase
      .from('clients')
      .select(`
        id,
        company_name,
        vat_number,
        contact_email,
        is_premium,
        chiamataxi_start_date,
        chiamataxi_contract_date,
        chiamataxi_payment_start_date,
        chiamataxi_last_payment_date
      `)
      .order('company_name', { ascending: true })

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

    if (isPremium) {
      const existingPayment = payments.find(p => p.client_id === clientId)
      if (existingPayment) {
        await supabase
          .from('payments')
          .update({ is_exempt: true, is_paid: false })
          .eq('id', existingPayment.id)
      } else {
        await supabase.from('payments').insert({
          client_id: clientId,
          year: selectedYear,
          amount: 70.00,
          is_exempt: true,
          is_paid: false,
          invoice_date: new Date().toISOString().split('T')[0]
        })
      }
    }

    loadData()
  }

  let filteredClients = clients.filter(client => {
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

  // ============================================
  // FUNZIONE ESPORTAZIONE CSV (Excel)
  // ============================================
  function exportToCSV() {
    const headers = [
      'Cliente',
      'P.IVA',
      'Email',
      'Data Fornitura',
      'Ultima Fattura',
      'Stato Cliente',
      'Pagamento',
      'Importo'
    ]

    const rows = filteredClients.map(client => {
      const payment = payments.find(p => p.client_id === client.id)
      const isPaid = payment?.is_paid || false
      const isExempt = client.is_premium || payment?.is_exempt || false

      let statoPagamento = 'Da Pagare'
      if (isExempt) statoPagamento = 'Esente (Premium)'
      else if (isPaid) statoPagamento = 'Pagato'

      return [
        client.company_name,
        client.vat_number || 'N/D',
        client.contact_email || 'N/D',
        formatDate(client.chiamataxi_start_date),
        payment?.invoice_date ? formatDate(payment.invoice_date) : 'N/D',
        client.is_premium ? 'Premium' : 'Standard',
        statoPagamento,
        isExempt ? '0,00' : '70,00'
      ]
    })

    // Aggiungi riga totali
    rows.push([])
    rows.push(['TOTALI', '', '', '', '', '', 'Pagati: ' + paidClients, totalRevenue + ',00 EUR'])

    // Costruisci CSV
    const csvContent = [
      ['RIEPILOGO PAGAMENTI CHIAMATAXI - ANNO ' + selectedYear],
      [],
      headers,
      ...rows
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n')

    // BOM per Excel (supporto caratteri speciali)
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `pagamenti_chiamataxi_${selectedYear}.csv`)
    link.click()
    URL.revokeObjectURL(url)
    setExportMenuOpen(false)
  }

  // ============================================
  // FUNZIONE ESPORTAZIONE PDF (via stampa)
  // ============================================
  function exportToPDF() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Permetti i popup per esportare il PDF')
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pagamenti Chiamataxi ${selectedYear}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e40af; }
          h2 { color: #374151; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1e40af; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          tr:nth-child(even) { background: #f9fafb; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat-box { border: 1px solid #e5e7eb; padding: 10px 15px; border-radius: 8px; }
          .stat-label { font-size: 11px; color: #6b7280; }
          .stat-value { font-size: 20px; font-weight: bold; color: #111827; }
          .badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
          .badge-green { background: #dcfce7; color: #166534; }
          .badge-red { background: #fee2e2; color: #991b1b; }
          .badge-purple { background: #f3e8ff; color: #6b21a8; }
          .badge-gray { background: #f3f4f6; color: #374151; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>🔧 Riepilogo Pagamenti Chiamataxi</h1>
        <h2>Anno di riferimento: ${selectedYear} | Canone annuale: 70€ + IVA</h2>
        
        <div class="stats">
          <div class="stat-box">
            <div class="stat-label">Totale Clienti</div>
            <div class="stat-value">${totalClients}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Pagati</div>
            <div class="stat-value" style="color: #16a34a;">${paidClients}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Da Pagare</div>
            <div class="stat-value" style="color: #dc2626;">${unpaidClients}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Premium (Esenti)</div>
            <div class="stat-value" style="color: #9333ea;">${premiumClients}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Incassato</div>
            <div class="stat-value" style="color: #ca8a04;">${totalRevenue}€</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>P.IVA</th>
              <th>Email</th>
              <th>Data Fornitura</th>
              <th>Ultima Fattura</th>
              <th>Stato</th>
              <th>Pagamento</th>
              <th>Importo</th>
            </tr>
          </thead>
          <tbody>
            ${filteredClients.map(client => {
              const payment = payments.find(p => p.client_id === client.id)
              const isPaid = payment?.is_paid || false
              const isExempt = client.is_premium || payment?.is_exempt || false
              let statoPagamento = 'Da Pagare'
              let badgeClass = 'badge-red'
              if (isExempt) { statoPagamento = 'Esente'; badgeClass = 'badge-purple'; }
              else if (isPaid) { statoPagamento = 'Pagato'; badgeClass = 'badge-green'; }
              
              return `
                <tr>
                  <td><strong>${client.company_name}</strong></td>
                  <td>${client.vat_number || 'N/D'}</td>
                  <td>${client.contact_email || 'N/D'}</td>
                  <td>${formatDate(client.chiamataxi_start_date)}</td>
                  <td>${payment?.invoice_date ? formatDate(payment.invoice_date) : 'N/D'}</td>
                  <td><span class="badge badge-gray">${client.is_premium ? 'Premium' : 'Standard'}</span></td>
                  <td><span class="badge ${badgeClass}">${statoPagamento}</span></td>
                  <td>${isExempt ? '0,00€' : '70,00€'}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right; font-size: 12px; color: #6b7280;">
          Generato il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1e40af; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
            🖨️ Stampa / Salva come PDF
          </button>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setExportMenuOpen(false)
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestione Pagamenti Chiamataxi</h2>
            <p className="text-gray-600">Canone annuale: 70€ + IVA (esclusi clienti premium fidelizzati)</p>
          </div>
          
          {/* Pulsante Esporta */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              📥 Esporta
            </button>
            
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={exportToCSV}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                >
                  <span className="text-xl">📊</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Excel (CSV)</p>
                    <p className="text-xs text-gray-500">Apribile con Excel</p>
                  </div>
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="text-xl"></span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">PDF</p>
                    <p className="text-xs text-gray-500">Stampa o salva PDF</p>
                  </div>
                </button>
              </div>
            )}
          </div>
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
          <div ref={tableRef} className="bg-white rounded-xl shadow overflow-hidden">
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Fornitura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ultima Fattura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagamento
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
                          {client.contact_email ? (
                            <a href={`mailto:${client.contact_email}`} className="text-sm text-blue-600 hover:underline">
                              {client.contact_email}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">N/D</span>
                          )}
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
                          <button
                            onClick={() => togglePremiumStatus(client.id, !client.is_premium)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                              client.is_premium
                                ? 'bg-purple-100 text-purple-800 border-2 border-purple-300 shadow-sm'
                                : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                            }`}
                            title="Clicca per cambiare stato cliente"
                          >
                            {client.is_premium ? '👑 Premium' : 'Standard'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isExempt ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              Esente
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
                              title={isPaid ? 'Clicca per segnare come NON pagato' : 'Clicca per segnare come PAGATO'}
                            >
                              {isPaid ? '↩️ Segna non pagato' : '✓ Segna pagato'}
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