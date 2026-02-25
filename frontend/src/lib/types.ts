import { type LineItem, InvoiceStatus } from '../backend';

// Invoice type is not exported from the backend interface, so we define it locally
// matching the backend's Invoice structure exactly.
export interface Invoice {
    id: string;
    customerId: string;
    lineItems: LineItem[];
    totalAmount: bigint;
    status: InvoiceStatus;
    createdAt: bigint;
    dueDate: bigint;
}
