import React, { useMemo, useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay
} from 'date-fns'
import eventsData from '../data/events.json'

function formatMinutes(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function getKey(d) {
  return format(d, 'yyyy-MM-dd')
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [expandedDates, setExpandedDates] = useState({})

  const eventsByDate = useMemo(() => {
    const map = {}

    eventsData.forEach((ev) => {
      const key = ev.date
      const [hh, mm] = ev.startTime.split(':').map(Number)
      const start = hh * 60 + mm
      const duration = Number(ev.duration || 60)
      const end = start + duration
      const item = { ...ev, start, end }
      if (!map[key]) map[key] = []
      map[key].push(item)
    })

    Object.keys(map).forEach((k) => {
      const arr = map[k]
      arr.sort((a, b) => a.start - b.start)
      arr.forEach((it) => (it.conflict = false))
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[j].start < arr[i].end) {
            arr[i].conflict = true
            arr[j].conflict = true
          } else break
        }
      }
    })

    return map
  }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const weeks = []
  let day = startDate
  while (day <= endDate) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    weeks.push(week)
  }

  const prev = () => setCurrentMonth(subMonths(currentMonth, 1))
  const next = () => setCurrentMonth(addMonths(currentMonth, 1))

  function toggleExpand(key) {
    setExpandedDates((s) => ({ ...s, [key]: !s[key] }))
  }

  return (
    <div className="calendar">
      <div className="cal-header">
        <button onClick={prev}>◀</button>
        <div className="title">{format(currentMonth, 'MMMM yyyy')}</div>
        <button onClick={next}>▶</button>
      </div>

      <div className="weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid">
        {weeks.map((week, wi) => (
          <React.Fragment key={wi}>
            {week.map((day) => {
              const key = getKey(day)
              const inMonth = isSameMonth(day, currentMonth)
              const today = isSameDay(day, new Date())
              const items = eventsByDate[key] || []

              return (
                <div className={`cell ${inMonth ? '' : 'muted'}`} key={key}>
                  <div className={`day ${today ? 'today' : ''}`}>
                    {format(day, 'd')}
                  </div>

                  <div className="items">
                    {items.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`item ${ev.conflict ? 'conflict' : ''}`}
                      >
                        <div className="time">{formatMinutes(ev.start)}</div>
                        <div className="evtitle">{ev.title}</div>
                      </div>
                    ))}

                    {items.length > 2 && (
                      <button className="more" onClick={() => toggleExpand(key)}>
                        {expandedDates[key]
                          ? 'hide'
                          : `+${items.length - 2} more`}
                      </button>
                    )}

                    {expandedDates[key] &&
                      items.slice(2).map((ev) => (
                        <div
                          key={'more-' + ev.id}
                          className={`item small ${ev.conflict ? 'conflict' : ''}`}
                        >
                          <div className="time">{formatMinutes(ev.start)}</div>
                          <div className="evtitle">{ev.title}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
