import { useState } from 'react';
import { useCustomers, useDeleteCustomer } from '../hooks/useQueries';
import { useInvoices } from '../hooks/useQueries';
import { type Customer } from '../backend';
import CustomerForm from '../components/CustomerForm';
import CustomerDetail from '../components/CustomerDetail';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '../lib/utils';
import { Plus, Search, Pencil, Trash2, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function Customers() {
    const { data: customers = [], isLoading } = useCustomers();
    const { data: invoices = [] } = useInvoices();
    const deleteCustomer = useDeleteCustomer();

    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    function handleEdit(customer: Customer) {
        setEditCustomer(customer);
        setFormOpen(true);
    }

    function handleView(customer: Customer) {
        setDetailCustomer(customer);
        setDetailOpen(true);
    }

    async function handleDelete() {
        if (!deleteId) return;
        try {
            await deleteCustomer.mutateAsync(deleteId);
            toast.success('Customer deleted');
        } catch {
            toast.error('Failed to delete customer');
        } finally {
            setDeleteId(null);
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Customers</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your customer relationships</p>
                </div>
                <Button onClick={() => { setEditCustomer(null); setFormOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add Customer
                </Button>
            </div>

            <Card className="shadow-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <span className="text-sm text-muted-foreground">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {search ? 'No customers match your search' : 'No customers yet'}
                            </p>
                            {!search && (
                                <Button variant="outline" size="sm" className="mt-3" onClick={() => setFormOpen(true)}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add your first customer
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(customer => (
                                    <TableRow key={customer.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">{customer.phone || '—'}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(customer.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(customer)}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(customer)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(customer.id)}>
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

            <CustomerForm open={formOpen} onOpenChange={setFormOpen} customer={editCustomer} />
            <CustomerDetail open={detailOpen} onOpenChange={setDetailOpen} customer={detailCustomer} invoices={invoices} />
            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={open => !open && setDeleteId(null)}
                title="Delete Customer"
                description="Are you sure you want to delete this customer? This action cannot be undone."
                onConfirm={handleDelete}
                isLoading={deleteCustomer.isPending}
            />
        </div>
    );
}
