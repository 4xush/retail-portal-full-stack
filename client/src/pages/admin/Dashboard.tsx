import { useQuery } from '@tanstack/react-query';
import { fetchAdminDashboard } from '../../api/admin.api';

export function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: fetchAdminDashboard });
  const stats = (data as { stats?: Record<string, number> })?.stats;
  const recent = (data as { recentOrders?: unknown[] })?.recentOrders ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>
      {isLoading && <p>Loading…</p>}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Products', stats.productCount],
            ['Categories', stats.categoryCount],
            ['Users', stats.userCount],
            ['Orders today', stats.ordersToday],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm text-neutral-500">{k}</div>
              <div className="mt-1 text-2xl font-black text-brand">{v}</div>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Recent orders</h3>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-neutral-500">
              <th className="py-1">ID</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(recent as { _id: string; total: number; status: string }[]).map((o) => (
              <tr key={o._id} className="border-t">
                <td className="py-2 font-mono text-xs">{String(o._id).slice(-8)}</td>
                <td>₹{Number(o.total).toFixed(2)}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
