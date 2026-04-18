import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchDiscountCodes, createDiscountCode } from '../../api/admin.api';

const schema = z.object({
  code: z.string().min(2),
  discountType: z.enum(['percent', 'flat']),
  discountValue: z.coerce.number().min(0),
  minOrderValue: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().optional(),
});

type Form = z.infer<typeof schema>;

export function DiscountCodes() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: async () => {
      const res = await fetchDiscountCodes();
      return res.data as { code: string; discountType: string; discountValue: number }[];
    },
  });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema) as Resolver<Form>,
    defaultValues: { discountType: 'percent', minOrderValue: 0 },
  });

  const onSubmit = async (f: Form) => {
    await createDiscountCode({
      code: f.code,
      discountType: f.discountType,
      discountValue: f.discountValue,
      minOrderValue: f.minOrderValue ?? 0,
      usageLimit: f.usageLimit || null,
    });
    reset();
    void qc.invalidateQueries({ queryKey: ['discount-codes'] });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-xl font-bold">Discount codes</h2>
        {isLoading && <p className="mt-4">Loading…</p>}
        <ul className="mt-4 space-y-2">
          {data?.map((c) => (
            <li key={c.code} className="rounded-xl border bg-white p-3 text-sm shadow-sm">
              <span className="font-mono font-bold">{c.code}</span> — {c.discountType} {c.discountValue}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Create code</h3>
        <form className="mt-3 space-y-2" onSubmit={handleSubmit(onSubmit)}>
          <input className="w-full rounded border px-2 py-1 text-sm" placeholder="CODE" {...register('code')} />
          {errors.code && <p className="text-xs text-red-600">{errors.code.message}</p>}
          <select className="w-full rounded border px-2 py-1 text-sm" {...register('discountType')}>
            <option value="percent">Percent</option>
            <option value="flat">Flat</option>
          </select>
          <input type="number" className="w-full rounded border px-2 py-1 text-sm" placeholder="Value" {...register('discountValue')} />
          <input type="number" className="w-full rounded border px-2 py-1 text-sm" placeholder="Min order" {...register('minOrderValue')} />
          <input type="number" className="w-full rounded border px-2 py-1 text-sm" placeholder="Usage limit" {...register('usageLimit')} />
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-brand py-2 text-sm font-semibold text-white">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
