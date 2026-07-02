import type { ConsoleModule } from '@/types/admin-console';

export const enterpriseConsoleModules: ConsoleModule[] = [
  { domain:'crm', title:'CRM', href:'/admin/crm', status:'ready', description:'Customers, contacts, quotes, service history, and retention.', metrics:[{label:'Customers', value:'Live', href:'/admin/customers'}, {label:'Quotes', value:'Live', href:'/admin/quotes'}] },
  { domain:'dispatch', title:'Dispatch', href:'/admin/dispatch', status:'building', description:'Technicians, scheduling, work assignments, service requests, and work orders.', metrics:[{label:'Work Orders', value:'Live', href:'/admin/work-orders'}, {label:'Service Requests', value:'Live'}] },
  { domain:'inventory', title:'Inventory', href:'/admin/inventory', status:'ready', description:'Products, categories, warehouses, balances, adjustments, purchasing, and vendors.', metrics:[{label:'Products', value:'Live', href:'/admin/products'}, {label:'Warehouses', value:'Live', href:'/admin/warehouses'}] },
  { domain:'accounting', title:'Accounting', href:'/admin/accounting', status:'ready', description:'Invoices, invoice items, payments, expenses, tax rates, and financial controls.', metrics:[{label:'Invoices', value:'Live', href:'/admin/invoices'}, {label:'Payments', value:'Live', href:'/admin/payments'}] },
  { domain:'reporting', title:'Reporting', href:'/admin/reporting', status:'ready', description:'Executive dashboard, revenue, retention, job counts, inventory reorder, technician productivity.', metrics:[{label:'KPIs', value:'Live', href:'/admin/reports'}, {label:'Dashboards', value:'Ready'}] },
  { domain:'security', title:'Security & IAM', href:'/admin/security', status:'attention', description:'Users, roles, permissions, MFA, sessions, audit, API keys, service accounts, and impersonation.', metrics:[{label:'Users', value:'Live', href:'/admin/users'}, {label:'Roles', value:'Live', href:'/admin/roles'}] },
];
