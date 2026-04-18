import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type Form = z.infer<typeof schema>;

export function Signup() {
  const nav = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    const res = await signup(data);
    if (res.success) {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      nav('/');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Create account</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium">Name</label>
          <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register('name')} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>
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
          {isSubmitting ? '…' : 'Sign up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-600">
        Already have an account? <Link className="font-semibold text-brand" to="/login">Log in</Link>
      </p>
    </div>
  );
}
