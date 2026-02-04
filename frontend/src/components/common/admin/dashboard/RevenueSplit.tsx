export interface RevenueStats {
  totalPaymentAmount: number;
  totalWorkerPayouts: number;
}

interface Props {
  stats: RevenueStats | null;
  isLoading: boolean;
}

export function RevenueSplit({ stats, isLoading }: Props) {
  if (!stats && !isLoading) return null;

  const total = stats?.totalPaymentAmount ?? 0;
  const payouts = stats?.totalWorkerPayouts ?? 0;
  const fees = Math.max(total - payouts, 0);
  const pct = total > 0 ? Math.round((fees / total) * 100) : 0;

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Revenue Split</h3>
        <p className="text-sm text-muted-foreground">
          Platform earnings vs worker payouts
        </p>
      </div>

      {isLoading ? (
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      ) : (
        <>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="font-medium text-primary">
              Platform: {fees} MAD ({pct}%)
            </span>
            <span className="text-muted-foreground">
              Payouts: {payouts} MAD
            </span>
          </div>
        </>
      )}
    </div>
  );
}
