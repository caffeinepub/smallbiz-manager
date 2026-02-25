import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Customer, type Product, type Expense, type LineItem, InvoiceStatus } from '../backend';
import { type Invoice } from '../lib/types';
import { generateId, nowNanoseconds, dateInputToNanoseconds } from '../lib/utils';

// ─── Customers ───────────────────────────────────────────────────────────────

export function useCustomers() {
    const { actor, isFetching } = useActor();
    return useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async () => {
            if (!actor) return [];
            // Backend doesn't have getAllCustomers, so we use local state seeded via mutations
            return [];
        },
        enabled: !!actor && !isFetching,
    });
}

export function useCreateCustomer() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; email: string; phone: string; address: string }) => {
            if (!actor) throw new Error('Actor not ready');
            const id = generateId();
            const createdAt = nowNanoseconds();
            await actor.createCustomer(id, data.name, data.email, data.phone, data.address, createdAt);
            const customer: Customer = { id, name: data.name, email: data.email, phone: data.phone, address: data.address, createdAt };
            return customer;
        },
        onSuccess: (newCustomer) => {
            queryClient.setQueryData<Customer[]>(['customers'], (old = []) => [...old, newCustomer]);
        },
    });
}

export function useUpdateCustomer() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; name: string; email: string; phone: string; address: string }) => {
            if (!actor) throw new Error('Actor not ready');
            await actor.updateCustomer(data.id, data.name, data.email, data.phone, data.address);
            return data;
        },
        onSuccess: (updated) => {
            queryClient.setQueryData<Customer[]>(['customers'], (old = []) =>
                old.map(c => c.id === updated.id ? { ...c, ...updated } : c)
            );
        },
    });
}

export function useDeleteCustomer() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            if (!actor) throw new Error('Actor not ready');
            await actor.deleteCustomer(id);
            return id;
        },
        onSuccess: (id) => {
            queryClient.setQueryData<Customer[]>(['customers'], (old = []) => old.filter(c => c.id !== id));
        },
    });
}

// ─── Products ────────────────────────────────────────────────────────────────

export function useProducts() {
    const { actor, isFetching } = useActor();
    return useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            if (!actor) return [];
            return [];
        },
        enabled: !!actor && !isFetching,
    });
}

export function useAddProduct() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; description: string; price: number; stockQuantity: number; category: string }) => {
            if (!actor) throw new Error('Actor not ready');
            const id = generateId();
            await actor.addProduct(id, data.name, data.description, BigInt(Math.round(data.price * 100)), BigInt(data.stockQuantity), data.category);
            const product: Product = {
                id,
                name: data.name,
                description: data.description,
                price: BigInt(Math.round(data.price * 100)),
                stockQuantity: BigInt(data.stockQuantity),
                category: data.category,
            };
            return product;
        },
        onSuccess: (newProduct) => {
            queryClient.setQueryData<Product[]>(['products'], (old = []) => [...old, newProduct]);
        },
    });
}

export function useUpdateProduct() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; name: string; description: string; price: number; stockQuantity: number; category: string }) => {
            if (!actor) throw new Error('Actor not ready');
            await actor.updateProduct(data.id, data.name, data.description, BigInt(Math.round(data.price * 100)), BigInt(data.stockQuantity), data.category);
            return {
                ...data,
                price: BigInt(Math.round(data.price * 100)),
                stockQuantity: BigInt(data.stockQuantity),
            };
        },
        onSuccess: (updated) => {
            queryClient.setQueryData<Product[]>(['products'], (old = []) =>
                old.map(p => p.id === updated.id ? { ...p, ...updated } : p)
            );
        },
    });
}

export function useDeleteProduct() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            if (!actor) throw new Error('Actor not ready');
            await actor.deleteProduct(id);
            return id;
        },
        onSuccess: (id) => {
            queryClient.setQueryData<Product[]>(['products'], (old = []) => old.filter(p => p.id !== id));
        },
    });
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export function useInvoices() {
    const { actor, isFetching } = useActor();
    return useQuery<Invoice[]>({
        queryKey: ['invoices'],
        queryFn: async () => {
            if (!actor) return [];
            return [];
        },
        enabled: !!actor && !isFetching,
    });
}

