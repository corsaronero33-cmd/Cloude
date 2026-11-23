import io, sys
BLU='#1B3A5C'; INK='#16222A'; MUT='#5F7078'; LINEA='#D5DDE1'; ROSSO='#DD0000'
FONT='Source Sans 3, Segoe UI, sans-serif'
COL=[(81,100,'Data'),(181,120,'Origine'),(301,385,'Descrizione'),(686,90,'Gravità'),(776,100,'Stato'),(876,120,'Chiusa il')]
RIGHE=[
 ('11/11/2026','rilevazione',"Fuori limite: Frigo carni. Valore rilevato 7 °C, limiti…",'alta','aperta',''),
 ('10/11/2026','rilevazione',"Fuori limite: Abbattitore. Valore rilevato -12 °C…",'alta','aperta',''),
 ('06/11/2026','reclamo',"Cliente segnala pesce poco fresco al tavolo 4",'media','aperta',''),
 ('28/10/2026','rilevazione',"Fuori limite: Frigo cucina 1. Valore rilevato 6 °C…",'alta','chiusa','29/10/2026'),
 ('15/10/2026','verifica interna',"Etichette lotto mancanti in cella 2",'bassa','chiusa','16/10/2026'),
]
def esc(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
o=io.StringIO()
H_INT,H_C,H_P=143,30,38
tot=H_INT+H_C*len(RIGHE)+H_P
o.write(f'<svg viewBox="-20 -44 1060 {44+tot+14}" role="img" aria-label="La maschera D_NonConformita elenco a video: le non conformita aperte in cima e in rosso, sotto quelle chiuse con la data di chiusura." font-family="{FONT}">\n')
for x,w,_ in COL+[(24,51,'')]:
    o.write(f'  <line x1="{x}" y1="-16" x2="{x}" y2="-4" stroke="currentColor" opacity=".35"/>\n')
    o.write(f'  <text x="{x}" y="-22" font-size="11" fill="currentColor" opacity=".75">{x}</text>\n')
o.write('  <line x1="996" y1="-16" x2="996" y2="-4" stroke="currentColor" opacity=".35"/>\n')
o.write('  <text x="996" y="-22" font-size="11" fill="currentColor" opacity=".75" text-anchor="end">996</text>\n')
o.write(f'  <rect x="0" y="0" width="1020" height="{H_INT}" fill="{BLU}"/>\n')
o.write(f'  <text x="24" y="44" font-size="25" font-weight="700" fill="#FFFFFF">Non conformità</text>\n')
o.write(f'  <text x="996" y="40" font-size="15" fill="#C9DAE8" text-anchor="end">Mario Rossi</text>\n')
for bx,bw,et in ((24,84,'&#8592; Menu'),(109,117,'Tutte'),(230,160,'Solo aperte')):
    o.write(f'  <rect x="{bx}" y="57" width="{bw}" height="35" rx="3" fill="#E8EDF1"/>\n')
    o.write(f'  <text x="{bx+bw/2:.0f}" y="79" font-size="13" fill="{BLU}" text-anchor="middle">{et}</text>\n')
o.write('  <line x1="0" y1="101" x2="1020" y2="101" stroke="#FFFFFF" opacity=".35"/>\n')
o.write('  <rect x="0" y="110" width="1020" height="32" fill="#FFFFFF"/>\n')
for x,w,et in COL:
    o.write(f'  <text x="{x+6}" y="131" font-size="12" font-weight="700" fill="#44565F">{esc(et)}</text>\n')
y=H_INT
for r in RIGHE:
    o.write(f'  <rect x="0" y="{y}" width="1020" height="{H_C}" fill="#FFFFFF"/>\n')
    o.write(f'  <rect x="24" y="{y+2}" width="51" height="26" rx="3" fill="#E8EDF1"/>\n')
    o.write(f'  <text x="49.5" y="{y+20}" font-size="12" fill="{BLU}" text-anchor="middle">Apri</text>\n')
    for (x,w,_),v in zip(COL,r):
        if not v: continue
        rosso = v=='aperta'
        t=esc(v)
        if len(t)>52: t=t[:51]+'…'
        o.write(f'  <text x="{x+6}" y="{y+20}" font-size="13.5" fill="{ROSSO if rosso else INK}" font-weight="{700 if rosso else 400}">{t}</text>\n')
    o.write(f'  <line x1="0" y1="{y+H_C}" x2="1020" y2="{y+H_C}" stroke="{LINEA}"/>\n')
    y+=H_C
o.write(f'  <rect x="0" y="{y}" width="1020" height="{H_P}" fill="#F2F5F6"/>\n')
o.write(f'  <text x="24" y="{y+24}" font-size="13" fill="{MUT}">Record   1   Di   5</text>\n')
o.write(f'  <rect x="0" y="0" width="1020" height="{tot}" fill="none" stroke="currentColor" opacity=".35"/>\n')
o.write('</svg>')
open(sys.argv[1],'w',encoding='utf-8').write(o.getvalue()); print('ok')
