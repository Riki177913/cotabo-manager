'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#6B7280'];

export default function DashboardRiepilogo() {
  const [data, setData] = useState({
    totaleClienti: 0,
    chiamataxiPercent: 0,
    btaxiPercent: 0,
    categorie: [],
    loading: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch clients
    const { data: clientsData } = await supabase.from('clients').select('id, company_name');
    
    // Classifica clienti per categoria
    const categorie = { 
      'Hotel & B&B': 0, 
      'Ristoranti & Bar': 0, 
      'Cliniche & Centri Medici': 0, 
      'Aziende & Altro': 0 
    };
    
    clientsData.forEach(client => {
      const name = client.company_name.toUpperCase();
      if (name.includes('HOTEL') || name.includes('RESIDENCE') || name.includes('B&B') || name.includes('SUITE')) {
        categorie['Hotel & B&B']++;
      } else if (name.includes('RISTORANTE') || name.includes('TRATTORIA') || name.includes('OSTERIA') || name.includes('PUB')) {
        categorie['Ristoranti & Bar']++;
      } else if (name.includes('CLINICA') || name.includes('OSPEDALE') || name.includes('CENTRO MEDICO') || name.includes('TERME')) {
        categorie['Cliniche & Centri Medici']++;
      } else {
        categorie['Aziende & Altro']++;
      }
    });

    // Fetch dispositivi e credenziali
    const { data: devices } = await supabase.from('chiamataxi_devices').select('client_id');
    const { data: credentials } = await supabase.from('btaxi_credentials').select('client_id');

    const totale = clientsData.length;
    const uniciChiamataxi = [...new Set(devices.map(d => d.client_id))].length;
    const uniciBtaxi = [...new Set(credentials.map(c => c.client_id))].length;

    const chiamataxiPerc = totale > 0 ? ((uniciChiamataxi / totale) * 100).toFixed(1) : 0;
    const btaxiPerc = totale > 0 ? ((uniciBtaxi / totale) * 100).toFixed(1) : 0;

    const categorieArray = Object.entries(categorie).map(([name, value]) => ({ name, value }));

    setData({
      totaleClienti: totale,
      chiamataxiPercent: chiamataxiPerc,
      btaxiPercent: btaxiPerc,
      categorie: categorieArray,
      loading: false
    });
  };

  if (data.loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center text-gray-500">Caricamento dati...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Riepilogativa</h2>
          <p className="text-sm text-gray-500">Panoramica completa del sistema</p>
        </div>
      </div>

      {/* SEZIONE 1: Utilizzo Servizi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Utilizzo Chiamataxi</h3>
            <span className="text-3xl font-bold text-blue-600">{data.chiamataxiPercent}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-700"
              style={{ width: `${data.chiamataxiPercent}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">Clienti attivi con dispositivi</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Utilizzo BTaxiWeb</h3>
            <span className="text-3xl font-bold text-emerald-600">{data.btaxiPercent}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-4 rounded-full transition-all duration-700"
              style={{ width: `${data.btaxiPercent}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">Clienti con credenziali web</p>
        </div>
      </div>

      {/* SEZIONE 2: Distribuzione per Categoria */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Distribuzione Clienti per Tipologia</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grafico a Torta */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categorie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categorie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} clienti`, 'Totale']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista Dettagli */}
          <div className="space-y-3">
            {data.categorie.map((cat, index) => {
              const perc = ((cat.value / data.totaleClienti) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-bold text-gray-800">{cat.value}</span>
                    <span className="block text-xs text-gray-500">{perc}%</span>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Totale Clienti:</span>
                <span className="text-xl font-bold text-gray-900">{data.totaleClienti}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
