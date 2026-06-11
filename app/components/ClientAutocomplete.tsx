'use client'

import { useState, useRef, useEffect } from 'react'

interface ClientAutocompleteProps {
  clients: any[]
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

export default function ClientAutocomplete({ clients, value, onChange, label = 'Cliente', required = false }: ClientAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Inizializza il valore quando cambia il client selezionato
  useEffect(() => {
    if (value) {
      const client = clients.find(c => c.id === value)
      if (client) {
        setInputValue(client.company_name)
      }
    } else {
      setInputValue('')
    }
  }, [value, clients])

  // Filtra i clienti quando l'utente digita
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredClients(clients)
    } else {
      const filtered = clients.filter(client =>
        client.company_name.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredClients(filtered)
    }
    setHighlightedIndex(-1)
  }, [inputValue, clients])

  // Chiudi il dropdown quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (client: any) => {
    onChange(client.id)
    setInputValue(client.company_name)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev < filteredClients.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < filteredClients.length) {
        handleSelect(filteredClients[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setIsOpen(true)
          // Resetta il valore selezionato se l'utente modifica il testo
          if (value) {
            const client = clients.find(c => c.id === value)
            if (client && client.company_name !== e.target.value) {
              onChange('')
            }
          }
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Inizia a digitare il nome del cliente..."
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      
      {isOpen && filteredClients.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              onClick={() => handleSelect(client)}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                highlightedIndex === index ? 'bg-blue-100' : ''
              } ${client.id === value ? 'bg-green-50 font-medium' : ''}`}
            >
              <div className="font-medium text-gray-900">{client.company_name}</div>
              {client.vat_number && (
                <div className="text-xs text-gray-500">P.IVA: {client.vat_number}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && inputValue && filteredClients.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm">
          Nessun cliente trovato
        </div>
      )}
    </div>
  )
}