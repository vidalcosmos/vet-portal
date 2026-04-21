import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const EMOJI = { Perro:'🐶', Gato:'🐱', Ave:'🐦', Conejo:'🐰', Otro:'🐾' }

function daysFrom(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000)
}

function VacunaChip({ vacunas }) {
  if (!vacunas?.length)
    return <span className="text-xs text-gray-400">Sin vacunas registradas</span>

  const proximas = vacunas
    .filter(v => v.proxima_fecha)
    .sort((a, b) => new Date(a.proxima_fecha) - new Date(b.proxima_fecha))

  if (!proximas.length)
    return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Sin próxima vacuna</span>

  const days = daysFrom(proximas[0].proxima_fecha)
  if (days === null) return null
  if (days < 0)    return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">🚨 Vacuna vencida</span>
  if (days <= 30)  return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⚠️ Vacuna en {days} días</span>
  return               <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Vacuna al día</span>
}

export default function Dashboard() {
  const { user, signOut }       = useAuth()
  const [mascotas, setMascotas] = useState([])
  const [owner,    setOwner]    = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: o }, { data: m }] = await Promise.all([
        supabase.from('owners').select('*').eq('id', user.id).single(),
        supabase.from('mascotas')
          .select('*, vacunas(proxima_fecha, fecha_aplicacion)')
          .order('created_at'),
      ])
      setOwner(o)
      setMascotas(m ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  const alertas = mascotas.filter(m => {
    const prox = m.vacunas?.filter(v => v.proxima_fecha) ?? []
    if (!prox.length) return false
    const days = daysFrom(
      prox.sort((a,b) => new Date(a.proxima_fecha) - new Date(b.proxima_fecha))[0].proxima_fecha
    )
    return days !== null && days <= 30
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">🐾 Mis mascotas</h1>
            <p className="text-xs text-gray-400 mt-0.5">Hola, {owner?.nombre || user.email}</p>
          </div>
          <button onClick={signOut}
            className="text-sm text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Botón agendar */}
        <Link to="/agendar"
          className="flex items-center justify-between bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-5 py-4 transition-colors">
          <div>
            <p className="font-semibold text-base">Agendar hora</p>
            <p className="text-teal-100 text-sm mt-0.5">Consultas, vacunas, controles</p>
          </div>
          <span style={{fontSize:'28px'}}>📅</span>
        </Link>

        {/* Alertas vacunas */}
        {alertas.length > 0 && (
          <div className="space-y-2">
            {alertas.map(m => {
              const proxima = m.vacunas
                .filter(v => v.proxima_fecha)
                .sort((a,b) => new Date(a.proxima_fecha) - new Date(b.proxima_fecha))[0]
              const days     = daysFrom(proxima.proxima_fecha)
              const vencida  = days < 0
              return (
                <Link key={m.id} to={`/mascota/${m.id}`}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                    vencida ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                  <span style={{fontSize:'20px'}}>{EMOJI[m.especie] ?? '🐾'}</span>
                  <p className={`flex-1 text-sm font-medium ${vencida ? 'text-red-800' : 'text-amber-800'}`}>
                    {vencida ? '🚨' : '⚠️'} {m.nombre} —{' '}
                    {vencida
                      ? `vacuna vencida hace ${Math.abs(days)} días`
                      : `vacuna vence en ${days} días`}
                  </p>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              )
            })}
          </div>
        )}

        {/* Lista mascotas */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"/>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {mascotas.length > 0 ? `${mascotas.length} mascota${mascotas.length > 1 ? 's' : ''}` : 'Tus mascotas'}
              </p>
              <Link to="/agregar-mascota"
                className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-full transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Agregar mascota
              </Link>
            </div>

            {mascotas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <div style={{fontSize:'48px'}} className="mb-3">🐾</div>
                <h2 className="text-base font-medium text-gray-900 mb-1">Aún no tienes mascotas</h2>
                <p className="text-gray-400 text-sm mb-4 max-w-xs mx-auto">
                  Agrega a tu mascota para ver su historial de vacunas y agendar citas
                </p>
                <Link to="/agregar-mascota"
                  className="inline-flex items-center gap-2 bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Agregar mi primera mascota
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {mascotas.map(m => (
                  <Link key={m.id} to={`/mascota/${m.id}`}
                    className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-sm transition-all">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0"
                         style={{fontSize:'24px'}}>
                      {EMOJI[m.especie] ?? '🐾'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{m.nombre}</p>
                      <p className="text-xs text-gray-400 mb-1">
                        {m.especie}{m.raza ? ` · ${m.raza}` : ''}
                      </p>
                      <VacunaChip vacunas={m.vacunas}/>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}

                {/* Agregar otra */}
                <Link to="/agregar-mascota"
                  className="flex items-center justify-center gap-2 bg-white border border-dashed border-gray-200 rounded-xl py-3.5 text-sm text-gray-400 hover:text-teal-600 hover:border-teal-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Agregar otra mascota
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
