import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../api/admin.api';

export function AdminOrders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => fetchAdminOrders({ page: 1, limit: 50 }),
  });
  const rows = (data?.data as { _id: string; total: number; status: string; user?: { email?: string } }[]) ?? [];

  return (
    <div>
      <h2 className="text-xl font-bold">Orders</h2>
      {isLoading && <p className="mt-4">Loading…</p>}
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-2 font-mono text-xs">{o._id.slice(-8)}</td>
                <td className="p-2">{o.user?.email ?? '—'}</td>
                <td className="p-2">₹{Number(o.total).toFixed(2)}</td>
                <td className="p-2">
                  <select
                    className="rounded border px-1 py-0.5"
                    value={o.status}
                    onChange={async (e) => {
                      await updateAdminOrderStatus(o._id, e.target.value);
                      void qc.invalidateQueries({ queryKey: ['admin-orders'] });
                    }}
                  >
                    {['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
