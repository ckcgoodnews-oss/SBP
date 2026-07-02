export default function Page() {
  return (
    <main className="main">
      <h1>SendGrid Integration</h1>
      <p>Email provider placeholder.</p>
      <form className="form" method="post" action="/api/admin/integrations">
        <label>Tenant ID<input name="tenant_id" required placeholder="uuid" /></label>
        <label>Provider<input name="provider" defaultValue="sendgrid" required /></label>
        <label>Status
          <select name="status">
            <option value="not_configured">Not Configured</option>
            <option value="configured">Configured</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>
        <label>Public Config JSON<textarea name="public_config" rows={5} defaultValue="{}" /></label>
        <button type="submit">Save Integration Placeholder</button>
      </form>
    </main>
  );
}
