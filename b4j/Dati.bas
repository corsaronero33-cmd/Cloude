B4J=true
Group=Default Group
ModulesStructureVersion=1
Type=StaticCode
Version=9.8
@EndOfDesignText@
' ---------------------------------------------------------------------------
' MODULO DATI
'
' Qui dentro c'e' tutto quello che tocca il database, e nient'altro.
' La finestra non sa come sono fatte le tabelle: chiama queste Sub e basta.
'
' E' un "Code Module": un contenitore di Sub, come un file .prg di Clipper
' pieno di FUNCTION. Non e' un oggetto, non si crea con New, non ha stato
' nascosto. Si chiama scrivendo   Dati.NomeSub(...)
' ---------------------------------------------------------------------------

Sub Process_Globals
	' La scheda di un cliente. In B4X si chiama Type ed e' esattamente un
	' record: un gruppo di campi con un nome, senza niente dentro che "fa".
	Type Cliente (Id As Int, Codice As String, RagioneSociale As String, _
		PartitaIva As String, CodiceFiscale As String, Indirizzo As String, _
		Cap As String, Comune As String, Provincia As String, _
		Email As String, Telefono As String)

	Private SQL1 As SQL
	Private Aperto As Boolean = False
End Sub

' Apre il database e crea le tabelle se non ci sono. Da chiamare una volta
' all'avvio del programma.
Public Sub Apri
	If Aperto Then Return

	' File.DirData mette il database nella cartella dati dell'utente, non
	' accanto al programma. Se lo mettessi accanto al programma, il giorno che
	' installi in "Programmi" Windows non ti farebbe piu' scrivere e il
	' programma andrebbe in errore sul PC del cliente.
	Dim Cartella As String = File.DirData("Cloude")
	SQL1.InitializeSQLite(Cartella, "cloude.db", True)

	SQL1.ExecNonQuery("CREATE TABLE IF NOT EXISTS clienti (" & _
		"Id INTEGER PRIMARY KEY AUTOINCREMENT, " & _
		"Codice TEXT NOT NULL DEFAULT '', " & _
		"RagioneSociale TEXT NOT NULL DEFAULT '', " & _
		"PartitaIva TEXT NOT NULL DEFAULT '', " & _
		"CodiceFiscale TEXT NOT NULL DEFAULT '', " & _
		"Indirizzo TEXT NOT NULL DEFAULT '', " & _
		"Cap TEXT NOT NULL DEFAULT '', " & _
		"Comune TEXT NOT NULL DEFAULT '', " & _
		"Provincia TEXT NOT NULL DEFAULT '', " & _
		"Email TEXT NOT NULL DEFAULT '', " & _
		"Telefono TEXT NOT NULL DEFAULT '')")

	Aperto = True
	Log("Database aperto: " & Cartella & "\cloude.db")
End Sub

' Scheda vuota, pronta da riempire. Serve perche' in B4X un Type va sempre
' inizializzato prima di essere usato, altrimenti da' errore.
Public Sub NuovoCliente As Cliente
	Dim C As Cliente
	C.Initialize
	C.Id = 0
	C.Codice = ""
	C.RagioneSociale = ""
	C.PartitaIva = ""
	C.CodiceFiscale = ""
	C.Indirizzo = ""
	C.Cap = ""
	C.Comune = ""
	C.Provincia = ""
	C.Email = ""
	C.Telefono = ""
	Return C
End Sub

' Elenco dei clienti. Se Filtro non e' vuoto, cerca in codice, denominazione,
' partita IVA e codice fiscale. Torna una List di Cliente.
Public Sub Elenca (Filtro As String) As List
	Dim Elenco As List
	Elenco.Initialize

	Dim Righe As ResultSet
	Dim F As String = Filtro.Trim

	If F = "" Then
		Righe = SQL1.ExecQuery("SELECT * FROM clienti ORDER BY RagioneSociale")
	Else
		' Il ? viene sostituito da B4X in modo sicuro. Non attaccare mai il
		' testo digitato dall'utente dentro la query con &, altrimenti chi
		' scrive un apice puo' combinare guai.
		Dim Come As String = "%" & F & "%"
		Righe = SQL1.ExecQuery2("SELECT * FROM clienti WHERE " & _
			"Codice LIKE ? OR RagioneSociale LIKE ? OR " & _
			"PartitaIva LIKE ? OR CodiceFiscale LIKE ? " & _
			"ORDER BY RagioneSociale", _
			Array As String(Come, Come, Come, Come))
	End If

	Do While Righe.NextRow
		Elenco.Add(LeggiRiga(Righe))
	Loop
	Righe.Close

	Return Elenco
End Sub

' Un solo cliente. Torna una scheda con Id = 0 se non lo trova.
Public Sub Leggi (Id As Int) As Cliente
	Dim Righe As ResultSet = SQL1.ExecQuery2( _
		"SELECT * FROM clienti WHERE Id = ?", Array As String(Id))

	Dim C As Cliente = NuovoCliente
	If Righe.NextRow Then C = LeggiRiga(Righe)
	Righe.Close

	Return C
End Sub

' Salva: inserisce se Id vale 0, altrimenti aggiorna. Torna l'Id.
Public Sub Salva (C As Cliente) As Int
	If C.Id = 0 Then
		SQL1.ExecNonQuery2("INSERT INTO clienti " & _
			"(Codice, RagioneSociale, PartitaIva, CodiceFiscale, Indirizzo, " & _
			" Cap, Comune, Provincia, Email, Telefono) " & _
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", _
			Array As Object(C.Codice, C.RagioneSociale, C.PartitaIva, _
				C.CodiceFiscale, C.Indirizzo, C.Cap, C.Comune, _
				C.Provincia, C.Email, C.Telefono))

		C.Id = SQL1.ExecQuerySingleResult("SELECT last_insert_rowid()")
	Else
		SQL1.ExecNonQuery2("UPDATE clienti SET " & _
			"Codice = ?, RagioneSociale = ?, PartitaIva = ?, CodiceFiscale = ?, " & _
			"Indirizzo = ?, Cap = ?, Comune = ?, Provincia = ?, " & _
			"Email = ?, Telefono = ? WHERE Id = ?", _
			Array As Object(C.Codice, C.RagioneSociale, C.PartitaIva, _
				C.CodiceFiscale, C.Indirizzo, C.Cap, C.Comune, _
				C.Provincia, C.Email, C.Telefono, C.Id))
	End If

	Return C.Id
End Sub

Public Sub Elimina (Id As Int)
	SQL1.ExecNonQuery2("DELETE FROM clienti WHERE Id = ?", Array As String(Id))
End Sub

' Travasa la riga letta dal database dentro una scheda Cliente.
' E' privata: la usano solo le Sub qui sopra.
Private Sub LeggiRiga (Righe As ResultSet) As Cliente
	Dim C As Cliente = NuovoCliente

	C.Id = Righe.GetInt("Id")
	C.Codice = Righe.GetString("Codice")
	C.RagioneSociale = Righe.GetString("RagioneSociale")
	C.PartitaIva = Righe.GetString("PartitaIva")
	C.CodiceFiscale = Righe.GetString("CodiceFiscale")
	C.Indirizzo = Righe.GetString("Indirizzo")
	C.Cap = Righe.GetString("Cap")
	C.Comune = Righe.GetString("Comune")
	C.Provincia = Righe.GetString("Provincia")
	C.Email = Righe.GetString("Email")
	C.Telefono = Righe.GetString("Telefono")

	Return C
End Sub
