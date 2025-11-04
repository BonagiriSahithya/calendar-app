import React from 'react'
import Calendar from './components/Calendar'

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Calendar</h1>
      </header>

      <main className="main">
        <Calendar />
      </main>
    </div>
  )
}
