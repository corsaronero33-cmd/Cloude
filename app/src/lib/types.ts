// Tipi del dominio. Ricalcano uno a uno le tabelle della migrazione SQL:
// quando si aggiunge una colonna la si aggiunge anche qui, e il compilatore
// segnala ogni punto da sistemare.

/** Campi che ogni riga sincronizzata porta con se'. */
export interface Sincronizzabile {
  id: string
  /** Scritto dal client: decide chi vince in caso di conflitto. */
  updated_at: string
  /** Scritto dal server: segnalibro per scaricare solo cio' che e' cambiato. */
  synced_at?: string
  deleted: boolean
}

export type Ruolo = 'admin' | 'tecnico'

export interface Profilo extends Sincronizzabile {
  nome: string
  ruolo: Ruolo
  telefono: string | null
  attivo: boolean
}

export interface Cliente extends Sincronizzabile {
  ragione_sociale: string
  partita_iva: string | null
  codice_fiscale: string | null
  codice_sdi: string | null
  pec: string | null
  email: string | null
  telefono: string | null
  indirizzo: string | null
  cap: string | null
  citta: string | null
  provincia: string | null
  note: string | null
  attivo: boolean
}

export interface Sede extends Sincronizzabile {
  cliente_id: string
  nome: string
  indirizzo: string | null
  cap: string | null
  citta: string | null
  provincia: string | null
  telefono: string | null
  referente: string | null
  note: string | null
}

export type TipoDispositivo = 'rt' | 'server_rt' | 'pos_integrato' | 'misuratore' | 'altro'
export type StatoDispositivo = 'attivo' | 'fuori_servizio' | 'dismesso' | 'magazzino'

export interface Dispositivo extends Sincronizzabile {
  cliente_id: string
  sede_id: string | null
  /** Matricola assegnata dall'Agenzia delle Entrate. */
  matricola: string
  marca: string | null
  modello: string | null
  /** Provvedimento di approvazione del modello. */
  provvedimento: string | null
  tipo: TipoDispositivo
  data_messa_servizio: string | null
  data_ultima_verifica: string | null
  firmware_versione: string | null
  /** Adeguamento al collegamento con il POS. */
  collegato_pos: boolean
  stato: StatoDispositivo
  data_dismissione: string | null
  note: string | null
}

export type TipoContratto = 'software' | 'assistenza' | 'canone_rt' | 'noleggio' | 'altro'
export type Periodicita =
  | 'mensile'
  | 'trimestrale'
  | 'semestrale'
  | 'annuale'
  | 'biennale'
  | 'una_tantum'
export type StatoContratto = 'attivo' | 'rinnovato' | 'scaduto' | 'disdetto'

export interface Contratto extends Sincronizzabile {
  cliente_id: string
  tipo: TipoContratto
  descrizione: string
  data_inizio: string | null
  data_scadenza: string
  periodicita: Periodicita
  importo: number | null
  licenza: string | null
  rinnovo_automatico: boolean
  stato: StatoContratto
  note: string | null
}

export type TipoIntervento =
  | 'hardware'
  | 'software'
  | 'verifica_periodica'
  | 'installazione'
  | 'dismissione'
  | 'consulenza'
  | 'altro'
export type StatoIntervento = 'aperto' | 'in_corso' | 'sospeso' | 'chiuso' | 'annullato'
export type Priorita = 'bassa' | 'normale' | 'alta' | 'urgente'

export interface Intervento extends Sincronizzabile {
  /** Progressivo assegnato dal server: nullo finche' il record non e' salito. */
  numero: number | null
  cliente_id: string
  sede_id: string | null
  dispositivo_id: string | null
  tipo: TipoIntervento
  stato: StatoIntervento
  priorita: Priorita
  data_apertura: string
  data_intervento: string | null
  ora_inizio: string | null
  ora_fine: string | null
  tecnico_id: string | null
  problema: string | null
  soluzione: string | null
  ore: number | null
  da_fatturare: boolean
  fatturato: boolean
  firma_base64: string | null
  firma_nome: string | null
  verifica_esito: 'regolare' | 'irregolare' | null
  verifica_sigilli: string | null
  verifica_libretto: string | null
  /** Trasmissione a Fatture e Corrispettivi: e' da qui che nascono le sanzioni. */
  ade_trasmessa: boolean
  ade_trasmessa_il: string | null
  note: string | null
}

export type TipoRiga = 'manodopera' | 'ricambio' | 'trasferta' | 'altro'

export interface InterventoRiga extends Sincronizzabile {
  intervento_id: string
  tipo: TipoRiga
  descrizione: string
  quantita: number
  prezzo_unitario: number | null
  ricambio_id: string | null
}

export interface Ricambio extends Sincronizzabile {
  codice: string
  descrizione: string
  giacenza: number
  scorta_minima: number
  prezzo: number | null
  note: string | null
}

export interface Impostazione {
  chiave: string
  valore: string
  updated_at: string
  synced_at?: string
  deleted: boolean
}

// --- etichette per l'interfaccia ------------------------------------------

export const ETICHETTE_TIPO_INTERVENTO: Record<TipoIntervento, string> = {
  hardware: 'Hardware',
  software: 'Software',
  verifica_periodica: 'Verifica periodica',
  installazione: 'Installazione',
  dismissione: 'Dismissione',
  consulenza: 'Consulenza',
  altro: 'Altro',
}

export const ETICHETTE_STATO_INTERVENTO: Record<StatoIntervento, string> = {
  aperto: 'Aperto',
  in_corso: 'In corso',
  sospeso: 'Sospeso',
  chiuso: 'Chiuso',
  annullato: 'Annullato',
}

export const ETICHETTE_TIPO_DISPOSITIVO: Record<TipoDispositivo, string> = {
  rt: 'Registratore telematico',
  server_rt: 'Server RT',
  pos_integrato: 'POS integrato',
  misuratore: 'Misuratore fiscale',
  altro: 'Altro',
}

export const ETICHETTE_STATO_DISPOSITIVO: Record<StatoDispositivo, string> = {
  attivo: 'Attivo',
  fuori_servizio: 'Fuori servizio',
  dismesso: 'Dismesso',
  magazzino: 'In magazzino',
}

export const ETICHETTE_TIPO_CONTRATTO: Record<TipoContratto, string> = {
  software: 'Abbonamento software',
  assistenza: 'Contratto di assistenza',
  canone_rt: 'Canone RT',
  noleggio: 'Noleggio',
  altro: 'Altro',
}

export const ETICHETTE_PERIODICITA: Record<Periodicita, string> = {
  mensile: 'Mensile',
  trimestrale: 'Trimestrale',
  semestrale: 'Semestrale',
  annuale: 'Annuale',
  biennale: 'Biennale',
  una_tantum: 'Una tantum',
}

export const ETICHETTE_PRIORITA: Record<Priorita, string> = {
  bassa: 'Bassa',
  normale: 'Normale',
  alta: 'Alta',
  urgente: 'Urgente',
}
