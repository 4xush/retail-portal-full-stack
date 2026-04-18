import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-black text-brand">404</h1>
      <p className="mt-2 text-neutral-600">Page not found</p>
      <Link to="/" className="mt-6 rounded-full bg-brand px-6 py-2 font-semibold text-white">
        Home
      </Link>
    </div>
  );
}
