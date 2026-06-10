import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">🚖 COTABO Manager</h1>
          <Link href="/login" className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
            Accedi
          </Link>
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
            <h3 className="font-bold text-lg mb-2">📊 Dashboard</h3>
            <p className="text-sm text-blue-100">Statistiche e riepiloghi</p>
          </Link>

          <Link href="/clienti" className="block bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg hover:border-blue-400 transition">
            <h3 className="font-bold text-lg mb-2">📋 Clienti</h3>
            <p className="text-sm text-gray-600">Gestisci le aziende e i contratti</p>
          </Link>
          
          <Link href="/chiamataxi" className="block bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg hover:border-blue-400 transition">
            <h3 className="font-bold text-lg mb-2">📱 Chiamataxi</h3>
            <p className="text-sm text-gray-600">SIM, PIN e dispositivi</p>
          </Link>
          
          <Link href="/btaxi" className="block bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg hover:border-blue-400 transition">
            <h3 className="font-bold text-lg mb-2">🌐 bTaxi Web</h3>
            <p className="text-sm text-gray-600">Credenziali di accesso</p>
          </Link>
        </div>
      </main>
    </div>
  )
}