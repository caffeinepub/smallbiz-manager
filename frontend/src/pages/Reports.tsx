import { useState, useMemo } from 'react';
import { useInvoices, useExpenses, useProducts } from '../hooks/useQueries';
import { InvoiceStatus } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, MONTHS } from '../lib/utils';
import { BarChart3, TrendingUp, TrendingDown, Trophy } from 'lucide-react';

export default function Reports() {
    const { data: invoices = [], isLoading: loadingInvoices } = useInvoices();
    const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();
    const { data: _products = [] } = useProducts();

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(String(currentYear));

    const isLoading = loadingInvoices || loadingExpenses;

    // Available years derived from invoice data
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        years.add(currentYear);
        invoices.forEach(inv => {
            const ms = Number(inv.createdAt) / 1_000_000;
            years.add(new Date(ms).getFullYear());
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [invoices, currentYear]);

    // Monthly revenue for selected year
    const monthlyRevenue = useMemo(() => {
        const year = parseInt(selectedYear);
        const monthly: Record<number, bigint> = {};
        for (let m = 0; m < 12; m++) monthly[m] = 0n;

        invoices
            .filter(inv => inv.status === InvoiceStatus.paid)
            .forEach(inv => {
                const ms = Number(inv.createdAt) / 1_000_000;
                const d = new Date(ms);
                if (d.getFullYear() === year) {
                    monthly[d.getMonth()] = (monthly[d.getMonth()] ?? 0n) + inv.totalAmount;
                }
            });

        return Object.entries(monthly).map(([month, amount]) => ({
            month: MONTHS[parseInt(month)],
            amount,
        }));
    }, [invoices, selectedYear]);

    const yearTotal = monthlyRevenue.reduce((sum, { amount }) => sum + amount, 0n);
    const maxMonthAmount = Math.max(...monthlyRevenue.map(m => Number(m.amount)), 1);

    // Top 5 products by quantity sold across all paid invoices
    const topProducts = useMemo(() => {
        const productSales: Record<string, { name: string; qty: bigint; revenue: bigint }> = {};

        invoices
            .filter(inv => inv.status === InvoiceStatus.paid)
            .forEach(inv => {
                inv.lineItems.forEach(item => {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = { name: item.name, qty: 0n, revenue: 0n };
                    }
                    productSales[item.productId].qty += item.quantity;
                    productSales[item.productId].revenue += item.price * item.quantity;
                });
            });

        return Object.entries(productSales)
            .sort((a, b) => Number(b[1].qty - a[1].qty))
            .slice(0, 5)
            .map(([id, data]) => ({ id, ...data }));
    }, [invoices]);

    // Current month revenue vs expenses
    const currentMonthComparison = useMemo(() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const revenue = invoices
            .filter(inv => {
                if (inv.status !== InvoiceStatus.paid) return false;
                const ms = Number(inv.createdAt) / 1_000_000;
                const d = new Date(ms);
                return d.getMonth() === month && d.getFullYear() === year;
            })
            .reduce((sum, inv) => sum + inv.totalAmount, 0n);

        const totalExpenses = expenses
            .filter(e => {
                const ms = Number(e.date) / 1_000_000;
                const d = new Date(ms);
                return d.getMonth() === month && d.getFullYear() === year;
            })
            .reduce((sum, e) => sum + e.amount, 0n);

        const profit = revenue - totalExpenses;
        return { revenue, totalExpenses, profit };
    }, [invoices, expenses]);

    const currentMonthName = MONTHS[new Date().getMonth()];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Reports</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Insights and analytics for your business
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue Table */}
                <Card className="shadow-card lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                Monthly Revenue
                            </CardTitle>
                            <div className="flex items-center gap-3">
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-28">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map(y => (
                                            <SelectItem key={y} value={String(y)}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-muted-foreground">
                                    Total:{' '}
                                    <span className="font-semibold text-foreground">
                                        {formatCurrency(yearTotal)}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <Skeleton key={i} className="h-8 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {monthlyRevenue.map(({ month, amount }) => {
                                    const pct = (Number(amount) / maxMonthAmount) * 100;
                                    return (
                                        <div key={month} className="flex items-center gap-3 text-sm">
                                            <span className="w-24 text-muted-foreground text-xs font-medium shrink-0">
                                                {month}
                                            </span>
                                            <div className="flex-1 h-6 bg-muted rounded-sm overflow-hidden">
                                                <div
                                                    className="h-full bg-primary/70 rounded-sm transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="w-24 text-right font-medium text-foreground text-xs shrink-0">
                                                {formatCurrency(amount)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top 5 Products */}
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Trophy className="h-4 w-4 text-primary" />
                            Top 5 Best-Selling Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        ) : topProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                No sales data yet
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {topProducts.map((product, idx) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                                    >
                                        <span
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                                                idx === 0
                                                    ? 'bg-primary/20 text-primary'
                                                    : idx === 1
                                                      ? 'bg-muted text-muted-foreground'
                                                      : idx === 2
                                                        ? 'bg-warning/20 text-warning-foreground'
                                                        : 'bg-muted/50 text-muted-foreground'
                                            }`}
                                        >
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {String(product.qty)} units sold
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold text-success shrink-0">
                                            {formatCurrency(product.revenue)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current Month Revenue vs Expenses */}
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {currentMonthName} Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg bg-success/5 border border-success/20 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-success" />
                                        <span className="text-sm font-medium">Revenue</span>
                                    </div>
                                    <span className="text-lg font-bold text-success">
                                        {formatCurrency(currentMonthComparison.revenue)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-destructive" />
                                        <span className="text-sm font-medium">Expenses</span>
                                    </div>
                                    <span className="text-lg font-bold text-destructive">
                                        {formatCurrency(currentMonthComparison.totalExpenses)}
                                    </span>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between px-1">
                                    <span className="text-sm font-semibold">Net Profit</span>
                                    <span
                                        className={`text-xl font-bold ${
                                            currentMonthComparison.profit >= 0n
                                                ? 'text-success'
                                                : 'text-destructive'
                                        }`}
                                    >
                                        {currentMonthComparison.profit < 0n ? '-' : ''}
                                        {formatCurrency(
                                            currentMonthComparison.profit < 0n
                                                ? -currentMonthComparison.profit
                                                : currentMonthComparison.profit
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
