import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

const rootRoute = createRootRoute({
    component: () => (
        <Layout>
            <Outlet />
        </Layout>
    ),
});

const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Dashboard });
const customersRoute = createRoute({ getParentRoute: () => rootRoute, path: '/customers', component: Customers });
const inventoryRoute = createRoute({ getParentRoute: () => rootRoute, path: '/inventory', component: Inventory });
const invoicesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/invoices', component: Invoices });
const expensesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/expenses', component: Expenses });
const reportsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/reports', component: Reports });

const routeTree = rootRoute.addChildren([
    dashboardRoute,
    customersRoute,
    inventoryRoute,
    invoicesRoute,
    expensesRoute,
    reportsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <RouterProvider router={router} />
            <Toaster richColors position="top-right" />
        </ThemeProvider>
    );
}
