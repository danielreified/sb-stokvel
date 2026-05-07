import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@seyva/ui';
import { Globe } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { LOCALES, type Locale, localeStore, useCopy } from '../copy/index.js';

const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  zu: 'ZU',
  af: 'AF',
};

/**
 * Language picker. Reactive — switching writes through the locale store
 * which fires `useCopy()` subscribers across the app.
 */
export function LanguageSwitcher() {
  const copy = useCopy();
  const locale = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getLocale,
    localeStore.getLocale,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          aria-label={copy.language.pickerLabel}
        >
          <Globe className="size-4" aria-hidden="true" />
          <span className="font-semibold">{LOCALE_LABEL[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuRadioGroup
          value={locale}
          // reason: DropdownMenuRadioGroup hands back string; we constrain
          // values to the Locale union elsewhere (LOCALES list).
          onValueChange={(v) => localeStore.setLocale(v as Locale)}
        >
          {LOCALES.map((l) => (
            <DropdownMenuRadioItem key={l.code} value={l.code}>
              {l.nativeLabel}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
