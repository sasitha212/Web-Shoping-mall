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
  const [viewing,setViewing]=useState<Shop|null>(null);
  const [deleting,setDeleting]=useState<Shop|null>(null);
  const show=(type:'success'|'error',msg:string)=>{ setToast({type,msg}); setTimeout(()=>setToast(null),2000); };

  async function refresh(){ 
    try {
      const [shopsData, usersData] = await Promise.all([listShops(), listUsers()]);
      console.log('Loaded shops:', shopsData);
      console.log('Loaded users:', usersData);
      setShops(shopsData); 
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
  useEffect(()=>{ refresh(); },[]);

  useEffect(()=>{
    function onKey(e: KeyboardEvent){ 
      if(e.key==='Escape'){ 
        setViewing(null);
        setDeleting(null);
      } 
    }
    if(viewing || deleting){ document.addEventListener('keydown', onKey); }
    return ()=>document.removeEventListener('keydown', onKey);
  },[viewing, deleting]);

  const filtered = useMemo(()=>{ const q=query.toLowerCase(); return shops.filter(s=> s.shopName.toLowerCase().includes(q)); },[shops,query]);
  const userById = useMemo(()=> users.reduce((m,u)=>{ m[u.id]=u; return m; },{} as Record<string,User>),[users]);
  const ownerLabel = (ownerUserId: string)=>{
    // If users haven't loaded yet, show loading state
    if(users.length === 0) {
      return 'Loading...';
    }
    
    const u = userById[ownerUserId];
    if(!u) {
      // If user not found, try to find by partial match or return a more user-friendly message
      const foundUser = users.find(user => user.id === ownerUserId);
      if(foundUser) {
        return `${foundUser.name} (${foundUser.email})`;
      }
      // Debug: log the issue
      console.log('User not found for ID:', ownerUserId, 'Available users:', users.map(u => ({id: u.id, name: u.name})));
      return `Unknown User (${ownerUserId})`;
    }
    return `${u.name} (${u.email})`;
  };

  function validateForm(){
    if(!form.shopName.trim()) return 'Shop name is required';
    if(!form.ownerUserId) return 'Please select an owner';
    if(form.contactNumber && !/^\d{10}$/.test(form.contactNumber)) return 'Contact number must be exactly 10 digits';
    return null;
  }

  async function submit(e: React.FormEvent){
     e.preventDefault();
     const error = validateForm();
     if(error) return show('error', error);
     try{ await createShop(form); setForm({ shopName:'', description:'', ownerUserId:'', contactNumber:'', address:'' }); show('success','Shop created'); await refresh(); }catch(e:any){ show('error', e.message); }
  }

  function openEdit(s: Shop){ setEditing(s); window.scrollTo({top:0, behavior:'smooth'}); }

  function validateEditForm(){
    if(!editing) return null;
    if(!editing.shopName.trim()) return 'Shop name is required';
    if(!editing.ownerUserId) return 'Please select an owner';
    if(editing.contactNumber && !/^\d{10}$/.test(editing.contactNumber)) return 'Contact number must be exactly 10 digits';
    return null;
  }

  async function applyEdit(e: React.FormEvent){
     e.preventDefault(); if(!editing) return; 
     const error = validateEditForm();
     if(error) return show('error', error);
     try{ await updateShop(editing.id, editing); setEditing(null); show('success','Shop updated'); await refresh(); }catch(e:any){ show('error', e.message); }
  }

  function removeShop(s: Shop){ setDeleting(s); }

  async function confirmDelete(){
    if(!deleting) return;
    try{ 
      await deleteShop(deleting.id); 
      show('success','Shop deleted'); 
      setDeleting(null);
      await refresh(); 
    }catch(e:any){ 
      show('error', e.message); 
    }
  }

  const shopStats = useMemo(() => {
    const total = shops.length;
    const byOwner = shops.reduce((acc: Record<string, number>, s) => {
      acc[s.ownerUserId] = (acc[s.ownerUserId] || 0) + 1;
      return acc;
    }, {});
    const withContact = shops.filter(s => s.contactNumber).length;
    const withAddress = shops.filter(s => s.address).length;
    return { total, byOwner, withContact, withAddress };
  }, [shops]);

  return (
    <div className="max-w-7xl mx-auto">
      {viewing ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setViewing(null)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-200 relative z-10 overflow-hidden">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-6 text-white relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm text-white grid place-items-center font-bold text-xl shadow-lg">
                          {viewing.shopName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                <div>
                        <h2 className="text-2xl font-bold text-white">{viewing.shopName}</h2>
                        <p className="text-white/80 text-sm">{viewing.description || 'No description'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={()=>setViewing(null)} 
                      className="h-8 w-8 rounded-full hover:bg-white/20 grid place-items-center transition-colors duration-200" 
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid gap-6">
                  {/* Shop Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Shop Details
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                <div>
                          <div className="text-sm text-gray-500">Owner</div>
                          <div className="font-medium text-gray-900">{ownerLabel(viewing.ownerUserId)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                </div>
                <div>
                          <div className="text-sm text-gray-500">Contact Number</div>
                          <div className="font-medium text-gray-900">{viewing.contactNumber || 'Not provided'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                </div>
                <div>
                          <div className="text-sm text-gray-500">Address</div>
                          <div className="font-medium text-gray-900">{viewing.address || 'Not provided'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={()=>{
                          setViewing(null);
                          openEdit(viewing);
                        }}
                        className="flex items-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-sm font-medium">Edit Shop</span>
                      </button>
                      <button 
                        onClick={()=>{
                          setViewing(null);
                          removeShop(viewing);
                        }}
                        className="flex items-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-sm font-medium">Delete Shop</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button 
                  onClick={()=>setViewing(null)} 
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {deleting ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setDeleting(null)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border p-6 relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 grid place-items-center">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Shop</h3>
                  <p className="text-gray-600 text-sm">This action cannot be undone</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <span className="font-semibold">{deleting.shopName}</span>? 
                  This will permanently remove the shop and all associated data.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={()=>setDeleting(null)} 
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Delete Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
            <input 
              value={editing.contactNumber||''} 
              onChange={e=>{
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setEditing({...editing!, contactNumber:value});
              }} 
              placeholder="10-digit phone number" 
              className="border rounded px-3 py-2" 
              maxLength={10}
              pattern="[0-9]{10}"
            />
            <input value={editing.address||''} onChange={e=>setEditing({...editing!, address:e.target.value})} placeholder="Address" className="border rounded px-3 py-2" />
            <div className="md:col-span-5 flex gap-2">
              <button className="bg-indigo-600 text-white rounded px-4 py-2">Save changes</button>
              <button type="button" onClick={()=>setEditing(null)} className="rounded px-4 py-2 border">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Header Section */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-8 text-white shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Shop Directory</h1>
                </div>
                <p className="text-white/90 text-base">Manage your retail locations and storefronts</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    value={query} 
                    onChange={e=>setQuery(e.target.value)} 
                    placeholder="Search shops..." 
                    className="pl-10 pr-4 py-3 w-80 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200" 
                  />
                </div>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-white/60 font-medium">Total Shops</div>
                </div>
                <div className="text-2xl font-bold">{shopStats.total}</div>
              </div>
              
              <div className="group rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-orange-500/30 rounded-lg">
                    <svg className="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-white/60 font-medium">Unique Owners</div>
                </div>
                <div className="text-2xl font-bold">{Object.keys(shopStats.byOwner).length}</div>
              </div>
              
              <div className="group rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-500/30 rounded-lg">
                    <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-white/60 font-medium">With Contact</div>
                </div>
                <div className="text-2xl font-bold">{shopStats.withContact}</div>
      </div>

              <div className="group rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-500/30 rounded-lg">
                    <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-white/60 font-medium">With Address</div>
                </div>
                <div className="text-2xl font-bold">{shopStats.withAddress}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Shop Form */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 p-6 mb-8 bg-gradient-to-br from-white to-gray-50 shadow-sm">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-orange-100 rounded-full blur-2xl opacity-60"></div>
        <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-amber-100 rounded-full blur-2xl opacity-60"></div>
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
          </div>
          <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Shop</h2>
              <p className="text-sm text-gray-500">Create a new retail location</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Shop Name *</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <input 
                  value={form.shopName} 
                  onChange={e=>setForm({...form, shopName:e.target.value})} 
                  placeholder="Enter shop name" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <input 
                  value={form.description} 
                  onChange={e=>setForm({...form, description:e.target.value})} 
                  placeholder="Enter description" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Owner *</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <select 
                  value={form.ownerUserId} 
                  onChange={e=>setForm({...form, ownerUserId:e.target.value})} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none bg-white"
                  required
                >
              <option value="">Select owner</option>
              {users.map(u=> <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
          </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            <input 
              value={form.contactNumber} 
              onChange={e=>{
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm({...form, contactNumber:value});
              }} 
              placeholder="Enter 10-digit phone number" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input 
                  value={form.address} 
                  onChange={e=>setForm({...form, address:e.target.value})} 
                  placeholder="Enter address" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit"
              className="group relative px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Shop
              </div>
            </button>
        </div>
      </form>
      </div>

      {/* Shops List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Shops List</h3>
            <div className="text-sm text-gray-500">
              {filtered.length} of {shops.length} shops
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {filtered.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(s=> (
                <div key={s.id} className="group bg-gray-50 hover:bg-white border border-gray-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:border-gray-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white grid place-items-center font-semibold text-lg shadow-lg">
                          {s.shopName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 truncate">{s.shopName}</h4>
                        <p className="text-sm text-gray-600 truncate">{s.description || 'No description'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">{ownerLabel(s.ownerUserId)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{s.contactNumber || 'No contact'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{s.address || 'No address'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={()=>setViewing(s)} 
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button 
                      onClick={()=>openEdit(s)} 
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={()=>removeShop(s)} 
                      className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 grid place-items-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or add a new shop.</p>
            </div>
          )}
        </div>
      </div>

      {toast ? (<div className={"fixed bottom-4 right-4 rounded-lg px-4 py-2 shadow text-white "+(toast.type==='success'?'bg-emerald-600':'bg-red-600')}>{toast.msg}</div>) : null}
    </div>
);
}
