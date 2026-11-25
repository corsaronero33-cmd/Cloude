import io, sys
BLU='#1B3A5C'; INK='#16222A'; MUT='#5F7078'; ROSSO='#DD0000'; FONDO='#FFFFFF'; BORDO='#C9D3D8'; CORNICE='#A9B6BD'
FONT='Source Sans 3, Segoe UI, sans-serif'
o=io.StringIO()
W,H=1020,1011
def esc(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def cornice(y,h,titolo,largo):
    # il corpo e' bianco: la cornice e' solo bordo; il titolo sta SULLA linea,
    # testo alto 23 a y-12 con fondo bianco che interrompe il bordo
    o.write(f'  <rect x="14" y="{y}" width="982" height="{h}" rx="5" fill="none" stroke="{CORNICE}"/>\n')
    o.write(f'  <rect x="28" y="{y-12}" width="{largo}" height="23" fill="#FFFFFF"/>\n')
    o.write(f'  <text x="34" y="{y+5}" font-size="13" font-weight="700" fill="{BLU}" letter-spacing=".06em">{esc(titolo)}</text>\n')
def etichetta(x_dx,y,testo):
    o.write(f'  <text x="{x_dx}" y="{y+21}" font-size="13" fill="{MUT}" text-anchor="end">{esc(testo)}</text>\n')
def campo(x,y,w,h,testo,tipo='',colore=INK,peso=400,grigio=False):
    o.write(f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{"#F4F6F7" if grigio else "#FFFFFF"}" stroke="{BORDO}"/>\n')
    righe=testo.split('\n')
    for i,r in enumerate(righe):
        o.write(f'  <text x="{x+8}" y="{y+21+i*18}" font-size="13.5" fill="{colore}" font-weight="{peso}">{esc(r)}</text>\n')
    if tipo=='discesa':
        o.write(f'  <path d="M {x+w-20} {y+13} l 6 7 l 6 -7" fill="none" stroke="{MUT}" stroke-width="1.5"/>\n')
    if tipo=='calendario':
        o.write(f'  <rect x="{x+w-24}" y="{y+8}" width="16" height="15" rx="2" fill="none" stroke="{MUT}"/><line x1="{x+w-24}" y1="{y+13}" x2="{x+w-8}" y2="{y+13}" stroke="{MUT}"/>\n')
o.write(f'<svg viewBox="-150 -44 {W+192} {H+54}" role="img" aria-label="La maschera D_NonConformita scheda su fondo bianco: tre cornici con il titolo sulla linea, cosa e successo, cosa si e fatto e la chiusura, piu le note; in alto i pulsanti Elenco, Nuova, Salva, Annulla modifiche e Chiudi la non conformita." font-family="{FONT}">\n')
o.write(f'  <rect x="0" y="0" width="{W}" height="{H}" fill="{FONDO}"/>\n')
# righello: le X che contano
for xr,anc in ((14,'start'),(147,'middle'),(459,'middle'),(621,'middle'),(969,'end'),(996,'end'),(1020,'start')):
    o.write(f'  <line x1="{xr}" y1="-14" x2="{xr}" y2="0" stroke="currentColor" opacity=".55"/>\n')
    o.write(f'  <text x="{xr+(3 if anc=="start" else -3 if anc=="end" else 0)}" y="-19" font-size="12" fill="currentColor" opacity=".8" text-anchor="{anc}">{xr}</text>\n')
o.write(f'  <text x="-16" y="-19" font-size="12" fill="currentColor" opacity=".8" text-anchor="end">X</text>\n')
# intestazione
o.write(f'  <rect x="0" y="0" width="{W}" height="100" fill="{BLU}"/>\n')
o.write(f'  <text x="24" y="44" font-size="25" font-weight="700" fill="#FFFFFF">NON CONFORMITÀ</text>\n')
o.write(f'  <text x="996" y="40" font-size="15" fill="#C9DAE8" text-anchor="end">Mario Rossi</text>\n')
for bx,bw,et in ((24,117,'Elenco'),(146,117,'Nuova'),(268,117,'Salva'),(390,191,'Annulla modifiche')):
    o.write(f'  <rect x="{bx}" y="57" width="{bw}" height="35" rx="3" fill="#E8EDF1"/>\n')
    o.write(f'  <text x="{bx+bw/2:.0f}" y="79" font-size="13" fill="{BLU}" text-anchor="middle">{et}</text>\n')
o.write(f'  <rect x="756" y="57" width="240" height="35" rx="3" fill="#FFFFFF"/>\n')
o.write(f'  <text x="876" y="79" font-size="13.5" font-weight="700" fill="{BLU}" text-anchor="middle">Chiudi la non conformità</text>\n')
# misure: 09-MASCHERE.md, Misure standard (rilevate dal DDR Rev 21)
# cornice 1
cornice(116,232,'COSA È SUCCESSO',141)
etichetta(136,142,'Data'); campo(147,142,312,32,'11/11/2026','calendario')
etichetta(610,142,'Origine'); campo(621,142,348,32,'rilevazione','discesa')
etichetta(136,182,'Gravità'); campo(147,182,312,32,'alta','discesa')
etichetta(610,182,'Rilevata da'); campo(621,182,348,32,'Rossi Mario','discesa')
etichetta(136,222,'Descrizione'); campo(147,222,822,100,'Fuori limite: Frigo carni. Valore rilevato 7 °C,\nlimiti ammessi da 0 a 4.')
# cornice 2
cornice(392,132,'COSA SI È FATTO',141)
etichetta(136,418,'Azione corr.'); campo(147,418,822,80,'Spostati i prodotti nel frigo 2. Chiamato il tecnico:\nguarnizione della porta sostituita.')
# cornice 3
cornice(568,212,'CHIUSURA',90)
etichetta(136,594,'Verifica'); campo(147,594,822,80,'Rimisurato il giorno dopo alle 7:00 e alle 12:00:\n3 °C e 3,5 °C.')
etichetta(136,682,'Esito'); campo(147,682,312,32,'efficace','discesa')
etichetta(610,682,'Stato'); campo(621,682,348,32,'aperta',colore=ROSSO,peso=700,grigio=True)
etichetta(136,722,'Chiusa il'); campo(147,722,312,32,'',grigio=True)
etichetta(610,722,'Chiusa da'); campo(621,722,348,32,'',grigio=True)
# note
o.write(f'  <text x="14" y="809" font-size="13" fill="{MUT}">Note</text>\n')
campo(14,815,982,110,'')
# piede
o.write(f'  <rect x="0" y="973" width="{W}" height="38" fill="#F2F5F6"/>\n')
o.write(f'  <text x="24" y="997" font-size="13" fill="{MUT}">Record   3   Di   5</text>\n')
o.write(f'  <rect x="0" y="0" width="{W}" height="{H}" fill="none" stroke="currentColor" opacity=".35"/>\n')
# sezioni a sinistra
for et,y in (('Intestazione',54),('Corpo',540),("Piè di pagina",997)):
    o.write(f'  <text x="-16" y="{y}" font-size="13" fill="currentColor" opacity=".8" text-anchor="end">{esc(et)}</text>\n')
for y in (100,973):
    o.write(f'  <line x1="-140" y1="{y}" x2="-6" y2="{y}" stroke="currentColor" opacity=".3" stroke-dasharray="3 3"/>\n')
    o.write(f'  <text x="-140" y="{y-4}" font-size="11" fill="currentColor" opacity=".6">y {y}</text>\n')
# grigio = sola lettura
o.write(f'  <text x="621" y="798" font-size="11.5" fill="{MUT}">in grigio: li scrive lo script, non si toccano</text>\n')
o.write('</svg>')
open(sys.argv[1],'w',encoding='utf-8').write(o.getvalue()); print('ok')
