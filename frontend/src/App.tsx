import { BrowserRouter, Routes, Route, Navigate, Link, NavLink } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import Login from './pages/Login';
import Users from './pages/Users';
import Shops from './pages/Shops';
import Products from './pages/Products';

export default function App(){
  const [user,setUser]=useState<any>(null);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [avatarOpen,setAvatarOpen]=useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const handleLogin=(u:any)=>{ setUser(u); localStorage.setItem('mall_user', JSON.stringify(u)); };
  const handleLogout=()=>{ setUser(null); localStorage.removeItem('mall_user'); };
  const userInitial = useMemo(()=> (user?.name || user?.email || 'U').charAt(0).toUpperCase(),[user]);
  const closeMenus = ()=>{ setMobileOpen(false); setAvatarOpen(false); };

  // Restore user from localStorage on app load
  useEffect(()=>{
    try{
      const stored = localStorage.getItem('mall_user');
      if(stored){ setUser(JSON.parse(stored)); }
    }catch(e){ console.warn('Failed to restore user session:', e); }
  },[]);

  useEffect(()=>{
    function handleClickOutside(e: MouseEvent){
      if(!avatarOpen) return;
      const target = e.target as Node;
      if(avatarRef.current && !avatarRef.current.contains(target)){
        setAvatarOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent){ if(e.key==='Escape'){ setAvatarOpen(false); setMobileOpen(false); } }
    function handleScroll(){ if(avatarOpen){ setAvatarOpen(false);} }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return ()=>{
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScroll);
    };
  },[avatarOpen]);
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow relative z-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={()=>setMobileOpen(v=>!v)} aria-label="Toggle menu">
                  <span className="block h-0.5 w-5 bg-gray-700 mb-1" />
                  <span className="block h-0.5 w-5 bg-gray-700 mb-1" />
                  <span className="block h-0.5 w-5 bg-gray-700" />
                </button>
                <Link to="/" onClick={closeMenus} className="font-semibold">Web Shopping Mall</Link>
                {user ? (
                  <div className="hidden md:flex items-center gap-2 ml-6">
                    <NavLink to="/users" onClick={closeMenus} className={({isActive})=>`px-3 py-1.5 rounded text-sm ${isActive? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>Users</NavLink>
                    <NavLink to="/shops" onClick={closeMenus} className={({isActive})=>`px-3 py-1.5 rounded text-sm ${isActive? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>Shops</NavLink>
                    <NavLink to="/products" onClick={closeMenus} className={({isActive})=>`px-3 py-1.5 rounded text-sm ${isActive? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>Products</NavLink>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="relative" ref={avatarRef}>
                    <button className="h-8 w-8 rounded-full bg-indigo-600 text-white grid place-items-center font-medium" onClick={()=>setAvatarOpen(v=>!v)} aria-haspopup="menu" aria-expanded={avatarOpen}>
                      {userInitial}
                    </button>
                    {avatarOpen ? (
                      <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-lg py-1 text-sm z-50">
                        <div className="px-3 py-2 text-gray-700">{user?.name || user?.email}</div>
                        <button onClick={()=>{ handleLogout(); closeMenus(); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600">Logout</button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {user && mobileOpen ? (
            <div className="md:hidden border-t">
              <div className="px-4 py-2 flex flex-col gap-1">
                <NavLink to="/users" onClick={closeMenus} className={({isActive})=>`px-3 py-2 rounded ${isActive? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>Users</NavLink>
                <NavLink to="/shops" onClick={closeMenus} className={({isActive})=>`px-3 py-2 rounded ${isActive? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>Shops</NavLink>
                <NavLink to="/products" onClick={closeMenus} className={({isActive})=>`px-3 py-2 rounded ${isActive? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>Products</NavLink>
                <button onClick={()=>{ handleLogout(); closeMenus(); }} className="text-left px-3 py-2 rounded text-red-600 hover:bg-gray-50">Logout</button>
              </div>
            </div>
          ) : null}
        </nav>
        <main className="p-6">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/users"/> : <Login onLogin={handleLogin}/> } />
            <Route path="/users" element={user ? <Users/> : <Navigate to="/"/>} />
            <Route path="/shops" element={user ? <Shops/> : <Navigate to="/"/>} />
            <Route path="/products" element={user ? <Products/> : <Navigate to="/"/>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
