"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface VideoLoaderProps {
  className?: string
}

export function VideoLoader({ className }: VideoLoaderProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch
  if (!mounted) {
    return null
  }

  const videoSrc = resolvedTheme === "dark" ? "/Logo-4-remix2.mp4" : "/Logo-4-remix.mp4"

  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <video
        key={videoSrc}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-[300px] h-[300px] object-contain"
      />
    </div>
  )
}
