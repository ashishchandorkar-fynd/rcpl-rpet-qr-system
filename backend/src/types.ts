export interface RpetProduct {
  id?: number;
  batch_code: string;
  category: string;
  subcategory: string;
  vendor_name: string;
  vendor_address: string;
  fssai_license: string;
  tag?: string;
  sku?: string;
  product_name?: string;
  manufacturer?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductDto {
  batch_code: string;
  category: string;
  subcategory: string;
  vendor_name: string;
  vendor_address: string;
  fssai_license: string;
  tag?: string;
  sku?: string;
  product_name?: string;
  manufacturer?: string;
  status?: 'active' | 'inactive';
}

export type UpdateProductDto = Partial<Omit<CreateProductDto, 'batch_code'>>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RpetDeclaration {
  id?: number;
  combined_code: string;          // e.g. MBB306C — VendorCode+ProductVariantCode+SKUCode+RecycleCode
  product_name: string;
  sku: string;
  manufacturing_location: string; // full address
  recycle_content: number;        // percentage, e.g. 100
  pwm_reg_no: string;             // PWM Registration Number
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface CreateDeclarationDto {
  combined_code: string;
  product_name: string;
  sku: string;
  manufacturing_location: string;
  recycle_content: number;
  pwm_reg_no: string;
  status?: 'active' | 'inactive';
}

export type UpdateDeclarationDto = Partial<Omit<CreateDeclarationDto, 'combined_code'>>;
