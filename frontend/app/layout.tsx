import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "지역별 맛집 후기 공유 게시판",
  description: "지역별 맛집 후기를 공유하는 게시판",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`h-full antialiased ${notoSansKr.variable}`}>
      <body className={`${notoSansKr.className} flex min-h-full flex-col`}>
        <AuthProvider>
          <Header />
          {children}
          <footer className="mt-auto px-6 py-4">
            <p className="mx-auto w-full max-w-[720px] text-right text-[11px] text-subtle md:max-w-[1100px]">
              © heesoon.park
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
