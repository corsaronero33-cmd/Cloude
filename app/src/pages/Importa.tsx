import { useMemo, useState } from 'react'
import { aggiungiMesi, daFormatoItaliano, formatta, oggi } from '../lib/dates'
import { abbina, analizza, esporta, scarica, type Tabella } from '../lib/csv'
import { db, nuovoId, salva } from '../lib/db'
import { useClienti, useContratti, useDispositivi, useImpostazioni } from '../lib/dati'
import { costruisciScadenzario, prossimaVerifica } from '../lib/scadenze'
import type { Cliente, Contratto, Dispositivo } from '../lib/types'
import { ETICHETTE_TIPO_CONTRATTO } from '../lib/types'
import {
  Bottone, Campo, Intestazione, Scelta, Scheda, Spunta, unisci,
} from '../components/ui'

// Importazione dai fogli di calcolo esistenti e riesportazione.
//
// L'abbinamento fra le colonne del file e i campi dell'archivio e' automatico
// quando i nomi si somigliano, e correggibile a mano quando non lo sono. Niente
// viene scritto prima dell'anteprima: si vede cosa succederebbe, e solo poi si
// conferma.

type Entita = 'clienti' | 'dispositivi' | 'contratti'

interface DefinizioneCampo {
  chiave: string
  etichetta: string
  sinonimi?: string[]
  obbligatorio?: boolean
}

const CAMPI: Record<Entita, DefinizioneCampo[]> = {
  clienti: [
    { chiave: 'ragione_sociale', etichetta: 'Ragione sociale', obbligatorio: true, sinonimi: ['cliente', 'nome', 'denominazione', 'nominativo'] },
    { chiave: 'partita_iva', etichetta: 'Partita IVA', sinonimi: ['piva', 'p iva', 'vat'] },
    { chiave: 'codice_fiscale', etichetta: 'Codice fiscale', sinonimi: ['cf'] },
    { chiave: 'telefono', etichetta: 'Telefono', sinonimi: ['tel', 'cellulare', 'telefono1'] },
    { chiave: 'email', etichetta: 'Email', sinonimi: ['mail', 'posta'] },
    { chiave: 'indirizzo', etichetta: 'Indirizzo', sinonimi: ['via'] },
    { chiave: 'cap', etichetta: 'CAP' },
    { chiave: 'citta', etichetta: 'Città', sinonimi: ['comune', 'localita'] },
    { chiave: 'provincia', etichetta: 'Provincia', sinonimi: ['prov', 'pr'] },
    { chiave: 'codice_sdi', etichetta: 'Codice SDI', sinonimi: ['sdi', 'destinatario'] },
    { chiave: 'pec', etichetta: 'PEC' },
    { chiave: 'note', etichetta: 'Note' },
  ],
  dispositivi: [
    { chiave: 'cliente', etichetta: 'Cliente', obbligatorio: true, sinonimi: ['ragione sociale', 'nominativo'] },
    { chiave: 'matricola', etichetta: 'Matricola', obbligatorio: true, sinonimi: ['matricola ade', 'serial', 'seriale', 'numero matricola'] },
    { chiave: 'marca', etichetta: 'Marca', sinonimi: ['costruttore', 'produttore'] },
    { chiave: 'modello', etichetta: 'Modello' },
    { chiave: 'provvedimento', etichetta: 'Provvedimento', sinonimi: ['approvazione'] },
    { chiave: 'data_messa_servizio', etichetta: 'Messa in servizio', sinonimi: ['installazione', 'data installazione', 'attivazione'] },
    { chiave: 'data_ultima_verifica', etichetta: 'Ultima verifica', sinonimi: ['verifica', 'ultima verificazione', 'data verifica'] },
    { chiave: 'firmware_versione', etichetta: 'Firmware', sinonimi: ['versione'] },
    { chiave: 'note', etichetta: 'Note' },
  ],
  contratti: [
    { chiave: 'cliente', etichetta: 'Cliente', obbligatorio: true, sinonimi: ['ragione sociale', 'nominativo'] },
    { chiave: 'descrizione', etichetta: 'Descrizione', sinonimi: ['prodotto', 'servizio'] },
    { chiave: 'data_scadenza', etichetta: 'Scadenza', obbligatorio: true, sinonimi: ['data scadenza', 'rinnovo', 'scade il'] },
    { chiave: 'data_inizio', etichetta: 'Data inizio', sinonimi: ['decorrenza', 'inizio'] },
    { chiave: 'importo', etichetta: 'Importo', sinonimi: ['canone', 'prezzo'] },
    { chiave: 'licenza', etichetta: 'Licenza', sinonimi: ['chiave', 'seriale', 'codice licenza'] },
    { chiave: 'note', etichetta: 'Note' },
  ],
}

