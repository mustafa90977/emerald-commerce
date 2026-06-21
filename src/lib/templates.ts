export type HeaderStyle = "centered" | "split" | "minimal" | "dark" | "gradient" | "elegant"
export type CardStyle = "bordered" | "shadow" | "elevated" | "flat" | "dark" | "colored" | "gold" | "sharp"
export type ProductImageShape = "square" | "rounded" | "circular" | "landscape"

export interface TemplateColors {
  primary: string; onPrimary: string; primaryContainer: string; onPrimaryContainer: string
  secondary: string; onSecondary: string
  surface: string; onSurface: string; surfaceVariant: string; onSurfaceVariant: string
  outline: string; background: string; onBackground: string
  cardBg: string; cardBorder: string; error: string
  headerBg: string; headerText: string
  badgeBg: string; badgeText: string
}

export interface TemplateLayout {
  headerStyle: HeaderStyle; cardStyle: CardStyle; gridCols: number
  productImageShape: ProductImageShape; showPrice: boolean; showStock: boolean; showCategory: boolean
}

export interface Template {
  id: string; name: string; description: string
  colors: TemplateColors; layout: TemplateLayout; font: string
  radius: { sm: string; md: string; lg: string; xl: string; card: string; button: string; badge: string }
  previewEmoji: string
}

