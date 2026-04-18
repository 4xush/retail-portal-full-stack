import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { RequireAuth } from './RequireAuth';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { SearchPage } from '../pages/SearchPage';
import { OrderHistory } from '../pages/OrderHistory';
import { NotFound } from '../pages/NotFound';
import { Dashboard } from '../pages/admin/Dashboard';
import { AdminProducts } from '../pages/admin/Products';
import { AdminCategories } from '../pages/admin/Categories';
import { StockUpdate } from '../pages/admin/StockUpdate';
import { AdminOrders } from '../pages/admin/Orders';
import { AdminUsers } from '../pages/admin/Users';
import { DiscountCodes } from '../pages/admin/DiscountCodes';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route
          path="orders"
          element={
            <RequireAuth roles={['user']}>
              <OrderHistory />
            </RequireAuth>
          }
        />
      </Route>

      <Route
        path="admin"
        element={
          <RequireAuth roles={['admin']}>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="stock-update" element={<StockUpdate />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="discount-codes" element={<DiscountCodes />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
