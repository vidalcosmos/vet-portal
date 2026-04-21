import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const HORARIOS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00',
                  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']
const MOTIVOS  = ['Vacuna','Consulta general','Control','Desparasitación','Urgencia','Otro']
const EMOJI    = { Perro:'🐶', Gato:'🐱', Ave:'🐦', Conejo:'🐰', Otro:'🐾' }

async function notificarMake({ mascota, fecha, hora, motivo, notas, dueno, telefono }) {
  const url = import.meta.env.VITE_MAKE_WEBHOOK
  if (!url) return

  const texto = encodeURIComponent(
    [
      '🐾 Nueva cita agendada!',
      '',
      `🐶 Mascota: ${mascota}`,
      `📅 Fecha: ${fecha}`,
      `🕐 Hora: ${hora}`,
      `🏥 Motivo: ${motivo}`,
      `👤 Dueño: ${dueno}`,
      telefono ? `📱 WhatsApp: ${telefono}` : null,
      notas    ? `📝 Notas: ${notas}`       : null,
    ].filter(Boolean).join('\n')
  )

  try {
    await fetch(`${url}?texto=${texto}`, { method: 'GET' })
  } catch (e) {
    console.warn('Webhook no disponible:', e.message)
  }
}

export default function BookAppointment() {
  const { user }    = useAuth()
  const [mascotas,  setMascotas]  = useState([])
  const [owner,     setOwner]     = useState(null)
  const [mascotaId, setMascotaId] = useState('')
  const [fecha,     setFecha]     = useState('')
  const [hora,      setHora]      = useState('')
  const [motivo,    setMotivo]    = useState('Consulta general')
  const [notas,     setNotas]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [notifOk,   setNotifOk]   = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function load() {
      const [{ data: o }, { data: m }] = await Promise.all([
        supabase.from('owners').select('nombre, telefono_wa').eq('id', user.id).single(),
        supabase.from('mascotas').select('id, nombre, especie'),
      ])
      setOwner(o)
      setMascotas(m ?? [])
      if (m?.length) setMascotaId(m[0].id)
    }
    load()
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('citas').insert({
      mascota_id: mascotaId,
      fecha_hora: `${fecha}T${hora}:00`,
      motivo, notas,
      estado: 'Pendiente',
      canal:  'Web',
    })

    if (!error) {
      const mascotaNombre = mascotas.find(m => m.id === mascotaId)?.nombre ?? '—'

      await notificarMake({
        mascota:  mascotaNombre,
        fecha,
        hora,
        motivo,
        notas:    notas || 'Sin notas',
        dueno:    owner?.nombre || user.email,
        telefono: owner?.telefono_wa || '',
      })

      setNotifOk(true)
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    const mascotaNombre = mascotas.find(m => m.id === mascotaId)?.nombre ?? '—'
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-md p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Hora agendada!</h2>
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-1.5 mb-5">
            <p><span className="text-gray-400">Mascota:</span> <span className="font-medium">{mascotaNombre}</span></p>
            <p><span className="text-gray-400">Fecha:</span> <span className="font-medium">{fecha}</span></p>
            <p><span className="text-gray-400">Hora:</span> <span className="font-medium">{hora}</span></p>
            <p><span className="text-gray-400">Motivo:</span> <span className="font-medium">{motivo}</span></p>
          </div>
          {notifOk && (
            <div className="flex items-center justify-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-5">
              <span>✓</span>
              <span>Veterinario notificado por WhatsApp</span>
            </div>
          )}
          <Link to="/"
            className="block w-full bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors text-center">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

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
                    motivo === m
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
                      hora === h
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'border-gray-200 text-gray-700 hover:border-teal-300'
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

          {/* Resumen + botón */}
          {mascotaId && fecha && hora && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm">
              <p className="font-medium text-teal-800 mb-2">Resumen de tu cita</p>
              <div className="space-y-1 text-teal-700">
                <p>🐾 {mascotas.find(m => m.id === mascotaId)?.nombre} — {motivo}</p>
                <p>📅 {fecha} a las {hora}</p>
                <p>👤 {owner?.nombre || user.email}</p>
                {owner?.telefono_wa && <p>📱 {owner.telefono_wa}</p>}
              </div>
            </div>
          )}

          <button type="submit"
            disabled={loading || !mascotaId || !fecha || !hora}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Agendando...
              </>
            ) : 'Confirmar cita'}
          </button>
        </form>
      </main>
    </div>
  )
}
