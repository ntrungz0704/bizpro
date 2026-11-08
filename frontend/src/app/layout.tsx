import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "BizPro+ | Nền Tảng Quản Trị & Vận Hành Doanh Nghiệp Toàn Diện",
  description: "Hệ thống quản trị doanh nghiệp thế hệ mới hợp nhất CRM, Kho hàng, Quy trình Bán hàng 5 bước và Chấm công Nhân sự",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="bg-surface text-on-surface antialiased" suppressHydrationWarning>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
