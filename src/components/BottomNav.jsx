import { Link, useLocation } from 'react-router-dom'

const tabs = [
  {
    path: '/', label: 'Inicio',
    icon: (a) => (
      <svg className={`w-5 h-5 ${a?'text-teal-600':'text-gray-400'}`} fill={a?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a?0:1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
  {
    path: '/agendar', label: 'Agendar',
    icon: (a) => (
      <svg className={`w-5 h-5 ${a?'text-teal-600':'text-gray-400'}`} fill={a?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a?0:1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    path: '/operativos', label: 'Operativos',
    icon: (a) => (
      <svg className={`w-5 h-5 ${a?'text-teal-600':'text-gray-400'}`} fill={a?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a?0:1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    path: '/noticias', label: 'Noticias',
    icon: (a) => (
      <svg className={`w-5 h-5 ${a?'text-teal-600':'text-gray-400'}`} fill={a?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a?0:1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
      </svg>
    ),
  },
  {
    path: '/perfil', label: 'Perfil',
    icon: (a) => (
      <svg className={`w-5 h-5 ${a?'text-teal-600':'text-gray-400'}`} fill={a?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a?0:1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(tab => {
          const active = pathname === tab.path
          return (
            <Link key={tab.path} to={tab.path}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                active ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {tab.icon(active)}
              <span className={`text-xs font-medium ${active ? 'text-teal-600' : 'text-gray-400'}`} style={{fontSize:'10px'}}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
