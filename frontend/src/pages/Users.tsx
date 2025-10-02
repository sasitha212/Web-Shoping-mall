import { useEffect, useMemo, useState } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../lib/api';

type User = { id: string; email: string; name: string; phone?: string; role?: string };

type Toast = { type: 'success' | 'error'; msg: string } | null;

export default function Users(){
  const [users,setUsers]=useState<User[]>([]);
  const [fetching,setFetching]=useState(false);
  const [email,setEmail]=useState('');
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [role,setRole]=useState('customer');
  const [password,setPassword]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|undefined>();
  const [editing,setEditing]=useState<User|null>(null);
  const [editName,setEditName]=useState('');
  const [editPhone,setEditPhone]=useState('');
  const [editRole,setEditRole]=useState('customer');
  const [editPassword,setEditPassword]=useState('');
  const [query,setQuery]=useState('');
  const [searchInput,setSearchInput]=useState('');
  const [toast,setToast]=useState<Toast>(null);
  const [viewing,setViewing]=useState<User|null>(null);

  function showToast(type: 'success'|'error', msg: string){
    setToast({ type, msg });
    setTimeout(()=>setToast(null), 2000);
  }

  async function refresh(){
    setError(undefined);
    try{ setFetching(true); setUsers(await listUsers()); }catch(err:any){ setError(err.message);} finally{ setFetching(false);} 
  }

  useEffect(()=>{ refresh(); },[]);

  useEffect(()=>{
    function onKey(e: KeyboardEvent){ if(e.key==='Escape'){ setViewing(null);} }
    if(viewing){ document.addEventListener('keydown', onKey); }
    return ()=>document.removeEventListener('keydown', onKey);
  },[viewing]);

  async function addUser(e: React.FormEvent){
    e.preventDefault();
    setLoading(true);
    try{
      await createUser({email,name,password,phone,role});
      showToast('success','User created');
      setEmail(''); setName(''); setPassword(''); setPhone(''); setRole('customer');
      await refresh();
    }catch(err:any){ setError(err.message); showToast('error','Create failed'); } finally{ setLoading(false);} 
  }

  function openEditor(u: User){
    setEditing(u);
    setEditName(u.name);
    setEditPhone(u.phone || '');
    setEditRole(u.role || 'customer');
    setEditPassword('');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  async function applyEdit(e: React.FormEvent){
    e.preventDefault();
    if(!editing) return;
    try{
      await updateUser(editing.id,{name:editName, password:editPassword || undefined, phone: editPhone || undefined, role: editRole || undefined});
      showToast('success','User updated');
      setEditing(null);
      await refresh();
    }catch(err:any){ setError(err.message); showToast('error','Update failed'); }
  }

  const filtered = useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return users;
    return users.filter(u=>u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q));
  },[users,query]);

  const totals = useMemo(()=>{
    const total = users.length;
    const byRole = users.reduce((acc: Record<string, number>, u)=>{ const r=(u.role||'customer'); acc[r]=(acc[r]||0)+1; return acc;},{} as Record<string, number>);
    return { total, admins: byRole['admin']||0, sellers: byRole['seller']||0, customers: byRole['customer']||0, delivery: byRole['delivery']||0 };
  },[users]);

  useEffect(()=>{
    const t = setTimeout(()=>setQuery(searchInput), 250);
    return ()=>clearTimeout(t);
  },[searchInput]);

  async function removeUser(u: User){
    if(!confirm(`Delete ${u.email}?`)) return;
    try{ await deleteUser(u.id); showToast('success','User deleted'); await refresh(); }catch(err:any){ setError(err.message); showToast('error','Delete failed'); }
  }

  function roleBadge(role?: string){
    const r = role || 'customer';
    const cls = r==='admin' ? 'bg-red-100 text-red-700' : r==='seller' ? 'bg-amber-100 text-amber-700' : r==='delivery' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700';
    return <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium "+cls}>{r}</span>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {viewing ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setViewing(null)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border p-5 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 text-white grid place-items-center font-semibold">{(viewing.name||viewing.email).charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="text-lg font-semibold">{viewing.name || '—'}</div>
                    <div className="text-gray-600 text-sm">{viewing.email}</div>
                  </div>
                </div>
                <button onClick={()=>setViewing(null)} className="h-8 w-8 rounded-full hover:bg-gray-100 grid place-items-center" aria-label="Close">✕</button>
              </div>
              <div className="grid gap-3">
                <div>
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="font-medium">{viewing.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Role</div>
                  <div>{roleBadge(viewing.role)}</div>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button onClick={()=>setViewing(null)} className="px-4 py-2 rounded border">Close</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {editing ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-emerald-900">Edit user</h2>
            <button onClick={()=>setEditing(null)} className="text-sm text-emerald-800 hover:underline">Close</button>
          </div>
          <form onSubmit={applyEdit} className="grid gap-3 md:grid-cols-5">
            <input value={editing.email} readOnly className="border rounded px-3 py-2 bg-white/50" />
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Name" className="border rounded px-3 py-2" required />
            <input value={editPhone} onChange={e=>setEditPhone(e.target.value)} placeholder="Phone" className="border rounded px-3 py-2" />
            <select value={editRole} onChange={e=>setEditRole(e.target.value)} className="border rounded px-3 py-2">
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="seller">Seller</option>
              <option value="delivery">Delivery staff</option>
            </select>
            <input value={editPassword} onChange={e=>setEditPassword(e.target.value)} placeholder="New password (optional)" type="password" className="border rounded px-3 py-2" />
            <div className="md:col-span-5 flex gap-2">
              <button className="bg-emerald-600 text-white rounded px-4 py-2">Save changes</button>
              <button type="button" onClick={()=>setEditing(null)} className="rounded px-4 py-2 border">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Users</h1>
              <p className="text-white/80 text-sm">Manage members, roles and access</p>
            </div>
            <div className="flex items-center gap-2">
              <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search by name or email" className="rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white/10 backdrop-blur p-3">
              <div className="text-xs uppercase tracking-wide text-white/70">Total</div>
              <div className="text-lg font-semibold">{totals.total}</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur p-3">
              <div className="text-xs uppercase tracking-wide text-white/70">Admins</div>
              <div className="text-lg font-semibold">{totals.admins}</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur p-3">
              <div className="text-xs uppercase tracking-wide text-white/70">Sellers</div>
              <div className="text-lg font-semibold">{totals.sellers}</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur p-3">
              <div className="text-xs uppercase tracking-wide text-white/70">Customers</div>
              <div className="text-lg font-semibold">{totals.customers}</div>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="text-red-600 text-sm mb-2">{error}</div> : null}

      <form onSubmit={addUser} className="bg-white rounded-xl border p-4 mb-6 grid gap-2 md:grid-cols-6">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="border rounded px-3 py-2" required />
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="border rounded px-3 py-2" required />
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="border rounded px-3 py-2" />
        <select value={role} onChange={e=>setRole(e.target.value)} className="border rounded px-3 py-2">
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="delivery">Delivery staff</option>
        </select>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="border rounded px-3 py-2" required />
        <button disabled={loading} className="bg-blue-600 text-white rounded px-3 py-2">Add</button>
      </form>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              Array.from({length:5}).map((_,i)=> (
                <tr key={i} className="border-t animate-pulse">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200" />
                      <div>
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                        <div className="mt-1 h-3 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-8 w-28 bg-gray-200 rounded" /></td>
                </tr>
              ))
            ) : filtered.map(u=> (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center font-medium">{(u.name||u.email).charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-gray-600">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{u.phone || '-'}</td>
                <td className="px-4 py-3">{roleBadge(u.role)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>setViewing(u)} className="px-3 py-1 rounded border mr-2">View</button>
                  <button onClick={()=>openEditor(u)} className="px-3 py-1 rounded bg-emerald-600 text-white mr-2">Edit</button>
                  <button onClick={()=>removeUser(u)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                </td>
              </tr>
            ))}
            {!fetching && filtered.length===0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={4}>
                  <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gray-100 grid place-items-center">👤</div>
                  No users found
                </td>
              </tr>
            ): null}
          </tbody>
        </table>
      </div>

      {toast ? (
        <div className={`fixed bottom-4 right-4 rounded-lg px-4 py-2 shadow text-white ${toast.type==='success'?'bg-emerald-600':'bg-red-600'}`}>{toast.msg}</div>
      ) : null}
    </div>
  );
}
