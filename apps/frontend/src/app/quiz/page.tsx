"use client"

import { useState } from "react"
import { questions } from "@/lib/questions"

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]/gi, "") 
}

export default function QuizPage() {
  const [current, setCurrent] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [isWaiting, setIsWaiting] = useState(false)

  const handleSubmit = () => {
    if (isWaiting) return

    const correct = normalize(questions[current].answer)
    const user = normalize(userAnswer)

    const isCorrect = user === correct
    if (isCorrect) setScore(prev => prev + 1)

    setFeedback(isCorrect ? "correct" : "incorrect")
    setIsWaiting(true)

    setTimeout(() => {
      setFeedback(null)
      setUserAnswer("")

      if (current + 1 < questions.length) {
        setCurrent(prev => prev + 1)
      } else {
        setShowResult(true)
      }

      setIsWaiting(false)
    }, 1500)
  }

  const restartQuiz = () => {
    setCurrent(0)
    setUserAnswer("")
    setScore(0)
    setShowResult(false)
    setFeedback(null)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4 py-10">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6">
        {!showResult ? (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold">🌍 Quiz de Géographie</h2>
              <p className="text-sm text-gray-300 mt-1">
                Question {current + 1} / {questions.length}
              </p>
            </div>

            <p className="text-lg font-medium mb-4 text-center">{questions[current].question}</p>

            <input
  type="text"
  className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
  value={userAnswer}
  onChange={(e) => setUserAnswer(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (userAnswer.trim()) handleSubmit()
    }
  }}
  placeholder="Votre réponse"
  disabled={isWaiting}
/>

            {feedback && (
              <div className={`text-sm font-medium mb-4 text-center ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}>
                {feedback === "correct" ? "✅ Bonne réponse !" : `❌ Mauvaise réponse ! Réponse attendue : ${questions[current].answer}`}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isWaiting || !userAnswer.trim()}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
            >
              Valider
            </button>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">🎉 Résultat</h2>
            <p className="text-lg mb-2">Vous avez obtenu {score} / {questions.length}</p>
            <button
              onClick={restartQuiz}
              className="px-4 py-2 mt-4 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition"
            >
              Recommencer
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
