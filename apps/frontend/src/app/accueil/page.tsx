"use client"

import { Globe } from "@/components/ui/globe"
import { motion } from "framer-motion"
import { Book, Atom, Globe as GlobeIcon, BookText, Languages } from "lucide-react"
import type { COBEOptions } from "cobe"
import Link from "next/link"


export default function Dashboard() {
  const GLOBE_CONFIG_EARTH_COLORS: COBEOptions = {
    width: 800,
    height: 800,
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 1,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 3,
    baseColor: [0.2, 0.4, 1],
    markerColor: [0.8, 0.5, 0.1],
    glowColor: [0.1, 0.6, 1],
    markers: [],
    onRender: () => {},
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-sans">
      <main className="relative z-10 px-6 py-10">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Bienvenue 👋</h1>
            <p className="text-gray-400 mt-2 text-base">Explore les matières ou le globe interactif.</p>
          </div>
        </header>

        <section className="mb-16 flex flex-col items-center gap-10">
  <div className="flex flex-wrap justify-center gap-8">
    <SubjectCard
      title="Mathématiques"
      description="Algèbre, géométrie, probabilités"
      icon={<Book className="w-7 h-7 text-white" />}
      bg="bg-gradient-to-br from-blue-600 to-cyan-500"
    />
    <SubjectCard
      title="Physique"
      description="Mécanique, ondes, électricité"
      icon={<Atom className="w-7 h-7 text-white" />}
      bg="bg-gradient-to-br from-indigo-600 to-purple-600"
    />
    <SubjectCard
      title="Espace"
      description="Planètes, étoiles, cosmologie"
      icon={<GlobeIcon className="w-7 h-7 text-white" />}
      bg="bg-gradient-to-br from-pink-500 to-yellow-400"
    />
  </div>

  {/* Ligne du bas : 2 cards */}
  <div className="flex flex-wrap justify-center gap-8">
    <SubjectCard
      title="Français"
      description="Grammaire, conjugaison, vocabulaire"
      icon={<BookText className="w-7 h-7 text-white" />}
      bg="bg-gradient-to-br from-red-500 to-pink-600"
    />
    <SubjectCard
      title="Anglais"
      description="Compréhension, expression, culture"
      icon={<Languages className="w-7 h-7 text-white" />}
      bg="bg-gradient-to-br from-green-500 to-emerald-500"
    />
  </div>
</section>


<section className="relative w-full max-w-[360px] mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg px-6 py-6 overflow-hidden">
  <div className="relative z-10 mb-4 text-center">
    <h2 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
      🌍 Quiz de Géographie
    </h2>
    <p className="mt-1 text-sm text-gray-300">Explore le monde avec le globe interactif.</p>
  </div>

  <div className="relative z-10 flex items-center justify-center">
    <div className="w-[200px] aspect-square">
      <Globe className="w-[200px] h-[200px]" config={GLOBE_CONFIG_EARTH_COLORS} />
    </div>
  </div>

  <Link href="/quiz">
  <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition text-white text-sm font-medium shadow">
    Lancer le quiz →
  </button>
</Link>

  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent z-0" />
</section>


      </main>
    </div>
  )
}

function SubjectCard({
  title,
  description,
  icon,
  bg,
}: {
  title: string
  description: string
  icon: React.ReactNode
  bg: string
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300"
    >
      <div className={`absolute -top-5 -right-5 rounded-full p-3 ${bg} shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-300 mb-4">{description}</p>
      <button className="text-sm font-medium text-cyan-400 hover:underline">Commencer →</button>
    </motion.div>
  )
}
