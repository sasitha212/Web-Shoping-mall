import { useEffect, useMemo, useState } from 'react';
import { listShops, createShop, updateShop, deleteShop } from '../lib/shopApi';
import { listUsers } from '../lib/api';

type Shop = { id: string; shopName: string; description?: string; ownerUserId: string; contactNumber?: string; address?: string };

type User = { id: string; email: string; name: string };

export default function Shops(){
  const [shops,setShops]=useState<Shop[]>([]);
  const [users,setUsers]=useState<User[]>([]);
  const [query,setQuery]=useState('');
  const [form,setForm]=useState({ shopName:'', description:'', ownerUserId:'', contactNumber:'', address:'' });
  const [editing,setEditing]=useState<Shop|null>(null);
  const [toast,setToast]=useState<{type:'success'|'error'; msg:string}|null>(null);
  const show=(type:'success'|'error',msg:string)=>{ setToast({type,msg}); setTimeout(()=>setToast(null),2000); };

  async function refresh(){ setShops(await listShops()); setUsers(await listUsers()); }
  useEffect(()=>{ refresh(); },[]);

  const filtered = useMemo(()=>{ const q=query.toLowerCase(); return shops.filter(s=> s.shopName.toLowerCase().includes(q)); },[shops,query]);
  const userById = useMemo(()=> users.reduce((m,u)=>{ m[u.id]=u; return m; },{} as Record<string,User>),[users]);
  const ownerLabel = (ownerUserId: string)=>{
    const u = userById[ownerUserId];
    if(!u) return ownerUserId;
    return `${u.name} (${u.email})`;
  };

  async function submit(e: React.FormEvent){
     e.preventDefault();
     if(!form.ownerUserId) return show('error','Select owner');
     try{ await createShop(form); setForm({ shopName:'', description:'', ownerUserId:'', contactNumber:'', address:'' }); show('success','Shop created'); await refresh(); }catch(e:any){ show('error', e.message); }
  }

  function openEdit(s: Shop){ setEditing(s); window.scrollTo({top:0, behavior:'smooth'}); }

  async function applyEdit(e: React.FormEvent){
     e.preventDefault(); if(!editing) return; 
     try{ await updateShop(editing.id, editing); setEditing(null); show('success','Shop updated'); await refresh(); }catch(e:any){ show('error', e.message); }
  }

  async function remove(s: Shop){ if(!confirm(`Delete ${s.shopName}?`)) return; try{ await deleteShop(s.id); show('success','Shop deleted'); await refresh(); }catch(e:any){ show('error', e.message); } }

  return (
    <div className="max-w-6xl mx-auto">
      {editing ? (
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-indigo-900">Edit shop</h2>
            <button onClick={()=>setEditing(null)} className="text-sm text-indigo-800 hover:underline">Close</button>
          </div>
          <form onSubmit={applyEdit} className="grid gap-3 md:grid-cols-5">
            <input value={editing.shopName} onChange={e=>setEditing({...editing!, shopName:e.target.value})} placeholder="Shop name" className="border rounded px-3 py-2" required />
            <input value={editing.description||''} onChange={e=>setEditing({...editing!, description:e.target.value})} placeholder="Description" className="border rounded px-3 py-2" />
            <select value={editing.ownerUserId} onChange={e=>setEditing({...editing!, ownerUserId:e.target.value})} className="border rounded px-3 py-2">
              <option value="">Select owner</option>
              {users.map(u=> <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
            <input value={editing.contactNumber||''} onChange={e=>setEditing({...editing!, contactNumber:e.target.value})} placeholder="Contact" className="border rounded px-3 py-2" />
            <input value={editing.address||''} onChange={e=>setEditing({...editing!, address:e.target.value})} placeholder="Address" className="border rounded px-3 py-2" />
            <div className="md:col-span-5 flex gap-2">
              <button className="bg-indigo-600 text-white rounded px-4 py-2">Save changes</button>
              <button type="button" onClick={()=>setEditing(null)} className="rounded px-4 py-2 border">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Shops</h1>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name" className="border rounded px-3 py-2" />
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border p-4 mb-6 grid gap-2 md:grid-cols-5">
        <input value={form.shopName} onChange={e=>setForm({...form, shopName:e.target.value})} placeholder="Shop name" className="border rounded px-3 py-2" required />
        <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="border rounded px-3 py-2" />
        <select value={form.ownerUserId} onChange={e=>setForm({...form, ownerUserId:e.target.value})} className="border rounded px-3 py-2">
          <option value="">Select owner</option>
          {users.map(u=> <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
        </select>
        <input value={form.contactNumber} onChange={e=>setForm({...form, contactNumber:e.target.value})} placeholder="Contact" className="border rounded px-3 py-2" />
        <input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} placeholder="Address" className="border rounded px-3 py-2" />
        <button className="bg-blue-600 text-white rounded px-3 py-2 md:col-span-5">Add shop</button>
      </form>

      <div className="bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Shop</th>
              <th className="text-left px-4 py-3">Owner</th>
              <th className="text-left px-4 py-3">Contact</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s=> (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{s.shopName}</div>
                  <div className="text-gray-600 text-xs">{s.description}</div>
                </td>
                <td className="px-4 py-3">{ownerLabel(s.ownerUserId)}</td>
                <td className="px-4 py-3">{s.contactNumber||'-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>openEdit(s)} className="px-3 py-1 rounded bg-emerald-600 text-white mr-2">Edit</button>
                  <button onClick={()=>remove(s)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 ? (<tr><td className="px-4 py-6 text-gray-500">No shops</td></tr>): null}
          </tbody>
        </table>
      </div>

      {toast ? (<div className={"fixed bottom-4 right-4 rounded-lg px-4 py-2 shadow text-white "+(toast.type==='success'?'bg-emerald-600':'bg-red-600')}>{toast.msg}</div>) : null}
    </div>
);
}
