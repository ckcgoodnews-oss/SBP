export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-slate-600">This screen is wired into the Enterprise Administration module and ready for detailed implementation.</p>
    </div>
  );
}
