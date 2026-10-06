import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { ProviderAuth } from './lib/auth'

// HashRouter e non BrowserRouter: l'indirizzo porta il cancelletto, ma l'app
// funziona su qualunque hosting statico senza regole di riscrittura, e
// soprattutto continua a funzionare aperta dalla cache quando la rete non c'e'.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ProviderAuth>
        <App />
      </ProviderAuth>
    </HashRouter>
  </StrictMode>,
)
