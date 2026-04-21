import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

const HORARIOS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00',
                  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']
const MOTIVOS  = ['Vacuna','Consulta general','Control','Desparasitación','Urgencia','Otro']
const EMOJI    = { Perro:'🐶', Gato:'🐱', Ave:'🐦', Conejo:'🐰', Otro:'🐾' }

export default function BookAppointment() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [mascotas, setMascotas] = useState([])
  const [mascotaId, setMascotaId] = useState('')
  const [fecha,    setFecha]    = useState('')
  const [hora,     setHora]     = useState('')
  const [motivo,   setMotivo]   = useState('Consulta general')
  const [notas,    setNotas]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    supabase.from('mascotas').select('id,nombre,especie').then(({ data }) => {
      setMascotas(data ?? [])
      if (data?.length) setMascotaId(data[0].id)
    })
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('citas').insert({
      mascota_id: mascotaId,
      fecha_hora: `${fecha}T${hora}:00`,
      motivo,
      notas,
      estado: 'Pendiente',
      canal:  'Web',
    })
    setLoading(false)
    if (!error) setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Hora agendada!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Te contactaremos por WhatsApp para confirmar tu cita.<br/>
          <span className="font-medium">{fecha} a las {hora}</span>
        </p>
        <Link to="/" className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
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
          <h1 className="text-lg font-semibold text-gray-900">Agendar hora</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Mascota */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-medium text-gray-900 mb-3">¿Para qué mascota?</h3>
            {mascotas.length === 0 ? (
              <p className="text-sm text-gray-400">No tienes mascotas registradas aún.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {mascotas.map(m => (
                  <button key={m.id} type="button" onClick={() => setMascotaId(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      mascotaId === m.id ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <div className="text-2xl mb-1">{EMOJI[m.especie] ?? '🐾'}</div>
                    <div className="text-sm font-medium text-gray-900">{m.nombre}</div>
                    <div className="text-xs text-gray-400">{m.especie}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Motivo */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-medium text-gray-900 mb-3">Motivo</h3>
            <div className="flex flex-wrap gap-2">
              {MOTIVOS.map(m => (
                <button key={m} type="button" onClick={() => setMotivo(m)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    motivo === m ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-medium text-gray-900 mb-3">Fecha</h3>
            <input type="date" value={fecha} min={today} required
              onChange={e => { setFecha(e.target.value); setHora('') }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Horarios */}
          {fecha && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-medium text-gray-900 mb-3">Hora disponible</h3>
              <div className="grid grid-cols-4 gap-2">
                {HORARIOS.map(h => (
                  <button key={h} type="button" onClick={() => setHora(h)}
                    className={`py-2 rounded-lg text-sm border transition-all ${
                      hora === h ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-700 hover:border-teal-300'
                    }`}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-medium text-gray-900 mb-1">
              Notas <span className="text-gray-400 font-normal text-sm">(opcional)</span>
            </h3>
            <p className="text-xs text-gray-400 mb-3">Síntomas, preguntas o información importante</p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
              placeholder="Ej: El perro lleva 2 días sin comer, le noto el abdomen hinchado..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <button type="submit" disabled={loading || !mascotaId || !fecha || !hora}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-40">
            {loading ? 'Agendando...' : `Confirmar — ${fecha || '—'} ${hora || '—'}`}
          </button>
        </form>
      </main>
    </div>
  )
}
