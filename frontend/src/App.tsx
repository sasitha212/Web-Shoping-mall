import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Users from './pages/Users';

export default function App(){
  const [user,setUser]=useState<any>(null);
  const handleLogin=(u:any)=>setUser(u);
  const handleLogout=()=>setUser(null);
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow p-4 flex justify-between">
          <Link to="/" className="font-semibold">Web Shopping Mall</Link>
          <div>
            {user ? (<button className="text-sm text-red-600" onClick={handleLogout}>Logout</button>) : null}
          </div>
        </nav>
        <main className="p-6">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/users"/> : <Login onLogin={handleLogin}/> } />
            <Route path="/users" element={user ? <Users/> : <Navigate to="/"/>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
