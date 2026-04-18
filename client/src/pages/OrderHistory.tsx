import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../api/orders.api';
import { OrderCard } from '../components/order/OrderCard';
import type { Order } from '../types';

export function OrderHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrders({ page: 1, limit: 20 }),
  });
  const orders = (data?.data as Order[]) ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Your orders</h1>
      {isLoading && <p className="mt-4 text-neutral-500">Loading…</p>}
      {!isLoading && orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed p-8 text-center">
          <p className="text-neutral-600">No orders yet</p>
          <Link to="/" className="mt-4 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white">
            Browse menu
          </Link>
        </div>
      )}
      <div className="mt-6 space-y-4">
        {orders.map((o) => (
          <OrderCard key={String(o._id ?? o.id)} order={o} />
        ))}
      </div>
    </div>
  );
}
