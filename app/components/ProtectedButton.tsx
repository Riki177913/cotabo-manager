// Sostituisci il contenuto con questo per bypassare i controlli
export default function ProtectedButton({ children, onClick, className, roles = [] }: any) {
  // Bypassa temporaneamente i controlli
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}
