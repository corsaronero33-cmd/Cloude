B4J=true
Group=Default Group
ModulesStructureVersion=1
Type=StaticCode
Version=9.8
@EndOfDesignText@
' ---------------------------------------------------------------------------
' CONTROLLI FORMALI
'
' Funzioni pure: entra un dato, esce una risposta. Non leggono il database,
' non toccano la finestra, non hanno memoria. Per questo si possono provare
' da sole e non ti sorprendono mai.
' ---------------------------------------------------------------------------

Sub Process_Globals
	' Valori dei caratteri in posizione dispari del codice fiscale.
	' L'indice va da 0 a 35: 0-9 per le cifre, 10-35 per le lettere A-Z.
	' E' una tabella di legge, non c'e' una formula da cui ricavarla.
	Private ValoriDispari() As Int = Array As Int( _
		1, 0, 5, 7, 9, 13, 15, 17, 19, 21, _
		1, 0, 5, 7, 9, 13, 15, 17, 19, 21, _
		2, 4, 18, 20, 11, 3, 6, 8, 12, 14, _
		16, 10, 22, 25, 24, 23)
End Sub

' Partita IVA italiana: 11 cifre, l'ultima e' di controllo.
Public Sub PartitaIvaValida (PartitaIva As String) As Boolean
	Dim P As String = PartitaIva.Trim
	If P.Length <> 11 Then Return False
	If SoloCifre(P) = False Then Return False

	Dim Somma As Int = 0
	For I = 0 To 9
		Dim Cifra As Int = Asc(P.CharAt(I)) - 48

		' Le cifre in posizione pari (la 2a, la 4a...) vanno raddoppiate,
		' e se il raddoppio supera 9 si sottrae 9.
		If I Mod 2 = 1 Then
			Cifra = Cifra * 2
			If Cifra > 9 Then Cifra = Cifra - 9
		End If

		Somma = Somma + Cifra
	Next

	Dim Controllo As Int = (10 - (Somma Mod 10)) Mod 10
	Return Controllo = (Asc(P.CharAt(10)) - 48)
End Sub

' Codice fiscale di persona fisica: 16 caratteri, l'ultimo di controllo.
' Funziona anche sui codici "omocodici", quelli in cui l'Agenzia delle Entrate
' ha messo lettere al posto di cifre per distinguere due persone con dati
' uguali: le tabelle prevedono le lettere anche nelle posizioni numeriche.
Public Sub CodiceFiscaleValido (CodiceFiscale As String) As Boolean
	Dim C As String = CodiceFiscale.Trim.ToUpperCase
	If C.Length <> 16 Then Return False

	For I = 0 To 15
		If LetteraOCifra(C.CharAt(I)) = False Then Return False
	Next

	Dim Somma As Int = 0
	For I = 0 To 14
		' "Posizione dispari" si conta partendo da 1, quindi sono i caratteri
		' di indice 0, 2, 4... del testo.
		If I Mod 2 = 0 Then
			Somma = Somma + ValoriDispari(ValoreIndice(C.CharAt(I)))
		Else
			Somma = Somma + ValorePari(C.CharAt(I))
		End If
	Next

	Dim Atteso As String = Chr(Asc("A") + (Somma Mod 26))
	Return Atteso = C.SubString2(15, 16)
End Sub

' Il codice destinatario dice al Sistema di Interscambio dove recapitare la
' fattura: 7 caratteri per i privati, 6 per la Pubblica Amministrazione.
Public Sub CodiceDestinatarioValido (Codice As String) As Boolean
	Dim C As String = Codice.Trim.ToUpperCase
	If C.Length <> 6 And C.Length <> 7 Then Return False

	For I = 0 To C.Length - 1
		If LetteraOCifra(C.CharAt(I)) = False Then Return False
	Next

	Return True
End Sub

Private Sub SoloCifre (Testo As String) As Boolean
	For I = 0 To Testo.Length - 1
		Dim V As Int = Asc(Testo.CharAt(I))
		If V < 48 Or V > 57 Then Return False
	Next
	Return True
End Sub

Private Sub LetteraOCifra (C As Char) As Boolean
	Dim V As Int = Asc(C)
	If V >= 48 And V <= 57 Then Return True
	If V >= 65 And V <= 90 Then Return True
	Return False
End Sub

' Indice nella tabella dei dispari: cifre 0-9, lettere 10-35.
Private Sub ValoreIndice (C As Char) As Int
	Dim V As Int = Asc(C)
	If V >= 48 And V <= 57 Then Return V - 48
	Return V - 65 + 10
End Sub

' Valore dei caratteri in posizione pari: le cifre valgono se stesse,
' le lettere valgono la posizione nell'alfabeto (A=0 ... Z=25).
Private Sub ValorePari (C As Char) As Int
	Dim V As Int = Asc(C)
	If V >= 48 And V <= 57 Then Return V - 48
	Return V - 65
End Sub
