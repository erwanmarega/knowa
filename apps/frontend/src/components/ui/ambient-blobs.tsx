export function AmbientBlobs({ variant = "course" }: { variant?: "home" | "course" }) {
  if (variant === "home") {
    return (
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-60 left-1/3 w-[500px] h-[500px] bg-cyan-600/[0.07] rounded-full blur-[120px]" />
      </div>
    )
  }
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute -top-60 -left-60 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
    </div>
  )
}
