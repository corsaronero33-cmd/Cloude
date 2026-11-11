# -*- coding: utf-8 -*-
import io

COLONNE = [
    (24,  70,  'Ora'),
    (94,  290, 'Punto di controllo'),
    (384, 100, 'Valore'),
    (484, 80,  'Unita'),
    (564, 120, 'Esito'),
    (684, 150, 'Operatore'),
    (834, 162, 'Note'),
]

GIORNI = [
    ("mercoledi' 11 novembre 2026", [
        ('06:42', 'Frigo cucina 1',         '3',   'degC', 'conforme',     'Mario Rossi',  ''),
        ('06:45', 'Frigo carni',            '7',   'degC', 'non conforme', 'Mario Rossi',  'sbrinamento in corso'),
        ('06:50', "Integrita' zanzariere",   '',    '',     'conforme',     'Mario Rossi',  ''),
    ]),
    ("martedi' 10 novembre 2026", [
        ('18:20', 'Abbattitore',            '-18', 'degC', 'conforme',     'Luca Bianchi', 'fine servizio'),
        ('06:40', 'Frigo cucina 1',         '4',   'degC', 'conforme',     'Mario Rossi',  ''),
    ]),
]

BLU   = '#1B3A5C'
INK   = '#16222A'
MUT   = '#5F7078'
LINEA = '#D5DDE1'
ROSSO = '#DD0000'
FONT  = 'Source Sans 3, Segoe UI, sans-serif'

def esc(s):
    return (s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
             .replace('degC','°C'))

