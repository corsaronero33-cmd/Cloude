'
' CreaDatabase.vbs - crea l'archivio Access e gli applica le migrazioni.
'
' Fa dal prompt la stessa cosa che fanno Database e Migrator dentro
' l'applicazione. Serve in due momenti: quando si prepara l'archivio sul
' server prima di avere l'eseguibile, e quando bisogna ricreare un archivio
' vuoto per provare qualcosa senza toccare quello di produzione.
'
' Uso:
'
'   cscript //nologo CreaDatabase.vbs <percorso.accdb> [cartella_sql] [password]
'
' Esempio:
'
'   cscript //nologo CreaDatabase.vbs \\SERVER\Gestionale\Dati\Gestionale.accdb
'
' ATTENZIONE ALL'ARCHITETTURA. Questo script parla con il motore ACE, che
' esiste a 32 o a 64 bit, e cscript deve essere della stessa architettura:
'
'   ACE a 64 bit   C:\Windows\System32\cscript.exe
'   ACE a 32 bit   C:\Windows\SysWOW64\cscript.exe
'
' Se l'errore e' "Impossibile trovare il provider", quasi sempre e' questo.
'
Option Explicit

Const PROVIDER_16 = "Microsoft.ACE.OLEDB.16.0"
Const PROVIDER_12 = "Microsoft.ACE.OLEDB.12.0"

Dim gFso
Set gFso = CreateObject("Scripting.FileSystemObject")

Main

Sub Main()
    Dim percorsoDb, cartellaSql, password
    Dim connectionString, conn, applicate

    If WScript.Arguments.Count < 1 Then
        WScript.Echo "Uso: cscript //nologo CreaDatabase.vbs <percorso.accdb> [cartella_sql] [password]"
        WScript.Quit 1
    End If

    percorsoDb = WScript.Arguments(0)
    If WScript.Arguments.Count >= 2 Then
        cartellaSql = WScript.Arguments(1)
    Else
        cartellaSql = gFso.BuildPath(gFso.GetParentFolderName(gFso.GetParentFolderName(WScript.ScriptFullName)), "sql")
    End If
    If WScript.Arguments.Count >= 3 Then password = WScript.Arguments(2) Else password = ""

    If Not gFso.FolderExists(cartellaSql) Then
        WScript.Echo "Cartella delle migrazioni non trovata: " & cartellaSql
        WScript.Quit 2
    End If

    WScript.Echo "Archivio    : " & percorsoDb
    WScript.Echo "Migrazioni  : " & cartellaSql
    WScript.Echo ""

    If gFso.FileExists(percorsoDb) Then
        WScript.Echo "Archivio esistente: applico solo le migrazioni mancanti."
    End If

    connectionString = PreparaArchivio(percorsoDb, password)
    If connectionString = "" Then
        WScript.Echo "Nessun provider ACE ha potuto aprire o creare l'archivio."
        WScript.Echo "Installare il motore di database di Microsoft Access nella"
        WScript.Echo "stessa architettura di cscript, e verificare i permessi di"
        WScript.Echo "scrittura sulla cartella."
        WScript.Quit 3
    End If

    Set conn = CreateObject("ADODB.Connection")
    conn.Open connectionString

    applicate = ApplicaMigrazioni(conn, cartellaSql)
    WScript.Echo ""
    If applicate = 0 Then
        WScript.Echo "Nessuna migrazione da applicare: archivio gia' aggiornato."
    Else
        WScript.Echo "Migrazioni applicate: " & applicate
        WScript.Echo "Versione dello schema: " & VersioneCorrente(conn)
    End If

    conn.Close
End Sub

' ---------------------------------------------------------------------------

' Prova i provider uno per uno finche' uno apre o crea l'archivio per
' davvero. Assegnare Provider a una connessione chiusa non dimostra
' niente: ADO non verifica nulla finche' non si apre.
Function PreparaArchivio(percorsoDb, password)
    Dim candidati, i, stringa

    candidati = Array(PROVIDER_16, PROVIDER_12)
    For i = 0 To UBound(candidati)
        stringa = StringaDiConnessione(candidati(i), percorsoDb, password)
        If gFso.FileExists(percorsoDb) Then
            If PuoAprire(stringa) Then
                WScript.Echo "Provider    : " & candidati(i)
                PreparaArchivio = stringa
                Exit Function
            End If
        Else
            If PuoCreare(stringa) Then
                WScript.Echo "Provider    : " & candidati(i)
                WScript.Echo "Archivio creato."
                PreparaArchivio = stringa
                Exit Function
            End If
        End If
    Next
    PreparaArchivio = ""
End Function

Function PuoAprire(stringa)
    Dim conn

    On Error Resume Next
    Set conn = CreateObject("ADODB.Connection")
    conn.Open stringa
    PuoAprire = (Err.Number = 0)
    If Err.Number = 0 Then conn.Close
    Err.Clear
    On Error GoTo 0
End Function

Function PuoCreare(stringa)
    Dim catalogo

    On Error Resume Next
    Set catalogo = CreateObject("ADOX.Catalog")
    catalogo.Create stringa
    PuoCreare = (Err.Number = 0)
    Err.Clear
    On Error GoTo 0
    Set catalogo = Nothing
End Function

Function StringaDiConnessione(provider, percorsoDb, password)
    Dim stringa

    stringa = "Provider=" & provider & ";Data Source=" & percorsoDb & ";"
    stringa = stringa & "Persist Security Info=False;Mode=Share Deny None;"
    stringa = stringa & "Jet OLEDB:Database Locking Mode=1;"
    If Len(password) > 0 Then
        stringa = stringa & "Jet OLEDB:Database Password=" & password & ";"
    End If
    StringaDiConnessione = stringa
