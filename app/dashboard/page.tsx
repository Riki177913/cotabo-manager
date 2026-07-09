'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#6B7280'];

export default function DashboardRiepilogo() {
  const [stats, setStats] = useState({
    totaleClienti: 0,
    clientiAttivi: 0,
    clientiInattivi: 0,
    totaleDispositivi: 0,
    dispositiviAttivi: 0,
    dispositiviInattivi: 0,
    totaleCredenziali: 0,
    credenzialiConPassword: 0,
    mediaPerCliente: 0,
    chiamataxiPercent: 0,
    btaxiPercent: 0,
    categorie: [] as { name: string; value: number }[],
    loading: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, company_name');
      
      if (clientsError) throw clientsError;
      if (!clientsData) return;

      // Fetch dispositivi
      const { data: devicesData, error: devicesError } = await supabase
        .from('chiamataxi_devices')
        .select('id, client_id, is_active');
      
      if (devicesError) throw devicesError;

      // Fetch credenziali
      const { data: credentialsData, error: credentialsError } = await supabase
        .from('btaxi_credentials')
        .select('id, client_id');
      
      if (credentialsError) throw credentialsError;

      // Calcola statistiche
      const totaleClienti = clientsData.length;
      const clientiUniciConDispositivi = devicesData 
        ? [...new Set(devicesData.map((d: any) => d.client_id))].length 
        : 0;
      const clientiUniciConCredenziali = credentialsData 
        ? [...new Set(credentialsData.map((c: any) => c.client_id))].length 
        : 0;

      const dispositiviAttivi = devicesData?.filter((d: any) => d.is_active === true).length || 0;
      const dispositiviInattivi = devicesData?.filter((d: any) => d.is_active === false).length || 0;

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

      const chiamataxiPercent = totaleClienti > 0 
        ? parseFloat(((clientiUniciConDispositivi / totaleClienti) * 100).toFixed(1)) 
        : 0;
      const btaxiPercent = totaleClienti > 0 
        ? parseFloat(((clientiUniciConCredenziali / totaleClienti) * 100).toFixed(1)) 
        : 0;

      const mediaPerCliente = totaleClienti > 0 
        ? parseFloat((((credentialsData?.length || 0) / totaleClienti)).toFixed(1))
        : 0;

      const categorieArray = Object.entries(categorie).map(([name, value]) => ({ name, value }));

      setStats({
        totaleClienti,
        clientiAttivi: clientiUniciConDispositivi,
        clientiInattivi: totaleClienti - clientiUniciConDispositivi,
        totaleDispositivi: devicesData?.length || 0,
        dispositiviAttivi,
        dispositiviInattivi,
        totaleCredenziali: credentialsData?.length || 0,
        credenzialiConPassword: credentialsData?.filter((c: any) => c.password).length || 0,
        mediaPerCliente,
        chiamataxiPercent,
        btaxiPercent,
        categorie: categorieArray,
        loading: false
      });
    } catch (error) {
      console.error("Errore nel fetch dei dati dashboard:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center text-gray-500">Caricamento dati...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Riepilogativa</h1>
            <p className="text-sm text-gray-500">Panoramica completa del sistema</p>
          </div>
        </div>

        {/* SEZIONE ORIGINALE - Le 3 Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Clienti */}
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Totale Clienti</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totaleClienti}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Attivi:
                </span>
                <span className="font-semibold">{stats.clientiAttivi}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                  Inattivi:
                </span>
                <span className="font-semibold">{stats.clientiInattivi}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.totaleClienti > 0 ? (stats.clientiAttivi / stats.totaleClienti) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {stats.totaleClienti > 0 ? ((stats.clientiAttivi / stats.totaleClienti) * 100).toFixed(1) : 0}% attivi
              </p>
            </div>
          </div>

          {/* Card Dispositivi */}
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-purple-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Dispositivi Chiamataxi</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totaleDispositivi}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Attivi:
                </span>
                <span className="font-semibold">{stats.dispositiviAttivi}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                  Inattivi:
                </span>
                <span className="font-semibold">{stats.dispositiviInattivi}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.totaleDispositivi > 0 ? (stats.dispositiviAttivi / stats.totaleDispositivi) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {stats.totaleDispositivi > 0 ? ((stats.dispositiviAttivi / stats.totaleDispositivi) * 100).toFixed(1) : 0}% attivi
              </p>
            </div>
          </div>

          {/* Card Credenziali */}
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Credenziali bTaxi Web</p>
                <p className="text-3xl font-bold text-green-600">{stats.totaleCredenziali}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-orange-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                  Con password:
                </span>
                <span className="font-semibold">{stats.credenzialiConPassword}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Media per cliente:
                </span>
                <span className="font-semibold">{stats.mediaPerCliente}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.totaleClienti > 0 ? (stats.totaleCredenziali / stats.totaleClienti) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">Copertura credenziali</p>
            </div>
          </div>
        </div>

        {/* NUOVA SEZIONE - Utilizzo Servizi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Utilizzo Chiamataxi</h3>
              <span className="text-3xl font-bold text-blue-600">{stats.chiamataxiPercent}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-700"
                style={{ width: `${stats.chiamataxiPercent}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">Clienti attivi con dispositivi</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Utilizzo BTaxiWeb</h3>
              <span className="text-3xl font-bold text-emerald-600">{stats.btaxiPercent}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-600 h-4 rounded-full transition-all duration-700"
                style={{ width: `${stats.btaxiPercent}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">Clienti con credenziali web</p>
          </div>
        </div>

        {/* NUOVA SEZIONE - Distribuzione per Categoria */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Distribuzione Clienti per Tipologia
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grafico a Torta */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categorie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categorie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} clienti`, 'Totale']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Lista Dettagli */}
            <div className="space-y-3">
              {stats.categorie.map((cat, index) => {
                const perc = stats.totaleClienti > 0 
                  ? ((cat.value / stats.totaleClienti) * 100).toFixed(1) 
                  : '0';
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                  <span className="text-xl font-bold text-gray-900">{stats.totaleClienti}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
