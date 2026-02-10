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
  title: "A.G.I.R. - Programa de Formacao Medica",
  description: "Abdome Agudo Guiado por Investigacao e Raciocinio - Programa de formacao medica para atendimento seguro",
  keywords: ["agir", "medicina", "abdome agudo", "formacao medica", "plantao", "cirurgia"],
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
