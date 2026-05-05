import type { Member } from '@seyva/types';

export type AuthState = { isAuthenticated: false } | { isAuthenticated: true; member: Member };
