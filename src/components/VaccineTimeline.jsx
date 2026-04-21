const PUPPY_DAYS = [0, 21, 42]

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function daysFrom(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000)
}

function fmtShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
}

function Dot({ label, date, status }) {
  const ring = {
    done:     'bg-teal-500',
    upcoming: 'bg-amber-400',
    overdue:  'bg-red-500',
    future:   'bg-gray-200',
  }
  const txt = {
    done:     'text-teal-700',
    upcoming: 'text-amber-700',
    overdue:  'text-red-600',
    future:   'text-gray-400',
  }
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <div className={`w-4 h-4 rounded-full ${ring[status]} flex-shrink-0`}/>
      <p className={`text-xs font-medium ${txt[status]} text-center leading-tight`}>{label}</p>
      {date && <p className="text-xs text-gray-400">{fmtShort(date)}</p>}
    </div>
  )
}

export default function VaccineTimeline({ vacunas, especie }) {
  if (!vacunas?.length) return null

  const sorted = [...vacunas].sort((a, b) =>
    new Date(a.fecha_aplicacion) - new Date(b.fecha_aplicacion)
  )

  const spanDays = sorted.length > 1
    ? (new Date(sorted[sorted.length-1].fecha_aplicacion) - new Date(sorted[0].fecha_aplicacion)) / 86400000
    : 0

  const isPuppy = (especie === 'Perro' || especie === 'Gato') &&
    sorted.length < 3 && spanDays < 50

  /* ── PUPPY TIMELINE ── */
  if (isPuppy) {
    const doses = PUPPY_DAYS.map((days, i) => {
      const target   = addDays(sorted[0].fecha_aplicacion, days)
      const applied  = sorted[i]
      const daysLeft = daysFrom(target)
      let status
      if (applied)         status = 'done'
      else if (daysLeft < 0)    status = 'overdue'
      else if (daysLeft <= 7)   status = 'upcoming'
      else                      status = 'future'
      return { label: `Dosis ${i+1}`, date: applied?.fecha_aplicacion ?? target, status }
    })

    const done = doses.filter(d => d.status === 'done').length
    const pct  = (done / 3) * 100

    const nextDose = doses.find(d => d.status === 'upcoming' || d.status === 'overdue')

    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-amber-800">Plan cachorro · {done}/3 dosis</p>
          {nextDose?.status === 'overdue' && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">¡Vencida!</span>
          )}
          {nextDose?.status === 'upcoming' && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              En {daysFrom(nextDose.date)} días
            </span>
          )}
          {done === 3 && (
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Completo ✓</span>
          )}
        </div>

        {/* Track */}
        <div className="relative mb-4 px-2">
          <div className="absolute top-[7px] left-4 right-4 h-1 bg-gray-200 rounded-full"/>
          <div className="absolute top-[7px] left-4 h-1 bg-teal-500 rounded-full transition-all"
               style={{ width: `calc(${pct}% * (100% - 32px) / 100)` }}/>
          <div className="relative flex justify-between">
            {doses.map((d, i) => <Dot key={i} {...d}/>)}
          </div>
        </div>

        <p className="text-xs text-amber-700">
          Las 3 dosis se aplican con 21 días de diferencia para protección completa.
        </p>
      </div>
    )
  }

  /* ── ANNUAL TIMELINE ── */
  const last     = sorted[sorted.length - 1]
  const nextDate = last.proxima_fecha
  if (!nextDate) return null

  const elapsed  = Math.floor((new Date() - new Date(last.fecha_aplicacion)) / 86400000)
  const pct      = Math.min(Math.round((elapsed / 365) * 100), 100)
  const daysLeft = daysFrom(nextDate)

  let barColor   = 'bg-teal-500'
  let msg        = `Próxima vacuna en ${daysLeft} días`
  let msgColor   = 'text-teal-700'

  if (daysLeft < 0) {
    barColor = 'bg-red-500'; msg = `Vacuna vencida hace ${Math.abs(daysLeft)} días`; msgColor = 'text-red-600'
  } else if (daysLeft <= 30) {
    barColor = 'bg-amber-400'; msg = `⚠️ Vence en ${daysLeft} días`; msgColor = 'text-amber-700'
  }

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-700">Vacuna anual</p>
        <p className={`text-xs font-medium ${msgColor}`}>{msg}</p>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}/>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-400">{fmtShort(last.fecha_aplicacion)}</span>
        <span className="text-xs text-gray-400 font-medium">{pct}% del año</span>
        <span className="text-xs text-gray-400">{fmtShort(nextDate)}</span>
      </div>
    </div>
  )
}
