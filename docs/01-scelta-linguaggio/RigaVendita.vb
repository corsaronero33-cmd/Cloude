Namespace Cassa.Core.Vendite

    ''' <summary>
    ''' Una riga dello scontrino.
    '''
    ''' I prezzi di un negozio sono prezzi al pubblico, quindi IVA compresa:
    ''' l'imponibile non si somma, si ricava per scorporo.
    ''' </summary>
    Public NotInheritable Class RigaVendita

        Public Property Descrizione As String = ""
        Public Property Quantita As Decimal               ' anche 0,350 (kg)
        Public Property PrezzoUnitarioLordo As Decimal    ' IVA compresa
        Public Property ScontoPercentuale As Decimal      ' da 0 a 100
        Public Property AliquotaIva As Decimal            ' 22, 10, 5, 4, 0

        Public ReadOnly Property TotaleLordo As Decimal
            Get
                Return Arrotonda(Quantita * PrezzoUnitarioLordo _
                                 * (1D - ScontoPercentuale / 100D))
            End Get
        End Property

        Public ReadOnly Property Imponibile As Decimal
            Get
                Return Arrotonda(TotaleLordo / (1D + AliquotaIva / 100D))
            End Get
        End Property

        ' L'imposta si ricava per DIFFERENZA, non ricalcolandola a parte.
        ' Cosi' imponibile + imposta fa sempre esattamente il totale lordo.
        ' Arrotondando le due voci separatamente si rischia un centesimo di
        ' scarto: il registratore telematico lo rifiuta, e lo scontrino non esce.
        Public ReadOnly Property Imposta As Decimal
            Get
                Return TotaleLordo - Imponibile
            End Get
        End Property

        ' Arrotondamento commerciale: 0,005 va a 0,01.
        ' ATTENZIONE: Math.Round per default arrotonda "al pari"
        ' (0,125 -> 0,12 invece di 0,13). Non e' quello che vuole il fisco
        ' italiano, quindi MidpointRounding.AwayFromZero va messo sempre.
        Private Shared Function Arrotonda(valore As Decimal) As Decimal
            Return Math.Round(valore, 2, MidpointRounding.AwayFromZero)
        End Function

    End Class

End Namespace
