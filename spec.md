# Specification

## Summary
**Goal:** Convert all currency displays in the BizSolve application from US Dollars ($) to Indian Rupees (₹).

**Planned changes:**
- Update the `formatCurrency` utility in `frontend/src/lib/utils.ts` to use locale `en-IN` and currency code `INR`, rendering the ₹ symbol.
- Ensure the updated formatting propagates to Dashboard metrics (total revenue, monthly revenue).
- Ensure the updated formatting propagates to Invoices (line item prices, subtotals, totals).
- Ensure the updated formatting propagates to Expenses (amounts, category summaries).
- Ensure the updated formatting propagates to Inventory/Products (unit prices).
- Ensure the updated formatting propagates to Reports (revenue charts, expense vs revenue breakdown, top products).

**User-visible outcome:** All monetary values throughout the application display with the ₹ symbol instead of $, with no $ symbols remaining in the UI.
