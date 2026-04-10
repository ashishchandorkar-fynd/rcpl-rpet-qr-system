import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, getProduct, updateProduct } from '../api/products';
import { CreateProductDto } from '../types';
import { useToastContext } from '../context/ToastContext';

interface FormErrors {
  batch_code?: string;
  category?: string;
  subcategory?: string;
  vendor_name?: string;
  vendor_address?: string;
  fssai_license?: string;
}

const CATEGORIES = ['Dairy', 'Beverages', 'Packaged Foods', 'Other'];

const emptyForm: CreateProductDto = {
  batch_code: '',
  category: '',
  subcategory: '',
  vendor_name: '',
  vendor_address: '',
  fssai_license: '',
  sku: '',
  product_name: '',
  manufacturer: '',
  status: 'active',
};

function validate(form: CreateProductDto, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!isEdit && !form.batch_code.trim()) errors.batch_code = 'Batch code is required';
  else if (!isEdit && !/^[A-Z0-9]+$/.test(form.batch_code)) errors.batch_code = 'Alphanumeric only (A-Z, 0-9)';
  if (!form.category) errors.category = 'Category is required';
  if (!form.subcategory.trim()) errors.subcategory = 'Subcategory is required';
  if (!form.vendor_name.trim()) errors.vendor_name = 'Vendor name is required';
  if (!form.vendor_address.trim()) errors.vendor_address = 'Vendor address is required';
  if (!form.fssai_license.trim()) errors.fssai_license = 'FSSAI license is required';
  else if (!/^\d{14}$/.test(form.fssai_license)) errors.fssai_license = 'Must be exactly 14 digits';
  return errors;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-red-600 text-xs">{msg}</p>;
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToastContext();
  const [form, setForm] = useState<CreateProductDto>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: existing } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => getProduct(parseInt(id!)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        batch_code: existing.batch_code,
        category: existing.category,
        subcategory: existing.subcategory,
        vendor_name: existing.vendor_name,
        vendor_address: existing.vendor_address,
        fssai_license: existing.fssai_license,
        sku: existing.sku || '',
        product_name: existing.product_name || '',
        manufacturer: existing.manufacturer || '',
        status: existing.status,
      });
    }
  }, [existing]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      addToast('Product created successfully!', 'success');
      navigate('/admin/products');
    },
    onError: (err: Error) => addToast(err.message || 'Failed to create product', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ data }: { data: Omit<CreateProductDto, 'batch_code'> }) =>
      updateProduct(parseInt(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
      addToast('Product updated successfully!', 'success');
      navigate('/admin/products');
    },
    onError: (err: Error) => addToast(err.message || 'Failed to update product', 'error'),
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    if (isEdit) {
      const { batch_code: _, ...updateData } = form;
      updateMutation.mutate({ data: updateData });
    } else {
      createMutation.mutate(form);
    }
  }

  function field(name: keyof CreateProductDto, value: string) {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(e => ({ ...e, [name]: undefined }));
  }

  const inputCls = (err?: string) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-primary-800 px-6 py-4 text-white">
          <h2 className="font-bold text-lg">{isEdit ? 'Edit rPET Product' : 'Add New rPET Product'}</h2>
          <p className="text-primary-200 text-sm">Fields marked with <span className="text-red-300">*</span> are required</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {/* Batch Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Batch Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.batch_code}
              onChange={e => field('batch_code', e.target.value.toUpperCase())}
              disabled={isEdit}
              placeholder="e.g. AA"
              maxLength={10}
              className={`${inputCls(errors.batch_code)} font-mono ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {isEdit && <p className="mt-1 text-gray-400 text-xs">Batch code cannot be changed after creation</p>}
            <FieldError msg={errors.batch_code} />
          </div>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={e => field('category', e.target.value)}
                className={inputCls(errors.category)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <FieldError msg={errors.category} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Subcategory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.subcategory}
                onChange={e => field('subcategory', e.target.value)}
                placeholder="e.g. Full Cream Milk"
                className={inputCls(errors.subcategory)}
              />
              <FieldError msg={errors.subcategory} />
            </div>
          </div>

          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.vendor_name}
              onChange={e => field('vendor_name', e.target.value)}
              placeholder="e.g. RCPL Dairy Unit - Pune"
              className={inputCls(errors.vendor_name)}
            />
            <FieldError msg={errors.vendor_name} />
          </div>

          {/* Vendor Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Vendor Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.vendor_address}
              onChange={e => field('vendor_address', e.target.value)}
              placeholder="Full address including PIN code"
              rows={3}
              className={`${inputCls(errors.vendor_address)} resize-none`}
            />
            <FieldError msg={errors.vendor_address} />
          </div>

          {/* FSSAI License */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              FSSAI License Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fssai_license}
              onChange={e => field('fssai_license', e.target.value.replace(/\D/g, '').slice(0, 14))}
              placeholder="14-digit FSSAI license number"
              maxLength={14}
              className={`${inputCls(errors.fssai_license)} font-mono tracking-wide`}
            />
            <p className="mt-1 text-gray-400 text-xs">{form.fssai_license.length}/14 digits</p>
            <FieldError msg={errors.fssai_license} />
          </div>

          {/* Optional fields */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Optional Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">SKU</label>
                <input type="text" value={form.sku || ''} onChange={e => field('sku', e.target.value)} placeholder="e.g. RCPL-FCM-500" className={inputCls()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Product Name</label>
                <input type="text" value={form.product_name || ''} onChange={e => field('product_name', e.target.value)} placeholder="Full product name" className={inputCls()} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Manufacturer</label>
                <input type="text" value={form.manufacturer || ''} onChange={e => field('manufacturer', e.target.value)} placeholder="Manufacturer name" className={inputCls()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Status</label>
                <select value={form.status} onChange={e => field('status', e.target.value as 'active' | 'inactive')} className={inputCls()}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              disabled={isLoading}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-primary-700 text-white rounded-xl font-semibold text-sm hover:bg-primary-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                isEdit ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
