import { getChapters, Chapter } from "@/lib/api"
import { AmbientBlobs } from "@/components/ui/ambient-blobs"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { notFound } from "next/navigation"
import { ChapterGroups } from "./ChapterGroups"

export default async function CoursPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getChapters(slug).catch(() => notFound())
  const { subject_name, chapters } = data

  const sorted = [...chapters].sort((a, b) => (a.chapter_number ?? 0) - (b.chapter_number ?? 0))

  const grouped = sorted.reduce<{ name: string | null; chapters: Chapter[] }[]>((acc, ch) => {
    const last = acc[acc.length - 1]
    if (last && last.name === (ch.group_name ?? null)) {
      last.chapters.push(ch)
    } else {
      acc.push({ name: ch.group_name, chapters: [ch] })
    }
    return acc
  }, [])

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

        <ChapterGroups groups={grouped} slug={slug} />
      </main>
    </div>
  )
}
