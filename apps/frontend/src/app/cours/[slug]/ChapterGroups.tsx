"use client"

import { Chapter } from "@/lib/api"
import { BookOpen, ChevronRight, Hash, ChevronDown, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

function ChapterCard({ chapter, slug }: { chapter: Chapter; slug: string }) {
  return (
    <Link href={`/cours/${slug}/${chapter.id}`}>
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
        <h2 className="text-sm font-bold text-white mb-1 leading-snug flex-1">{chapter.title}</h2>
        {chapter.title_fr && (
          <p className="text-xs text-white/35 mb-4">{chapter.title_fr}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            {chapter.item_count > 0 ? (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                {chapter.item_count} entrées
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                {chapter.document_count} document{chapter.document_count > 1 ? "s" : ""}
              </>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  )
}

type Group = { name: string | null; chapters: Chapter[] }

export function ChapterGroups({ groups, slug }: { groups: Group[]; slug: string }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(
    new Set(groups.map((g) => g.name).filter(Boolean) as string[])
  )

  const toggle = (name: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  return (
    <div className="space-y-6">
      {groups.map((group, i) => {
        const isOpen = !group.name || !collapsed.has(group.name)
        return (
          <div key={i}>
            {group.name ? (
              <button
                onClick={() => toggle(group.name!)}
                className="w-full flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06] group/header"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/40 group-hover/header:text-white/60 transition-colors">
                    {group.name}
                  </span>
                  {(() => {
                    const nums = group.chapters.map((c) => c.chapter_number).filter(Boolean) as number[]
                    if (nums.length === 0) return null
                    const min = Math.min(...nums)
                    const max = Math.max(...nums)
                    return (
                      <span className="text-xs font-mono text-white/20">
                        {min === max ? `Chap ${min}` : `Chap ${min}–${max}`}
                      </span>
                    )
                  })()}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/20 group-hover/header:text-white/40 transition-all duration-200 ${
                    isOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>
            ) : null}

            {isOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.chapters.map((chapter) => (
                  <ChapterCard key={chapter.id} chapter={chapter} slug={slug} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
