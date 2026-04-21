import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import VaccineTimeline from '../components/VaccineTimeline'

const EMOJI = { Perro:'🐶', Gato:'🐱', Ave:'🐦', Conejo:'🐰', Otro:'🐾' }
const fmt   = d => d ? new Date(d).toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' }) : '—'

const ESTADO_COLORS = {
  Completada: 'bg-green-100 text-green-700',
  Confirmada: 'bg-blue-100 text-blue-700',
  Cancelada:  'bg-red-100 text-red-700',
  Pendiente:  'bg-amber-100 text-amber-700',
}

export default function PetDetail() {
  const { id }                = useParams()
  const [mascota, setMascota] = useState(null)
  const [vacunas, setVacunas] = useState([])
  const [citas,   setCitas]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: m }, { data: v }, { data: c }] = await Promise.all([
        supabase.from('mascotas').select('*').eq('id', id).single(),
        supabase.from('vacunas').select('*').eq('mascota_id', id).order('fecha_aplicacion', { ascending: false }),
        supabase.from('citas').select('*').eq('mascota_id', id).order('fecha_hora', { ascending: false }).limit(5),
      ])
      setMascota(m)
      setVacunas(v ?? [])
      setCitas(c ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"/>
    </div>
  )
  if (!mascota) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Mascota no encontrada</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 flex-1">{mascota.nombre}</h1>
          <Link to="/agendar"
            className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors">
            Agendar hora
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Ficha */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
              {EMOJI[mascota.especie] ?? '🐾'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{mascota.nombre}</h2>
              <p className="text-sm text-gray-500">{mascota.especie}{mascota.raza ? ` · ${mascota.raza}` : ''}</p>
              {mascota.fecha_nacimiento && (
                <p className="text-xs text-gray-400 mt-1">Nacimiento: {fmt(mascota.fecha_nacimiento)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline vacunas */}
        {vacunas.length > 0 && (
          <VaccineTimeline vacunas={vacunas} especie={mascota.especie}/>
        )}

        {/* Historial completo de vacunas */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            💉 Historial de vacunas
            <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {vacunas.length}
            </span>
          </h3>
          {vacunas.length === 0 ? (
            <p className="text-sm text-gray-400">Sin vacunas registradas aún.</p>
          ) : (
            <div className="space-y-3">
              {vacunas.map((v, i) => (
                <div key={v.id} className={`flex gap-3 pb-3 ${i < vacunas.length-1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0"/>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-sm text-gray-900">{v.tipo}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{fmt(v.fecha_aplicacion)}</span>
                    </div>
                    {v.proxima_fecha && (
                      <p className="text-xs text-teal-600 mt-0.5">Próxima dosis: {fmt(v.proxima_fecha)}</p>
                    )}
                    {v.veterinario && <p className="text-xs text-gray-400 mt-0.5">Dr/a. {v.veterinario}</p>}
                    {v.notas       && <p className="text-xs text-gray-400 mt-0.5 italic">{v.notas}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citas */}
        {citas.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">📅 Citas recientes</h3>
            <div className="space-y-3">
              {citas.map((c, i) => (
                <div key={c.id} className={`flex items-center gap-3 pb-3 ${i < citas.length-1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-gray-900">
                        {c.motivo || c.tipo_consulta || 'Consulta'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${ESTADO_COLORS[c.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                        {c.estado}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{fmt(c.fecha_hora)}</p>
                    {c.notas && <p className="text-xs text-gray-400 mt-0.5 italic">{c.notas}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA agendar */}
        <Link to="/agendar"
          className="flex items-center justify-center gap-2 bg-white border border-teal-200 text-teal-700 rounded-xl py-3.5 text-sm font-medium hover:bg-teal-50 transition-colors">
          <span>📅</span> Agendar nueva hora para {mascota.nombre}
        </Link>

      </main>
    </div>
  )
}
