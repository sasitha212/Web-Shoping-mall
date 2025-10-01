const BASE_URL = 'http://localhost:8080/api/products';

export async function listProducts(shopId?: string){
  const url = shopId ? `${BASE_URL}?shopId=${encodeURIComponent(shopId)}` : BASE_URL;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function createProduct(payload: { productName: string; description?: string; price: number; quantity: number; category?: string; shopId: string; }){
  const res = await fetch(BASE_URL,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  if(!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function updateProduct(id: string, payload: Partial<{ productName: string; description: string; price: number; quantity: number; category: string; shopId: string; }>){
  const res = await fetch(`${BASE_URL}/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  if(!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteProduct(id: string){
  const res = await fetch(`${BASE_URL}/${id}`,{ method:'DELETE' });
  if(!res.ok) throw new Error('Failed to delete product');
}
