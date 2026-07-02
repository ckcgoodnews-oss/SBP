import Link from 'next/link';
import EnterpriseConsoleShell from '@/components/admin/EnterpriseConsoleShell';

const domainLinks: Record<string, {title:string; description:string; links:[string,string][]}> = {
  crm:{title:'CRM Administration', description:'Manage customers, contacts, quotes, service history, and retention workflows.', links:[['Customers','/admin/customers'],['Contacts','/admin/contacts'],['Quotes','/admin/quotes'],['Customer Notes','/admin/customer-notes']]},
  dispatch:{title:'Dispatch Administration', description:'Manage service requests, work orders, technicians, assignments, scheduling, and field operations.', links:[['Service Requests','/admin/service-requests'],['Work Orders','/admin/work-orders'],['Technicians','/admin/users'],['Service Locations','/admin/service-locations']]},
  inventory:{title:'Inventory Administration', description:'Manage products, categories, warehouses, balances, adjustments, purchase orders, and vendors.', links:[['Products','/admin/products'],['Product Categories','/admin/product-categories'],['Warehouses','/admin/warehouses'],['Inventory Balances','/admin/inventory-balances'],['Adjustments','/admin/inventory-adjustments'],['Purchase Orders','/admin/purchase-orders'],['Vendors','/admin/vendors']]},
  accounting:{title:'Accounting Administration', description:'Manage invoices, payments, expenses, tax rates, revenue controls, and financial workflows.', links:[['Invoices','/admin/invoices'],['Payments','/admin/payments'],['Expenses','/admin/expenses'],['Tax Rates','/admin/tax-rates']]},
  reporting:{title:'Reporting Administration', description:'Review operational KPIs, revenue, customer retention, job counts, inventory reorder, and technician productivity.', links:[['Reports Home','/admin/reports'],['Executive Dashboard','/admin/reports'],['Monthly Revenue','/admin/reports'],['Technician Productivity','/admin/reports']]},
  security:{title:'Security & IAM Administration', description:'Control users, roles, permissions, MFA, sessions, audit events, service accounts, and impersonation.', links:[['Users','/admin/users'],['Roles','/admin/roles'],['Permissions','/admin/permissions'],['MFA','/admin/mfa'],['Sessions','/admin/sessions'],['Audit','/admin/audit'],['Audit Timeline','/admin/audit-timeline'],['API Keys','/admin/api-keys'],['Service Accounts','/admin/service-accounts'],['Impersonation','/admin/impersonation']]},
};

export default function DomainPage({ domain }: { domain: keyof typeof domainLinks }) {
  const d = domainLinks[domain];
  return <EnterpriseConsoleShell title={d.title} description={d.description}>
    <section style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:12}}>
      {d.links.map(([label,href]) => <Link key={href+label} href={href} style={{padding:18, border:'1px solid #e2e8f0', borderRadius:14, textDecoration:'none', background:'white', fontWeight:700}}>{label}<span style={{float:'right'}}>→</span></Link>)}
    </section>
  </EnterpriseConsoleShell>
}
