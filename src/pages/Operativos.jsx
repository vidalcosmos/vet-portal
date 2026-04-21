import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function diasRestantes(fecha) {
  const diff = Math.ceil((new Date(fecha) - new Date()) / 86400000)
  return diff
}

function EstadoBadge({ estado, fecha }) {
  const days = diasRestantes(fecha)
  if (estado === 'Completado') return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Completado</span>
  if (estado === 'Cancelado')  return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Cancelado</span>
  if (days < 0)                return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Finalizado</span>
  if (days === 0)              return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium animate-pulse">Hoy</span>
  if (days <= 7)               return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">En {days} días</span>
  return                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Próximamente</span>
}

export default function Operativos() {
  const [operativos, setOperativos] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filtro,     setFiltro]     = useState('proximos')

  useEffect(() => {
    supabase.from('operativos')
      .select('*')
      .eq('publicado', true)
      .order('fecha', { ascending: true })
      .then(({ data }) => { setOperativos(data ?? []); setLoading(false) })
  }, [])

  const hoy = new Date().toISOString().split('T')[0]

  const filtrados = operativos.filter(o => {
    if (filtro === 'proximos') return o.fecha >= hoy && o.estado === 'Activo'
    if (filtro === 'pasados')  return o.fecha < hoy  || o.estado === 'Completado'
    return true
  })

  function mapsUrl(o) {
    if (o.lat && o.lng) return `https://www.google.com/maps?q=${o.lat},${o.lng}`
    return `https://www.google.com/maps/search/${encodeURIComponent(o.direccion)}`
  }

  function wazeUrl(o) {
    if (o.lat && o.lng) return `https://waze.com/ul?ll=${o.lat},${o.lng}&navigate=yes`
    return `https://waze.com/ul?q=${encodeURIComponent(o.direccion)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-3">📍 Operativos veterinarios</h1>
          <div className="flex gap-2">
            {[['proximos','Próximos'],['pasados','Pasados'],['todos','Todos']].map(([val, label]) => (
              <button key={val} onClick={() => setFiltro(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filtro === val ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"/>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📍</div>
            <p className="text-gray-400 text-sm">No hay operativos {filtro === 'proximos' ? 'próximos' : ''}</p>
          </div>
        ) : filtrados.map(o => (
          <div key={o.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">{o.nombre}</h3>
                <EstadoBadge estado={o.estado} fecha={o.fecha}/>
              </div>

              {o.descripcion && (
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{o.descripcion}</p>
              )}

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-base">📅</span>
                  <span>
                    {new Date(o.fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long' })}
                    {o.hora ? ` · ${o.hora}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-base">📌</span>
                  <span>{o.direccion}{o.comuna ? `, ${o.comuna}` : ''}</span>
                </div>
              </div>

              {/* Botones navegación */}
              <div className="grid grid-cols-2 gap-2">
                <a href={mapsUrl(o)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm py-2.5 rounded-xl transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Google Maps
                </a>
                <a href={wazeUrl(o)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-medium text-sm py-2.5 rounded-xl transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  </svg>
                  Waze
                </a>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
