import { useEffect, useMemo, useState } from 'react';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../lib/productApi';
import { listShops } from '../lib/shopApi';

type Product = { id: string; productName: string; description?: string; price: number; quantity: number; category?: string; shopId: string };

type Shop = { id: string; shopName: string };

export default function Products(){
  const [products,setProducts]=useState<Product[]>([]);
  const [shops,setShops]=useState<Shop[]>([]);
  const [filterShop,setFilterShop]=useState('');
  const [query,setQuery]=useState('');
  const [form,setForm]=useState({ productName:'', description:'', price:0, quantity:0, category:'', shopId:'' });
  const [editing,setEditing]=useState<Product|null>(null);
  const [toast,setToast]=useState<{type:'success'|'error'; msg:string}|null>(null);
  const [viewing,setViewing]=useState<Product|null>(null);
  const show=(type:'success'|'error',msg:string)=>{ setToast({type,msg}); setTimeout(()=>setToast(null),2000); };

  async function refresh(){ setShops(await listShops()); setProducts(await listProducts(filterShop||undefined)); }
  useEffect(()=>{ refresh(); },[filterShop]);

  useEffect(()=>{
    function onKey(e: KeyboardEvent){ if(e.key==='Escape'){ setViewing(null);} }
    if(viewing){ document.addEventListener('keydown', onKey); }
    return ()=>document.removeEventListener('keydown', onKey);
  },[viewing]);

  const filtered = useMemo(()=>{ const q=query.toLowerCase(); return products.filter(p=> p.productName.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q)); },[products,query]);
  const shopById = useMemo(()=> shops.reduce((m,s)=>{ m[s.id]=s; return m; },{} as Record<string,Shop>),[shops]);
  const shopLabel = (shopId: string)=>{
    const s = shopById[shopId];
    return s ? s.shopName : shopId;
  };

  async function submit(e: React.FormEvent){
    e.preventDefault(); if(!form.shopId) return show('error','Select shop');
    try{ await createProduct({...form, price:+form.price, quantity:+form.quantity}); setForm({ productName:'', description:'', price:0, quantity:0, category:'', shopId:'' }); show('success','Product created'); await refresh(); }catch(e:any){ show('error', e.message); }
  }

  function openEdit(p: Product){ setEditing(p); window.scrollTo({top:0, behavior:'smooth'}); }

  async function applyEdit(e: React.FormEvent){ e.preventDefault(); if(!editing) return; try{ await updateProduct(editing.id, editing); setEditing(null); show('success','Product updated'); await refresh(); }catch(e:any){ show('error', e.message); } }

  async function remove(p: Product){ if(!confirm(`Delete ${p.productName}?`)) return; try{ await deleteProduct(p.id); show('success','Product deleted'); await refresh(); }catch(e:any){ show('error', e.message); } }

  return (
    <div className="max-w-6xl mx-auto">
      {viewing ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setViewing(null)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border p-5 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-lg font-semibold">{viewing.productName}</div>
                  <div className="text-gray-600 text-sm">{viewing.description || '—'}</div>
                </div>
                <button onClick={()=>setViewing(null)} className="h-8 w-8 rounded-full hover:bg-gray-100 grid place-items-center" aria-label="Close">✕</button>
              </div>
              <div className="grid gap-3">
                <div>
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="font-medium">${viewing.price}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Quantity</div>
                  <div className="font-medium">{viewing.quantity}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Category</div>
                  <div className="font-medium">{viewing.category || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Shop</div>
                  <div className="font-medium">{shopLabel(viewing.shopId)}</div>
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
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-amber-900">Edit product</h2>
            <button onClick={()=>setEditing(null)} className="text-sm text-amber-800 hover:underline">Close</button>
          </div>
          <form onSubmit={applyEdit} className="grid gap-3 md:grid-cols-6">
            <input value={editing.productName} onChange={e=>setEditing({...editing!, productName:e.target.value})} placeholder="Product name" className="border rounded px-3 py-2" required />
            <input value={editing.description||''} onChange={e=>setEditing({...editing!, description:e.target.value})} placeholder="Description" className="border rounded px-3 py-2" />
            <input value={editing.price} onChange={e=>setEditing({...editing!, price:+e.target.value})} placeholder="Price" type="number" step="0.01" className="border rounded px-3 py-2" />
            <input value={editing.quantity} onChange={e=>setEditing({...editing!, quantity:+e.target.value})} placeholder="Qty" type="number" className="border rounded px-3 py-2" />
            <input value={editing.category||''} onChange={e=>setEditing({...editing!, category:e.target.value})} placeholder="Category" className="border rounded px-3 py-2" />
            <select value={editing.shopId} onChange={e=>setEditing({...editing!, shopId:e.target.value})} className="border rounded px-3 py-2">
              <option value="">Select shop</option>
              {shops.map(s=> <option key={s.id} value={s.id}>{s.shopName}</option>)}
            </select>
            <div className="md:col-span-6 flex gap-2">
              <button className="bg-amber-600 text-white rounded px-4 py-2">Save changes</button>
              <button type="button" onClick={()=>setEditing(null)} className="rounded px-4 py-2 border">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="flex gap-2">
          <select value={filterShop} onChange={e=>setFilterShop(e.target.value)} className="border rounded px-3 py-2">
            <option value="">All shops</option>
            {shops.map(s=> <option key={s.id} value={s.id}>{s.shopName}</option>)}
          </select>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name/category" className="border rounded px-3 py-2" />
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border p-4 mb-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input value={form.productName} onChange={e=>setForm({...form, productName:e.target.value})} placeholder="Enter product name" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Enter description" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input value={form.price} onChange={e=>setForm({...form, price:+e.target.value})} placeholder="0.00" type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input value={form.quantity} onChange={e=>setForm({...form, quantity:+e.target.value})} placeholder="0" type="number" min="0" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input value={form.category} onChange={e=>setForm({...form, category:e.target.value})} placeholder="Enter category" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
            <select value={form.shopId} onChange={e=>setForm({...form, shopId:e.target.value})} className="w-full border rounded px-3 py-2">
              <option value="">Select shop</option>
              {shops.map(s=> <option key={s.id} value={s.id}>{s.shopName}</option>)}
            </select>
          </div>
        </div>
        <button className="mt-4 bg-blue-600 text-white rounded px-4 py-2 w-full">Add Product</button>
      </form>

      <div className="bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Qty</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Shop</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=> (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.productName}</div>
                  <div className="text-gray-600 text-xs">{p.description}</div>
                </td>
                <td className="px-4 py-3">{p.price}</td>
                <td className="px-4 py-3">{p.quantity}</td>
                <td className="px-4 py-3">{p.category||'-'}</td>
                <td className="px-4 py-3">{shopLabel(p.shopId)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>setViewing(p)} className="px-3 py-1 rounded border mr-2">View</button>
                  <button onClick={()=>openEdit(p)} className="px-3 py-1 rounded bg-emerald-600 text-white mr-2">Edit</button>
                  <button onClick={()=>remove(p)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 ? (<tr><td className="px-4 py-6 text-gray-500">No products</td></tr>): null}
          </tbody>
        </table>
      </div>

      {toast ? (<div className={"fixed bottom-4 right-4 rounded-lg px-4 py-2 shadow text-white "+(toast.type==='success'?'bg-emerald-600':'bg-red-600')}>{toast.msg}</div>) : null}
    </div>
);
}
