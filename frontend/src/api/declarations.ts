import client from './client';
import { RpetDeclaration, CreateDeclarationDto, UpdateDeclarationDto, PaginatedResponse, ApiResponse } from '../types';

export async function lookupDeclaration(code: string): Promise<RpetDeclaration> {
  const res = await client.get<ApiResponse<RpetDeclaration>>(`/rpet/lookup?code=${encodeURIComponent(code)}`);
  return res.data.data!;
}

export async function getAllDeclarations(page = 1, limit = 20): Promise<PaginatedResponse<RpetDeclaration>> {
  const res = await client.get<ApiResponse<PaginatedResponse<RpetDeclaration>>>(`/admin/rpet?page=${page}&limit=${limit}`);
  return res.data.data!;
}

export async function getDeclaration(id: number): Promise<RpetDeclaration> {
  const res = await client.get<ApiResponse<RpetDeclaration>>(`/admin/rpet/${id}`);
  return res.data.data!;
}

export async function createDeclaration(data: CreateDeclarationDto): Promise<RpetDeclaration> {
  const res = await client.post<ApiResponse<RpetDeclaration>>('/admin/rpet', data);
  return res.data.data!;
}

export async function updateDeclaration(id: number, data: UpdateDeclarationDto): Promise<RpetDeclaration> {
  const res = await client.put<ApiResponse<RpetDeclaration>>(`/admin/rpet/${id}`, data);
  return res.data.data!;
}

export async function deleteDeclaration(id: number): Promise<void> {
  await client.delete(`/admin/rpet/${id}`);
}

export async function searchDeclarations(q: string): Promise<RpetDeclaration[]> {
  const res = await client.get<ApiResponse<RpetDeclaration[]>>(`/admin/rpet/search?q=${encodeURIComponent(q)}`);
  return res.data.data!;
}
