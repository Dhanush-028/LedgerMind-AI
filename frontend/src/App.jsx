import { useState } from 'react'
import LandingPage from './components/LandingPage.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import InvoiceList from './components/InvoiceList.jsx'
import ClientRisk from './components/ClientRisk.jsx'
import InvoiceAnalyzer from './components/InvoiceAnalyzer.jsx'
import CashFlowForecast from './components/CashFlowForecast.jsx'
import AiChat from './components/AiChat.jsx'
import Alerts from './components/Alerts.jsx'

export default function App() {
  const [entered, setEntered] = useState(false) // false = landing page, true = the app
  const [view, setView] = useState('dashboard')

  if (!entered) {
    return <LandingPage onGetStarted={() => setEntered(true)} />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} setView={setView} />
      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1280 }}>
        {view === 'dashboard' && <Dashboard onNavigate={setView} />}
        {view === 'invoices' && <InvoiceList />}
        {view === 'analyzer' && <InvoiceAnalyzer />}
        {view === 'forecast' && <CashFlowForecast />}
        {view === 'chat' && <AiChat />}
        {view === 'alerts' && <Alerts />}
        {view === 'clients' && <ClientRisk />}
      </main>
    </div>
  )
}