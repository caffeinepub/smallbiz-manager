import { useRouter, useLocation } from '@tanstack/react-router';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarFooter,
} from '@/components/ui/sidebar';
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    Receipt,
    BarChart3,
    Building2,
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
];

export default function AppSidebar() {
    const router = useRouter();
    const location = useLocation();

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-sidebar-accent">
                        <img
                            src="/assets/generated/bizsolve-logo.dim_128x128.png"
                            alt="BizSolve Logo"
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-sidebar-primary font-bold text-lg">B</span>';
                            }}
                        />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-sidebar-foreground tracking-tight">BizSolve</p>
                        <p className="text-xs text-sidebar-foreground/60">Business Manager</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 py-2">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            onClick={() => router.navigate({ to: item.path })}
                                            className="cursor-pointer"
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
                <div className="flex items-center gap-2 text-sidebar-foreground/50">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="text-xs">Small Business Suite</span>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
