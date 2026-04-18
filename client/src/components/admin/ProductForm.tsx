import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { fetchCategories } from '../../api/categories.api';
import { createProduct, updateProduct, fetchAdminProducts } from '../../api/admin.api';
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

function idOf(p: Product): string {
  return String(p._id ?? p.id ?? '');
}

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) as Resolver<Form> });

  useEffect(() => {
    void fetchCategories().then(setCats);
    void fetchAdminProducts({ limit: 100, page: 1 }).then((res) => {
      setAllProducts(res.data as Product[]);
    });
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
      setSelectedAddOns((initial.addOns ?? []).map(idOf).filter(Boolean));
      setSelectedCombos((initial.combos ?? []).map(idOf).filter(Boolean));
    } else {
      reset({ title: '', description: '', cost: 99, taxPercent: 5, category: '', stock: 10, tags: '' });
      setSelectedAddOns([]);
      setSelectedCombos([]);
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
    selectedAddOns.forEach((id) => fd.append('addOns', id));
    selectedCombos.forEach((id) => fd.append('combos', id));
    files.forEach((f) => fd.append('images', f));
    if (initial) {
      await updateProduct(String(initial._id ?? initial.id), fd);
    } else {
      await createProduct(fd);
    }
    onSaved();
    onClose();
  };

  const toggleItem = (
    id: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const currentId = initial ? idOf(initial) : '';
  const eligibleProducts = allProducts.filter((p) => idOf(p) !== currentId);

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
              <label className="text-xs font-medium">Cost (₹)</label>
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
            <label className="text-xs font-medium">Tags (comma separated)</label>
            <input className="mt-1 w-full rounded border px-2 py-1 text-sm" {...register('tags')} />
          </div>

          {/* Add-Ons multi-select */}
          <div>
            <label className="text-xs font-medium">Add-Ons</label>
            <p className="mb-1 text-[10px] text-gray-400">Items customers can add to this product</p>
            <div className="max-h-32 overflow-y-auto rounded border p-2 text-xs">
              {eligibleProducts.length === 0 && (
                <span className="text-gray-400">No other products yet</span>
              )}
              {eligibleProducts.map((p) => (
                <label key={idOf(p)} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedAddOns.includes(idOf(p))}
                    onChange={() => toggleItem(idOf(p), selectedAddOns, setSelectedAddOns)}
                    className="accent-brand"
                  />
                  <span>{p.title}</span>
                  <span className="ml-auto text-gray-400">₹{p.cost}</span>
                </label>
              ))}
            </div>
            {selectedAddOns.length > 0 && (
              <p className="mt-0.5 text-[10px] text-brand">{selectedAddOns.length} selected</p>
            )}
          </div>

          {/* Combos multi-select */}
          <div>
            <label className="text-xs font-medium">Combo Products</label>
            <p className="mb-1 text-[10px] text-gray-400">Products bundled as a combo with this item</p>
            <div className="max-h-32 overflow-y-auto rounded border p-2 text-xs">
              {eligibleProducts.length === 0 && (
                <span className="text-gray-400">No other products yet</span>
              )}
              {eligibleProducts.map((p) => (
                <label key={idOf(p)} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedCombos.includes(idOf(p))}
                    onChange={() => toggleItem(idOf(p), selectedCombos, setSelectedCombos)}
                    className="accent-brand"
                  />
                  <span>{p.title}</span>
                  <span className="ml-auto text-gray-400">₹{p.cost}</span>
                </label>
              ))}
            </div>
            {selectedCombos.length > 0 && (
              <p className="mt-0.5 text-[10px] text-brand">{selectedCombos.length} selected</p>
            )}
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