def figura_maschera():
    o = io.StringIO()
    H_INT, H_RIEP, H_CORPO, H_PIE = 143, 40, 30, 40

    # altezza totale
    y = H_INT
    for _, righe in GIORNI:
        y += H_RIEP + H_CORPO * len(righe)
    y += H_PIE
    tot = y

    vb_x, vb_y = -152, -44
    vb_w, vb_h = 152 + 1020 + 16, 44 + tot + 14

    o.write(f'<svg viewBox="{vb_x} {vb_y} {vb_w} {vb_h}" role="img" '
            f'aria-label="La maschera D_Rilevazioni elenco come appare a video: '
            f'intestazione blu con titolo, tre pulsanti e le sette etichette di colonna; '
            f'poi le rilevazioni raggruppate per giornata, con la riga fuori limite in rosso." '
            f'font-family="{FONT}">\n')

    # --- tacche delle X in alto -------------------------------------
    for x, w, _ in COLONNE:
        o.write(f'  <line x1="{x}" y1="-16" x2="{x}" y2="-4" stroke="currentColor" '
                f'stroke-width="1" opacity=".35"/>\n')
        o.write(f'  <text x="{x}" y="-22" font-size="11" fill="currentColor" opacity=".75">{x}</text>\n')
    o.write('  <line x1="996" y1="-16" x2="996" y2="-4" stroke="currentColor" stroke-width="1" opacity=".35"/>\n')
    o.write('  <text x="996" y="-22" font-size="11" fill="currentColor" opacity=".75" text-anchor="end">996</text>\n')

    # --- INTESTAZIONE -----------------------------------------------
    o.write(f'  <rect x="0" y="0" width="1020" height="{H_INT}" fill="{BLU}"/>\n')
    o.write(f'  <text x="24" y="44" font-size="25" font-weight="700" fill="#FFFFFF">Registro delle rilevazioni</text>\n')
    o.write(f'  <text x="996" y="40" font-size="15" fill="#C9DAE8" text-anchor="end">Mario Rossi</text>\n')
    for bx, bw, et in ((24,84,'&#8592; Menu'), (109,117,'Tutte'), (230,160,'Solo non conformi')):
        o.write(f'  <rect x="{bx}" y="57" width="{bw}" height="35" rx="3" fill="#E8EDF1"/>\n')
        o.write(f'  <text x="{bx+bw/2:.0f}" y="79" font-size="13" fill="{BLU}" text-anchor="middle">{et}</text>\n')
    # fascia bianca delle etichette
    o.write('  <rect x="0" y="110" width="1020" height="32" fill="#FFFFFF"/>\n')
    for x, w, et in COLONNE:
        o.write(f'  <text x="{x+6}" y="131" font-size="12" font-weight="700" fill="#44565F">{esc(et)}</text>\n')

    # --- GIORNATE ---------------------------------------------------
    y = H_INT
    gutter = []          # (etichetta, y centrale)
    gutter.append(('Intestazione', 76))
    for data, righe in GIORNI:
        # riepilogo iniziale
        o.write(f'  <rect x="0" y="{y}" width="1020" height="{H_RIEP}" fill="#FFFFFF"/>\n')
        o.write(f'  <text x="24" y="{y+27}" font-size="17" font-weight="700" fill="{INK}">{esc(data)}</text>\n')
        o.write(f'  <text x="860" y="{y+26}" font-size="15" font-weight="700" fill="{INK}" text-anchor="end">{len(righe)}</text>\n')
        o.write(f'  <text x="866" y="{y+26}" font-size="13" fill="{MUT}">rilevazioni</text>\n')
        o.write(f'  <line x1="24" y1="{y+H_RIEP-2}" x2="996" y2="{y+H_RIEP-2}" stroke="#BCC9CE" stroke-width="1"/>\n')
        gutter.append(('Riepilogo iniziale', y + 25))
        y += H_RIEP
        primo_corpo = y
        for r in righe:
            o.write(f'  <rect x="0" y="{y}" width="1020" height="{H_CORPO}" fill="#FFFFFF"/>\n')
            for (x, w, _), val in zip(COLONNE, r):
                if not val:
                    continue
                col = ROSSO if val == 'non conforme' else INK
                peso = '700' if val == 'non conforme' else '400'
                testo = esc(val)
                if len(testo) > 26:
                    testo = testo[:25] + '…'
                o.write(f'  <text x="{x+6}" y="{y+20}" font-size="13.5" fill="{col}" font-weight="{peso}">{testo}</text>\n')
            o.write(f'  <line x1="0" y1="{y+H_CORPO}" x2="1020" y2="{y+H_CORPO}" stroke="{LINEA}" stroke-width="1"/>\n')
            y += H_CORPO
        gutter.append(('Corpo', (primo_corpo + y) / 2 + 4))

    # --- PIE' DI PAGINA ---------------------------------------------
    o.write(f'  <rect x="0" y="{y}" width="1020" height="{H_PIE}" fill="#F2F5F6"/>\n')
    o.write(f'  <text x="24" y="{y+25}" font-size="13" fill="{MUT}">Record   1   Di   5</text>\n')
    gutter.append(("Pie' di pagina", y + 25))

    # --- cornice e gutter -------------------------------------------
    o.write(f'  <rect x="0" y="0" width="1020" height="{tot}" fill="none" stroke="currentColor" stroke-width="1" opacity=".35"/>\n')
    for et, yy in gutter:
        o.write(f'  <text x="-16" y="{yy:.0f}" font-size="12.5" fill="currentColor" opacity=".8" text-anchor="end">{esc(et)}</text>\n')
    o.write('</svg>')
    return o.getvalue()


