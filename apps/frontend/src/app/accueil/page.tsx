"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Globe } from "@/components/ui/globe"
import { AmbientBlobs } from "@/components/ui/ambient-blobs"
import { motion } from "framer-motion"
import {
  Book, Atom, Globe as GlobeIcon, BookText, Languages,
  Sparkles, Trophy, Target, Star, ChevronRight, Map,
} from "lucide-react"
import type { COBEOptions } from "cobe"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

const GLOBE_CONFIG: COBEOptions = {
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

const subjects = [
  {
    title: "Mathématiques",
    description: "Algèbre, géométrie, probabilités",
    Icon: Book,
    iconGradient: "from-blue-500 to-cyan-400",
    barGradient: "from-blue-500 to-cyan-400",
    progress: 0,
    lessons: 24,
    href: null,
  },
  {
    title: "Physique",
    description: "Mécanique, ondes, électricité",
    Icon: Atom,
    iconGradient: "from-violet-500 to-purple-400",
    barGradient: "from-violet-500 to-purple-400",
    progress: 0,
    lessons: 18,
    href: null,
  },
  {
    title: "Espace",
    description: "Planètes, étoiles, cosmologie",
    Icon: GlobeIcon,
    iconGradient: "from-pink-500 to-orange-400",
    barGradient: "from-pink-500 to-orange-400",
    progress: 0,
    lessons: 12,
    href: null,
  },
  {
    title: "Français",
    description: "Grammaire, conjugaison, vocabulaire",
    Icon: BookText,
    iconGradient: "from-rose-500 to-pink-400",
    barGradient: "from-rose-500 to-pink-400",
    progress: 0,
    lessons: 30,
    href: null,
  },
  {
    title: "Anglais",
    description: "Compréhension, expression, culture",
    Icon: Languages,
    iconGradient: "from-emerald-500 to-green-400",
    barGradient: "from-emerald-500 to-green-400",
    progress: 0,
    lessons: 20,
    href: "/cours/anglais",
  },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function Dashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white overflow-x-hidden">
      <AmbientBlobs variant="home" />

      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 h-16 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">Mon Espace Savoir</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-yellow-300/80 font-medium">Niveau 3</span>
          </div>
          <button
            onClick={() => { logout(); router.push('/login') }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold shadow-md hover:opacity-80 transition-opacity"
            title="Se déconnecter"
          >
            {user.username[0].toUpperCase()}
          </button>
        </div>
      </nav>

      <main className="relative z-10 px-6 md:px-10 pt-10 pb-16 max-w-6xl mx-auto">

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <p className="text-xs text-white/30 mb-2 tracking-widest uppercase font-semibold">Tableau de bord</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Bonjour,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {user.username}
            </span>{" "}
            !
          </h1>
          <p className="text-white/40 text-sm md:text-base mb-7">Reprends là où tu t&apos;es arrêté.</p>

          <div className="flex flex-wrap gap-2">
            <StatPill icon={<Book className="w-3.5 h-3.5 text-cyan-400" />} label="5 matières" />
            <StatPill icon={<Target className="w-3.5 h-3.5 text-violet-400" />} label="15 quiz terminés" />
            <StatPill icon={<Star className="w-3.5 h-3.5 text-yellow-400" />} label="320 points" />
          </div>
        </motion.section>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Matières</h2>
          <span className="text-xs text-white/20">{subjects.length} disponibles</span>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
        >
          {subjects.map((s) => (
            <motion.div key={s.title} variants={fadeUp} className="h-full">
              <SubjectCard {...s} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <QuizCard />
        </motion.div>
      </main>
    </div>
  )
}

function StatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-2 text-sm text-white/55">
      {icon}
      {label}
    </div>
  )
}

type Subject = typeof subjects[0]

function SubjectCard({ title, description, Icon, iconGradient, barGradient, progress, lessons, href }: Subject) {
  const card = (
    <motion.div
      whileHover={{ y: -4, scale: 1.012 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="group relative flex flex-col h-full rounded-2xl bg-white/[0.04] border border-white/[0.07] p-6 overflow-hidden hover:border-white/[0.13] hover:bg-white/[0.06] transition-colors duration-300 cursor-pointer"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center mb-5 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-white/40 mb-6 flex-1 leading-relaxed">{description}</p>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-white/25 mb-2">
          <span>Progression</span>
          <span className="font-medium text-white/40">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.07]">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/20">{lessons} leçons</span>
        <span className={`flex items-center gap-1 text-xs font-semibold transition-colors ${href ? "text-white/60 group-hover:text-white" : "text-white/25"}`}>
          {href ? "Voir les cours" : "Bientôt disponible"}
          {href && <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />}
        </span>
      </div>
    </motion.div>
  )

  if (href) return <Link href={href} className="h-full">{card}</Link>
  return card
}

function QuizCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-[#040f1e] to-[#060a1a]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1.5 mb-6">
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-cyan-300 font-medium">Quiz interactif</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Quiz de Géographie
          </h3>
          <p className="text-white/45 text-sm md:text-base mb-7 max-w-md leading-relaxed">
            Teste tes connaissances sur les capitales du monde. Tourne le globe et affronte les questions !
          </p>

          <div className="flex items-center gap-5 mb-8 justify-center md:justify-start">
            <Stat value="15" label="questions" />
            <div className="w-px h-8 bg-white/10" />
            <Stat value="~3" label="minutes" />
            <div className="w-px h-8 bg-white/10" />
            <Stat value="🌍" label="monde" />
          </div>

          <Link href="/quiz">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-shadow duration-300"
            >
              Lancer le quiz
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>

        <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px] shrink-0">
          <Globe config={GLOBE_CONFIG} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] to-blue-500/[0.04]" />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-white/30">{label}</p>
    </div>
  )
}
