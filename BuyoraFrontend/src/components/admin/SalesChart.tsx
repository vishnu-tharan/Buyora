export function SalesChart({
  data,
}: {
  data: Array<{ date: string; revenue: number; orders: number }>;
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex h-64 items-end gap-2 pt-4">
      {data.map((item, i) => {
        const heightPercent = (item.revenue / maxRevenue) * 100;
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-2">
            <div className="bg-primary/10 relative flex h-full w-full items-end rounded-t-sm">
              <div
                className="bg-primary w-full rounded-t-sm transition-all duration-500"
                style={{ height: `${heightPercent}%` }}
              />
              <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                Rs. {item.revenue.toLocaleString()}
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
