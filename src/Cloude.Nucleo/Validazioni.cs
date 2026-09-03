namespace Cloude.Nucleo;

// ---------------------------------------------------------------------------
// CONTROLLI FORMALI
//
// Ogni funzione risponde a una domanda secca e non tocca niente fuori da se'.
// Le funzioni che validano un documento intero non lanciano eccezioni: tornano
// l'elenco dei problemi trovati, cosi' la finestra puo' mostrarli tutti in una
// volta invece di far scoprire all'utente un errore per volta.
// ---------------------------------------------------------------------------

public static class Validazioni
{
    // Partita IVA italiana: 11 cifre, l'ultima e' un carattere di controllo
    // calcolato con l'algoritmo di Luhn.
    public static bool PartitaIvaValida(string partitaIva)
    {
        string p = (partitaIva ?? "").Trim();
        if (p.Length != 11) return false;

        for (int i = 0; i < 11; i++)
            if (p[i] < '0' || p[i] > '9') return false;

        int somma = 0;
        for (int i = 0; i < 10; i++)
        {
            int cifra = p[i] - '0';

            // Le cifre in posizione pari (la 2a, la 4a, ...) vanno raddoppiate,
            // e se il raddoppio supera 9 si sottrae 9.
            if (i % 2 == 1)
            {
                cifra = cifra * 2;
                if (cifra > 9) cifra = cifra - 9;
            }
            somma = somma + cifra;
        }

        int controllo = (10 - somma % 10) % 10;
        return controllo == (p[10] - '0');
    }

    // Tabella dei valori per i caratteri in posizione dispari del codice
    // fiscale. L'indice va da 0 a 35: 0-9 per le cifre, 10-35 per le lettere
    // da A a Z. E' una tabella di legge, non c'e' una formula da cui ricavarla.
    private static readonly int[] ValoriDispari =
    {
        1, 0, 5, 7, 9, 13, 15, 17, 19, 21,          // cifre 0-9
        1, 0, 5, 7, 9, 13, 15, 17, 19, 21,          // lettere A-J
        2, 4, 18, 20, 11, 3, 6, 8, 12, 14,          // lettere K-T
        16, 10, 22, 25, 24, 23                       // lettere U-Z
    };

    // Codice fiscale di persona fisica: 16 caratteri, l'ultimo di controllo.
    // Accetta anche i codici "omocodici", quelli in cui l'Agenzia delle Entrate
    // ha sostituito delle cifre con lettere per distinguere due persone con
    // dati identici: l'algoritmo funziona lo stesso perche' le tabelle
    // prevedono le lettere anche nelle posizioni numeriche.
    public static bool CodiceFiscaleValido(string codiceFiscale)
    {
        string c = (codiceFiscale ?? "").Trim().ToUpperInvariant();
        if (c.Length != 16) return false;

        for (int i = 0; i < 16; i++)
            if (!IsLetteraOCifra(c[i])) return false;

        int somma = 0;
        for (int i = 0; i < 15; i++)
        {
            // Attenzione: "posizione dispari" si conta partendo da 1, quindi
            // e' l'indice 0, 2, 4... del testo.
            if (i % 2 == 0)
                somma = somma + ValoriDispari[ValoreIndice(c[i])];
            else
                somma = somma + ValorePari(c[i]);
        }

        char atteso = (char)('A' + (somma % 26));
        return atteso == c[15];
    }

    // Il codice destinatario dice al Sistema di Interscambio dove recapitare
    // la fattura: 7 caratteri per i privati, 6 per la Pubblica Amministrazione.
    // "0000000" significa che il cliente non ha un canale telematico e ritirera'
    // la fattura dal cassetto fiscale; in quel caso serve la PEC oppure niente.
    public static bool CodiceDestinatarioValido(string codice)
    {
        string c = (codice ?? "").Trim().ToUpperInvariant();
        if (c.Length != 6 && c.Length != 7) return false;

        for (int i = 0; i < c.Length; i++)
            if (!IsLetteraOCifra(c[i])) return false;

        return true;
    }

    // Controlla un documento prima del salvataggio o dell'invio.
    // Torna la lista dei problemi: lista vuota = tutto a posto.
    public static List<string> ControllaDocumento(Documento documento)
    {
        var errori = new List<string>();

        if (documento == null)
        {
            errori.Add("Documento mancante.");
            return errori;
        }

        if (string.IsNullOrWhiteSpace(documento.Numero))
            errori.Add("Manca il numero del documento.");

        if (documento.Data == default)
            errori.Add("Manca la data del documento.");

        if (string.IsNullOrWhiteSpace(documento.ClienteDenominazione))
            errori.Add("Manca la denominazione del cliente.");

        // Per un cliente italiano serve almeno uno fra partita IVA e codice
        // fiscale: senza, il Sistema di Interscambio scarta la fattura.
        bool haPartitaIva = !string.IsNullOrWhiteSpace(documento.ClientePartitaIva);
        bool haCodiceFiscale = !string.IsNullOrWhiteSpace(documento.ClienteCodiceFiscale);

        if (!haPartitaIva && !haCodiceFiscale)
            errori.Add("Il cliente non ha ne' partita IVA ne' codice fiscale.");

        if (haPartitaIva && documento.ClienteNazione == "IT"
            && !PartitaIvaValida(documento.ClientePartitaIva))
            errori.Add("La partita IVA del cliente non e' valida: " + documento.ClientePartitaIva);

        if (documento.Righe == null || documento.Righe.Count == 0)
        {
            errori.Add("Il documento non ha righe.");
            return errori;
        }

        for (int i = 0; i < documento.Righe.Count; i++)
        {
            var riga = documento.Righe[i];
            string dove = "Riga " + (i + 1) + ": ";

            if (string.IsNullOrWhiteSpace(riga.Descrizione))
                errori.Add(dove + "manca la descrizione.");

            if (riga.AliquotaIva < 0 || riga.AliquotaIva > 100)
                errori.Add(dove + "aliquota IVA fuori intervallo (" + riga.AliquotaIva + ").");

            // Se l'IVA e' zero il tracciato pretende di sapere il perche'.
            if (riga.AliquotaIva == 0 && string.IsNullOrWhiteSpace(riga.NaturaIva))
                errori.Add(dove + "aliquota a zero senza codice natura (N1-N7).");

            if (riga.AliquotaIva > 0 && !string.IsNullOrWhiteSpace(riga.NaturaIva))
                errori.Add(dove + "il codice natura si mette solo con aliquota a zero.");

            if (riga.ScontoPercentuale < 0 || riga.ScontoPercentuale > 100)
                errori.Add(dove + "sconto fuori intervallo (" + riga.ScontoPercentuale + ").");
        }

        return errori;
    }

    private static bool IsLetteraOCifra(char c)
    {
        return (c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z');
    }

    // Indice nella tabella dei dispari: cifre 0-9, lettere 10-35.
    private static int ValoreIndice(char c)
    {
        if (c >= '0' && c <= '9') return c - '0';
        return c - 'A' + 10;
    }

    // Valore dei caratteri in posizione pari: le cifre valgono se stesse,
    // le lettere valgono la loro posizione nell'alfabeto (A=0 ... Z=25).
    private static int ValorePari(char c)
    {
        if (c >= '0' && c <= '9') return c - '0';
        return c - 'A';
    }
}
