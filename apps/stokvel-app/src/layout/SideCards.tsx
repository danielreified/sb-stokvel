import { ArrowRight, Download, Info, Smartphone, WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useInstallPrompt } from '../features/pwa/use-install-prompt.js';

interface CardProps {
  icon: ReactNode;
  title: string;
  body: string;
  cta: ReactNode;
  footer?: ReactNode;
}

function GlassCard({ icon, title, body, cta, footer }: CardProps) {
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl backdrop-blur">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold leading-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-white/80">{body}</p>
      </div>
      {cta}
      {footer}
    </aside>
  );
}

/**
 * Install button. Three runtime states:
 *   - Chromium with beforeinstallprompt fired → triggers the native prompt.
 *   - Already-installed PWA → button hidden (appinstalled clears canInstall).
 *   - Browser without the event (Safari + iOS) → renders a hint instead of
 *     the button, since iOS install is manual via Share → Add to Home Screen.
 */
function InstallCta() {
  const { canInstall, triggerInstall } = useInstallPrompt();

  if (!canInstall) {
    return (
      <p className="mt-2 text-xs text-white/70">
        On iPhone: tap the Share icon → Add to Home Screen.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void triggerInstall()}
      className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#001f6e] transition-colors hover:bg-white/90"
    >
      <Download className="size-4" aria-hidden="true" />
      Install app
    </button>
  );
}

export function SideCards() {
  return (
    <div className="hidden flex-col gap-4 self-start 2xl:col-start-2 2xl:row-start-1 2xl:flex">
      <GlassCard
        icon={<Smartphone className="size-[22px]" aria-hidden="true" />}
        title="Take Seyva with you"
        body="Install the app on your phone and manage your stokvel on the go — works offline, wherever you are."
        cta={<InstallCta />}
        footer={
          <div className="flex items-center gap-2 pt-1 text-xs text-white/70">
            <WifiOff className="size-3.5" aria-hidden="true" />
            Works offline
          </div>
        }
      />
      <GlassCard
        icon={<Info className="size-[22px]" aria-hidden="true" />}
        title="Find out more"
        body="Learn how stokvels work, how Seyva keeps your money safe, and how to start your own group with friends and family."
        cta={
          <button
            type="button"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Learn more
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        }
      />
    </div>
  );
}
