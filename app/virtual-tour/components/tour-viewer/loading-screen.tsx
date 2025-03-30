"use client"

import { useEffect, useState } from "react"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <h2 className="mb-8 text-2xl font-bold">Loading Virtual Tour</h2>
      <div className="w-64 overflow-hidden rounded-full bg-muted">
        <div className="h-2 bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{Math.round(progress)}%</p>
    </div>
  )
}

