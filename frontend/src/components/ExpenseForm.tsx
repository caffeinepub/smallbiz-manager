import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Expense } from '../backend';
import { useAddExpense, useUpdateExpense } from '../hooks/useQueries';
import { formatDateInput } from '../lib/utils';
import { toast } from 'sonner';

interface ExpenseFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expense?: Expense | null;
}

export default function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const addExpense = useAddExpense();
    const updateExpense = useUpdateExpense();
    const isEditing = !!expense;
    const isLoading = addExpense.isPending || updateExpense.isPending;

    useEffect(() => {
        if (open) {
            setCategory(expense?.category ?? '');
            setAmount(expense ? (Number(expense.amount) / 100).toFixed(2) : '');
            setDescription(expense?.description ?? '');
            setDate(expense ? formatDateInput(expense.date) : new Date().toISOString().split('T')[0]);
            setErrors({});
        }
    }, [open, expense]);

    function validate() {
        const errs: Record<string, string> = {};
        if (!category.trim()) errs.category = 'Category is required';
        const amtNum = parseFloat(amount);
        if (isNaN(amtNum) || amtNum <= 0) errs.amount = 'Amount must be greater than 0';
        if (!date) errs.date = 'Date is required';
        return errs;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        try {
            const data = { category, amount: parseFloat(amount), description, date };
            if (isEditing && expense) {
                await updateExpense.mutateAsync({ id: expense.id, ...data });
                toast.success('Expense updated successfully');
            } else {
                await addExpense.mutateAsync(data);
                toast.success('Expense added successfully');
            }
            onOpenChange(false);
        } catch {
            toast.error('Failed to save expense');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="exp-cat">Category <span className="text-destructive">*</span></Label>
                        <Input id="exp-cat" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Rent, Utilities, Marketing" />
                        {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="exp-amount">Amount ($) <span className="text-destructive">*</span></Label>
                            <Input id="exp-amount" type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="exp-date">Date <span className="text-destructive">*</span></Label>
                            <Input id="exp-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="exp-desc">Description</Label>
                        <Textarea id="exp-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional notes about this expense" rows={2} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : isEditing ? 'Update Expense' : 'Add Expense'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
