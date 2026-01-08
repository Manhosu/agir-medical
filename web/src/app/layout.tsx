import type { Metadata } from "next"
import { Work_Sans, Lora } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "AGIR - E-Learning Médico",
  description: "Plataforma de E-Learning focada em guidelines médicos e educação continuada",
  keywords: ["e-learning", "médico", "medicina", "guidelines", "educação médica"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${workSans.variable} ${lora.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
