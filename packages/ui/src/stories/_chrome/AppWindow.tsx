import { Home, List, Users } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Logo } from '../../components/logo.js';
import { Separator } from '../../components/separator.js';
import {
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
} from '../../components/sidebar.js';
import { useMediaQuery } from '../../hooks/use-media-query.js';
import {
  ContributionsPanel,
  DashboardPanel,
  MembersPanel,
  ProfilePanel,
} from '../_AppLayout.panels.js';

export type AppPage = 'dashboard' | 'members' | 'contributions' | 'profile';

const NAV_ITEMS: { id: AppPage; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="size-[18px]" aria-hidden="true" />,
  },
  { id: 'members', label: 'Members', icon: <Users className="size-[18px]" aria-hidden="true" /> },
  {
    id: 'contributions',
    label: 'Contributions',
    icon: <List className="size-[18px]" aria-hidden="true" />,
  },
];

interface AppWindowProps {
  initialPage?: AppPage;
  /** Overrides the default panel switching — render arbitrary content in the
   * panel slot (e.g. a gate, lock screen, or error state). Sidebar +
   * breadcrumb header still render around it. */
  children?: ReactNode;
}

export function AppWindow({ initialPage = 'dashboard', children }: AppWindowProps) {
  const [active, setActive] = useState<AppPage>(initialPage);
  const isWide = useMediaQuery('(min-width: 1536px)');
  const [sidebarOpen, setSidebarOpen] = useState(isWide);

  useEffect(() => {
    setSidebarOpen(isWide);
  }, [isWide]);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen} className="h-full">
      <div className="relative flex h-full w-full overflow-hidden bg-background lg:rounded-2xl lg:border lg:shadow-2xl">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex h-10 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Logo variant="mark" className="h-7 w-7 shrink-0" />
              <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
                Seyva
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={active === item.id}
                        onClick={() => setActive(item.id)}
                        tooltip={item.label}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  isActive={active === 'profile'}
                  onClick={() => setActive('profile')}
                  tooltip="Nomsa Dlamini"
                  className="h-auto"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    ND
                  </div>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-xs font-medium">Nomsa Dlamini</p>
                    <p className="truncate text-[10px] text-muted-foreground">+27 82 100 0001</p>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <p className="-mx-2 -mb-2 mt-1 border-t border-slate-200 bg-slate-100 px-4 py-1.5 text-[10px] text-slate-500 group-data-[collapsible=icon]:hidden">
              Seyva v1.0.0
            </p>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium capitalize text-muted-foreground">
              Ubuntu Stokvel
            </span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-semibold capitalize">{active}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {children ?? (
              <>
                {active === 'dashboard' && <DashboardPanel />}
                {active === 'members' && <MembersPanel />}
                {active === 'contributions' && <ContributionsPanel />}
                {active === 'profile' && <ProfilePanel />}
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
