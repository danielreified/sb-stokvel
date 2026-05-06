import type { ReactNode } from 'react';
import { BgBlobs } from './BgBlobs.js';
import { MarketingFooter } from './MarketingFooter.js';
import { SideCards } from './SideCards.js';
import { TopNav } from './TopNav.js';

interface DemoShellProps {
  children: ReactNode;
}

/**
 * Marketing surround for storybook demos: Standard Bank top nav, regulatory
 * footer, side cards, and decorative background. The `children` slot is the
 * app window itself, sized by the inner grid:
 *   - mobile/tablet (`<lg`): fullscreen edge-to-edge
 *   - desktop (`lg+`): windowed with brand chrome
 *   - 2xl+: side cards appear next to the app
 */
export function DemoShell({ children }: DemoShellProps) {
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
