import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Customer } from '../backend';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useQueries';
import { toast } from 'sonner';

interface CustomerFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: Customer | null;
}

export default function CustomerForm({ open, onOpenChange, customer }: CustomerFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const isEditing = !!customer;
    const isLoading = createCustomer.isPending || updateCustomer.isPending;

    useEffect(() => {
        if (open) {
            setName(customer?.name ?? '');
            setEmail(customer?.email ?? '');
            setPhone(customer?.phone ?? '');
            setAddress(customer?.address ?? '');
            setErrors({});
        }
    }, [open, customer]);

    function validate() {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address';
        return errs;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        try {
            if (isEditing && customer) {
                await updateCustomer.mutateAsync({ id: customer.id, name, email, phone, address });
                toast.success('Customer updated successfully');
            } else {
                await createCustomer.mutateAsync({ name, email, phone, address });
                toast.success('Customer created successfully');
            }
            onOpenChange(false);
        } catch {
            toast.error('Failed to save customer');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="cust-name">Name <span className="text-destructive">*</span></Label>
                        <Input id="cust-name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="cust-email">Email <span className="text-destructive">*</span></Label>
                        <Input id="cust-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="cust-phone">Phone</Label>
                        <Input id="cust-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="cust-address">Address</Label>
                        <Input id="cust-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, City, State" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : isEditing ? 'Update Customer' : 'Add Customer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
