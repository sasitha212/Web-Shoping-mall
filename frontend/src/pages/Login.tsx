import { useState } from 'react';
import { login } from '../lib/api';

type Props = { onLogin: (user: any) => void };

export default function Login({ onLogin }: Props){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|undefined>();

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const user = await login(email,password);
      onLogin(user);
    } catch(err:any){
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-indigo-50 via-white to-rose-50 rounded-xl">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border p-6">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-indigo-600/10 grid place-items-center">
              <span className="text-indigo-600 font-bold text-xl">WS</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to Web Shopping Mall</h1>
            <p className="text-sm text-gray-600">Sign in to manage users</p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="@example.com" type="email" className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/60" required />
            </div>
            <div>
              <label className="text-sm text-gray-700">Password</label>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/60" required />
            </div>
            {error ? <div className="text-red-600 text-sm">{error}</div> : null}
            <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-2.5 rounded-lg disabled:opacity-60">{loading?'Signing in...':'Sign in'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
