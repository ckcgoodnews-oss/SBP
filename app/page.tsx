const modules = ['Executive Dashboard', 'Revenue', 'Jobs', 'Technicians', 'Inventory', 'Customers', 'Audit Logs', 'Notifications', 'Integrations'];

export default function HomePage() {
  return (
    <main className="main">
      <h1>SBP Reports & Integrations Foundation</h1>
      <p>Package 08 adds reporting, notifications, audit presentation, and provider integration structures.</p>
      <section className="grid">
        {modules.map((m) => <article className="card" key={m}><h2>{m}</h2><p>Reporting/integration capability prepared for tenant-aware workflows.</p></article>)}
      </section>
    </main>
  );
}
