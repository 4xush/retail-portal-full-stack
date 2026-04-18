import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { createCategory, updateCategory } from '../../api/admin.api';
import { ImageUploadZone } from './ImageUploadZone';
import type { Category } from '../../types';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export function CategoryForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (initial) reset({ name: initial.name, description: initial.description ?? '' });
    else reset({ name: '', description: '' });
    setFiles([]);
  }, [initial, reset]);

  const onSubmit = async (data: Form) => {
    const fd = new FormData();
    fd.append('name', data.name);
    fd.append('description', data.description ?? '');
    if (files[0]) fd.append('logo', files[0]);
    if (initial?.id || initial?._id) {
      await updateCategory(String(initial.id ?? initial._id), fd);
    } else {
      await createCategory(fd);
    }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold">{initial ? 'Edit category' : 'New category'}</h2>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-xs font-medium">Name</label>
            <input className="mt-1 w-full rounded border px-2 py-1 text-sm" {...register('name')} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium">Description</label>
            <textarea className="mt-1 w-full rounded border px-2 py-1 text-sm" rows={3} {...register('description')} />
          </div>
          <ImageUploadZone files={files} onChange={(f) => setFiles(f.slice(0, 1))} />
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand px-4 py-2 text-sm text-white">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
