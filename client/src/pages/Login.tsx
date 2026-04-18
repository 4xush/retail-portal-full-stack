import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export function Login() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const setAuth = useAuthStore((s) => s.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    const res = await login(data);
    if (res.success) {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      const target = loc.state?.from;
      if (res.data.user.role === 'admin') nav('/admin');
      else nav(target && target !== '/login' ? target : '/');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Log in</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="mt-1 w-full rounded-lg border px-3 py-2" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input className="mt-1 w-full rounded-lg border px-3 py-2" type="password" {...register('password')} />
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? '…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-600">
        No account? <Link className="font-semibold text-brand" to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
