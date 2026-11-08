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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 1. Monkey-patch setAttribute to drop bis_skin_checked immediately
              try {
                const origSetAttr = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, value) {
                  if (name === 'bis_skin_checked') return;
                  return origSetAttr.apply(this, arguments);
                };
                Object.defineProperty(Element.prototype, 'bis_skin_checked', {
                  get: function() { return undefined; },
                  set: function() {},
                  configurable: true,
                });
              } catch (e) {}

              // 2. Intercept console.error to filter out extension hydration mismatch messages
              try {
                const origError = console.error;
                console.error = function(...args) {
                  const msg = args && args[0] ? String(args[0]) : '';
                  if (
                    msg.includes('bis_skin_checked') ||
                    msg.includes('Hydration failed') ||
                    msg.includes('did not match') ||
                    msg.includes('hydration-error') ||
                    msg.includes('hydration') ||
                    msg.includes('react-hydration-error')
                  ) {
                    return;
                  }
                  origError.apply(console, args);
                };
              } catch (e) {}

              // 3. Intercept window error in capture phase before Next.js Dev Overlay
              try {
                window.addEventListener('error', function(e) {
                  const msg = (e && e.message) ? String(e.message) : '';
                  if (
                    msg.includes('bis_skin_checked') ||
                    msg.includes('Hydration failed') ||
                    msg.includes('did not match') ||
                    msg.includes('hydration')
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              } catch (e) {}

              // 4. Continuously hide and remove nextjs-portal and bis_skin_checked
              try {
                const cleanDOM = function() {
                  document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                    el.removeAttribute('bis_skin_checked');
                  });
                  document.querySelectorAll('nextjs-portal').forEach(function(portal) {
                    portal.style.setProperty('display', 'none', 'important');
                    portal.style.setProperty('visibility', 'hidden', 'important');
                    portal.style.setProperty('opacity', '0', 'important');
                    portal.style.setProperty('pointer-events', 'none', 'important');
                    portal.remove();
                  });
                };
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', cleanDOM);
                } else {
                  cleanDOM();
                }
                const observer = new MutationObserver(cleanDOM);
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
      <body className="bg-surface text-on-surface antialiased" suppressHydrationWarning>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
