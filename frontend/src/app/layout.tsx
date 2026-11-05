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
      <body className="bg-[#F8FAFC] antialiased" suppressHydrationWarning>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
