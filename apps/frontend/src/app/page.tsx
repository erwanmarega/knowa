"use client"

import dynamic from "next/dynamic"

const BeamsBackground = dynamic(
  () => import("@/components/ui/beams-background").then((m) => m.BeamsBackground),
  { ssr: false }
)

export default function HomePage() {
  return <BeamsBackground />
}
