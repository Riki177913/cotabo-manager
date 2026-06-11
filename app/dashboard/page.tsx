'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    totalDevices: 0,
    activeDevices: 0,
    inactiveDevices: 0,
    totalCredentials: 0,
    recentClients: [] as any[],
    recentDevices: [] as any[],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    // Conta clienti
    const { count: totalClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
    
    const { data: activeClientsData } = await supabase
      .from('clients')
      .select('id')
      .eq('status', 'Attivo')
    
    const { data: recentClients } = await supabase
      .from('clients')
      .select('company_name, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5)

    // Conta dispositivi
    const { count: totalDevices } = await supabase
      .from('chiamataxi_devices')
      .select('*', { count: 'exact', head: true })
    
    const { data: activeDevicesData } = await supabase
      .from('chiamataxi_devices')
      .select('id')
      .eq('is_active', true)
    
    const { data: recentDevices } = await supabase
      .from('chiamataxi_devices')
      .select('sim_number, created_at, is_active, clients(company_name)')
      .order('created_at', { ascending: false })
      .limit(5)

    // Conta credenziali
    const { count: totalCredentials } = await supabase
      .from('btaxi_credentials')
      .select('*', { count: 'exact', head: true })

    setStats({
      totalClients: totalClients || 0,
      activeClients: activeClientsData?.length || 0,
      inactiveClients: (totalClients || 0) - (activeClientsData?.length || 0),
      totalDevices: totalDevices || 0,
      activeDevices: activeDevicesData?.length || 0,
      inactiveDevices: (totalDevices || 0) - (activeDevicesData?.length || 0),
      totalCredentials: totalCredentials || 0,
      recentClients: recentClients || [],
      recentDevices: recentDevices || [],
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Caricamento dashboard...</p>
      </div>
    )
  }

  // Calcola percentuali come numeri
  const totalItems = stats.totalClients + stats.totalDevices + stats.totalCredentials
  const clientPercentageNum = totalItems > 0 ? (stats.totalClients / totalItems) * 100 : 0
  const devicePercentageNum = totalItems > 0 ? (stats.totalDevices / totalItems) * 100 : 0
  const credentialPercentageNum = totalItems > 0 ? (stats.totalCredentials / totalItems) * 100 : 0

  const clientPercentage = totalItems > 0 ? ((stats.totalClients / totalItems) * 100).toFixed(1) : '0'
  const devicePercentage = totalItems > 0 ? ((stats.totalDevices / totalItems) * 100).toFixed(1) : '0'
  const credentialPercentage = totalItems > 0 ? ((stats.totalCredentials / totalItems) * 100).toFixed(1) : '0'

  const activeClientPercentage = stats.totalClients > 0 ? ((stats.activeClients / stats.totalClients) * 100).toFixed(1) : '0'
  const activeDevicePercentage = stats.totalDevices > 0 ? ((stats.activeDevices / stats.totalDevices) * 100).toFixed(1) : '0'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">🚖 COTABO Manager</h1>
          <Link href="/" className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
            ← Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-8">
        {/* Titolo Dashboard */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">📊 Dashboard Riepilogativa</h2>
          <p className="text-gray-600 mt-1">Panoramica completa del sistema</p>
        </div>

        {/* Card Principali */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Clienti */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👥</div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Totale Clienti</p>
                <p className="text-4xl font-bold text-blue-600">{stats.totalClients}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">✅ Attivi:</span>
                <span className="font-semibold">{stats.activeClients}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">⏸️ Inattivi:</span>
                <span className="font-semibold">{stats.inactiveClients}</span>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${activeClientPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {activeClientPercentage}% attivi
              </p>
            </div>
          </div>

          {/* Dispositivi Chiamataxi */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📱</div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Dispositivi Chiamataxi</p>
                <p className="text-4xl font-bold text-purple-600">{stats.totalDevices}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">✅ Attivi:</span>
                <span className="font-semibold">{stats.activeDevices}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">⏸️ Inattivi:</span>
                <span className="font-semibold">{stats.inactiveDevices}</span>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${activeDevicePercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {activeDevicePercentage}% attivi
              </p>
            </div>
          </div>

          {/* Credenziali bTaxi */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🌐</div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Credenziali bTaxi Web</p>
                <p className="text-4xl font-bold text-green-600">{stats.totalCredentials}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">🔐 Con password:</span>
                <span className="font-semibold">{stats.totalCredentials}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">📊 Media per cliente:</span>
                <span className="font-semibold">
                  {stats.totalClients > 0 ? (stats.totalCredentials / stats.totalClients).toFixed(1) : 0}
                </span>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalClients > 0 ? Math.min((stats.totalCredentials / stats.totalClients) * 100, 100) : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Copertura credenziali
              </p>
            </div>
          </div>
        </div>

        {/* Grafico Distribuzione */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Distribuzione Totale</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Grafico a barre orizzontali */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">👥 Clienti</span>
                  <span className="text-sm font-bold text-blue-600">{clientPercentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${clientPercentage}%` }}
                  >
                    <span className="text-xs text-white font-bold">{stats.totalClients}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">📱 Dispositivi</span>
                  <span className="text-sm font-bold text-purple-600">{devicePercentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-purple-500 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${devicePercentage}%` }}
                  >
                    <span className="text-xs text-white font-bold">{stats.totalDevices}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">🌐 Credenziali</span>
                  <span className="text-sm font-bold text-green-600">{credentialPercentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${credentialPercentage}%` }}
                  >
                    <span className="text-xs text-white font-bold">{stats.totalCredentials}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Totale elementi nel sistema:</strong> {totalItems}
                </p>
              </div>
            </div>

            {/* Grafico a torta con CSS */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {/* Clienti */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="40"
                    strokeDasharray={`${(clientPercentageNum / 100) * 502} 502`}
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                  />
                  {/* Dispositivi */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="40"
                    strokeDasharray={`${(devicePercentageNum / 100) * 502} 502`}
                    strokeDashoffset={`-${(clientPercentageNum / 100) * 502}`}
                    transform="rotate(-90 100 100)"
                  />
                  {/* Credenziali */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="40"
                    strokeDasharray={`${(credentialPercentageNum / 100) * 502} 502`}
                    strokeDashoffset={`-${((clientPercentageNum + devicePercentageNum) / 100) * 502}`}
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
                    <p className="text-xs text-gray-600">Totale</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-700">Clienti ({stats.totalClients})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-700">Dispositivi ({stats.totalDevices})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Credenziali ({stats.totalCredentials})</span>
            </div>
          </div>
        </div>

        {/* Attività Recente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ultimi Clienti */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Ultimi Clienti Aggiunti</h3>
            {stats.recentClients.length > 0 ? (
              <div className="space-y-3">
                {stats.recentClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{client.company_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(client.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      client.status === 'Attivo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nessun cliente registrato</p>
            )}
          </div>

          {/* Ultimi Dispositivi */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📱 Ultimi Dispositivi Aggiunti</h3>
            {stats.recentDevices.length > 0 ? (
              <div className="space-y-3">
                {stats.recentDevices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-mono font-medium text-gray-900">
                        SIM ...{device.sim_number?.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {device.clients?.company_name} • {new Date(device.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      device.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {device.is_active ? 'Attiva' : 'Inattiva'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nessun dispositivo registrato</p>
            )}
          </div>
        </div>

        {/* Link Rapidi */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Azioni Rapide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/clienti/nuovo" className="bg-white p-3 rounded-lg text-center hover:shadow-md transition">
              <div className="text-2xl mb-1">➕</div>
              <p className="text-sm font-medium">Nuovo Cliente</p>
            </Link>
            <Link href="/chiamataxi" className="bg-white p-3 rounded-lg text-center hover:shadow-md transition">
              <div className="text-2xl mb-1">📱</div>
              <p className="text-sm font-medium">Gestisci SIM</p>
            </Link>
            <Link href="/btaxi" className="bg-white p-3 rounded-lg text-center hover:shadow-md transition">
              <div className="text-2xl mb-1">🌐</div>
              <p className="text-sm font-medium">Credenziali</p>
            </Link>
            <Link href="/clienti" className="bg-white p-3 rounded-lg text-center hover:shadow-md transition">
              <div className="text-2xl mb-1">📋</div>
              <p className="text-sm font-medium">Lista Clienti</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