export const templates: Template[] = [
  {
    id: "emerald", name: "الزمرد", description: "أخضر أنيق، نظيف مع لمسات طبيعية — القالب الافتراضي",
    previewEmoji: "💚",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#004532", onPrimary: "#ffffff", primaryContainer: "#065f46", onPrimaryContainer: "#8bd6b7",
      secondary: "#006c4b", onSecondary: "#ffffff",
      surface: "#f8f9ff", onSurface: "#0d1c2e", surfaceVariant: "#d5e3fc", onSurfaceVariant: "#3f4944",
      outline: "#bec9c2", background: "#f8f9ff", onBackground: "#0d1c2e",
      cardBg: "#ffffff", cardBorder: "#bec9c2", error: "#ba1a1a",
      headerBg: "#ffffff", headerText: "#0d1c2e",
      badgeBg: "#e6eeff", badgeText: "#004532",
    },
    layout: { headerStyle: "split", cardStyle: "bordered", gridCols: 3, productImageShape: "rounded", showPrice: true, showStock: true, showCategory: true },
    radius: { sm: "0.25rem", md: "0.5rem", lg: "1rem", xl: "1.5rem", card: "1rem", button: "0.75rem", badge: "0.5rem" },
  },
  {
    id: "classic", name: "كلاسيك", description: "أزرق تقليدي، حدود واضحة، شعور رسمي موثوق",
    previewEmoji: "🔵",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#1e40af", onPrimary: "#ffffff", primaryContainer: "#dbeafe", onPrimaryContainer: "#1e3a5f",
      secondary: "#475569", onSecondary: "#ffffff",
      surface: "#fafafa", onSurface: "#1e293b", surfaceVariant: "#e2e8f0", onSurfaceVariant: "#64748b",
      outline: "#cbd5e1", background: "#ffffff", onBackground: "#1e293b",
      cardBg: "#ffffff", cardBorder: "#cbd5e1", error: "#dc2626",
      headerBg: "#1e40af", headerText: "#ffffff",
      badgeBg: "#dbeafe", badgeText: "#1e40af",
    },
    layout: { headerStyle: "centered", cardStyle: "bordered", gridCols: 3, productImageShape: "square", showPrice: true, showStock: true, showCategory: true },
    radius: { sm: "0.125rem", md: "0.375rem", lg: "0.75rem", xl: "1rem", card: "0.5rem", button: "0.375rem", badge: "0.25rem" },
  },
  {
    id: "modern", name: "عصري", description: "أزرق حيوي، مسطح، أبيض كثير، بسيط ونظيف مع مساحة بيضاء واسعة",
    previewEmoji: "🌀",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#2563eb", onPrimary: "#ffffff", primaryContainer: "#eff6ff", onPrimaryContainer: "#1e40af",
      secondary: "#64748b", onSecondary: "#ffffff",
      surface: "#ffffff", onSurface: "#0f172a", surfaceVariant: "#f1f5f9", onSurfaceVariant: "#475569",
      outline: "#e2e8f0", background: "#f8fafc", onBackground: "#0f172a",
      cardBg: "#ffffff", cardBorder: "#e2e8f0", error: "#ef4444",
      headerBg: "#ffffff", headerText: "#0f172a",
      badgeBg: "#eff6ff", badgeText: "#2563eb",
    },
    layout: { headerStyle: "minimal", cardStyle: "shadow", gridCols: 4, productImageShape: "landscape", showPrice: true, showStock: false, showCategory: false },
    radius: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem", card: "0.75rem", button: "0.5rem", badge: "0.375rem" },
  },
  {
    id: "bold", name: "جريء", description: "داكن مع برتقالي/ذهبي جريء، طباعة كبيرة، تأثير قوي",
    previewEmoji: "🔥",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#ea580c", onPrimary: "#ffffff", primaryContainer: "#fff7ed", onPrimaryContainer: "#c2410c",
      secondary: "#fed7aa", onSecondary: "#431407",
      surface: "#1c1917", onSurface: "#fafaf9", surfaceVariant: "#292524", onSurfaceVariant: "#a8a29e",
      outline: "#44403c", background: "#0c0a09", onBackground: "#fafaf9",
      cardBg: "#292524", cardBorder: "#44403c", error: "#fca5a5",
      headerBg: "#0c0a09", headerText: "#fafaf9",
      badgeBg: "#ea580c", badgeText: "#ffffff",
    },
    layout: { headerStyle: "dark", cardStyle: "dark", gridCols: 3, productImageShape: "square", showPrice: true, showStock: false, showCategory: false },
    radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem", xl: "1.5rem", card: "1rem", button: "0.75rem", badge: "0.5rem" },
  },
  {
    id: "warm", name: "دافئ", description: "عنبري/برتقالي وردي، ودود، زوايا مستديرة جداً، إحساس ترحيبي",
    previewEmoji: "☀️",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#d97706", onPrimary: "#ffffff", primaryContainer: "#fffbeb", onPrimaryContainer: "#b45309",
      secondary: "#fcd34d", onSecondary: "#713f12",
      surface: "#fffcf5", onSurface: "#1c1917", surfaceVariant: "#fef3c7", onSurfaceVariant: "#78716c",
      outline: "#fde68a", background: "#fffbeb", onBackground: "#1c1917",
      cardBg: "#ffffff", cardBorder: "#fde68a", error: "#f87171",
      headerBg: "#fffbeb", headerText: "#92400e",
      badgeBg: "#fef3c7", badgeText: "#d97706",
    },
    layout: { headerStyle: "centered", cardStyle: "shadow", gridCols: 3, productImageShape: "rounded", showPrice: true, showStock: true, showCategory: true },
    radius: { sm: "0.5rem", md: "0.75rem", lg: "1.25rem", xl: "2rem", card: "1.5rem", button: "1rem", badge: "0.75rem" },
  },
  {
    id: "minimal", name: "بسيط", description: "أبيض/أسود/رمادي فقط، خطوط رفيعة، بسيط جداً بدون ألوان زائدة",
    previewEmoji: "⚪",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#1e293b", onPrimary: "#ffffff", primaryContainer: "#f1f5f9", onPrimaryContainer: "#0f172a",
      secondary: "#64748b", onSecondary: "#ffffff",
      surface: "#ffffff", onSurface: "#0f172a", surfaceVariant: "#f8fafc", onSurfaceVariant: "#94a3b8",
      outline: "#e2e8f0", background: "#ffffff", onBackground: "#0f172a",
      cardBg: "#ffffff", cardBorder: "#e2e8f0", error: "#94a3b8",
      headerBg: "#ffffff", headerText: "#0f172a",
      badgeBg: "#f1f5f9", badgeText: "#475569",
    },
    layout: { headerStyle: "minimal", cardStyle: "flat", gridCols: 4, productImageShape: "square", showPrice: true, showStock: false, showCategory: false },
    radius: { sm: "0", md: "0.125rem", lg: "0.25rem", xl: "0.5rem", card: "0.25rem", button: "0", badge: "0" },
  },
  {
    id: "luxury", name: "فخم", description: "ذهبي/كريمي، زخارف ناعمة، خطوط ذهبية، تدرجات ناعمة، فخامة وأناقة",
    previewEmoji: "👑",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#b8860b", onPrimary: "#ffffff", primaryContainer: "#fefce8", onPrimaryContainer: "#854d0e",
      secondary: "#fbbf24", onSecondary: "#422006",
      surface: "#fefce8", onSurface: "#292524", surfaceVariant: "#fef3c7", onSurfaceVariant: "#78716c",
      outline: "#d4a017", background: "#fffbeb", onBackground: "#292524",
      cardBg: "#ffffff", cardBorder: "#d4a017", error: "#991b1b",
      headerBg: "#292524", headerText: "#fbbf24",
      badgeBg: "#fef3c7", badgeText: "#b8860b",
    },
    layout: { headerStyle: "elegant", cardStyle: "gold", gridCols: 3, productImageShape: "rounded", showPrice: true, showStock: true, showCategory: true },
    radius: { sm: "0.125rem", md: "0.25rem", lg: "0.5rem", xl: "0.75rem", card: "0.5rem", button: "0.125rem", badge: "0.125rem" },
  },
  {
    id: "playful", name: "مرح", description: "ألوان زاهية متعددة، تدرجات، زوايا مستديرة جداً، بطاقات ملونة، طفولي ومرح",
    previewEmoji: "🎨",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#ec4899", onPrimary: "#ffffff", primaryContainer: "#fdf2f8", onPrimaryContainer: "#be185d",
      secondary: "#8b5cf6", onSecondary: "#ffffff",
      surface: "#fdf4ff", onSurface: "#1e1b4b", surfaceVariant: "#f3e8ff", onSurfaceVariant: "#6d28d9",
      outline: "#e9d5ff", background: "#faf5ff", onBackground: "#1e1b4b",
      cardBg: "#ffffff", cardBorder: "#e9d5ff", error: "#f43f5e",
      headerBg: "linear-gradient(135deg, #ec4899, #8b5cf6)", headerText: "#ffffff",
      badgeBg: "#ec4899", badgeText: "#ffffff",
    },
    layout: { headerStyle: "gradient", cardStyle: "colored", gridCols: 3, productImageShape: "circular", showPrice: true, showStock: true, showCategory: true },
    radius: { sm: "0.75rem", md: "1rem", lg: "1.5rem", xl: "2rem", card: "1.5rem", button: "1.25rem", badge: "1rem" },
  },
  {
    id: "tech", name: "تقني", description: "أزرق داكن/سليت، زوايا حادة، كثيف بالمعلومات، تقني وعصري",
    previewEmoji: "⚡",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#06b6d4", onPrimary: "#ffffff", primaryContainer: "#ecfeff", onPrimaryContainer: "#0891b2",
      secondary: "#64748b", onSecondary: "#ffffff",
      surface: "#0f172a", onSurface: "#e2e8f0", surfaceVariant: "#1e293b", onSurfaceVariant: "#94a3b8",
      outline: "#334155", background: "#020617", onBackground: "#e2e8f0",
      cardBg: "#1e293b", cardBorder: "#334155", error: "#f87171",
      headerBg: "#020617", headerText: "#e2e8f0",
      badgeBg: "#06b6d4", badgeText: "#020617",
    },
    layout: { headerStyle: "dark", cardStyle: "sharp", gridCols: 4, productImageShape: "square", showPrice: true, showStock: true, showCategory: true },
    radius: { sm: "0", md: "0", lg: "0", xl: "0", card: "0", button: "0", badge: "0" },
  },
  {
    id: "nature", name: "طبيعة", description: "ترابي أخضر/بني، ألوان عضوية ناعمة، إحساس طبيعي ومريح",
    previewEmoji: "🌿",
    font: "IBM Plex Sans Arabic",
    colors: {
      primary: "#2d6a4f", onPrimary: "#ffffff", primaryContainer: "#d8f3dc", onPrimaryContainer: "#1b4332",
      secondary: "#7f4f24", onSecondary: "#ffffff",
      surface: "#f0fdf4", onSurface: "#1c1917", surfaceVariant: "#dcfce7", onSurfaceVariant: "#57534e",
      outline: "#bbf7d0", background: "#f0fdf4", onBackground: "#1c1917",
      cardBg: "#ffffff", cardBorder: "#bbf7d0", error: "#dc2626",
      headerBg: "#2d6a4f", headerText: "#ffffff",
      badgeBg: "#d8f3dc", badgeText: "#2d6a4f",
    },
    layout: { headerStyle: "centered", cardStyle: "bordered", gridCols: 3, productImageShape: "rounded", showPrice: true, showStock: true, showCategory: true },
    radius: { sm: "0.375rem", md: "0.625rem", lg: "1rem", xl: "1.5rem", card: "1rem", button: "0.75rem", badge: "0.5rem" },
  },
]

export function getTemplate(id: string): Template {
  return templates.find((t) => t.id === id) ?? templates[0]
}
