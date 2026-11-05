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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Auto-remove extension attributes & suppress dev hydration popup
              try {
                const origError = console.error;
                console.error = function(...args) {
                  const msg = args && args[0] ? String(args[0]) : '';
                  if (
                    msg.includes('bis_skin_checked') ||
                    msg.includes('Hydration failed') ||
                    msg.includes('did not match') ||
                    msg.includes('hydration-error')
                  ) {
                    return;
                  }
                  origError.apply(console, args);
                };

                const clean = () => {
                  document.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
                  document.querySelectorAll('nextjs-portal').forEach(el => {
                    el.style.display = 'none';
                    el.remove();
                  });
                };
                clean();
                const observer = new MutationObserver(clean);
                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                  attributeFilter: ['bis_skin_checked']
                });
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#F8FAFC] antialiased" suppressHydrationWarning>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
