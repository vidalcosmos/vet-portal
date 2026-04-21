import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Otro']
const EMOJI    = { Perro:'🐶', Gato:'🐱', Ave:'🐦', Conejo:'🐰', Otro:'🐾' }

export default function AddPet() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [nombre,    setNombre]    = useState('')
  const [especie,   setEspecie]   = useState('Perro')
  const [raza,      setRaza]      = useState('')
  const [fechaNac,  setFechaNac]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nombre.trim()) return
    setLoading(true)
    setError('')

    const { error } = await supabase.from('mascotas').insert({
      owner_id:         user.id,
      nombre:           nombre.trim(),
      especie,
      raza:             raza.trim() || null,
      fecha_nacimiento: fechaNac || null,
    })

    if (error) {
      setError('No se pudo guardar. Intenta de nuevo.')
      setLoading(false)
    } else {
      navigate('/')
    }
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
          <h1 className="text-lg font-semibold text-gray-900">Agregar mascota</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Especie */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-medium text-gray-900 mb-3">Tipo de mascota</h3>
            <div className="grid grid-cols-5 gap-2">
              {ESPECIES.map(e => (
                <button key={e} type="button" onClick={() => setEspecie(e)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    especie === e
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  <span style={{fontSize:'24px'}}>{EMOJI[e]}</span>
                  <span className={`text-xs font-medium ${especie === e ? 'text-teal-700' : 'text-gray-500'}`}>
                    {e}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-medium text-gray-900 mb-3">
              Nombre <span className="text-red-400">*</span>
            </h3>
            <input
              type="text" value={nombre} onChange={e => setNombre(e.target.value)}
              required placeholder={`Nombre de tu ${especie.toLowerCase()}`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Raza y fecha */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Raza <span className="text-gray-400 font-normal text-sm">(opcional)</span>
              </h3>
              <input
                type="text" value={raza} onChange={e => setRaza(e.target.value)}
                placeholder="Ej: Labrador, Mestizo, Siamés..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Fecha de nacimiento <span className="text-gray-400 font-normal text-sm">(opcional)</span>
              </h3>
              <input
                type="date" value={fechaNac}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setFechaNac(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                La usamos para saber si es cachorro y calcular el plan de vacunas
              </p>
            </div>
          </div>

          {/* Preview */}
          {nombre && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center gap-3">
              <span style={{fontSize:'32px'}}>{EMOJI[especie]}</span>
              <div>
                <p className="font-semibold text-teal-900">{nombre}</p>
                <p className="text-sm text-teal-600">
                  {especie}{raza ? ` · ${raza}` : ''}{fechaNac ? ` · Nació el ${new Date(fechaNac).toLocaleDateString('es-CL')}` : ''}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !nombre.trim()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-40">
            {loading ? 'Guardando...' : `Agregar a ${nombre || 'mi mascota'}`}
          </button>
        </form>
      </main>
    </div>
  )
}
