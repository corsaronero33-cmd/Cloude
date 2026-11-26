# Lezione 0 — Preparare il PC (Windows)

Tempo previsto: 30–45 minuti. PostgreSQL per ora **non** serve: lo
installiamo alla Fase 3, quando arriveremo al database.

## 1. Python

1. Vai su <https://www.python.org/downloads/windows/> e scarica l'ultimo
   **Python 3.13** ("Windows installer 64-bit").
2. Avvia l'installazione e, **prima** di premere *Install Now*, spunta in
   basso **"Add python.exe to PATH"**. È il passaggio che si dimentica più
   spesso.
3. Alla fine, se compare *"Disable path length limit"*, cliccalo.

Verifica: apri il **Prompt dei comandi** (tasto Windows, scrivi `cmd`,
Invio) e scrivi:

```
py --version
```

Deve rispondere qualcosa come `Python 3.13.x`.

> `py` è il "lanciatore" di Python per Windows. Funziona anche `python`, ma
> `py` è più affidabile se hai più versioni installate.

## 2. Git

1. Scarica da <https://git-scm.com/download/win> e installa lasciando tutte
   le opzioni predefinite.
2. Verifica nel Prompt: `git --version`.

Git serve a scaricare il progetto e a salvare la storia delle modifiche.
Ogni "commit" è come un salvataggio con nota: puoi sempre tornare indietro.

## 3. VS Code

1. Scarica da <https://code.visualstudio.com/> e installa. Durante
   l'installazione spunta **"Aggiungi l'azione 'Apri con Code'"** (entrambe
   le caselle) e **"Aggiungi a PATH"**.
2. Apri VS Code, vai su *Estensioni* (icona dei quadratini a sinistra, oppure
   `Ctrl+Shift+X`) e installa:
   - **Python** (di Microsoft) — porta con sé anche *Pylance* e il debugger
   - **Italian Language Pack** (facoltativo, per avere i menu in italiano)

## 4. Scaricare il progetto

Nel Prompt dei comandi:

```
cd %USERPROFILE%\Documents
git clone https://github.com/corsaronero33-cmd/cloude.git
cd cloude
git checkout claude/libra-pro-easyfatt-clone-0cy4by
cd LibraPRO
```

Ora sei nella cartella del progetto.

## 5. L'ambiente virtuale

Ogni progetto Python ha la sua "scatola" di librerie, separata dal resto del
PC: si chiama **ambiente virtuale** (cartella `.venv`). Così le librerie di
Libra PRO non si mescolano con quelle di altri programmi.

Sempre dentro `LibraPRO`:

```
py -m venv .venv
.venv\Scripts\activate
```

Il prompt ora inizia con `(.venv)`: l'ambiente è attivo. Installa le
librerie del progetto:

```
pip install -r requirements.txt
```

> Se in futuro apri un nuovo Prompt, ricordati di rifare
> `.venv\Scripts\activate` dalla cartella `LibraPRO`. In VS Code lo fa da solo
> (vedi sotto).

## 6. Aprire il progetto in VS Code

```
code .
```

(il punto significa "la cartella in cui mi trovo").

In VS Code:
1. Premi `Ctrl+Shift+P`, scrivi **Python: Select Interpreter** e scegli
   quello che contiene `.venv`.
2. Apri il terminale integrato con `` Ctrl+` `` (il tasto accanto all'1, con
   AltGr su alcune tastiere: in alternativa menu *Terminale → Nuovo
   terminale*). Deve comparire `(.venv)`.

> **Se il terminale dà un errore rosso su "esecuzione di script disabilitata"**:
> è PowerShell che blocca l'attivazione. Esegui una volta
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, rispondi `S` e
> chiudi/riapri il terminale.

## 7. Verifica finale

Nel terminale di VS Code:

```
py esempio_fattura.py
py -m pytest
```

Il primo stampa una piccola fattura a video, il secondo deve terminare con
`7 passed`. Se vedi entrambi, sei pronto per la Lezione 1.

Se qualcosa va storto, copiami il messaggio di errore **completo**: in
Python l'errore importante è quasi sempre l'**ultima riga**.
