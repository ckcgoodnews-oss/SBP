import './globals.css';
import type { Metadata } from 'next';
import { AuthStatus } from '@/components/AuthStatus';

export const metadata: Metadata = {
  title: 'Service Business Platform',
  description: 'Service Business Platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a className="brand" href="/">Service Business Platform</a>
          <nav className="nav">
            <a href="/admin">Admin</a>
            <a href="/customer">Customer</a>
            <a href="/technician">Technician</a>
            <a href="/admin/dashboard">Dashboard</a>
            <a href="/admin/customers">Customers</a>
            <a href="/admin/work-orders">Work Orders</a>
            <a href="/admin/invoices">Invoices</a>
            <AuthStatus />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
