import EnterpriseConsoleShell from '@/components/admin/EnterpriseConsoleShell';
import ConsoleCard from '@/components/admin/ConsoleCard';
import { enterpriseConsoleModules } from '@/lib/admin-console/modules';

export default function EnterpriseConsolePage() {
  return <EnterpriseConsoleShell title="Enterprise Administration Console" description="Central control center for CRM, Dispatch, Inventory, Accounting, Reporting, and Security.">
    <section style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px,1fr))', gap:16}}>
      {enterpriseConsoleModules.map(module => <ConsoleCard key={module.domain} module={module} />)}
    </section>
  </EnterpriseConsoleShell>
}
