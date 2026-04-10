import client from './client';
import { RpetProduct, CreateProductDto, UpdateProductDto, PaginatedResponse, ApiResponse } from '../types';

export async function lookupProduct(code: string): Promise<RpetProduct> {
  const res = await client.get<ApiResponse<RpetProduct>>(`/products/lookup?code=${encodeURIComponent(code)}`);
  return res.data.data!;
}

export async function getAllProducts(page = 1, limit = 20): Promise<PaginatedResponse<RpetProduct>> {
  const res = await client.get<ApiResponse<PaginatedResponse<RpetProduct>>>(`/admin/products?page=${page}&limit=${limit}`);
  return res.data.data!;
}

export async function getProduct(id: number): Promise<RpetProduct> {
  const res = await client.get<ApiResponse<RpetProduct>>(`/admin/products/${id}`);
  return res.data.data!;
}

export async function createProduct(data: CreateProductDto): Promise<RpetProduct> {
  const res = await client.post<ApiResponse<RpetProduct>>('/admin/products', data);
  return res.data.data!;
}

export async function updateProduct(id: number, data: UpdateProductDto): Promise<RpetProduct> {
  const res = await client.put<ApiResponse<RpetProduct>>(`/admin/products/${id}`, data);
  return res.data.data!;
}

export async function deleteProduct(id: number): Promise<void> {
  await client.delete(`/admin/products/${id}`);
}

export async function searchProducts(q: string): Promise<RpetProduct[]> {
  const res = await client.get<ApiResponse<RpetProduct[]>>(`/admin/products/search?q=${encodeURIComponent(q)}`);
  return res.data.data!;
}
