"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Sparkles, ChevronRight, BookOpen, Layers, Languages, Atom, Sigma,
  Globe as GlobeIcon, BookText, Map, LogOut, Lock, ArrowUpRight, Type, FileText,
} from "lucide-react"
import type { COBEOptions } from "cobe"
import { Globe } from "@/components/ui/globe"
import { AmbientBlobs } from "@/components/ui/ambient-blobs"
import { useAuth } from "@/context/AuthContext"
import { getSubjectsClient, Subject } from "@/lib/api"

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

type Theme = {
  Icon: typeof Languages
  gradient: string
  glow: string
  ring: string
  text: string
}

const THEMES: Record<string, Theme> = {
  anglais: {
    Icon: Languages,
    gradient: "from-emerald-500 to-teal-400",
    glow: "bg-emerald-500/20",
    ring: "group-hover:border-emerald-400/30",
    text: "text-emerald-300",
  },
  mathematiques: {
    Icon: Sigma,
    gradient: "from-blue-500 to-cyan-400",
    glow: "bg-blue-500/20",
    ring: "group-hover:border-blue-400/30",
    text: "text-blue-300",
  },
  physique: {
    Icon: Atom,
    gradient: "from-violet-500 to-purple-400",
    glow: "bg-violet-500/20",
    ring: "group-hover:border-violet-400/30",
    text: "text-violet-300",
  },
  francais: {
    Icon: BookText,
    gradient: "from-rose-500 to-pink-400",
    glow: "bg-rose-500/20",
    ring: "group-hover:border-rose-400/30",
    text: "text-rose-300",
  },
  espace: {
    Icon: GlobeIcon,
    gradient: "from-orange-500 to-amber-400",
    glow: "bg-orange-500/20",
    ring: "group-hover:border-orange-400/30",
    text: "text-orange-300",
  },
}

const FALLBACK_THEME: Theme = {
  Icon: BookOpen,
  gradient: "from-cyan-500 to-blue-400",
  glow: "bg-cyan-500/20",
  ring: "group-hover:border-cyan-400/30",
  text: "text-cyan-300",
}

const UPCOMING = [
  { slug: "mathematiques", name: "Mathématiques", desc: "Algèbre, géométrie, probabilités" },
  { slug: "physique", name: "Physique", desc: "Mécanique, ondes, électricité" },
  { slug: "francais", name: "Français", desc: "Grammaire, conjugaison, style" },
  { slug: "espace", name: "Espace", desc: "Planètes, étoiles, cosmologie" },
]

const themeFor = (slug: string) => THEMES[slug] ?? FALLBACK_THEME
const fmt = (n: number) => n.toLocaleString("fr-FR")

// Une matière est soit "vocabulaire" (entrées + thèmes), soit "documents" (PDF)
function countsFor(s: Subject): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = []
  if (s.item_count > 0) {
    out.push({ value: fmt(s.item_count), label: "entrées" })
    if (s.group_count > 0) out.push({ value: fmt(s.group_count), label: "thèmes" })
  }
  if (s.document_count > 0) {
    out.push({ value: fmt(s.document_count), label: s.document_count > 1 ? "documents" : "document" })
  }
  return out
}

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