End Function

' ---------------------------------------------------------------------------

Function VersioneCorrente(conn)
    Dim rs

    VersioneCorrente = 0
    On Error Resume Next
    Set rs = conn.Execute("SELECT Contenuto FROM Parametri WHERE Chiave = 'SchemaVersion'")
    If Err.Number <> 0 Then
        Err.Clear
        On Error GoTo 0
        Exit Function
    End If
    On Error GoTo 0

    If Not rs.EOF Then
        If Not IsNull(rs.Fields(0).Value) Then
            VersioneCorrente = CLng("0" & rs.Fields(0).Value)
        End If
    End If
    rs.Close
End Function

Sub ScriviVersione(conn, versione)
    Dim interessate

    conn.Execute "UPDATE Parametri SET Contenuto = '" & versione & _
                 "' WHERE Chiave = 'SchemaVersion'", interessate
    If interessate = 0 Then
        conn.Execute "INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES " & _
                     "('SchemaVersion', '" & versione & _
                     "', 'Versione dello schema applicata. La gestisce il Migrator')"
    End If
End Sub

Function ApplicaMigrazioni(conn, cartellaSql)
    Dim files, nomi, i
    Dim corrente, versione, applicate

    Set files = gFso.GetFolder(cartellaSql).Files
    nomi = ElencoOrdinato(files)
    corrente = VersioneCorrente(conn)
    applicate = 0

    For i = 0 To UBound(nomi)
        If nomi(i) <> "" Then
            versione = VersioneDi(nomi(i))
            If versione > corrente Then
                WScript.Echo "Applico " & nomi(i) & " ..."
                EseguiFile conn, gFso.BuildPath(cartellaSql, nomi(i))
                ScriviVersione conn, versione
                corrente = versione
                applicate = applicate + 1
            End If
        End If
    Next

    ApplicaMigrazioni = applicate
End Function

Function ElencoOrdinato(files)
    Dim nomi(), quanti, file, i, j, scambio

    ReDim nomi(files.Count)
    quanti = 0
    For Each file In files
        If LCase(gFso.GetExtensionName(file.Name)) = "sql" Then
            If VersioneDi(file.Name) > 0 Then
                nomi(quanti) = file.Name
                quanti = quanti + 1
            End If
        End If
    Next

    For i = 1 To quanti - 1
        scambio = nomi(i)
        j = i - 1
        Do While j >= 0
            If nomi(j) <= scambio Then Exit Do
            nomi(j + 1) = nomi(j)
            j = j - 1
        Loop
        nomi(j + 1) = scambio
    Next

    If quanti = 0 Then
        ReDim nomi(0)
        nomi(0) = ""
    Else
        ReDim Preserve nomi(quanti - 1)
    End If
    ElencoOrdinato = nomi
End Function

Function VersioneDi(nomeFile)
    Dim prefisso, i, ch

    prefisso = ""
    For i = 1 To Len(nomeFile)
        ch = Mid(nomeFile, i, 1)
        If ch < "0" Or ch > "9" Then Exit For
        prefisso = prefisso & ch
    Next

    If Len(prefisso) = 0 Then
        VersioneDi = 0
    Else
        VersioneDi = CLng(prefisso)
    End If
End Function

' ACE non accetta batch: una istruzione per volta, e se una si ferma si
' dice quale, perche' con venti CREATE TABLE "errore di sintassi" da solo
' non basta a nessuno.
Sub EseguiFile(conn, percorso)
    Dim contenuto, istruzioni, i

    contenuto = gFso.OpenTextFile(percorso, 1).ReadAll()
    istruzioni = SpezzaIstruzioni(contenuto)

    For i = 0 To UBound(istruzioni)
        If istruzioni(i) <> "" Then
            On Error Resume Next
            conn.Execute istruzioni(i)
            If Err.Number <> 0 Then
                WScript.Echo ""
                WScript.Echo "ERRORE nell'istruzione " & (i + 1) & " di " & _
                             gFso.GetFileName(percorso)
                WScript.Echo Err.Description
                WScript.Echo ""
                WScript.Echo istruzioni(i)
                WScript.Quit 4
            End If
            On Error GoTo 0
        End If
    Next
End Sub

Function SpezzaIstruzioni(contenuto)
    Dim righe, i, riga, buffer, risultato(), quanti


    contenuto = Replace(contenuto, vbCrLf, vbLf)
    contenuto = Replace(contenuto, vbCr, vbLf)
    righe = Split(contenuto, vbLf)

    ReDim risultato(UBound(righe) + 1)
    quanti = 0
    buffer = ""

    For i = 0 To UBound(righe)
        riga = Trim(righe(i))
        If Len(riga) > 0 Then
            If Left(riga, 2) <> "--" Then
                If Len(buffer) > 0 Then buffer = buffer & " "
                buffer = buffer & riga
                If Right(riga, 1) = ";" Then
                    risultato(quanti) = Trim(Left(buffer, Len(buffer) - 1))
                    quanti = quanti + 1
                    buffer = ""
                End If
            End If
        End If
    Next

    If Len(Trim(buffer)) > 0 Then
        risultato(quanti) = Trim(buffer)
        quanti = quanti + 1
    End If

    If quanti = 0 Then
        ReDim risultato(0)
        risultato(0) = ""
    Else
        ReDim Preserve risultato(quanti - 1)
    End If
    SpezzaIstruzioni = risultato
End Function
