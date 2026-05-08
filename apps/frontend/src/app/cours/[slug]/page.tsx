import { getChapters } from "@/lib/api"
import { AmbientBlobs } from "@/components/ui/ambient-blobs"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { BookOpen, ChevronRight, Hash } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function CoursPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getChapters(slug).catch(() => notFound())
  const { subject_name, chapters } = data

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <AmbientBlobs />
      <Breadcrumb items={[{ label: "Accueil", href: "/accueil" }, { label: subject_name }]} />

      <main className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-2">Cours</p>
          <h1 className="text-3xl font-extrabold text-white mb-1">{subject_name}</h1>
          <p className="text-white/40 text-sm">{chapters.length} chapitres disponibles</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chapter) => (
            <Link key={chapter.id} href={`/cours/${slug}/${chapter.id}`}>
              <div className="group flex flex-col h-full rounded-2xl bg-white/[0.04] border border-white/[0.07] p-5 hover:bg-white/[0.07] hover:border-white/[0.13] transition-all duration-200 cursor-pointer">
                {chapter.chapter_number && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <Hash className="w-3.5 h-3.5 text-cyan-500/70" />
                    <span className="text-xs text-cyan-400/60 font-mono font-medium">
                      Chapitre {chapter.chapter_number}
                      {chapter.page_number ? ` — p.${chapter.page_number}` : ""}
                    </span>
                  </div>
                )}

                <h2 className="text-sm font-bold text-white mb-1 leading-snug flex-1">
                  {chapter.title}
                </h2>
                {chapter.title_fr && (
                  <p className="text-xs text-white/35 mb-4">{chapter.title_fr}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <BookOpen className="w-3.5 h-3.5" />
                    {chapter.item_count} entrées
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
