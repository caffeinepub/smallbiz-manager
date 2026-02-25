import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { type Customer } from '../backend';
import { InvoiceStatus } from '../backend';
import { type Invoice } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/utils';
import { Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';

interface CustomerDetailProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: Customer | null;
    invoices: Invoice[];
}

const statusColors: Record<string, string> = {
    [InvoiceStatus.paid]: 'bg-success/10 text-success border-success/20',
    [InvoiceStatus.sent]: 'bg-primary/10 text-primary border-primary/20',
    [InvoiceStatus.draft]: 'bg-muted text-muted-foreground border-border',
    [InvoiceStatus.overdue]: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function CustomerDetail({ open, onOpenChange, customer, invoices }: CustomerDetailProps) {
    if (!customer) return null;
    const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
    const totalRevenue = customerInvoices
        .filter(inv => inv.status === InvoiceStatus.paid)
        .reduce((sum, inv) => sum + inv.totalAmount, 0n);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Customer Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                        <h3 className="font-semibold text-lg text-foreground">{customer.name}</h3>
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                            {customer.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span>{customer.email}</span>
                                </div>
                            )}
                            {customer.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                            {customer.address && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{customer.address}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Customer since {formatDate(customer.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="h-4 w-4 text-primary" />
                            <span>Invoices ({customerInvoices.length})</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Total Revenue:{' '}
                            <span className="font-semibold text-success">{formatCurrency(totalRevenue)}</span>
                        </span>
                    </div>

                    <Separator />

                    {customerInvoices.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No invoices yet</p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {customerInvoices.map(inv => (
                                <div
                                    key={inv.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">Invoice #{inv.id.slice(-6)}</p>
                                        <p className="text-xs text-muted-foreground">Due: {formatDate(inv.dueDate)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{formatCurrency(inv.totalAmount)}</span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColors[inv.status] ?? ''}`}
                                        >
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
