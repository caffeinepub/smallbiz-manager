import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Customer, type Product, type LineItem, InvoiceStatus } from '../backend';
import { useCreateInvoice } from '../hooks/useQueries';
import { formatCurrency } from '../lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customers: Customer[];
    products: Product[];
}

interface LineItemDraft {
    productId: string;
    name: string;
    description: string;
    price: bigint;
    quantity: number;
}

export default function InvoiceForm({ open, onOpenChange, customers, products }: InvoiceFormProps) {
    const [customerId, setCustomerId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.draft);
    const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createInvoice = useCreateInvoice();
    const isLoading = createInvoice.isPending;

    useEffect(() => {
        if (open) {
            setCustomerId('');
            setDueDate('');
            setStatus(InvoiceStatus.draft);
            setLineItems([]);
            setErrors({});
        }
    }, [open]);

    function addLineItem() {
        setLineItems(prev => [...prev, { productId: '', name: '', description: '', price: 0n, quantity: 1 }]);
    }

    function removeLineItem(idx: number) {
        setLineItems(prev => prev.filter((_, i) => i !== idx));
    }

    function updateLineItemProduct(idx: number, productId: string) {
        const product = products.find(p => p.id === productId);
        setLineItems(prev => prev.map((item, i) =>
            i === idx ? {
                ...item,
                productId,
                name: product?.name ?? '',
                description: product?.description ?? '',
                price: product?.price ?? 0n,
            } : item
        ));
    }

    function updateLineItemQty(idx: number, qty: number) {
        setLineItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.price * BigInt(item.quantity), 0n);

    function validate() {
        const errs: Record<string, string> = {};
        if (!customerId) errs.customerId = 'Please select a customer';
        if (!dueDate) errs.dueDate = 'Due date is required';
        if (lineItems.length === 0) errs.lineItems = 'Add at least one line item';
        if (lineItems.some(li => !li.productId)) errs.lineItems = 'All line items must have a product selected';
        if (lineItems.some(li => li.quantity < 1)) errs.lineItems = 'Quantity must be at least 1';
        return errs;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        try {
            const items: LineItem[] = lineItems.map(li => ({
                productId: li.productId,
                name: li.name,
                description: li.description,
                price: li.price,
                quantity: BigInt(li.quantity),
            }));
            await createInvoice.mutateAsync({ customerId, lineItems: items, totalAmount, status, dueDate });
            toast.success('Invoice created successfully');
            onOpenChange(false);
        } catch {
            toast.error('Failed to create invoice');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Invoice</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Customer <span className="text-destructive">*</span></Label>
                            <Select value={customerId} onValueChange={setCustomerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.customerId && <p className="text-xs text-destructive">{errors.customerId}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="inv-due">Due Date <span className="text-destructive">*</span></Label>
                            <Input id="inv-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                            {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={v => setStatus(v as InvoiceStatus)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={InvoiceStatus.draft}>Draft</SelectItem>
                                <SelectItem value={InvoiceStatus.sent}>Sent</SelectItem>
                                <SelectItem value={InvoiceStatus.paid}>Paid</SelectItem>
                                <SelectItem value={InvoiceStatus.overdue}>Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Line Items <span className="text-destructive">*</span></Label>
                            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
                            </Button>
                        </div>
                        {errors.lineItems && <p className="text-xs text-destructive">{errors.lineItems}</p>}

                        {lineItems.length === 0 && (
                            <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                                No line items yet. Click "Add Item" to start.
                            </div>
                        )}

                        {lineItems.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end rounded-lg border border-border p-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Product</Label>
                                    <Select value={item.productId} onValueChange={v => updateLineItemProduct(idx, v)}>
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name} — {formatCurrency(p.price)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1 w-20">
                                    <Label className="text-xs">Qty</Label>
                                    <Input
                                        type="number" min="1" value={item.quantity}
                                        onChange={e => updateLineItemQty(idx, parseInt(e.target.value) || 1)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <div className="space-y-1 w-24">
                                    <Label className="text-xs">Subtotal</Label>
                                    <div className="h-8 flex items-center text-sm font-medium text-foreground">
                                        {formatCurrency(item.price * BigInt(item.quantity))}
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeLineItem(idx)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}

                        {lineItems.length > 0 && (
                            <div className="flex justify-end rounded-lg bg-muted/50 px-4 py-2">
                                <span className="text-sm font-semibold">Total: {formatCurrency(totalAmount)}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Invoice'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
