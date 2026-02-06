import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NokPlus - ระบบจัดซื้อจัดจ้าง",
  description: "ระบบจัดซื้อจัดจ้าง PR/PO/AP สำหรับองค์กร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
