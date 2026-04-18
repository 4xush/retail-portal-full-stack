import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchAdminCategories, deleteCategory } from '../../api/admin.api';
import { CategoryForm } from '../../components/admin/CategoryForm';
import type { Category } from '../../types';
import { resolveImageUrl } from '../../utils/resolveImageUrl';

export function AdminCategories() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<Category | 'new' | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => fetchAdminCategories({ page: 1, limit: 50 }),
  });
  const rows = (data?.data as Category[]) ?? [];

  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">Categories</h2>
        <button
          type="button"
          className="ml-auto rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          onClick={() => setModal('new')}
        >
          Add category
        </button>
      </div>
      {isLoading && <p className="mt-4">Loading…</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <div key={String(c._id ?? c.id)} className="rounded-2xl border bg-white p-4 shadow-sm">
            {c.logo && (
              <img src={resolveImageUrl(c.logo)} alt="" className="mb-2 h-16 w-16 rounded-lg object-cover" />
            )}
            <h3 className="font-bold">{c.name}</h3>
            <p className="text-xs text-neutral-600 line-clamp-2">{c.description}</p>
            <div className="mt-2 flex gap-2 text-sm">
              <button type="button" className="text-brand" onClick={() => setModal(c)}>
                Edit
              </button>
              <button
                type="button"
                className="text-red-600"
                onClick={async () => {
                  if (confirm('Delete category?')) {
                    await deleteCategory(String(c._id ?? c.id));
                    void qc.invalidateQueries({ queryKey: ['admin-categories'] });
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <CategoryForm
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            void qc.invalidateQueries({ queryKey: ['admin-categories'] });
            void qc.invalidateQueries({ queryKey: ['categories'] });
          }}
        />
      )}
    </div>
  );
}