export function useCreateInvoice() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            customerId: string;
            lineItems: LineItem[];
            totalAmount: bigint;
            status: InvoiceStatus;
            dueDate: string;
        }) => {
            if (!actor) throw new Error('Actor not ready');
            const id = generateId();
            const createdAt = nowNanoseconds();
            const dueDate = dateInputToNanoseconds(data.dueDate);
            await actor.createInvoice(id, data.customerId, data.lineItems, data.totalAmount, data.status, createdAt, dueDate);
            const invoice: Invoice = {
                id,
                customerId: data.customerId,
                lineItems: data.lineItems,
                totalAmount: data.totalAmount,
                status: data.status,
                createdAt,
                dueDate,
            };
            return invoice;
        },
        onSuccess: (newInvoice) => {
            queryClient.setQueryData<Invoice[]>(['invoices'], (old = []) => [...old, newInvoice]);
        },
    });
}

export function useUpdateInvoiceStatus() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; status: InvoiceStatus }) => {
            if (!actor) throw new Error('Actor not ready');
            await actor.updateInvoiceStatus(data.id, data.status);
            return data;
        },
        onSuccess: (updated) => {
            queryClient.setQueryData<Invoice[]>(['invoices'], (old = []) =>
                old.map(inv => inv.id === updated.id ? { ...inv, status: updated.status } : inv)
            );
            // When paid, update product stock quantities in local cache
            if (updated.status === InvoiceStatus.paid) {
                const invoices = queryClient.getQueryData<Invoice[]>(['invoices']) || [];
                const invoice = invoices.find(i => i.id === updated.id);
                if (invoice) {
                    const products = queryClient.getQueryData<Product[]>(['products']) || [];
                    const updatedProducts = products.map(p => {
                        const lineItem = invoice.lineItems.find(li => li.productId === p.id);
                        if (lineItem) {
                            const newQty = p.stockQuantity - lineItem.quantity;
                            return { ...p, stockQuantity: newQty < 0n ? 0n : newQty };
                        }
                        return p;
                    });
                    queryClient.setQueryData<Product[]>(['products'], updatedProducts);
                }
            }
        },
    });
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export function useExpenses() {
    const { actor, isFetching } = useActor();
    return useQuery<Expense[]>({
        queryKey: ['expenses'],
        queryFn: async () => {
            if (!actor) return [];
            return [];
        },
        enabled: !!actor && !isFetching,
    });
}

export function useAddExpense() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { category: string; amount: number; description: string; date: string }) => {
            if (!actor) throw new Error('Actor not ready');
            const id = generateId();
            const dateNs = dateInputToNanoseconds(data.date);
            const amountCents = BigInt(Math.round(data.amount * 100));
            await actor.addExpense(id, data.category, amountCents, data.description, dateNs);
            const expense: Expense = { id, category: data.category, amount: amountCents, description: data.description, date: dateNs };
            return expense;
        },
        onSuccess: (newExpense) => {
            queryClient.setQueryData<Expense[]>(['expenses'], (old = []) => [...old, newExpense]);
        },
    });
}

export function useUpdateExpense() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; category: string; amount: number; description: string; date: string }) => {
            if (!actor) throw new Error('Actor not ready');
            const dateNs = dateInputToNanoseconds(data.date);
            const amountCents = BigInt(Math.round(data.amount * 100));
            await actor.updateExpense(data.id, data.category, amountCents, data.description, dateNs);
            return { id: data.id, category: data.category, amount: amountCents, description: data.description, date: dateNs };
        },
        onSuccess: (updated) => {
            queryClient.setQueryData<Expense[]>(['expenses'], (old = []) =>
                old.map(e => e.id === updated.id ? { ...e, ...updated } : e)
            );
        },
    });
}

export function useDeleteExpense() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            if (!actor) throw new Error('Actor not ready');
            await actor.deleteExpense(id);
            return id;
        },
        onSuccess: (id) => {
            queryClient.setQueryData<Expense[]>(['expenses'], (old = []) => old.filter(e => e.id !== id));
        },
    });
}
