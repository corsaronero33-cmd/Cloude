import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './lib/auth'
import { configurato } from './lib/supabase'
import Accesso from './pages/Accesso'
import ClienteScheda from './pages/ClienteScheda'
import Clienti from './pages/Clienti'
import Contratti from './pages/Contratti'
import DispositivoScheda from './pages/DispositivoScheda'
import Dispositivi from './pages/Dispositivi'
import Importa from './pages/Importa'
import Impostazioni from './pages/Impostazioni'
import InterventoScheda from './pages/InterventoScheda'
import Interventi from './pages/Interventi'
import Scadenzario from './pages/Scadenzario'

export default function App() {
  const { pronto, sessione } = useAuth()

  if (!pronto) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-900 text-sm text-slate-300">
        Apertura…
      </div>
    )
  }

  // Senza configurazione del server l'app resta utilizzabile in locale: serve a
  // provarla subito dopo l'installazione, e l'indicatore in alto dice chiaramente
  // che nulla sta salendo da nessuna parte.
  const dentro = sessione !== null || !configurato

  if (!dentro) {
    return (
      <Routes>
        <Route path="/accesso" element={<Accesso />} />
        <Route path="*" element={<Navigate to="/accesso" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/accesso" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Scadenzario />} />
        <Route path="/clienti" element={<Clienti />} />
        <Route path="/clienti/:id" element={<ClienteScheda />} />
        <Route path="/dispositivi" element={<Dispositivi />} />
        <Route path="/dispositivi/:id" element={<DispositivoScheda />} />
        <Route path="/contratti" element={<Contratti />} />
        <Route path="/interventi" element={<Interventi />} />
        <Route path="/interventi/:id" element={<InterventoScheda />} />
        <Route path="/importa" element={<Importa />} />
        <Route path="/impostazioni" element={<Impostazioni />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
