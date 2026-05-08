import { getChapterItems } from "@/lib/api"
import { AmbientBlobs } from "@/components/ui/ambient-blobs"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { notFound } from "next/navigation"
import { VocabularyViewer } from "./VocabularyViewer"
import { VerbTableViewer } from "./VerbTableViewer"

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapterId: string }>
}) {
  const { slug, chapterId } = await params

  const data = await getChapterItems(chapterId).catch(() => notFound())
  const { chapter, items } = data
  const type = items[0]?.type ?? "vocabulary"

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <AmbientBlobs />
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/accueil" },
          { label: chapter.subject_name, href: `/cours/${slug}` },
          { label: chapter.title },
        ]}
      />

      <main className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
        <div className="mb-10">
          {chapter.chapter_number && (
            <p className="text-xs text-cyan-400/60 font-mono uppercase tracking-widest mb-2">
              Chapitre {chapter.chapter_number}
              {chapter.page_number ? ` — page ${chapter.page_number}` : ""}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">{chapter.title}</h1>
          {chapter.title_fr && (
            <p className="text-white/40 text-base">{chapter.title_fr}</p>
          )}
          <p className="text-white/25 text-sm mt-2">{items.length} entrées</p>
        </div>

        {type === "vocabulary" && <VocabularyViewer items={items} />}
        {type === "verb_table" && <VerbTableViewer items={items} />}
      </main>
    </div>
  )
}
