'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con Logout */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">COTABO Manager</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Esci
          </button>
        </div>
      </header>

      {/* Contenuto */}
      <main className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Benvenuto!</h2>
        <p className="text-gray-600 mb-6">
          Sistema di gestione strumenti taxi per la Cooperativa COTABO.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard" className="block bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <h3 className="font-bold text-lg mb-2">Dashboard</h3>
            <p className="text-sm text-blue-100">Statistiche e riepiloghi</p>
          </Link>

          <Link href="/clienti" className="block bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg hover:border-blue-400 transition">
            <h3 className="font-bold text-lg mb-2">Clienti</h3>
            <p className="text-sm text-gray-600">Gestisci le aziende e i contratti</p>
          </Link>
          
          <Link href="/chiamataxi" className="block bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg hover:border-blue-400 transition">
            <h3 className="font-bold text-lg mb-2">Chiamataxi</h3>
            <p className="text-sm text-gray-600">SIM, PIN e dispositivi</p>
          </Link>
          
          <Link href="/btaxi" className="block bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg hover:border-blue-400 transition">
            <h3 className="font-bold text-lg mb-2">bTaxi Web</h3>
            <p className="text-sm text-gray-600">Credenziali di accesso</p>
          </Link>
<Link href="/pagamenti" className="block bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg hover:border-green-400 transition">
  <h3 className="font-bold text-lg mb-2">Pagamenti</h3>
  <p className="text-sm text-gray-600">Gestione canoni Chiamataxi</p>
</Link>
        <Link href="/interventi" className="block bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg hover:border-orange-400 transition">
  <h3 className="font-bold text-lg mb-2">🔧 Interventi</h3>
  <p className="text-sm text-gray-600">Storico interventi tecnici</p>
</Link>
</div>
      </main>
    </div>
  )
}