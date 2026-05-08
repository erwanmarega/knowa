"use client"

import { Item } from "@/lib/api"
import { useState } from "react"

const COLUMN_ORDER = ["Base Verbale", "Prétérit", "Participe Passé", "Traduction"]

export function VerbTableViewer({ items }: { items: Item[] }) {
  const [search, setSearch] = useState("")

  const headers = COLUMN_ORDER.filter((h) =>
    items.some((i) => h in i.content)
  )

  const filtered = search
    ? items.filter((item) =>
        Object.values(item.content).some((v) =>
          v.toLowerCase().includes(search.toLowerCase())
        )
      )
    : items

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un verbe..."
          className="w-full max-w-sm bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-colors"
        />
      </div>

      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.03]">
              {headers.map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr
                key={item.id}
                className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.04] ${
                  idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                }`}
              >
                {headers.map((h, i) => (
                  <td
                    key={h}
                    className={`px-5 py-3.5 ${
                      i === 0
                        ? "font-semibold text-white"
                        : i === headers.length - 1
                        ? "text-cyan-400/80"
                        : "text-white/60"
                    }`}
                  >
                    {item.content[h] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-white/30 text-sm py-10">Aucun résultat</p>
        )}
      </div>

      <p className="text-xs text-white/20 mt-4 text-right">{filtered.length} verbe(s)</p>
    </div>
  )
}
