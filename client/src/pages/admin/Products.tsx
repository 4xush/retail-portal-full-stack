import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchAdminProducts, deleteProduct } from '../../api/admin.api';
import { ProductForm } from '../../components/admin/ProductForm';
import type { Product } from '../../types';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

export function AdminProducts() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Product | 'new' | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => fetchAdminProducts({ page, limit: 20, search }),
  });
  const rows = (data?.data as Product[]) ?? [];
  const total = data?.meta?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">Products</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="rounded-lg border px-3 py-1 text-sm"
        />
        <button
          type="button"
          className="ml-auto rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          onClick={() => setModal('new')}
        >
          Add product
        </button>
      </div>
      {isLoading && <p className="mt-4">Loading…</p>}
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="p-2">Image</th>
              <th className="p-2">Title</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={String(p._id ?? p.id)} className="border-t">
                <td className="p-2">
                  <img src={resolveImageUrl(p.images?.[0])} alt="" className="h-10 w-10 rounded object-cover" />
                </td>
                <td className="p-2 font-medium">{p.title}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2 space-x-2">
                  <button type="button" className="text-brand" onClick={() => setModal(p)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={async () => {
                      if (confirm('Delete?')) {
                        await deleteProduct(String(p._id ?? p.id));
                        void qc.invalidateQueries({ queryKey: ['admin-products'] });
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <button type="button" disabled={page <= 1} className="rounded border px-2" onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          className="rounded border px-2"
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {modal && (
        <ProductForm
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => void qc.invalidateQueries({ queryKey: ['admin-products'] })}
        />
      )}
    </div>
  );
}
