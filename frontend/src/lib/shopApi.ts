const BASE_URL = 'http://localhost:8080/api/shops';

export async function listShops(){
  const res = await fetch(BASE_URL);
  if(!res.ok) throw new Error('Failed to fetch shops');
  return res.json();
}

export async function createShop(payload: { shopName: string; description?: string; ownerUserId: string; contactNumber?: string; address?: string; }){
  const res = await fetch(BASE_URL,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  if(!res.ok) throw new Error('Failed to create shop');
  return res.json();
}

export async function updateShop(id: string, payload: Partial<{ shopName: string; description: string; ownerUserId: string; contactNumber: string; address: string; }>){
  const res = await fetch(`${BASE_URL}/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  if(!res.ok) throw new Error('Failed to update shop');
  return res.json();
}

export async function deleteShop(id: string){
  const res = await fetch(`${BASE_URL}/${id}`,{ method:'DELETE' });
  if(!res.ok) throw new Error('Failed to delete shop');
}
