import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Product } from '../backend';
import { useAddProduct, useUpdateProduct } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
}

export default function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [category, setCategory] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const addProduct = useAddProduct();
    const updateProduct = useUpdateProduct();
    const isEditing = !!product;
    const isLoading = addProduct.isPending || updateProduct.isPending;

    useEffect(() => {
        if (open) {
            setName(product?.name ?? '');
            setDescription(product?.description ?? '');
            setPrice(product ? (Number(product.price) / 100).toFixed(2) : '');
            setStockQuantity(product ? String(product.stockQuantity) : '');
            setCategory(product?.category ?? '');
            setErrors({});
        }
    }, [open, product]);

    function validate() {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Name is required';
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) errs.price = 'Price must be greater than 0';
        const qtyNum = parseInt(stockQuantity);
        if (isNaN(qtyNum) || qtyNum < 0) errs.stockQuantity = 'Stock quantity must be 0 or more';
        return errs;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        try {
            const data = { name, description, price: parseFloat(price), stockQuantity: parseInt(stockQuantity), category };
            if (isEditing && product) {
                await updateProduct.mutateAsync({ id: product.id, ...data });
                toast.success('Product updated successfully');
            } else {
                await addProduct.mutateAsync(data);
                toast.success('Product added successfully');
            }
            onOpenChange(false);
        } catch {
            toast.error('Failed to save product');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="prod-name">Name <span className="text-destructive">*</span></Label>
                        <Input id="prod-name" value={name} onChange={e => setName(e.target.value)} placeholder="Product name" />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="prod-desc">Description</Label>
                        <Textarea id="prod-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Product description" rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-price">Price ($) <span className="text-destructive">*</span></Label>
                            <Input id="prod-price" type="number" step="0.01" min="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="prod-qty">Stock Qty <span className="text-destructive">*</span></Label>
                            <Input id="prod-qty" type="number" min="0" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} placeholder="0" />
                            {errors.stockQuantity && <p className="text-xs text-destructive">{errors.stockQuantity}</p>}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="prod-cat">Category</Label>
                        <Input id="prod-cat" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Electronics, Clothing" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
