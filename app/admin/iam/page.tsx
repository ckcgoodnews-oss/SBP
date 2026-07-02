export default function IamHomePage() {
  const links = [
    ['/admin/users', 'Users'],
    ['/admin/iam/roles', 'Roles'],
    ['/admin/iam/permissions', 'Permissions'],
    ['/admin/iam/departments', 'Departments'],
    ['/admin/iam/api-keys', 'API Keys & Service Accounts']
  ];

  return (
    <main className="main">
      <h1>Enterprise IAM</h1>
      <p>Identity, access, permissions, departments, service accounts, and audit foundations.</p>
      <section className="grid">
        {links.map(([href, label]) => (
          <a className="card" href={href} key={href}>
            <h2>{label}</h2>
            <p>Open {label}</p>
          </a>
        ))}
      </section>
    </main>
  );
}
