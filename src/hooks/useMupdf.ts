import * as Comlink from 'comlink'
import { useEffect, useRef, useState } from 'react'
import type { MupdfWorker } from '../workers/mupdf.worker'

// Initialize the worker and wrap it with Comlink
const worker = new Worker(new URL('../workers/mupdf.worker', import.meta.url), { type: 'module' })
const mupdfWorker = Comlink.wrap<MupdfWorker>(worker)

export function useMupdf() {
  const [workerInitialized, setWorkerInitialized] = useState(false)
  const documentRef = useRef<ArrayBuffer | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    // Listen for the worker initialization message
    const handleWorkerMessage = (event: MessageEvent) => {
      if (event.data === 'MUPDF_LOADED') {
        setWorkerInitialized(true)
      }
    }

    worker.addEventListener('message', handleWorkerMessage)

    return () => {
      worker.removeEventListener('message', handleWorkerMessage)
    }
  }, [])

  const loadDocument = async (arrayBuffer: ArrayBuffer) => {
    documentRef.current = arrayBuffer
    return mupdfWorker.loadDocument(arrayBuffer)
  }

  const renderPage = async (pageIndex: number) => {
    if (!documentRef.current) throw new Error('Document not loaded')
    setCurrentPage(pageIndex)
    return mupdfWorker.renderPageAsImage(pageIndex, (window.devicePixelRatio * 96) / 72)
  }

  return {
    workerInitialized,
    loadDocument,
    renderPage,
    currentPage,
  }
}
