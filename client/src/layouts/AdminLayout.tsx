import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/stock-update', label: 'Stock Update' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/discount-codes', label: 'Discount Codes' },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clearAuth);

  return (
    <div className="flex min-h-screen bg-offwhite">
      <aside
        className={`sticky top-0 flex h-screen flex-col border-r bg-white transition-all ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <div className="flex items-center justify-between border-b p-3">
          {!collapsed && <span className="font-bold text-brand">Admin</span>}
          <button type="button" className="text-sm" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '»' : '«'}
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand text-white' : 'hover:bg-neutral-100'}`
              }
            >
              {!collapsed ? l.label : l.label[0]}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="border-t p-3 text-sm text-brand">
          {!collapsed ? '← Storefront' : '←'}
        </Link>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <h1 className="text-lg font-bold text-neutral-900">Admin panel</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-600">{user?.name}</span>
            <button
              type="button"
              className="rounded-full border px-3 py-1"
              onClick={() => {
                clear();
                nav('/login');
              }}
            >
              Log out
            </button>
          </div>
        </header>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
