'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function DebugClienti() {
  const [userData, setUserData] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [error, setError] = useState<any>(null)
  const [count, setCount] = useState<number>(0)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Test 1: Verifica autenticazione
      const { data: { user } } = await supabase.auth.getUser()
      setUserData(user)

      // Test 2: Leggi tutti i clienti
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      setError(error)
      setClients(data || [])
      setCount(data?.length || 0)
    }

    loadData()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug Clienti</h1>
      
      <div className="space-y-4">
        {/* Autenticazione */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-bold text-blue-900 mb-2">1. Autenticazione</h2>
          <p><strong>Utente loggato:</strong> {userData?.email || 'NO'}</p>
          <p><strong>User ID:</strong> {userData?.id || 'NO'}</p>
        </div>

        {/* Errori */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="font-bold text-red-900 mb-2">2. Errori nella query</h2>
          {error ? (
            <pre className="text-sm text-red-700">{JSON.stringify(error, null, 2)}</pre>
          ) : (
            <p className="text-green-700">✅ Nessun errore</p>
          )}
        </div>

        {/* Conteggio */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="font-bold text-yellow-900 mb-2">3. Conteggio clienti</h2>
          <p><strong>Totale clienti nel DB:</strong> {count}</p>
        </div>

        {/* Dati */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="font-bold text-green-900 mb-2">4. Dati letti ({clients.length} clienti)</h2>
          {clients.length > 0 ? (
            <pre className="text-sm text-green-800 overflow-auto max-h-96">
              {JSON.stringify(clients, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600">Nessun cliente letto dal database</p>
          )}
        </div>

        {/* Link */}
        <div className="flex gap-3">
          <Link href="/clienti" className="bg-blue-600 text-white px-4 py-2 rounded">
            ← Torna a Clienti
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            🔄 Ricarica
          </button>
        </div>
      </div>
    </div>
  )
}