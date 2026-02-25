import { useMemo } from 'react';
import { useCustomers } from '../hooks/useQueries';
import { useProducts } from '../hooks/useQueries';
import { useInvoices } from '../hooks/useQueries';
import { useExpenses } from '../hooks/useQueries';
import MetricCard from '../components/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoiceStatus } from '../backend';
import { formatCurrency, MONTHS } from '../lib/utils';
import { DollarSign, Users, Package, FileWarning, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { data: customers = [], isLoading: loadingCustomers } = useCustomers();
    const { data: products = [], isLoading: loadingProducts } = useProducts();
    const { data: invoices = [], isLoading: loadingInvoices } = useInvoices();
    const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();

    const isLoading = loadingCustomers || loadingProducts || loadingInvoices || loadingExpenses;

    const metrics = useMemo(() => {
        const totalRevenue = invoices
            .filter(inv => inv.status === InvoiceStatus.paid)
            .reduce((sum, inv) => sum + inv.totalAmount, 0n);

        const activeCustomers = customers.length;

        const lowStockProducts = products.filter(p => p.stockQuantity < 5n).length;

        const unpaidInvoices = invoices.filter(
            inv => inv.status === InvoiceStatus.sent || inv.status === InvoiceStatus.overdue
        ).length;

        return { totalRevenue, activeCustomers, lowStockProducts, unpaidInvoices };
    }, [customers, products, invoices]);

    const monthlyRevenue = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const monthly: Record<number, bigint> = {};
        for (let m = 0; m < 12; m++) monthly[m] = 0n;

        invoices
            .filter(inv => inv.status === InvoiceStatus.paid)
            .forEach(inv => {
                const ms = Number(inv.createdAt) / 1_000_000;
                const d = new Date(ms);
                if (d.getFullYear() === currentYear) {
                    monthly[d.getMonth()] = (monthly[d.getMonth()] ?? 0n) + inv.totalAmount;
                }
            });

        return Object.entries(monthly).map(([month, amount]) => ({
            month: MONTHS[parseInt(month)],
            amount,
        }));
    }, [invoices]);

    const recentInvoices = useMemo(() => {
        return [...invoices]
            .sort((a, b) => Number(b.createdAt - a.createdAt))
            .slice(0, 5);
    }, [invoices]);

    const statusColors: Record<string, string> = {
        [InvoiceStatus.paid]: 'text-success bg-success/10',
        [InvoiceStatus.sent]: 'text-primary bg-primary/10',
        [InvoiceStatus.draft]: 'text-muted-foreground bg-muted',
        [InvoiceStatus.overdue]: 'text-destructive bg-destructive/10',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Welcome back! Here's your business overview.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="shadow-card">
                            <CardContent className="p-5">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-32" />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <>
                        <MetricCard
                            title="Total Revenue"
                            value={formatCurrency(metrics.totalRevenue)}
                            subtitle="From paid invoices"
                            icon={<DollarSign className="h-5 w-5" />}
                            variant="amber"
                        />
                        <MetricCard
                            title="Active Customers"
                            value={metrics.activeCustomers}
                            subtitle="Total registered"
                            icon={<Users className="h-5 w-5" />}
                            variant="green"
                        />
                        <MetricCard
                            title="Low Stock Alerts"
                            value={metrics.lowStockProducts}
                            subtitle="Products below 5 units"
                            icon={<Package className="h-5 w-5" />}
                            variant={metrics.lowStockProducts > 0 ? 'red' : 'default'}
                        />
                        <MetricCard
                            title="Unpaid Invoices"
                            value={metrics.unpaidInvoices}
                            subtitle="Sent & overdue"
                            icon={<FileWarning className="h-5 w-5" />}
                            variant={metrics.unpaidInvoices > 0 ? 'red' : 'default'}
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue */}
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Monthly Revenue ({new Date().getFullYear()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-8 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {monthlyRevenue.map(({ month, amount }) => {
                                    const maxAmount = Math.max(...monthlyRevenue.map(m => Number(m.amount)));
                                    const pct = maxAmount > 0 ? (Number(amount) / maxAmount) * 100 : 0;
                                    return (
                                        <div key={month} className="flex items-center gap-3 text-sm">
                                            <span className="w-20 text-muted-foreground text-xs font-medium">{month.slice(0, 3)}</span>
                                            <div className="flex-1 h-6 bg-muted rounded-sm overflow-hidden">
                                                <div
                                                    className="h-full bg-primary/70 rounded-sm transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="w-20 text-right font-medium text-foreground text-xs">{formatCurrency(amount)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Invoices */}
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        ) : recentInvoices.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No invoices yet</p>
                        ) : (
                            <div className="space-y-2">
                                {recentInvoices.map(inv => {
                                    const customer = customers.find(c => c.id === inv.customerId);
                                    return (
                                        <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                                            <div>
                                                <p className="text-sm font-medium">{customer?.name ?? 'Unknown'}</p>
                                                <p className="text-xs text-muted-foreground">#{inv.id.slice(-6)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">{formatCurrency(inv.totalAmount)}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[inv.status] || ''}`}>
                                                    {inv.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
