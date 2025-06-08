
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Платформа Онлайн Курсов - Профессиональное образование",
  description: "Повышение квалификации и переподготовка для педагогов, специалистов по охране труда и других профессий. Дистанционное обучение с выдачей документов установленного образца.",
  keywords: "онлайн курсы, повышение квалификации, переподготовка, дистанционное обучение, сертификаты, дипломы",
  openGraph: {
    title: "Платформа Онлайн Курсов - Профессиональное образование",
    description: "Повышение квалификации и переподготовка для педагогов, специалистов по охране труда и других профессий.",
    type: 'website',
    siteName: 'Платформа Онлайн Курсов',
    locale: 'ru_RU'
  },
  twitter: {
    card: 'summary_large_image',
    title: "Платформа Онлайн Курсов - Профессиональное образование",
    description: "Повышение квалификации и переподготовка для педагогов, специалистов по охране труда и других профессий."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
