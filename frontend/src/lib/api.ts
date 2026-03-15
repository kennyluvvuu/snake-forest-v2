const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
const API_KEY = import.meta.env.API_KEY || ''; // SSR-only key

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Not Found');
    }
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export interface Animal {
  id: string;
  commonName: string;
  species: string;
  morph: string;
  age: 'young' | 'adult' | 'elderly';
  sex: 'male' | 'female' | 'unknown';
  priority: number;
  price: number;
  preview: string[];
  description?: string;
  imagesUrl?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'toy' | 'usable' | 'food';
  preview: string[];
  description?: string;
  imagesUrl?: string[];
}
