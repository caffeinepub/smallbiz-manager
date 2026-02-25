import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LineItem {
    name: string;
    description: string;
    productId: string;
    quantity: bigint;
    price: bigint;
}
export interface Expense {
    id: string;
    date: bigint;
    description: string;
    category: string;
    amount: bigint;
}
export interface Product {
    id: string;
    stockQuantity: bigint;
    name: string;
    description: string;
    category: string;
    price: bigint;
}
export interface Customer {
    id: string;
    name: string;
    createdAt: bigint;
    email: string;
    address: string;
    phone: string;
}
export enum InvoiceStatus {
    paid = "paid",
    sent = "sent",
    overdue = "overdue",
    draft = "draft"
}
export interface backendInterface {
    addExpense(id: string, category: string, amount: bigint, description: string, date: bigint): Promise<string>;
    addProduct(id: string, name: string, description: string, price: bigint, stockQuantity: bigint, category: string): Promise<string>;
    createCustomer(id: string, name: string, email: string, phone: string, address: string, createdAt: bigint): Promise<string>;
    createInvoice(id: string, customerId: string, lineItems: Array<LineItem>, totalAmount: bigint, status: InvoiceStatus, createdAt: bigint, dueDate: bigint): Promise<string>;
    deleteCustomer(id: string): Promise<string>;
    deleteExpense(id: string): Promise<string>;
    deleteProduct(id: string): Promise<string>;
    getCustomerById(id: string): Promise<Customer | null>;
    getExpenseById(id: string): Promise<Expense | null>;
    getProductById(id: string): Promise<Product | null>;
    updateCustomer(id: string, name: string, email: string, phone: string, address: string): Promise<string>;
    updateExpense(id: string, category: string, amount: bigint, description: string, date: bigint): Promise<string>;
    updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<string>;
    updateProduct(id: string, name: string, description: string, price: bigint, stockQuantity: bigint, category: string): Promise<string>;
}
