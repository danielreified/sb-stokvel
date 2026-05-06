import { initialsOf } from '../lib/initials.js';

type Size = 'xs' | 'sm' | 'md' | 'lg';
type Tone = 'solid' | 'soft';

interface MemberAvatarProps {
  name: string;
  /** xs (28px) | sm (32px) | md (56px) | lg (64px). Default: sm. */
  size?: Size;
  /** solid = brand bg + white text; soft = brand-tinted bg + brand text. Default: soft. */
  tone?: Tone;
  className?: string;
}

const SIZE_CLASS: Record<Size, string> = {
  xs: 'h-7 w-7 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-14 w-14 text-lg',
  lg: 'h-16 w-16 text-xl',
};

const TONE_CLASS: Record<Tone, string> = {
  solid: 'bg-primary text-primary-foreground font-bold',
  soft: 'bg-primary/10 text-primary font-semibold',
};

/** Circular avatar showing the member's initials. */
export function MemberAvatar({ name, size = 'sm', tone = 'soft', className }: MemberAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full ${SIZE_CLASS[size]} ${TONE_CLASS[tone]} ${className ?? ''}`}
    >
      {initialsOf(name)}
    </div>
  );
}
