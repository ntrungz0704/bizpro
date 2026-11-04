import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "BizPro+ | Business Management System",
  description: "Hệ thống quản trị doanh nghiệp hợp nhất CRM, Kho hàng, Bán hàng và Nhân sự",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-[#F8FAFC] antialiased" suppressHydrationWarning>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
