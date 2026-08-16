import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Churn Analytics - AI-Powered Customer Retention',
  description: 'Predict customer churn with explainable AI and actionable recommendations',
  icons: {
    // Bumped to ?v=3 to force the browser to grab the newest SVG we just made
    icon: '/icon.svg?v=3', 
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-colors duration-200">
        {children}
      </body>
    </html>
  )
}
