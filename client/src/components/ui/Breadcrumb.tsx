import { Link, useLocation, useSearchParams } from 'react-router-dom';

export function Breadcrumb() {
  const location = useLocation();
  const [params] = useSearchParams();
  const q = params.get('q');
  const cat = params.get('category');

  const crumbs: { label: string; to?: string }[] = [{ label: 'Home', to: '/' }];

  if (location.pathname.startsWith('/admin')) {
    crumbs.push({ label: 'Admin', to: '/admin' });
    if (location.pathname.includes('/products')) crumbs.push({ label: 'Products' });
    if (location.pathname.includes('/categories')) crumbs.push({ label: 'Categories' });
    if (location.pathname.includes('/stock-update')) crumbs.push({ label: 'Stock Update' });
    if (location.pathname.includes('/orders')) crumbs.push({ label: 'Orders' });
    if (location.pathname.includes('/users')) crumbs.push({ label: 'Users' });
    if (location.pathname.includes('/discount-codes')) crumbs.push({ label: 'Discount Codes' });
  } else if (location.pathname === '/orders') {
    crumbs.push({ label: 'Orders' });
  } else if (location.pathname === '/search') {
    if (cat) crumbs.push({ label: cat });
    if (q) crumbs.push({ label: `Search: "${q}"` });
    else crumbs.push({ label: 'Search' });
  } else if (cat) {
    crumbs.push({ label: cat });
  }

  return (
    <nav className="flex flex-wrap items-center gap-1 px-4 py-2 text-sm text-neutral-600">
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-400">/</span>}
          {c.to ? (
            <Link to={c.to} className="hover:text-brand">
              {c.label}
            </Link>
          ) : (
            <span className="font-medium text-neutral-900">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
