"use client"

import { LicenseBanner } from "@/components/license-banner"

interface PlaceholderSectionProps {
  title: string
  description: string
}

export function PlaceholderSection({ title, description }: PlaceholderSectionProps) {
  return (
    <div className="space-y-6">
      <LicenseBanner />
      <div className="bg-card rounded-2xl p-12 shadow-lg border border-border text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-wai-cyan bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
