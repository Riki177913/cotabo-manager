export default function CheckEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Controllo Ambiente</h1>
      <div className="space-y-2">
        <p><strong>URL Supabase:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ PRESENTE' : '❌ MANCANTE'}</p>
        <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ PRESENTE' : '❌ MANCANTE'}</p>
      </div>
    </div>
  )
}