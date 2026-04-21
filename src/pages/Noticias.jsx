import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIAS = ['Todas', 'Salud', 'Vacunas', 'Nutrición', 'Cuidados', 'General']

const CAT_COLORS = {
  Salud:     'bg-red-100 text-red-700',
  Vacunas:   'bg-purple-100 text-purple-700',
  Nutrición: 'bg-orange-100 text-orange-700',
  Cuidados:  'bg-blue-100 text-blue-700',
  General:   'bg-gray-100 text-gray-600',
}

function ArticleCard({ noticia, featured = false }) {
  const [expanded, setExpanded] = useState(false)

  if (featured) return (
    <div className="bg-teal-600 rounded-2xl p-5 text-white">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium`}>
          {noticia.categoria}
        </span>
        <span className="text-3xl">{noticia.emoji}</span>
      </div>
      <h2 className="text-lg font-semibold mb-2 leading-snug">{noticia.titulo}</h2>
      <p className="text-teal-100 text-sm leading-relaxed">{noticia.resumen}</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {noticia.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[noticia.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                {noticia.categoria}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{noticia.titulo}</h3>
          </div>
          <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform mt-1 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        {expanded && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3">
            <p className="text-sm text-gray-600 leading-relaxed">{noticia.resumen}</p>
            {noticia.contenido && (
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{noticia.contenido}</p>
            )}
          </div>
        )}
      </button>
    </div>
  )
}

export default function Noticias() {
  const [noticias,   setNoticias]   = useState([])
  const [categoria,  setCategoria]  = useState('Todas')
  const [loading,    setLoading]    = useState(true)
  const [busqueda,   setBusqueda]   = useState('')

  useEffect(() => {
    supabase.from('noticias')
      .select('*')
      .eq('publicado', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setNoticias(data ?? []); setLoading(false) })
  }, [])

  const filtradas = noticias.filter(n => {
    const matchCat = categoria === 'Todas' || n.categoria === categoria
    const matchBus = !busqueda || n.titulo.toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchBus
  })

  const featured = filtradas[0]
  const resto    = filtradas.slice(1)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-3">📰 Noticias y consejos</h1>
          {/* Buscador */}
          <div className="relative">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text" placeholder="Buscar artículos..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Filtros categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIAS.map(c => (
            <button key={c} onClick={() => setCategoria(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
                categoria === c
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"/>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400 text-sm">No se encontraron artículos</p>
          </div>
        ) : (
          <>
            {/* Destacado */}
            {featured && <ArticleCard noticia={featured} featured/>}

            {/* Lista */}
            {resto.length > 0 && (
              <div className="space-y-2">
                {resto.map(n => <ArticleCard key={n.id} noticia={n}/>)}
              </div>
            )}
          </>
        )}

        {/* Banner agregar noticias */}
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400">
            El veterinario puede agregar noticias directamente desde el panel de Supabase
          </p>
        </div>
      </main>
    </div>
  )
}
