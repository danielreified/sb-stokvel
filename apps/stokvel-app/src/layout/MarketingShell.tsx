import type { ReactNode } from 'react';
import { BgBlobs } from './BgBlobs.js';
import { MarketingFooter } from './MarketingFooter.js';
import { SideCards } from './SideCards.js';
import { TopNav } from './TopNav.js';

interface MarketingShellProps {
  children: ReactNode;
}

/**
 * Outer page chrome wrapping the embedded AppWindow on desktop. Hidden below
 * `lg` (mobile/tablet) so the app fills the viewport — the offline use case.
 *
 *   - mobile/tablet (`<lg`): chrome hidden, app fullscreen edge-to-edge
 *   - desktop (`lg+`): top nav + footer surround the windowed app
 *   - 2xl+: side cards appear next to the app
 */
export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#2B52CC]">
      <BgBlobs />
      <TopNav />
      <main className="relative z-10 mx-auto grid w-full max-w-[1672px] flex-1 grid-cols-1 p-0 lg:gap-x-6 lg:gap-y-6 lg:p-10 2xl:grid-cols-[minmax(0,1360px)_18rem]">
        <div className="h-screen w-screen overflow-hidden lg:aspect-[1360/820] lg:h-auto lg:max-h-[820px] lg:w-full lg:rounded-2xl 2xl:col-start-1 2xl:row-start-1 2xl:aspect-auto 2xl:h-[820px]">
          {children}
        </div>
        <MarketingFooter />
        <SideCards />
      </main>
    </div>
  );
}
