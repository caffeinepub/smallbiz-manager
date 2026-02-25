import { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: ReactNode;
    variant?: 'default' | 'amber' | 'green' | 'red' | 'blue';
    className?: string;
}

const variantStyles = {
    default: 'bg-card border-border',
    amber: 'bg-card border-primary/30',
    green: 'bg-card border-success/30',
    red: 'bg-card border-destructive/30',
    blue: 'bg-card border-ring/30',
};

const iconVariantStyles = {
    default: 'bg-muted text-muted-foreground',
    amber: 'bg-primary/10 text-primary',
    green: 'bg-success/10 text-success',
    red: 'bg-destructive/10 text-destructive',
    blue: 'bg-ring/10 text-ring',
};

export default function MetricCard({ title, value, subtitle, icon, variant = 'default', className }: MetricCardProps) {
    return (
        <Card className={cn('shadow-card hover:shadow-card-hover transition-shadow duration-200 border', variantStyles[variant], className)}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
                        <p className="text-2xl font-bold text-foreground truncate">{value}</p>
                        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ml-3', iconVariantStyles[variant])}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
