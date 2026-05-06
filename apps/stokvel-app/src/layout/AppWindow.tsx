import {
  Logo,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useMediaQuery,
} from '@seyva/ui';
import { Link, useMatchRoute, useRouterState } from '@tanstack/react-router';
import { Home, List, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { copy } from '../copy/index.js';
import { initialsOf } from '../lib/initials.js';

interface AppWindowProps {
  /**
   * The signed-in member, or `null` for the unauthenticated variant. When
   * null, AppWindow renders a minimal shell: collapsed icon-only sidebar
   * showing just the brand mark, no nav, no profile, no breadcrumb header.
   */
  member: { name: string; phone: string } | null;
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/dashboard', label: copy.nav.dashboard, icon: Home },
  { to: '/members', label: copy.nav.members, icon: Users },
  { to: '/contributions', label: copy.nav.contributions, icon: List },
] as const;

const ACTIVE_BREADCRUMB: Record<string, string> = {
  '/dashboard': copy.nav.dashboard,
  '/members': copy.nav.members,
  '/contributions': copy.nav.contributions,
  '/profile': copy.nav.profile,
};

/**
 * Windowed app shell. Two variants:
 *
 *   - **Authenticated** (`member` set): full sidebar (logo + nav + profile),
 *     breadcrumb header, content slot. Sidebar collapses to icon-only below
 *     `2xl` and stays open at `2xl+`.
 *   - **Unauthenticated** (`member === null`): minimal shell with just a
 *     collapsed icon-only sidebar (brand mark only). No nav, no profile, no
 *     breadcrumb. Used by the login route to keep the marketing-chrome layout
 *     consistent without exposing app surface to anonymous users.
 */
export function AppWindow({ member, children }: AppWindowProps) {
  const isAuth = member !== null;
  const matchRoute = useMatchRoute();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isWide = useMediaQuery('(min-width: 1536px)');
  const [sidebarOpen, setSidebarOpen] = useState(isWide);

  useEffect(() => {
    setSidebarOpen(isWide);
  }, [isWide]);

  // Unauth: force collapsed, ignore toggle. Auth: track viewport.
  const open = isAuth ? sidebarOpen : false;
  const onOpenChange = isAuth ? setSidebarOpen : () => {};

  const activeKey = (Object.keys(ACTIVE_BREADCRUMB) as string[]).find((p) =>
    pathname.startsWith(p),
  );

  return (
    <SidebarProvider open={open} onOpenChange={onOpenChange} className="h-full">
      <div className="relative flex h-full w-full overflow-hidden bg-background lg:rounded-2xl lg:border lg:shadow-2xl">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex h-10 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Logo variant="mark" className="h-7 w-7 shrink-0" />
              <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
                {copy.app.name.split(' ')[0]}
              </span>
            </div>
          </SidebarHeader>

          {isAuth && (
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {NAV_ITEMS.map((item) => {
                      const isActive = !!matchRoute({ to: item.to, fuzzy: true });
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.to}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                            <Link to={item.to}>
                              <Icon className="size-[18px]" aria-hidden="true" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          )}

          {isAuth && member && (
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={!!matchRoute({ to: '/profile' })}
                    tooltip={member.name}
                    className="h-auto"
                  >
                    <Link to="/profile">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {initialsOf(member.name)}
                      </div>
                      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-xs font-medium">{member.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{member.phone}</p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <p className="-mx-2 -mb-2 mt-1 border-t border-slate-200 bg-slate-100 px-4 py-1.5 text-[10px] text-slate-500 group-data-[collapsible=icon]:hidden">
                {copy.app.name} v{__APP_VERSION__}
              </p>
            </SidebarFooter>
          )}
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          {isAuth && (
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm font-medium capitalize text-muted-foreground">
                {copy.app.name}
              </span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm font-semibold capitalize">
                {activeKey ? ACTIVE_BREADCRUMB[activeKey] : ''}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </header>
          )}

          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
