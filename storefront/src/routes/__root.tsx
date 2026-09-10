import { createServerFn } from "@tanstack/react-start";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Shell } from "@/components/layout/shell";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "Originaly | اورجینالی";

const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  return u ? { id: u.id, email: u.email } : null;
});

export const Route = createRootRoute({
  beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "فروشگاه اورجینال پوشاک و کفش. Authentic fashion.",
      },
      { name: "theme-color", content: "#08090d" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: Root,
  notFoundComponent: () => (
    <Shell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="font-display text-4xl font-extrabold">۴۰۴</p>
        <p className="mt-3 text-muted">این صفحه پیدا نشد.</p>
      </div>
    </Shell>
  ),
});

function Root() {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Shell>
            <Outlet />
          </Shell>
          <Toaster
            position="top-center"
            theme="dark"
            toastOptions={{
              className: "font-sans !bg-elevated !text-fg !border-border",
            }}
          />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
