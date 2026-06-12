// Nella tabella, modifica le colonne dell'header:
<thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Cliente
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Codice Abbonato
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Email
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      P.IVA
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Stato
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      Azioni
    </th>
  </tr>
</thead>

// Nel tbody, modifica le righe dei clienti:
<tbody className="bg-white divide-y divide-gray-200">
  {filteredClients.map((client) => (
    <tr key={client.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <Link href={`/clienti/${client.id}`} className="text-sm font-medium text-blue-600 hover:underline">
            {client.company_name}
          </Link>
          {client.contact_name && (
            <p className="text-xs text-gray-500">{client.contact_name}</p>
          )}
        </div>
      </td>
      
      {/* Codice Abbonato */}
      <td className="px-6 py-4 whitespace-nowrap">
        {client.codice_abbonato ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {client.codice_abbonato}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">N/D</span>
        )}
      </td>
      
      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        {client.contact_email ? (
          <a href={`mailto:${client.contact_email}`} className="text-sm text-blue-600 hover:underline">
            {client.contact_email}
          </a>
        ) : (
          <span className="text-gray-400 text-sm">N/D</span>
        )}
      </td>
      
      {/* P.IVA */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{client.vat_number || 'N/D'}</div>
      </td>
      
      {/* Stato */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          client.status === 'Attivo' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {client.status || 'Attivo'}
        </span>
      </td>
      
      {/* Azioni */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <Link
            href={`/clienti/${client.id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            Dettagli
          </Link>
          <ProtectedButton
            roles={['admin', 'operator']}
            onClick={() => window.location.href = `/clienti/${client.id}/modifica`}
            className="text-yellow-600 hover:text-yellow-900"
          >
            Modifica
          </ProtectedButton>
          <ProtectedButton
            roles={['admin']}
            onClick={() => handleDelete(client.id)}
            className="text-red-600 hover:text-red-900"
          >
            Elimina
          </ProtectedButton>
        </div>
      </td>
    </tr>
  ))}
</tbody>