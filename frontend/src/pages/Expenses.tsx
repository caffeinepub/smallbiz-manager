import { useState, useMemo } from 'react';
import { useExpenses, useDeleteExpense } from '../hooks/useQueries';
import { type Expense } from '../backend';
import ExpenseForm from '../components/ExpenseForm';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '../lib/utils';
import { Plus, Pencil, Trash2, Receipt, PieChart } from 'lucide-react';
import { toast } from 'sonner';

export default function Expenses() {
    const { data: expenses = [], isLoading } = useExpenses();
    const deleteExpense = useDeleteExpense();

    const [formOpen, setFormOpen] = useState(false);
    const [editExpense, setEditExpense] = useState<Expense | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const sorted = [...expenses].sort((a, b) => Number(b.date - a.date));

    const currentMonthSummary = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthExpenses = expenses.filter(e => {
            const ms = Number(e.date) / 1_000_000;
            const d = new Date(ms);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const byCategory: Record<string, bigint> = {};
        monthExpenses.forEach(e => {
            byCategory[e.category] = (byCategory[e.category] ?? 0n) + e.amount;
        });

        return Object.entries(byCategory).sort((a, b) => Number(b[1] - a[1]));
    }, [expenses]);

    const totalThisMonth = currentMonthSummary.reduce((sum, [, amt]) => sum + amt, 0n);

    function handleEdit(expense: Expense) {
        setEditExpense(expense);
        setFormOpen(true);
    }

    async function handleDelete() {
        if (!deleteId) return;
        try {
            await deleteExpense.mutateAsync(deleteId);
            toast.success('Expense deleted');
        } catch {
            toast.error('Failed to delete expense');
        } finally {
            setDeleteId(null);
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Track and manage your business expenses</p>
                </div>
                <Button onClick={() => { setEditExpense(null); setFormOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add Expense
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Expense List */}
                <div className="lg:col-span-2">
                    <Card className="shadow-card">
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-4 space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                                </div>
                            ) : sorted.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Receipt className="h-10 w-10 text-muted-foreground/40 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground">No expenses yet</p>
                                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setFormOpen(true)}>
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Add your first expense
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="hidden md:table-cell">Description</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sorted.map(expense => (
                                            <TableRow key={expense.id} className="hover:bg-muted/30">
                                                <TableCell className="text-muted-foreground text-sm">{formatDate(expense.date)}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                        {expense.category}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground text-sm truncate max-w-xs">
                                                    {expense.description || '—'}
                                                </TableCell>
                                                <TableCell className="font-semibold">{formatCurrency(expense.amount)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(expense)}>
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(expense.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Summary */}
                <div>
                    <Card className="shadow-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <PieChart className="h-4 w-4 text-primary" />
                                This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                                </div>
                            ) : currentMonthSummary.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No expenses this month</p>
                            ) : (
                                <div className="space-y-2">
                                    {currentMonthSummary.map(([category, amount]) => (
                                        <div key={category} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground truncate max-w-[120px]">{category}</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(amount)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-border pt-2 mt-2 flex items-center justify-between text-sm font-semibold">
                                        <span>Total</span>
                                        <span className="text-destructive">{formatCurrency(totalThisMonth)}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ExpenseForm open={formOpen} onOpenChange={setFormOpen} expense={editExpense} />
            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={open => !open && setDeleteId(null)}
                title="Delete Expense"
                description="Are you sure you want to delete this expense? This action cannot be undone."
                onConfirm={handleDelete}
                isLoading={deleteExpense.isPending}
            />
        </div>
    );
}