const ETICHETTE_ENTITA: Record<Entita, string> = {
  clienti: 'Clienti',
  dispositivi: 'Apparecchi',
  contratti: 'Contratti',
}

interface Esito {
  creati: number
  aggiornati: number
  saltati: { riga: number; motivo: string }[]
  clientiCreati: number
}

export default function Importa() {
  const [entita, setEntita] = useState<Entita>('clienti')
  const [testo, setTesto] = useState('')
  const [tabella, setTabella] = useState<Tabella | null>(null)
  const [mappa, setMappa] = useState<Record<string, number>>({})
  const [creaClienti, setCreaClienti] = useState(true)
  const [esito, setEsito] = useState<Esito | null>(null)
  const [inCorso, setInCorso] = useState(false)

  const campi = CAMPI[entita]

  const leggi = (contenuto: string) => {
    const t = analizza(contenuto)
    setTabella(t)
    setMappa(abbina(t.intestazioni, campi))
    setEsito(null)
  }

  const cambiaEntita = (e: Entita) => {
    setEntita(e)
    setEsito(null)
    if (tabella) setMappa(abbina(tabella.intestazioni, CAMPI[e]))
  }

  const mancanti = campi.filter((c) => c.obbligatorio && mappa[c.chiave] === undefined)

  const importa = async () => {
    if (!tabella) return
    setInCorso(true)
    try {
      setEsito(await eseguiImportazione(entita, tabella, mappa, creaClienti))
    } finally {
      setInCorso(false)
    }
  }

  return (
    <div className="space-y-5">
      <Intestazione
        titolo="Importa e esporta"
        sottotitolo="Porta dentro i fogli di calcolo che usi oggi, o riprendi i dati in CSV"
      />

      <Scheda className="space-y-4 p-4">
        <div>
          <div className="mb-2 text-sm font-bold text-slate-800">1. Che cosa stai importando</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ETICHETTE_ENTITA) as Entita[]).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => cambiaEntita(e)}
                className={unisci(
                  'rounded-full px-3 py-1.5 text-sm font-semibold transition',
                  entita === e
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
                )}
              >
                {ETICHETTE_ENTITA[e]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-bold text-slate-800">2. Il file</div>
          <input
            type="file"
            accept=".csv,.txt,text/csv"
            onChange={async (ev) => {
              const file = ev.target.files?.[0]
              if (!file) return
              const contenuto = await file.text()
              setTesto(contenuto)
              leggi(contenuto)
            }}
            className="block w-full rounded-lg border border-slate-300 p-2 text-sm"
          />
          <p className="mt-2 text-xs text-slate-500">
            Da Excel: <em>File → Salva con nome → CSV UTF-8</em>. Oppure incollare qui sotto le celle
            copiate direttamente dal foglio.
          </p>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            onBlur={() => testo.trim() && leggi(testo)}
            placeholder={'Ragione sociale;Partita IVA;Città\nRossi srl;01234567890;Nizza'}
            className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs outline-none focus:border-slate-500"
          />
          {testo.trim() && (
            <Bottone className="mt-2" onClick={() => leggi(testo)}>
              Rileggi il testo incollato
            </Bottone>
          )}
        </div>

        {tabella && (
          <>
            <div>
              <div className="mb-2 text-sm font-bold text-slate-800">
                3. Abbinamento delle colonne{' '}
                <span className="font-normal text-slate-500">
                  ({tabella.righe.length} righe lette)
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {campi.map((c) => (
                  <Campo key={c.chiave} etichetta={c.etichetta} obbligatorio={c.obbligatorio}>
                    <Scelta
                      value={mappa[c.chiave] ?? ''}
                      onChange={(e) =>
                        setMappa((m) => {
                          const copia = { ...m }
                          if (e.target.value === '') delete copia[c.chiave]
                          else copia[c.chiave] = Number(e.target.value)
                          return copia
                        })
                      }
                    >
                      <option value="">— non importare —</option>
                      {tabella.intestazioni.map((h, i) => (
                        <option key={`${h}-${i}`} value={i}>
                          {h || `colonna ${i + 1}`}
                        </option>
                      ))}
                    </Scelta>
                  </Campo>
                ))}
              </div>
              {entita !== 'clienti' && (
                <div className="mt-3">
                  <Spunta
                    etichetta="Crea i clienti che non trovo in archivio"
                    checked={creaClienti}
                    onChange={setCreaClienti}
                  />
                </div>
              )}
            </div>

            <Anteprima tabella={tabella} mappa={mappa} campi={campi} />

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
              <Bottone
                variante="primario"
                onClick={importa}
                disabled={inCorso || mancanti.length > 0}
              >
                {inCorso ? 'Importazione…' : `Importa ${tabella.righe.length} righe`}
              </Bottone>
              {mancanti.length > 0 && (
                <span className="text-sm text-rose-700">
                  Da abbinare prima di procedere: {mancanti.map((c) => c.etichetta).join(', ')}
                </span>
              )}
            </div>
          </>
        )}

        {esito && <Risultato esito={esito} />}
      </Scheda>

      <Esportazioni />
    </div>
  )
}

