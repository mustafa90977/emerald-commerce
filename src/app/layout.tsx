import type { Metadata } from "next"
import { IBM_Plex_Sans_Arabic } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Emerald Commerce | منصة التجارة المحادثتية الأولى",
    template: "%s | Emerald Commerce",
  },
  description: "أول منصة تجارة محادثتية في الشرق الأوسط",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "Emerald Commerce",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.className} min-h-screen bg-surface text-on-surface antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
