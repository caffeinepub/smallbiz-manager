import { useState } from 'react';
import { useProducts, useDeleteProduct } from '../hooks/useQueries';
import { type Product } from '../backend';
import ProductForm from '../components/ProductForm';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '../lib/utils';
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Inventory() {
    const { data: products = [], isLoading } = useProducts();
    const deleteProduct = useDeleteProduct();

    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    const lowStockCount = products.filter(p => p.stockQuantity < 5n).length;

    function handleEdit(product: Product) {
        setEditProduct(product);
        setFormOpen(true);
    }

    async function handleDelete() {
        if (!deleteId) return;
        try {
            await deleteProduct.mutateAsync(deleteId);
            toast.success('Product deleted');
        } catch {
            toast.error('Failed to delete product');
        } finally {
            setDeleteId(null);
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Track your products and stock levels</p>
                </div>
                <Button onClick={() => { setEditProduct(null); setFormOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add Product
                </Button>
            </div>

            {lowStockCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span><strong>{lowStockCount}</strong> product{lowStockCount !== 1 ? 's' : ''} with low stock (below 5 units)</span>
                </div>
            )}

            <Card className="shadow-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or category..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <span className="text-sm text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {search ? 'No products match your search' : 'No products yet'}
                            </p>
                            {!search && (
                                <Button variant="outline" size="sm" className="mt-3" onClick={() => setFormOpen(true)}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add your first product
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(product => {
                                    const isLowStock = product.stockQuantity < 5n;
                                    return (
                                        <TableRow key={product.id} className={`hover:bg-muted/30 ${isLowStock ? 'bg-destructive/3' : ''}`}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    {product.description && (
                                                        <p className="text-xs text-muted-foreground truncate max-w-xs">{product.description}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {product.category ? (
                                                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell className="font-medium">{formatCurrency(product.price)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-medium ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                                                        {String(product.stockQuantity)}
                                                    </span>
                                                    {isLowStock && (
                                                        <Badge variant="destructive" className="text-xs px-1.5 py-0">Low</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(product)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(product.id)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <ProductForm open={formOpen} onOpenChange={setFormOpen} product={editProduct} />
            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={open => !open && setDeleteId(null)}
                title="Delete Product"
                description="Are you sure you want to delete this product? This action cannot be undone."
                onConfirm={handleDelete}
                isLoading={deleteProduct.isPending}
            />
        </div>
    );
}
