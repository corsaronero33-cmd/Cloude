import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const chiave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Vero quando i due valori di configurazione ci sono. Se mancano l'app parte
 * comunque e lavora solo in locale: meglio un'interfaccia che si apre e
 * spiega cosa manca, che una schermata bianca.
 */
export const configurato = Boolean(url && chiave && !url.includes('xxxxxxxx'))

export const sb: SupabaseClient = createClient(
  url ?? 'http://localhost:54321',
  chiave ?? 'chiave-non-configurata',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'assistenza-auth',
    },
  },
)
