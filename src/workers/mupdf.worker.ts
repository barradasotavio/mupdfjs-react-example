/// <reference lib="webworker" />
import * as Comlink from 'comlink'

export const MUPDF_LOADED = 'MUPDF_LOADED'

const mupdfScript = import.meta.env.PROD ? '/assets/mupdf.js' : '/node_modules/mupdf/dist/mupdf.js'

export class MupdfWorker {
  private mupdf?: any
  private document?: any

  constructor() {
    this.initializeMupdf()
  }

  private async initializeMupdf() {
    try {
      // Dynamically import the MuPDF library
      const mupdfModule = await import(/* @vite-ignore */ mupdfScript)
      this.mupdf = mupdfModule
      postMessage(MUPDF_LOADED) // Notify the main thread that MuPDF is ready
    } catch (error) {
      console.error('Failed to initialize MuPDF:', error)
    }
  }

  async loadDocument(document: ArrayBuffer): Promise<boolean> {
    if (!this.mupdf) throw new Error('MuPDF not initialized')
    try {
      this.document = this.mupdf.Document.openDocument(document, 'application/pdf')
      return true
    } catch (error) {
      console.error('Error loading document:', error)
      throw new Error('Failed to load document')
    }
  }

  async renderPageAsImage(pageIndex: number = 0, scale: number = 1): Promise<Uint8Array> {
    if (!this.mupdf || !this.document) throw new Error('Document not loaded')
    try {
      const page = this.document.loadPage(pageIndex)
      const pixmap = page.toPixmap([scale, 0, 0, scale, 0, 0], this.mupdf.ColorSpace.DeviceRGB)
      return pixmap.asPNG()
    } catch (error) {
      console.error('Error rendering page:', error)
      throw new Error('Failed to render page')
    }
  }
}

Comlink.expose(new MupdfWorker())
