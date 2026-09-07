"use client"

import { useState } from "react"
import { BookOpen, PencilLine, CheckCircle2, FileText, X, ExternalLink, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getDocumentUrl, ApiError, Document, DocumentKind } from "@/lib/api"

type KindMeta = {
  label: string
  hint: string
  Icon: typeof BookOpen
  iconBg: string
  accent: string
  border: string
  cta: string
}

const KINDS: Record<DocumentKind, KindMeta> = {
  cours: {
    label: "Cours",
    hint: "Le contenu théorique du chapitre",
    Icon: BookOpen,
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-400",
    accent: "text-violet-300",
    border: "hover:border-violet-400/30",
    cta: "Lire le cours",
  },
  exos: {
    label: "Exercices",
    hint: "À faire avant de regarder la correction",
    Icon: PencilLine,
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-400",
    accent: "text-cyan-300",
    border: "hover:border-cyan-400/30",
    cta: "Ouvrir les exos",
  },
  correction: {
    label: "Correction",
    hint: "La solution détaillée des exercices",
    Icon: CheckCircle2,
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-400",
    accent: "text-amber-300",
    border: "hover:border-amber-400/30",
    cta: "Voir la correction",
  },
}

const FALLBACK: KindMeta = {
  label: "Document",
  hint: "",
  Icon: FileText,
  iconBg: "bg-gradient-to-br from-slate-500 to-slate-400",
  accent: "text-white/60",
  border: "hover:border-white/20",
  cta: "Ouvrir",
}

const metaFor = (kind: DocumentKind | null) => (kind ? KINDS[kind] ?? FALLBACK : FALLBACK)

export function DocumentViewer({ documents }: { documents: Document[] }) {
  const router = useRouter()
  const [openDoc, setOpenDoc] = useState<{ url: string; filename: string } | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function openDocument(doc: Document) {
    setLoadingId(doc.id)
    setError(null)
    try {
      const { url, filename } = await getDocumentUrl(doc.id)
      setOpenDoc({ url, filename })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Connecte-toi pour accéder à ce document.")
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      } else {
        setError("Impossible de charger le document. Réessaie dans un instant.")
      }
    } finally {
      setLoadingId(null)
    }
  }

  if (documents.length === 0) return null

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-300/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {documents.map((doc) => {
        const { label, hint, Icon, iconBg, accent, border, cta } = metaFor(doc.kind)
        const loading = loadingId === doc.id

        return (
          <button
            key={doc.id}
            onClick={() => openDocument(doc)}
            disabled={loading}
            className={`group w-full flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 text-left transition-colors hover:bg-white/[0.05] disabled:opacity-60 ${border}`}
          >
            <div className={`w-11 h-11 shrink-0 rounded-xl ${iconBg} flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold mb-0.5 ${accent}`}>{label}</p>
              <p className="text-xs text-white/30 truncate">{hint || doc.filename}</p>
            </div>

            <span className="shrink-0 flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/60 group-hover:text-white group-hover:border-white/20 group-hover:bg-white/[0.08] transition-all">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {loading ? "Chargement" : cta}
            </span>
          </button>
        )
      })}

      {openDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenDoc(null)}
        >
          <div
            className="bg-[#0a0f1a] border border-white/10 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <span className="text-sm text-white/70 truncate font-medium">{openDoc.filename}</span>
              <div className="flex items-center gap-1">
                <a
                  href={openDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setOpenDoc(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
                  title="Fermer"
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
