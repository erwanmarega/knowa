"use client"

import { useState } from "react"
import { FileText, X, ExternalLink } from "lucide-react"
import { getDocumentUrl, Document } from "@/lib/api"

export function DocumentViewer({ documents }: { documents: Document[] }) {
  const [openDoc, setOpenDoc] = useState<{ id: number; url: string; filename: string } | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  async function openDocument(doc: Document) {
    setLoadingId(doc.id)
    try {
      const { url, filename } = await getDocumentUrl(doc.id)
      setOpenDoc({ id: doc.id, url, filename })
    } catch {
      alert("Impossible de charger le document")
    } finally {
      setLoadingId(null)
    }
  }

  if (documents.length === 0) return null

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => openDocument(doc)}
          disabled={loadingId === doc.id}
          className="w-full flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.07] hover:border-white/[0.15] transition-colors text-left disabled:opacity-50"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="flex-1 text-sm text-white/80 truncate">{doc.filename}</span>
          <span className="text-xs text-white/30">{loadingId === doc.id ? "Chargement…" : "Voir"}</span>
        </button>
      ))}

      {openDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpenDoc(null)}
        >
          <div
            className="bg-[#0a0f1a] border border-white/10 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm text-white/70 truncate">{openDoc.filename}</span>
              <div className="flex items-center gap-2">
                <a
                  href={openDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setOpenDoc(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe src={openDoc.url} className="flex-1 w-full bg-white" title={openDoc.filename} />
          </div>
        </div>
      )}
    </div>
  )
}
