interface StatusItem {
  status: string;
  count: number;
}

interface Props {
  stats: { workerStatusBreakdown?: StatusItem[] } | null;
}

export function RecentValidations({ stats }: Props) {
  const items = stats?.workerStatusBreakdown ?? [];

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6">
      <h3 className="text-lg font-bold mb-3">User Status</h3>

      <div className="flex flex-col divide-y">
        {items.map((s) => (
          <div
            key={s.status}
            className="flex items-center justify-between py-2 text-sm"
          >
            <span className="capitalize">{s.status.toLowerCase()}</span>
            <span className="font-semibold">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
