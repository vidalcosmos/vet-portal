import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const VET_EMAIL = 'giovannivc16@gmail.com'
const CAT_NOTICIAS = ['Salud','Nutrición','Cuidados','Vacunas','General']
const EMOJI_OPTS   = ['💉','🐶','🐱','🏥','🦴','🌿','❤️','⚠️','☀️','🪱','📢','🐾']

function FormNoticia({ onSuccess }) {
  const [titulo,   setTitulo]   = useState('')
  const [resumen,  setResumen]  = useState('')
  const [categoria,setCat]      = useState('General')
  const [emoji,    setEmoji]    = useState('🐾')
  const [saving,   setSaving]   = useState(false)
  const [ok,       setOk]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('noticias').insert({ titulo, resumen, categoria, emoji, publicado: true })
    if (!error) { setOk(true); setTitulo(''); setResumen(''); setTimeout(() => setOk(false), 2000) }
    setSaving(false)
    if (onSuccess) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {EMOJI_OPTS.map(e => (
          <button key={e} type="button" onClick={() => setEmoji(e)}
            className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-all ${
              emoji === e ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-300'
            }`}
            style={{fontSize:'18px'}}>{e}</button>
        ))}
      </div>
      <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} required
        placeholder="Título de la noticia"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      <textarea value={resumen} onChange={e => setResumen(e.target.value)} required rows={3}
        placeholder="Resumen o contenido..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"/>
      <div className="flex gap-2 flex-wrap">
        {CAT_NOTICIAS.map(c => (
          <button key={c} type="button" onClick={() => setCat(c)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              categoria === c ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600'
            }`}>{c}</button>
        ))}
      </div>
      <button type="submit" disabled={saving}
        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
          ok ? 'bg-green-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60'
        }`}>
        {ok ? '✓ Noticia publicada' : saving ? 'Publicando...' : 'Publicar noticia'}
      </button>
    </form>
  )
}

function FormOperativo({ onSuccess }) {
  const [nombre,  setNombre]  = useState('')
  const [desc,    setDesc]    = useState('')
  const [dir,     setDir]     = useState('')
  const [comuna,  setComuna]  = useState('')
  const [fecha,   setFecha]   = useState('')
  const [hora,    setHora]    = useState('')
  const [lat,     setLat]     = useState('')
  const [lng,     setLng]     = useState('')
  const [saving,  setSaving]  = useState(false)
  const [ok,      setOk]      = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('operativos').insert({
      nombre, descripcion: desc, direccion: dir, comuna, fecha, hora,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      publicado: true, estado: 'Activo'
    })
    if (!error) {
      setOk(true); setNombre(''); setDesc(''); setDir(''); setComuna(''); setFecha(''); setHora(''); setLat(''); setLng('')
      setTimeout(() => setOk(false), 2000)
    }
    setSaving(false)
    if (onSuccess) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required
        placeholder="Nombre del operativo"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
        placeholder="Descripción (servicios, requisitos...)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"/>
      <input type="text" value={dir} onChange={e => setDir(e.target.value)} required
        placeholder="Dirección exacta"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      <div className="grid grid-cols-2 gap-2">
        <input type="text" value={comuna} onChange={e => setComuna(e.target.value)}
          placeholder="Comuna"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        <input type="text" value={hora} onChange={e => setHora(e.target.value)}
          placeholder="Horario (ej: 10:00-14:00)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      </div>
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      <div className="grid grid-cols-2 gap-2">
        <input type="text" value={lat} onChange={e => setLat(e.target.value)}
          placeholder="Latitud (ej: -33.4489)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        <input type="text" value={lng} onChange={e => setLng(e.target.value)}
          placeholder="Longitud (ej: -70.6693)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      </div>
      <p className="text-xs text-gray-400">
        Busca el lugar en Google Maps → clic derecho → copia las coordenadas
      </p>
      <button type="submit" disabled={saving}
        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
          ok ? 'bg-green-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60'
        }`}>
        {ok ? '✓ Operativo publicado' : saving ? 'Publicando...' : 'Publicar operativo'}
      </button>
    </form>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState('noticias')

  if (user?.email !== VET_EMAIL) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="font-semibold text-gray-900 mb-2">Acceso restringido</h2>
        <p className="text-sm text-gray-500 mb-4">Solo el veterinario puede acceder a este panel.</p>
        <Link to="/" className="text-teal-600 text-sm font-medium">Volver al inicio</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/perfil" className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Panel veterinario</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex gap-2 mb-5">
          <button onClick={() => setTab('noticias')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              tab === 'noticias' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200'
            }`}>
            📰 Nueva noticia
          </button>
          <button onClick={() => setTab('operativo')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              tab === 'operativo' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200'
            }`}>
            📍 Nuevo operativo
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          {tab === 'noticias' ? <FormNoticia/> : <FormOperativo/>}
        </div>
      </main>
    </div>
  )
}
