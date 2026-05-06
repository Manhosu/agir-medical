import type { Metadata } from "next"
import { Inter, Space_Grotesk, Cuprum } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const cuprum = Cuprum({
  variable: "--font-cuprum",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "A.G.I.R. - Programa de Formação Médica",
  description: "Abdome Agudo Guiado por Investigação e Raciocínio - Programa de formação médica para atendimento seguro",
  keywords: ["agir", "medicina", "abdome agudo", "formação médica", "plantão", "cirurgia"],
  verification: {
    google: "El3tZm5QtYWLdy0vxtvVXlUunthWO57n8kVtj8dGHbk",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${cuprum.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
