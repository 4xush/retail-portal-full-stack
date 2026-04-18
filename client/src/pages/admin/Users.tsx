import { useQuery } from '@tanstack/react-query';
import { fetchAdminUsers } from '../../api/admin.api';

export function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetchAdminUsers(1),
  });
  const rows = (data?.data as { name: string; email: string; role: string }[]) ?? [];

  return (
    <div>
      <h2 className="text-xl font-bold">Users</h2>
      {isLoading && <p className="mt-4">Loading…</p>}
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
