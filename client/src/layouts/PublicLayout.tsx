import { Link, Outlet } from 'react-router-dom';
import { SearchBar } from '../components/search/SearchBar';
import { CartIcon } from '../components/cart/CartIcon';
import { CartDrawer } from '../components/cart/CartDrawer';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { useAuth } from '../hooks/useAuth';

export function PublicLayout() {
  const { user, isAuthenticated, clearAuth } = useAuth();

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="text-xl font-black tracking-tight text-brand">
            Retail<span className="text-neutral-900">Portal</span>
          </Link>
          <SearchBar />
          <div className="ml-auto flex items-center gap-2">
            <CartIcon />
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="rounded-full px-3 py-1 text-sm font-semibold text-brand">
                    Admin
                  </Link>
                )}
                <Link to="/orders" className="rounded-full px-3 py-1 text-sm font-medium text-neutral-700">
                  Orders
                </Link>
                <button
                  type="button"
                  className="rounded-full border px-3 py-1 text-sm"
                  onClick={() => {
                    clearAuth();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-3 py-1 text-sm font-medium">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <Breadcrumb />
      <main>
        <Outlet />
      </main>
      <CartDrawer />
      <footer className="mt-12 border-t bg-brand py-6 text-center text-sm text-white">
        Retail Portal — hackathon demo
      </footer>
    </div>
  );
}
