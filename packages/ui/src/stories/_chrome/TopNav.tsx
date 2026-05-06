import { ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '../../components/button.js';
import { Logo } from '../../components/logo.js';

const NAV_LINKS: { label: string; external?: boolean }[] = [
  { label: 'Personal' },
  { label: 'Business' },
  { label: 'Corporate and Institutions', external: true },
  { label: 'Wealth', external: true },
  { label: 'News and Media' },
];

/**
 * Standard Bank style top nav. Hidden below `lg` (mobile/tablet uses fullscreen app)
 * and on short viewports. The dark blue panel behind the logo extends to the page's
 * left edge via an absolute-positioned `w-[200vw]` div clipped by the parent's
 * `overflow-hidden`.
 */
export function TopNav() {
  return (
    <header className="relative z-20 hidden h-[72px] w-full shrink-0 bg-white shadow-sm lg:block [@media(max-height:899px)]:!hidden">
      <div className="mx-auto flex h-full w-full max-w-[1752px] items-center justify-between px-4 lg:px-10">
        <nav className="flex h-full items-center gap-1">
          <div className="relative mr-6 flex h-full items-center pr-6">
            <div
              aria-hidden="true"
              className="absolute right-0 top-0 h-full w-[200vw] bg-[#001f6e]"
            />
            <Logo variant="full" tone="light" className="relative z-10 h-9 w-auto shrink-0" />
          </div>
          {NAV_LINKS.map((link) => (
            <Button key={link.label} variant="ghost" size="sm">
              {link.label}
              {link.external && <ExternalLink className="size-3" aria-hidden="true" />}
            </Button>
          ))}
        </nav>
        <Button variant="ghost" size="sm">
          <span aria-hidden="true" className="text-base leading-none">
            🇿🇦
          </span>
          South Africa
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