function Anteprima({
  tabella, mappa, campi,
}: {
  tabella: Tabella
  mappa: Record<string, number>
  campi: DefinizioneCampo[]
}) {
  const usati = campi.filter((c) => mappa[c.chiave] !== undefined)
  const prime = tabella.righe.slice(0, 5)
  if (usati.length === 0) return null

  return (
    <div>
      <div className="mb-2 text-sm font-bold text-slate-800">4. Anteprima</div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              {usati.map((c) => (
                <th key={c.chiave} className="px-2 py-1.5 text-left font-semibold text-slate-600">
                  {c.etichetta}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prime.map((riga, i) => (
              <tr key={i} className="border-t border-slate-100">
                {usati.map((c) => (
                  <td key={c.chiave} className="px-2 py-1.5 text-slate-800">
                    {riga[mappa[c.chiave]!] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tabella.righe.length > prime.length && (
        <p className="mt-1 text-xs text-slate-500">
          …e altre {tabella.righe.length - prime.length} righe.
        </p>
      )}
    </div>
  )
}

function Risultato({ esito }: { esito: Esito }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
      <div className="font-bold text-emerald-900">Importazione conclusa</div>
      <ul className="mt-1 space-y-0.5 text-emerald-900">
        <li>{esito.creati} righe create</li>
        <li>{esito.aggiornati} righe aggiornate</li>
        {esito.clientiCreati > 0 && <li>{esito.clientiCreati} clienti creati automaticamente</li>}
        {esito.saltati.length > 0 && <li>{esito.saltati.length} righe saltate</li>}
      </ul>
      {esito.saltati.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-semibold text-emerald-900">
            Vedi le righe saltate
          </summary>
          <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto text-xs text-slate-700">
            {esito.saltati.map((s) => (
              <li key={s.riga}>
                riga {s.riga}: {s.motivo}
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="mt-2 text-xs text-emerald-800">
        I dati sono già nell&apos;archivio locale e stanno salendo al server.
      </p>
    </div>
  )
}

/** Esportazioni in CSV, incluso lo scadenzario completo. */
function Esportazioni() {
  const clienti = useClienti()
  const dispositivi = useDispositivi()
  const contratti = useContratti()
  const { mesiCadenza, giorniAvviso } = useImpostazioni()

  const nomi = useMemo(() => new Map(clienti.map((c) => [c.id, c.ragione_sociale])), [clienti])

  const esportaScadenzario = () => {
    const scadenze = costruisciScadenzario({
      dispositivi, contratti, interventi: [], clienti, mesiCadenza, giorniAvviso,
    })
    scarica(
      `scadenzario-${oggi()}.csv`,
      esporta(
        ['Scadenza', 'Giorni', 'Cliente', 'Tipo', 'Dettaglio', 'Importo'],
        scadenze.map((s) => [formatta(s.data), s.giorni, s.cliente, s.titolo, s.dettaglio, s.importo]),
      ),
    )
  }

  return (
    <Scheda className="space-y-3 p-4">
      <div className="text-sm font-bold text-slate-800">Esporta</div>
      <div className="flex flex-wrap gap-2">
        <Bottone onClick={esportaScadenzario}>Scadenzario</Bottone>
        <Bottone
          onClick={() =>
            scarica(
              `clienti-${oggi()}.csv`,
              esporta(
                ['Ragione sociale', 'Partita IVA', 'Codice fiscale', 'Telefono', 'Email', 'Indirizzo', 'CAP', 'Città', 'Prov'],
                clienti.map((c) => [
                  c.ragione_sociale, c.partita_iva, c.codice_fiscale, c.telefono,
                  c.email, c.indirizzo, c.cap, c.citta, c.provincia,
                ]),
              ),
            )
          }
        >
          Clienti
        </Bottone>
        <Bottone
          onClick={() =>
            scarica(
              `apparecchi-${oggi()}.csv`,
              esporta(
                ['Matricola', 'Cliente', 'Marca', 'Modello', 'Messa in servizio', 'Ultima verifica', 'Prossima verifica', 'Stato', 'POS collegato'],
                dispositivi.map((d) => [
                  d.matricola, nomi.get(d.cliente_id) ?? '', d.marca, d.modello,
                  formatta(d.data_messa_servizio), formatta(d.data_ultima_verifica),
                  formatta(prossimaVerifica(d, mesiCadenza)), d.stato, d.collegato_pos ? 'sì' : 'no',
                ]),
              ),
            )
          }
        >
          Apparecchi
        </Bottone>
        <Bottone
          onClick={() =>
            scarica(
              `contratti-${oggi()}.csv`,
              esporta(
                ['Cliente', 'Tipo', 'Descrizione', 'Scadenza', 'Periodicità', 'Importo', 'Licenza', 'Stato'],
                contratti.map((c) => [
                  nomi.get(c.cliente_id) ?? '', ETICHETTE_TIPO_CONTRATTO[c.tipo], c.descrizione,
                  formatta(c.data_scadenza), c.periodicita, c.importo, c.licenza, c.stato,
                ]),
              ),
            )
          }
        >
          Contratti
        </Bottone>
      </div>
      <p className="text-xs text-slate-500">
        I file escono con separatore punto e virgola e codifica UTF-8 con BOM: Excel li apre con un
        doppio clic, accenti compresi.
      </p>
    </Scheda>
  )
}

// --- motore di importazione -------------------------------------------------

function cella(riga: string[], indice: number | undefined): string {
  if (indice === undefined) return ''
  return (riga[indice] ?? '').trim()
}

function numero(testo: string): number | null {
  if (!testo) return null
  // Gli importi arrivano in forma italiana: 1.234,56
  const pulito = testo.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')
  const n = Number(pulito)
  return Number.isFinite(n) ? n : null
}

function normalizzaNome(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
}

async function eseguiImportazione(
  entita: Entita,
  tabella: Tabella,
  mappa: Record<string, number>,
  creaClienti: boolean,
): Promise<Esito> {
  const esito: Esito = { creati: 0, aggiornati: 0, saltati: [], clientiCreati: 0 }

  const clientiEsistenti = (await db.clienti.toArray()).filter((c) => !c.deleted)
  const perNome = new Map(clientiEsistenti.map((c) => [normalizzaNome(c.ragione_sociale), c]))
  const perPiva = new Map(
    clientiEsistenti.filter((c) => c.partita_iva).map((c) => [c.partita_iva!.trim(), c]),
  )
  const dispositiviEsistenti = (await db.dispositivi.toArray()).filter((d) => !d.deleted)
  const perMatricola = new Map(dispositiviEsistenti.map((d) => [d.matricola.toUpperCase(), d]))

  for (let r = 0; r < tabella.righe.length; r += 1) {
    const riga = tabella.righe[r]!
    const numeroRiga = r + 2 // +1 per l'intestazione, +1 perche' si conta da uno

    if (entita === 'clienti') {
      const ragione = cella(riga, mappa['ragione_sociale'])
      if (!ragione) {
        esito.saltati.push({ riga: numeroRiga, motivo: 'ragione sociale vuota' })
        continue
      }
      const piva = cella(riga, mappa['partita_iva'])
      const esistente = (piva && perPiva.get(piva)) || perNome.get(normalizzaNome(ragione))
      const base: Cliente = esistente ?? {
        id: nuovoId(), ragione_sociale: ragione,
        partita_iva: null, codice_fiscale: null, codice_sdi: null, pec: null,
        email: null, telefono: null, indirizzo: null, cap: null, citta: null,
        provincia: null, note: null, attivo: true, updated_at: '', deleted: false,
      }
      const aggiornato: Cliente = {
        ...base,
        ragione_sociale: ragione,
        partita_iva: piva || base.partita_iva,
        codice_fiscale: cella(riga, mappa['codice_fiscale']) || base.codice_fiscale,
        telefono: cella(riga, mappa['telefono']) || base.telefono,
        email: cella(riga, mappa['email']) || base.email,
        indirizzo: cella(riga, mappa['indirizzo']) || base.indirizzo,
        cap: cella(riga, mappa['cap']) || base.cap,
        citta: cella(riga, mappa['citta']) || base.citta,
        provincia: (cella(riga, mappa['provincia']) || base.provincia || '').toUpperCase() || null,
        codice_sdi: cella(riga, mappa['codice_sdi']) || base.codice_sdi,
        pec: cella(riga, mappa['pec']) || base.pec,
        note: cella(riga, mappa['note']) || base.note,
      }
      await salva('clienti', aggiornato as unknown as Record<string, unknown>)
      if (esistente) esito.aggiornati += 1
      else {
        esito.creati += 1
        perNome.set(normalizzaNome(ragione), aggiornato)
        if (aggiornato.partita_iva) perPiva.set(aggiornato.partita_iva, aggiornato)
      }
      continue
    }

    // Apparecchi e contratti hanno bisogno del cliente.
    const nomeCliente = cella(riga, mappa['cliente'])
    if (!nomeCliente) {
      esito.saltati.push({ riga: numeroRiga, motivo: 'cliente non indicato' })
      continue
    }
    let cliente = perNome.get(normalizzaNome(nomeCliente)) ?? perPiva.get(nomeCliente)
    if (!cliente) {
      if (!creaClienti) {
        esito.saltati.push({ riga: numeroRiga, motivo: `cliente "${nomeCliente}" non in archivio` })
        continue
      }
      cliente = {
        id: nuovoId(), ragione_sociale: nomeCliente,
        partita_iva: null, codice_fiscale: null, codice_sdi: null, pec: null,
        email: null, telefono: null, indirizzo: null, cap: null, citta: null,
        provincia: null, note: null, attivo: true, updated_at: '', deleted: false,
      }
      await salva('clienti', cliente as unknown as Record<string, unknown>)
      perNome.set(normalizzaNome(nomeCliente), cliente)
      esito.clientiCreati += 1
    }

    if (entita === 'dispositivi') {
      const matricola = cella(riga, mappa['matricola']).toUpperCase()
      if (!matricola) {
        esito.saltati.push({ riga: numeroRiga, motivo: 'matricola vuota' })
        continue
      }
      const esistente = perMatricola.get(matricola)
      const base: Dispositivo = esistente ?? {
        id: nuovoId(), cliente_id: cliente.id, sede_id: null, matricola,
        marca: null, modello: null, provvedimento: null, tipo: 'rt',
        data_messa_servizio: null, data_ultima_verifica: null, firmware_versione: null,
        collegato_pos: false, stato: 'attivo', data_dismissione: null, note: null,
        updated_at: '', deleted: false,
      }
      const aggiornato: Dispositivo = {
        ...base,
        cliente_id: cliente.id,
        matricola,
        marca: cella(riga, mappa['marca']) || base.marca,
        modello: cella(riga, mappa['modello']) || base.modello,
        provvedimento: cella(riga, mappa['provvedimento']) || base.provvedimento,
        data_messa_servizio:
          daFormatoItaliano(cella(riga, mappa['data_messa_servizio'])) ?? base.data_messa_servizio,
        data_ultima_verifica:
          daFormatoItaliano(cella(riga, mappa['data_ultima_verifica'])) ?? base.data_ultima_verifica,
        firmware_versione: cella(riga, mappa['firmware_versione']) || base.firmware_versione,
        note: cella(riga, mappa['note']) || base.note,
      }
      await salva('dispositivi', aggiornato as unknown as Record<string, unknown>)
      if (esistente) esito.aggiornati += 1
      else {
        esito.creati += 1
        perMatricola.set(matricola, aggiornato)
      }
      continue
    }

    // Contratti: non si cerca un corrispondente, ogni riga e' un contratto nuovo.
    const scadenza = daFormatoItaliano(cella(riga, mappa['data_scadenza']))
    if (!scadenza) {
      esito.saltati.push({
        riga: numeroRiga,
        motivo: `data di scadenza non leggibile ("${cella(riga, mappa['data_scadenza'])}")`,
      })
      continue
    }
    const contratto: Contratto = {
      id: nuovoId(),
      cliente_id: cliente.id,
      tipo: 'software',
      descrizione: cella(riga, mappa['descrizione']),
      data_inizio: daFormatoItaliano(cella(riga, mappa['data_inizio'])) ?? aggiungiMesi(scadenza, -12),
      data_scadenza: scadenza,
      periodicita: 'annuale',
      importo: numero(cella(riga, mappa['importo'])),
      licenza: cella(riga, mappa['licenza']) || null,
      rinnovo_automatico: false,
      stato: 'attivo',
      note: cella(riga, mappa['note']) || null,
      updated_at: '', deleted: false,
    }
    await salva('contratti', contratto as unknown as Record<string, unknown>)
    esito.creati += 1
  }

  return esito
}

