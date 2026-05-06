import { Button } from '../../components/button.js';

const FOOTER_LINKS = [
  'Security Centre',
  'Data Privacy Centre',
  'Regulatory',
  'Legal',
  'Supplier Marketplace',
  'Manage Cookies',
  'Terms & Conditions',
  'Pricing',
];

export function MarketingFooter() {
  return (
    <div className="hidden flex-col items-center gap-3 lg:flex [@media(max-height:899px)]:!hidden 2xl:col-start-1 2xl:row-start-2">
      <nav
        aria-label="Footer"
        className="flex max-w-4xl flex-wrap items-center justify-center gap-x-1 gap-y-0.5"
      >
        {FOOTER_LINKS.map((link) => (
          <Button
            key={link}
            variant="ghost"
            size="sm"
            className="text-xs text-white/90 hover:bg-white/10 hover:text-white"
          >
            {link}
          </Button>
        ))}
      </nav>
      <p className="max-w-3xl text-center text-[11px] leading-relaxed text-white/70">
        Standard Bank is a licensed financial services provider in terms of the Financial Advisory
        and Intermediary Services Act and a registered credit provider in terms of the National
        Credit Act, registration number NCRCP15.
      </p>
    </div>
  );
}
