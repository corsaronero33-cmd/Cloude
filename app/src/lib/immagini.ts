// Preparazione delle foto prima di conservarle.
//
// Una foto di un telefono di oggi pesa fra i tre e i sei megabyte. Un tecnico
// che ne scatta quattro per intervento riempirebbe in fretta la memoria del
// telefono e brucerebbe il traffico dati della sua scheda. Ridotta a 1600 pixel
// di lato lungo e salvata in JPEG, la stessa foto pesa qualche centinaio di
// chilobyte e si vede benissimo: per documentare un guasto serve riconoscere il
// pezzo, non contare i pixel.

export interface Ridotta {
  blob: Blob
  tipo: string
  dimensione: number
}

/**
 * Riduce l'immagine e la converte in JPEG. Se qualcosa non va -- un formato che
 * il browser non sa aprire, un telefono troppo vecchio -- restituisce il file
 * originale invece di far fallire lo scatto: meglio una foto pesante che
 * nessuna foto.
 */
export async function riduci(file: File, latoMax = 1600, qualita = 0.8): Promise<Ridotta> {
  const originale: Ridotta = {
    blob: file,
    tipo: file.type || 'image/jpeg',
    dimensione: file.size,
  }

  try {
    const immagine = await creaBitmap(file)
    if (!immagine) return originale

    const scala = Math.min(1, latoMax / Math.max(immagine.width, immagine.height))
    const larghezza = Math.round(immagine.width * scala)
    const altezza = Math.round(immagine.height * scala)

    const tela = document.createElement('canvas')
    tela.width = larghezza
    tela.height = altezza
    const ctx = tela.getContext('2d')
    if (!ctx) return originale
    ctx.drawImage(immagine, 0, 0, larghezza, altezza)
    if ('close' in immagine) immagine.close()

    const ridotto = await new Promise<Blob | null>((risolvi) => {
      tela.toBlob(risolvi, 'image/jpeg', qualita)
    })
    if (!ridotto) return originale

    // Se la riduzione non guadagna niente (una foto gia' piccola), si tiene
    // l'originale: ricomprimere un JPEG lo peggiora e basta.
    if (ridotto.size >= file.size) return originale

    return { blob: ridotto, tipo: 'image/jpeg', dimensione: ridotto.size }
  } catch {
    return originale
  }
}

async function creaBitmap(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  // createImageBitmap raddrizza da solo le foto scattate in verticale, che
  // altrimenti uscirebbero coricate.
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Qualche browser non accetta le opzioni: si riprova senza.
      try {
        return await createImageBitmap(file)
      } catch {
        /* si passa al ripiego */
      }
    }
  }
  return await new Promise<HTMLImageElement | null>((risolvi) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      risolvi(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      risolvi(null)
    }
    img.src = url
  })
}

/** Quanto pesa, detto in modo leggibile. */
export function pesoLeggibile(byte: number | null | undefined): string {
  if (!byte) return ''
  if (byte < 1024) return `${byte} B`
  if (byte < 1024 * 1024) return `${Math.round(byte / 1024)} kB`
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`
}