def figura_parti():
    o = io.StringIO()
    W, H = 720, 330
    o.write(f'<svg viewBox="0 0 {W} {H}" role="img" '
            f'aria-label="Le quattro parti del formato: in Modalita Formato scheda sono una ciascuna; '
            f'a video l Intestazione e il Pie di pagina compaiono una volta sola, il Riepilogo iniziale '
            f'una volta per giornata e il Corpo una volta per rilevazione." '
            f'font-family="{FONT}">\n')
    o.write('  <defs><marker id="pf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" '
            'markerHeight="7" orient="auto-start-reverse">'
            '<path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>\n')

    o.write('  <text x="30" y="22" font-size="12.5" font-weight="700" fill="currentColor">In Modalita&#768; Formato scheda</text>\n')
    o.write('  <text x="452" y="22" font-size="12.5" font-weight="700" fill="currentColor">A video</text>\n')

    LX, LW = 30, 242          # colonna di sinistra
    RX, RW = 452, 238         # colonna di destra

    # progetto: etichetta, y, h, y-da, y-a, lane, etichetta-freccia
    prog = [
        ('Intestazione',       40, 46, 0,   143, 400, 'x 1'),
        ('Riepilogo iniziale', 86, 34, 143, 183, 408, 'x 1 per giornata'),
        ('Corpo',             120, 30, 183, 213, 416, 'x 1 per rilevazione'),
        ("Pie' di pagina",    150, 34, 213, 253, 424, 'x 1'),
    ]
    # a video: y di arrivo per ciascuna parte
    arrivo = {'Intestazione': 58, 'Riepilogo iniziale': 106, 'Corpo': 130, "Pie' di pagina": 270}

    for et, y, h, ya, yb, lane, fr in prog:
        o.write(f'  <rect x="{LX}" y="{y}" width="{LW}" height="{h}" rx="2" fill="none" '
                f'stroke="currentColor" stroke-width="1.3" opacity=".8"/>\n')
        o.write(f'  <text x="{LX+12}" y="{y+h/2+4:.0f}" font-size="12.5" fill="currentColor">{esc(et)}</text>\n')
        o.write(f'  <text x="{LX+LW-10}" y="{y+h/2+4:.0f}" font-size="10.5" fill="currentColor" opacity=".55" '
                f'text-anchor="end">y {ya}&#8211;{yb}</text>\n')

    # a video
    vid = [
        ('Intestazione',   44, 28, 'int'),
        ('11 novembre',    92, 24, 'riep'),
        ('',              116, 18, 'corpo'),
        ('',              134, 18, 'corpo'),
        ('',              152, 18, 'corpo'),
        ('10 novembre',   180, 24, 'riep'),
        ('',              204, 18, 'corpo'),
        ('',              222, 18, 'corpo'),
        ("Pie' di pagina", 256, 28, 'pie'),
    ]
    for et, y, h, kind in vid:
        if kind in ('int', 'pie'):
            op = '.16' if kind == 'int' else '.08'
            o.write(f'  <rect x="{RX}" y="{y}" width="{RW}" height="{h}" rx="2" fill="currentColor" opacity="{op}"/>\n')
            o.write(f'  <rect x="{RX}" y="{y}" width="{RW}" height="{h}" rx="2" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".8"/>\n')
        elif kind == 'riep':
            o.write(f'  <rect x="{RX}" y="{y}" width="{RW}" height="{h}" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/>\n')
        else:
            o.write(f'  <rect x="{RX}" y="{y}" width="{RW}" height="{h}" rx="2" fill="none" stroke="currentColor" '
                    f'stroke-width="1" opacity=".45" stroke-dasharray="3 3"/>\n')
        if et:
            peso = '700' if kind == 'riep' else '400'
            o.write(f'  <text x="{RX+12}" y="{y+h/2+4:.0f}" font-size="11.5" fill="currentColor" font-weight="{peso}">{esc(et)}</text>\n')

    # frecce a squadra: fuori dalla scatola, corsia verticale, dentro al bersaglio
    for et, y, h, ya, yb, lane, fr in prog:
        ys = y + h / 2
        yt = arrivo[et]
        o.write(f'  <polyline points="{LX+LW+4},{ys:.0f} {lane},{ys:.0f} {lane},{yt} {RX-4},{yt}" '
                f'fill="none" stroke="currentColor" stroke-width="1.2" opacity=".8" '
                f'marker-end="url(#pf)"/>\n')
        o.write(f'  <text x="336" y="{ys-7:.0f}" font-size="11" fill="currentColor" '
                f'text-anchor="middle" opacity=".9">{esc(fr)}</text>\n')

    o.write(f'  <text x="360" y="306" font-size="11.5" font-weight="700" fill="{ROSSO}" text-anchor="middle">'
            f'il Riepilogo iniziale compare SOLO se i record sono ordinati su Giorno</text>\n')
    o.write('</svg>')
    return o.getvalue()


if __name__ == '__main__':
    import sys
    open(sys.argv[1], 'w', encoding='utf-8').write(figura_maschera())
    open(sys.argv[2], 'w', encoding='utf-8').write(figura_parti())
    print('figure scritte')
