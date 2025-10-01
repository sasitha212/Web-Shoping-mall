import { useEffect, useMemo, useState } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../lib/api';

type User = { id: string; email: string; name: string; phone?: string; role?: string };

type Toast = { type: 'success' | 'error'; msg: string } | null;

export default function Users(){
  const [users,setUsers]=useState<User[]>([]);
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
  const [toast,setToast]=useState<Toast>(null);

  function showToast(type: 'success'|'error', msg: string){
    setToast({ type, msg });
    setTimeout(()=>setToast(null), 2000);
  }

  async function refresh(){
    setError(undefined);
    try{ setUsers(await listUsers()); }catch(err:any){ setError(err.message);} 
  }

  useEffect(()=>{ refresh(); },[]);

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

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Users</h1>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or email" className="border rounded px-3 py-2" />
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

      <div className="bg-white rounded-xl border">
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
            {filtered.map(u=> (
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
                  <button onClick={()=>openEditor(u)} className="px-3 py-1 rounded bg-emerald-600 text-white mr-2">Edit</button>
                  <button onClick={()=>removeUser(u)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 ? (<tr><td className="px-4 py-6 text-gray-500">No users</td></tr>): null}
          </tbody>
        </table>
      </div>

      {toast ? (
        <div className={`fixed bottom-4 right-4 rounded-lg px-4 py-2 shadow text-white ${toast.type==='success'?'bg-emerald-600':'bg-red-600'}`}>{toast.msg}</div>
      ) : null}
    </div>
  );
}
