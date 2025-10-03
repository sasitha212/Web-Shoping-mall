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
        <nav className="relative z-20 bg-white/90 backdrop-blur-md border-b border-gray-300/50 shadow-sm">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200" 
                  onClick={()=>setMobileOpen(v=>!v)} 
                  aria-label="Toggle menu"
                >
                  <div className="space-y-1">
                    <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                    <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                    <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                  </div>
                </button>
                
                <Link to="/" onClick={closeMenus} className="flex items-center gap-3 group">
                  <div className="p-2 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Web Shopping Mall
                  </span>
                </Link>
                
                {user ? (
                  <div className="hidden md:flex items-center gap-1 ml-8">
                    <NavLink 
                      to="/users" 
                      onClick={closeMenus} 
                      className={({isActive})=>`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      Users
                    </NavLink>
                    <NavLink 
                      to="/shops" 
                      onClick={closeMenus} 
                      className={({isActive})=>`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Shops
                    </NavLink>
                    <NavLink 
                      to="/products" 
                      onClick={closeMenus} 
                      className={({isActive})=>`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Products
                    </NavLink>
                  </div>
                ) : null}
              </div>
              
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="relative" ref={avatarRef}>
                    <button 
                      className="group h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-gray-700 text-white grid place-items-center font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      onClick={()=>setAvatarOpen(v=>!v)} 
                      aria-haspopup="menu" 
                      aria-expanded={avatarOpen}
                    >
                      {userInitial}
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </button>
                    {avatarOpen ? (
                      <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-xl py-2 text-sm z-50 animate-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-gray-700 text-white grid place-items-center font-semibold text-sm">
                              {userInitial}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
                              <div className="text-xs text-gray-500">{user?.email}</div>
                            </div>
                          </div>
                        </div>
                        <div className="py-1">
                          <button 
                            onClick={()=>{ handleLogout(); closeMenus(); }} 
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {user && mobileOpen ? (
            <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-sm">
              <div className="px-4 py-4 flex flex-col gap-2">
                <NavLink 
                  to="/users" 
                  onClick={closeMenus} 
                  className={({isActive})=>`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Users
                </NavLink>
                <NavLink 
                  to="/shops" 
                  onClick={closeMenus} 
                  className={({isActive})=>`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Shops
                </NavLink>
                <NavLink 
                  to="/products" 
                  onClick={closeMenus} 
                  className={({isActive})=>`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Products
                </NavLink>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <button 
                    onClick={()=>{ handleLogout(); closeMenus(); }} 
                    className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </nav>
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
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
