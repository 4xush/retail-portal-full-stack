import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSuggestions } from '../../api/search.api';
import { fetchProductById } from '../../api/products.api';
import { fetchStockHistory, patchProductStock } from '../../api/admin.api';
import type { Product } from '../../types';

export function StockUpdate() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState('');
  const { data: product } = useQuery({
    queryKey: ['product', selectedId],
    queryFn: () => fetchProductById(selectedId!),
    enabled: !!selectedId,
  });
  const { data: history } = useQuery({
    queryKey: ['stock-history', selectedId],
    queryFn: () => fetchStockHistory(selectedId!, 1),
    enabled: !!selectedId,
  });

  const search = async (term: string) => {
    setQ(term);
    if (term.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const s = await fetchSuggestions(term.trim());
    setSuggestions(s as Product[]);
  };

  const submit = async () => {
    if (!selectedId || !reason.trim()) return;
    await patchProductStock(selectedId, { delta, reason });
    setDelta(0);
    setReason('');
    void qc.invalidateQueries({ queryKey: ['product', selectedId] });
    void qc.invalidateQueries({ queryKey: ['stock-history', selectedId] });
  };

  const rows = (history?.data as { delta: number; reason: string; timestamp: string; updatedBy?: { name?: string } }[]) ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold">Stock update</h2>
      <div>
        <label className="text-sm font-medium">Search product</label>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={q}
          onChange={(e) => void search(e.target.value)}
          placeholder="Type name…"
        />
        {suggestions.length > 0 && (
          <ul className="mt-2 max-h-48 overflow-y-auto rounded border bg-white text-sm shadow">
            {suggestions.map((p) => (
              <li key={String(p._id ?? p.id)}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-neutral-50"
                  onClick={() => {
                    setSelectedId(String(p._id ?? p.id));
                    setSuggestions([]);
                  }}
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {product && (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-500">Current stock</div>
          <div className="text-4xl font-black text-brand">{product.stock}</div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div>
              <label className="text-xs">Delta (+/-)</label>
              <input
                type="number"
                className="mt-1 w-full rounded border px-2 py-1"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs">Reason</label>
              <textarea className="mt-1 w-full rounded border px-2 py-1" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
          <button type="button" className="mt-4 rounded-xl bg-brand px-4 py-2 font-semibold text-white" onClick={() => void submit()}>
            Update stock
          </button>
        </div>
      )}
      {selectedId && (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold">History</h3>
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="text-neutral-500">
                <th className="py-1">When</th>
                <th>Delta</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className={r.delta >= 0 ? 'text-green-700' : 'text-red-700'}>{r.delta}</td>
                  <td>{r.reason}</td>
                  <td>{r.updatedBy?.name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
