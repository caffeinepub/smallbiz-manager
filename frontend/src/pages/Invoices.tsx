import { useState } from 'react';
import { useInvoices, useCustomers, useProducts } from '../hooks/useQueries';
import { InvoiceStatus } from '../backend';
import { type Invoice } from '../lib/types';
import InvoiceForm from '../components/InvoiceForm';
import InvoiceDetail from '../components/InvoiceDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '../lib/utils';
import { Plus, FileText } from 'lucide-react';

const statusColors: Record<string, string> = {
    [InvoiceStatus.paid]: 'text-success bg-success/10 border-success/20',
    [InvoiceStatus.sent]: 'text-primary bg-primary/10 border-primary/20',
    [InvoiceStatus.draft]: 'text-muted-foreground bg-muted border-border',
    [InvoiceStatus.overdue]: 'text-destructive bg-destructive/10 border-destructive/20',
};

export default function Invoices() {
    const { data: invoices = [], isLoading } = useInvoices();
    const { data: customers = [] } = useCustomers();
    const { data: products = [] } = useProducts();

    const [formOpen, setFormOpen] = useState(false);
    const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filtered =
        statusFilter === 'all' ? invoices : invoices.filter(inv => inv.status === statusFilter);

    const sorted = [...filtered].sort((a, b) => Number(b.createdAt - a.createdAt));

    function handleView(invoice: Invoice) {
        setDetailInvoice(invoice);
        setDetailOpen(true);
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Create and manage your invoices</p>
                </div>
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" /> Create Invoice
                </Button>
            </div>

            <Card className="shadow-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value={InvoiceStatus.draft}>Draft</SelectItem>
                                <SelectItem value={InvoiceStatus.sent}>Sent</SelectItem>
                                <SelectItem value={InvoiceStatus.paid}>Paid</SelectItem>
                                <SelectItem value={InvoiceStatus.overdue}>Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">
                            {sorted.length} invoice{sorted.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : sorted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {statusFilter !== 'all'
                                    ? 'No invoices with this status'
                                    : 'No invoices yet'}
                            </p>
                            {statusFilter === 'all' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => setFormOpen(true)}
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Create your first invoice
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Due Date</TableHead>
                                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sorted.map(invoice => {
                                    const customer = customers.find(c => c.id === invoice.customerId);
                                    return (
                                        <TableRow
                                            key={invoice.id}
                                            className="hover:bg-muted/30 cursor-pointer"
                                            onClick={() => handleView(invoice)}
                                        >
                                            <TableCell className="font-mono text-sm font-medium">
                                                #{invoice.id.slice(-8)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {customer?.name ?? 'Unknown'}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {formatCurrency(invoice.totalAmount)}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[invoice.status] ?? ''}`}
                                                >
                                                    {invoice.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {formatDate(invoice.dueDate)}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                {formatDate(invoice.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <InvoiceForm
                open={formOpen}
                onOpenChange={setFormOpen}
                customers={customers}
                products={products}
            />
            <InvoiceDetail
                open={detailOpen}
                onOpenChange={setDetailOpen}
                invoice={detailInvoice}
                customer={
                    detailInvoice ? customers.find(c => c.id === detailInvoice.customerId) : null
                }
            />
        </div>
    );
}
