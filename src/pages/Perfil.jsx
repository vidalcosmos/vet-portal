import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const VET_EMAIL = 'giovannivc16@gmail.com'

export default function Perfil() {
  const { user, signOut }       = useAuth()
  const [owner,    setOwner]    = useState(null)
  const [nombre,   setNombre]   = useState('')
  const [telefono, setTelefono] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    supabase.from('owners').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        setOwner(data)
        setNombre(data?.nombre ?? '')
        setTelefono(data?.telefono_wa ?? '')
      })
  }, [user])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('owners').update({ nombre, telefono_wa: telefono }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = nombre?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const isVet    = user?.email === VET_EMAIL

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">👤 Mi perfil</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-2xl font-semibold text-teal-700">
            {initials}
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 text-lg">{nombre || 'Sin nombre'}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
            {isVet && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Veterinario</span>}
          </div>
        </div>

        {/* Panel admin — solo para el vet */}
        {isVet && (
          <Link to="/admin"
            className="flex items-center justify-between bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-4 transition-colors">
            <div>
              <p className="font-semibold text-sm">Panel veterinario</p>
              <p className="text-teal-100 text-xs mt-0.5">Publicar noticias y operativos</p>
            </div>
            <svg className="w-5 h-5 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        )}

        {/* Formulario datos */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-medium text-gray-900 mb-4">Mis datos</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Tu nombre"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="+56912345678"/>
              <p className="text-xs text-gray-400 mt-1">Para enviarte recordatorios de vacunas</p>
            </div>
            <button type="submit" disabled={saving}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                saved ? 'bg-green-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60'
              }`}>
              {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Cuenta */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-medium text-gray-900 mb-3">Cuenta</h3>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm text-gray-900">{user.email}</span>
          </div>
          <div className="border-t border-gray-50 pt-3 mt-1">
            <button onClick={signOut}
              className="w-full text-red-500 hover:text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors">
              Cerrar sesión
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}
