"use client"

import type { Template } from "@/lib/templates"

export function StoreLayout({ template, children }: { template: Template; children: React.ReactNode }) {
  const { colors, radius } = template

  return (
    <div className="min-h-screen" style={{
      "--tpl-primary": colors.primary,
      "--tpl-on-primary": colors.onPrimary,
      "--tpl-primary-container": colors.primaryContainer,
      "--tpl-on-primary-container": colors.onPrimaryContainer,
      "--tpl-secondary": colors.secondary,
      "--tpl-on-secondary": colors.onSecondary,
      "--tpl-surface": colors.surface,
      "--tpl-on-surface": colors.onSurface,
      "--tpl-surface-variant": colors.surfaceVariant,
      "--tpl-on-surface-variant": colors.onSurfaceVariant,
      "--tpl-outline": colors.outline,
      "--tpl-background": colors.background,
      "--tpl-on-background": colors.onBackground,
      "--tpl-card-bg": colors.cardBg,
      "--tpl-card-border": colors.cardBorder,
      "--tpl-error": colors.error,
      "--tpl-header-bg": colors.headerBg,
      "--tpl-header-text": colors.headerText,
      "--tpl-badge-bg": colors.badgeBg,
      "--tpl-badge-text": colors.badgeText,
      "--tpl-radius-sm": radius.sm,
      "--tpl-radius-md": radius.md,
      "--tpl-radius-lg": radius.lg,
      "--tpl-radius-xl": radius.xl,
      "--tpl-radius-card": radius.card,
      "--tpl-radius-button": radius.button,
      "--tpl-radius-badge": radius.badge,
      backgroundColor: colors.background,
      color: colors.onBackground,
      fontFamily: template.font,
    } as React.CSSProperties}>
      {children}
    </div>
  )
}
