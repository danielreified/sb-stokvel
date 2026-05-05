/**
 * Display a +27 phone number in local SA reading format.
 * +27831234567 → "083 123 4567"
 */
export function formatPhone(phone: string): string {
  if (!phone.startsWith('+27') || phone.length !== 12) return phone;
  const local = '0' + phone.slice(3);
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

/** Normalise a raw input (083..., 27083..., +27083...) to E.164 (+27...) */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('27') && digits.length === 11) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+27${digits.slice(1)}`;
  return raw;
}