export default function Dashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[] | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    getSubjectsClient()
      .then(setSubjects)
      .catch(() => setSubjects([]))
  }, [user])

  if (isLoading || !user) return null

  const totalChapters = subjects?.reduce((n, s) => n + s.chapter_count, 0) ?? 0
  const totalItems = subjects?.reduce((n, s) => n + s.item_count, 0) ?? 0
  const totalDocuments = subjects?.reduce((n, s) => n + s.document_count, 0) ?? 0
  const activeSlugs = new Set(subjects?.map((s) => s.slug))
  const upcoming = UPCOMING.filter((u) => !activeSlugs.has(u.slug))

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white overflow-x-hidden">
      <AmbientBlobs variant="home" />

      <nav className="sticky top-0 z-30 backdrop-blur-xl bg-[#030712]/70 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-10 h-16">
          <Link href="/accueil" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Sparkles className="w-4 h-4 text-white" />
              <div className="absolute inset-0 rounded-lg bg-cyan-400/40 blur-lg -z-10 group-hover:bg-cyan-400/60 transition-colors" />
            </div>
            <span className="font-bold text-sm tracking-tight">Knowa</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2.5 rounded-full bg-white/[0.04] border border-white/[0.07] pl-1 pr-3 py-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[11px] font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-xs text-white/60 font-medium">{user.username}</span>
            </div>
            <button
              onClick={() => { logout(); router.push("/login") }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-6 md:px-10 pt-12 pb-20 max-w-6xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-[11px] text-cyan-400/50 mb-3 tracking-[0.2em] uppercase font-semibold">
            Tableau de bord
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-3">
            Bonjour,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300">
              {user.username}
            </span>
          </h1>
          <p className="text-white/35 text-base max-w-md">
            Reprends là où tu t&apos;es arrêté.
          </p>

          <div className="mt-9 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
            <Stat label="Matières" value={subjects ? fmt(subjects.length) : null} Icon={Layers} />
            <Stat label="Chapitres" value={subjects ? fmt(totalChapters) : null} Icon={BookOpen} />
            <Stat label="Entrées" value={subjects ? fmt(totalItems) : null} Icon={Type} />
            <Stat label="Documents" value={subjects ? fmt(totalDocuments) : null} Icon={FileText} />
          </div>
        </motion.section>

        <section className="mt-14">
          <SectionLabel
            title="Continuer"
            hint={subjects ? `${subjects.length} disponible${subjects.length > 1 ? "s" : ""}` : ""}
          />

          {!subjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : subjects.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
              <motion.div variants={fadeUp}>
                <FeaturedSubjectCard subject={subjects[0]} />
              </motion.div>
              {subjects.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.slice(1).map((s) => (
                    <motion.div key={s.id} variants={fadeUp}>
                      <SubjectCard subject={s} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </section>

        {upcoming.length > 0 && (
          <section className="mt-14">
            <SectionLabel title="Bientôt" hint={`${upcoming.length} en préparation`} />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {upcoming.map((u) => {
                const { Icon } = themeFor(u.slug)
                return (
                  <div
                    key={u.slug}
                    className="rounded-xl border border-dashed border-white/[0.09] bg-white/[0.015] p-4"
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <Icon className="w-4 h-4 text-white/20" />
                      <Lock className="w-3 h-3 text-white/15 ml-auto" />
                    </div>
                    <p className="text-sm font-semibold text-white/45 mb-0.5">{u.name}</p>
                    <p className="text-[11px] text-white/20 leading-relaxed">{u.desc}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55, ease }}
          className="mt-14"
        >
          <SectionLabel title="Entraînement" hint="quiz" />
          <QuizCard />
        </motion.section>
      </main>
    </div>
  )
}

function SectionLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-5">
      <h2 className="text-sm font-bold text-white/80 tracking-tight">{title}</h2>
      {hint && <span className="text-[11px] text-white/20 font-mono">{hint}</span>}
    </div>
  )
}

function Stat({
  label,
  value,
  Icon,
}: {
  label: string
  value: string | null
  Icon: typeof Layers
}) {
  return (
    <div className="bg-[#050a14] px-5 py-5">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-white/25" />
        <span className="text-[11px] text-white/30 uppercase tracking-wider font-medium">{label}</span>
      </div>
      {value === null ? (
        <div className="h-8 w-16 rounded bg-white/[0.05] animate-pulse" />
      ) : (
        <p className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-white">{value}</p>
      )}
    </div>
  )
}

function FeaturedSubjectCard({ subject }: { subject: Subject }) {
  const { Icon, gradient, glow, ring, text } = themeFor(subject.slug)

  return (
    <Link href={`/cours/${subject.slug}`} className="block">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] transition-colors duration-300 hover:bg-white/[0.05] ${ring}`}
      >
        <div
          className={`pointer-events-none absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full ${glow} blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-500`}
        />
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${gradient} opacity-40`} />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 p-7 md:p-8">
          <div
            className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-extrabold text-white tracking-tight mb-1.5">{subject.name}</h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/35">
              <span className={`font-mono font-semibold ${text}`}>{fmt(subject.chapter_count)}</span>
              <span>chapitres</span>
              {countsFor(subject).map(({ value, label }) => (
                <span key={label} className="flex items-center gap-2">
                  <span className="text-white/15">•</span>
                  <span className={`font-mono font-semibold ${text}`}>{value}</span>
                  <span>{label}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 rounded-xl border border-white/[0.09] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/70 group-hover:bg-white/[0.08] group-hover:text-white group-hover:border-white/20 transition-all">
            Reprendre
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

function SubjectCard({ subject }: { subject: Subject }) {
  const { Icon, gradient, glow, ring, text } = themeFor(subject.slug)

  return (
    <Link href={`/cours/${subject.slug}`} className="block h-full">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`group relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition-colors duration-300 hover:bg-white/[0.05] ${ring}`}
      >
        <div
          className={`pointer-events-none absolute -top-24 -right-16 w-56 h-56 rounded-full ${glow} blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        <div className="relative flex items-start justify-between mb-6">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-white/15 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        <h3 className="relative text-xl font-bold text-white mb-4 tracking-tight">{subject.name}</h3>

        <div className="relative flex items-center gap-5 pt-4 border-t border-white/[0.06]">
          <Metric value={fmt(subject.chapter_count)} label="chapitres" accent={text} />
          {countsFor(subject).slice(0, 1).map(({ value, label }) => (
            <div key={label} className="flex items-center gap-5">
              <div className="w-px h-8 bg-white/[0.07]" />
              <Metric value={value} label={label} accent={text} />
            </div>
          ))}
        </div>
      </motion.div>
    </Link>
  )
}

function Metric({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div>
      <p className={`text-lg font-bold font-mono leading-none mb-1 ${accent}`}>{value}</p>
      <p className="text-[11px] text-white/25">{label}</p>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
      <div className="w-12 h-12 rounded-xl bg-white/[0.05] animate-pulse mb-6" />
      <div className="h-6 w-32 rounded bg-white/[0.05] animate-pulse mb-6" />
      <div className="h-10 w-full rounded bg-white/[0.03] animate-pulse" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] py-14 text-center">
      <BookOpen className="w-6 h-6 text-white/15 mx-auto mb-3" />
      <p className="text-sm text-white/40 font-medium mb-1">Aucune matière pour le moment</p>
      <p className="text-xs text-white/20">Importe un cours pour le voir apparaître ici.</p>
    </div>
  )
}

function QuizCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/15 bg-gradient-to-br from-[#04101f] via-[#050a1a] to-[#0a0616]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 p-8 md:p-10">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 mb-5">
            <Map className="w-3 h-3 text-cyan-400" />
            <span className="text-[11px] text-cyan-300 font-medium tracking-wide">Quiz interactif</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
            Quiz de Géographie
          </h3>
          <p className="text-white/40 text-sm mb-7 max-w-md leading-relaxed mx-auto md:mx-0">
            Teste tes connaissances sur les capitales du monde. Tourne le globe et affronte les questions.
          </p>

          <div className="flex items-center gap-5 mb-8 justify-center md:justify-start">
            <Metric value="15" label="questions" accent="text-white" />
            <div className="w-px h-8 bg-white/[0.07]" />
            <Metric value="~3" label="minutes" accent="text-white" />
            <div className="w-px h-8 bg-white/[0.07]" />
            <Metric value="🌍" label="monde" accent="text-white" />
          </div>

          <Link href="/quiz">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-shadow duration-300"
            >
              Lancer le quiz
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>

        <div className="relative w-[190px] h-[190px] md:w-[230px] md:h-[230px] shrink-0">
          <Globe config={GLOBE_CONFIG} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-violet-500/[0.03]" />
    </div>
  )
}
