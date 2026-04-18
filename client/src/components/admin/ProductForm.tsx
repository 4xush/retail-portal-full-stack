import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { fetchCategories } from '../../api/categories.api';
import { createProduct, updateProduct } from '../../api/admin.api';
import { ImageUploadZone } from './ImageUploadZone';
import type { Category, Product } from '../../types';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  cost: z.coerce.number().min(0),
  taxPercent: z.coerce.number().min(0).max(100),
  category: z.string().min(1),
  stock: z.coerce.number().min(0),
  tags: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export function ProductForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [cats, setCats] = useState<Category[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) as Resolver<Form> });

  useEffect(() => {
    void fetchCategories().then(setCats);
  }, []);

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title,
        description: initial.description ?? '',
        cost: initial.cost,
        taxPercent: initial.taxPercent,
        category: String((initial.category as Category)?._id ?? (initial.category as Category)?.id ?? ''),
        stock: initial.stock,
        tags: (initial.tags ?? []).join(', '),
      });
    } else {
      reset({ title: '', description: '', cost: 99, taxPercent: 5, category: '', stock: 10, tags: '' });
    }
  }, [initial, reset]);

  const onSubmit = async (data: Form) => {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('description', data.description ?? '');
    fd.append('cost', String(data.cost));
    fd.append('taxPercent', String(data.taxPercent));
    fd.append('category', data.category);
    fd.append('stock', String(data.stock));
    if (data.tags) fd.append('tags', data.tags);
    files.forEach((f) => fd.append('images', f));
    if (initial) {
      await updateProduct(String(initial._id ?? initial.id), fd);
    } else {
      await createProduct(fd);
    }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">{initial ? 'Edit product' : 'New product'}</h2>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-xs font-medium">Title</label>
            <input className="mt-1 w-full rounded border px-2 py-1 text-sm" {...register('title')} />
            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium">Description</label>
            <textarea className="mt-1 w-full rounded border px-2 py-1 text-sm" rows={3} {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium">Cost</label>
              <input type="number" className="mt-1 w-full rounded border px-2 py-1 text-sm" {...register('cost')} />
              {errors.cost && <p className="text-xs text-red-600">{errors.cost.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium">Tax %</label>
              <input type="number" className="mt-1 w-full rounded border px-2 py-1 text-sm" {...register('taxPercent')} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Category</label>
            <select className="mt-1 w-full rounded border px-2 py-1 text-sm" {...register('category')}>
              <option value="">Select…</option>
              {cats.map((c) => (
                <option key={c.slug} value={String(c._id ?? c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium">Stock</label>
            <input type="number" className="mt-1 w-full rounded border px-2 py-1 text-sm" {...register('stock')} />
          </div>
          <div>
            <label className="text-xs font-medium">Tags (comma)</label>
            <input className="mt-1 w-full rounded border px-2 py-1 text-sm" {...register('tags')} />
          </div>
          <ImageUploadZone files={files} onChange={setFiles} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
