import { type ReactNode } from 'react';
import AppSidebar from './Sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
                    <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                    <div className="h-5 w-px bg-border" />
                    <span className="text-sm font-medium text-muted-foreground">BizSolve</span>
                </header>
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    {children}
                </main>
                <footer className="border-t border-border bg-card px-6 py-3 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} BizSolve. Built with{' '}
                    <span className="text-destructive">♥</span>{' '}using{' '}
                    <a
                        href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'bizsolve')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                    >
                        caffeine.ai
                    </a>
                </footer>
            </SidebarInset>
        </SidebarProvider>
    );
}
