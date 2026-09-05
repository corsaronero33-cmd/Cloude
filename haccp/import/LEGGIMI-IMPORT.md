# I file di importazione: tre formati della stessa cosa

Stesso contenuto, tre confezioni. Usa quella che il tuo FileMaker accetta
senza discutere.

| Cartella | Formato | Quando usarla |
|---|---|---|
| `excel/` | `.xlsx` | **Prima scelta.** Nessuna questione di delimitatore ne' di codifica |
| `schema/` e `dati/` | `.tab` separato da tabulazione | Se preferisci il testo, o se Excel non e' installato |

I file `.xlsx` sono generati dagli stessi `.tab`: se un giorno cambiano i
campi, si rigenerano, non si modificano a mano.

Differenza unica: nei file di schema in formato Excel **non c'e'** la riga
`ESEMPIO-DA-CANCELLARE`. C'e' solo l'intestazione, e FileMaker crea comunque
la tabella con tutti i campi. Un passaggio in meno.

---

## Importazione da Excel, passo per passo

1. `File` -> `Importa record` -> `File`
2. Scegli il `.xlsx`
3. Se il foglio e' uno solo FileMaker non chiede niente; altrimenti scegli il
   foglio con il nome della tabella
4. Nella finestra **Ordine di importazione**:
   - in alto a destra, alla voce **Destinazione**, scegli **`Nuova tabella`**
   - in basso a sinistra, nel menu a tendina, scegli
     **"Il primo record contiene i nomi dei campi"**
5. `Importa`

FileMaker crea la tabella con il nome del file e tutti i campi di tipo
**Testo**. I tipi si sistemano dopo, come descritto in `09-MONTAGGIO.md`.

---

## Se qualcosa non va

Le cause piu' frequenti, in ordine:

**"Nuova tabella" non compare fra le destinazioni.**
Succede se l'account con cui sei entrato non ha accesso completo: creare
tabelle e' un privilegio. Rientra nel file con l'account amministratore.

**I campi si chiamano `f1`, `f2`, `f3`...**
Non hai impostato "Il primo record contiene i nomi dei campi" **prima** di
premere Importa. E' un menu a tendina in basso a sinistra nella finestra di
importazione, facile da non vedere. Cancella la tabella e rifai.

**La tabella si chiama come il file, ma tu volevi un altro nome.**
E' voluto: i file si chiamano gia' come le tabelle. Se rinomini il file,
rinomini la tabella.

**FileMaker non vede il file nella finestra di scelta.**
Nel menu a tendina del tipo di file scegli **Tutti i file**, oppure il formato
giusto (`Excel` per gli `.xlsx`, `Testo separato da tabulazione` per i `.tab`).

**Con i `.tab` i dati finiscono tutti in una colonna sola.**
E' il delimitatore: FileMaker sta leggendo il file come separato da virgole.
Usa i file `.xlsx`, che non hanno questo problema.

**Con i `.tab` compaiono caratteri strani.**
E' la codifica: nella finestra di importazione va scelto **UTF-8**. I file non
contengono lettere accentate proprio per ridurre questo rischio, ma se capita,
usa i file `.xlsx`.

**Il file e' arrivato rovinato da GitHub.**
Se hai fatto copia e incolla dalla pagina web invece di scaricare il file, hai
copiato la vista formattata, non il file. Scarica con il pulsante di download
del file grezzo, oppure clona il repository.
