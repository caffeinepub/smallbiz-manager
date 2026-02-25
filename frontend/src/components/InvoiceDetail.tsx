import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { type Customer, InvoiceStatus } from '../backend';
import { type Invoice } from '../lib/types';
import { useUpdateInvoiceStatus } from '../hooks/useQueries';
import { formatCurrency, formatDate } from '../lib/utils';
import { toast } from 'sonner';

interface InvoiceDetailProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: Invoice | null;
    customer?: Customer | null;
}

const statusColors: Record<string, string> = {
    [InvoiceStatus.paid]: 'text-success bg-success/10 border-success/20',
    [InvoiceStatus.sent]: 'text-primary bg-primary/10 border-primary/20',
    [InvoiceStatus.draft]: 'text-muted-foreground bg-muted border-border',
    [InvoiceStatus.overdue]: 'text-destructive bg-destructive/10 border-destructive/20',
};

export default function InvoiceDetail({ open, onOpenChange, invoice, customer }: InvoiceDetailProps) {
    const updateStatus = useUpdateInvoiceStatus();

    if (!invoice) return null;

    async function handleStatusChange(newStatus: string) {
        if (!invoice) return;
        try {
            await updateStatus.mutateAsync({ id: invoice.id, status: newStatus as InvoiceStatus });
            toast.success('Invoice status updated');
        } catch {
            toast.error('Failed to update status');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Invoice #{invoice.id.slice(-8)}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Customer</p>
                            <p className="font-medium">{customer?.name ?? 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[invoice.status] ?? ''}`}
                            >
                                {invoice.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Issued</p>
                            <p className="font-medium">{formatDate(invoice.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Due Date</p>
                            <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-2">Line Items</p>
                        <div className="space-y-1.5">
                            {invoice.lineItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        {item.description && (
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(item.price)} × {String(item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Total Amount</span>
                        <span className="text-xl font-bold text-primary">{formatCurrency(invoice.totalAmount)}</span>
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-sm font-medium">Update Status</p>
                        <Select
                            value={invoice.status}
                            onValueChange={handleStatusChange}
                            disabled={updateStatus.isPending}
                        >
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
                        {invoice.status !== InvoiceStatus.paid && (
                            <p className="text-xs text-muted-foreground">
                                Marking as <strong>Paid</strong> will reduce product stock quantities.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
