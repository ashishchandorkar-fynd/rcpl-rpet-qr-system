import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createDeclaration, getDeclaration, updateDeclaration } from '../api/declarations';
import { CreateDeclarationDto } from '../types';
import { useToastContext } from '../context/ToastContext';

interface FormErrors {
  combined_code?: string;
  product_name?: string;
  sku?: string;
  manufacturing_location?: string;
  recycle_content?: string;
  pwm_reg_no?: string;
}

const emptyForm: CreateDeclarationDto = {
  combined_code: '',
  product_name: '',
  sku: '',
  manufacturing_location: '',
  recycle_content: 100,
  pwm_reg_no: '',
  status: 'active',
};

function validateForm(form: CreateDeclarationDto, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!isEdit && !form.combined_code.trim()) errors.combined_code = 'Combined code is required';
  else if (!isEdit && !/^[A-Z0-9]+$/.test(form.combined_code)) errors.combined_code = 'Alphanumeric only (A-Z, 0-9)';
  if (!form.product_name.trim()) errors.product_name = 'Product name is required';
  if (!form.sku.trim()) errors.sku = 'SKU is required';
  if (!form.manufacturing_location.trim()) errors.manufacturing_location = 'Manufacturing location is required';
  const pct = Number(form.recycle_content);
  if (isNaN(pct) || pct < 0 || pct > 100) errors.recycle_content = 'Must be between 0 and 100';
  if (!form.pwm_reg_no.trim()) errors.pwm_reg_no = 'PWM registration number is required';
  return errors;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-red-600 text-xs">{msg}</p>;
}

export default function AdminRpetForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToastContext();
  const [form, setForm] = useState<CreateDeclarationDto>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: existing } = useQuery({
    queryKey: ['admin-rpet-item', id],
    queryFn: () => getDeclaration(parseInt(id!)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        combined_code: existing.combined_code,
        product_name: existing.product_name,
        sku: existing.sku,
        manufacturing_location: existing.manufacturing_location,
        recycle_content: existing.recycle_content,
        pwm_reg_no: existing.pwm_reg_no,
        status: existing.status,
      });
    }
  }, [existing]);

  const createMutation = useMutation({
    mutationFn: createDeclaration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rpet'] });
      addToast('Declaration created successfully!', 'success');
      navigate('/admin/rpet');
    },
    onError: (err: Error) => addToast(err.message || 'Failed to create declaration', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ data }: { data: Omit<CreateDeclarationDto, 'combined_code'> }) =>
      updateDeclaration(parseInt(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rpet'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rpet-item', id] });
      addToast('Declaration updated successfully!', 'success');
      navigate('/admin/rpet');
    },
    onError: (err: Error) => addToast(err.message || 'Failed to update declaration', 'error'),
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(form, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    if (isEdit) {
      const { combined_code: _, ...updateData } = form;
      updateMutation.mutate({ data: updateData });
    } else {
      createMutation.mutate(form);
    }
  }

  function field(name: keyof CreateDeclarationDto, value: string | number) {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(e => ({ ...e, [name]: undefined }));
  }

  const inputCls = (err?: string) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-green-800 px-6 py-4 text-white">
          <h2 className="font-bold text-lg">{isEdit ? 'Edit rPET Declaration' : 'Add New rPET Declaration'}</h2>
          <p className="text-green-200 text-sm">Fields marked with <span className="text-red-300">*</span> are required</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">

          {/* Combined Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bottle Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.combined_code}
              onChange={e => field('combined_code', e.target.value.toUpperCase())}
              disabled={isEdit}
              placeholder="e.g. MBB306C"
              maxLength={20}
              className={`${inputCls(errors.combined_code)} font-mono tracking-widest ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {isEdit && <p className="mt-1 text-gray-400 text-xs">Bottle code cannot be changed after creation</p>}
            <p className="mt-1 text-gray-400 text-xs">Format: VendorCode + ProductVariantCode + SKUCode + RecycleCode (e.g. MBB306C)</p>
            <FieldError msg={errors.combined_code} />
          </div>

          {/* Product Name + SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.product_name}
                onChange={e => field('product_name', e.target.value)}
                placeholder="e.g. RCPL rPET Water Bottle 500ml"
                className={inputCls(errors.product_name)}
              />
              <FieldError msg={errors.product_name} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={e => field('sku', e.target.value)}
                placeholder="e.g. RCPL-PET-500"
                className={`${inputCls(errors.sku)} font-mono`}
              />
              <FieldError msg={errors.sku} />
            </div>
          </div>

          {/* Manufacturing Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Manufacturing Location <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.manufacturing_location}
              onChange={e => field('manufacturing_location', e.target.value)}
              placeholder="Full manufacturing address including city, state and PIN code"
              rows={3}
              className={`${inputCls(errors.manufacturing_location)} resize-none`}
            />
            <FieldError msg={errors.manufacturing_location} />
          </div>

          {/* Recycle Content + PWM Reg No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Recycle Content (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.recycle_content}
                  onChange={e => field('recycle_content', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                  step={1}
                  placeholder="e.g. 100"
                  className={`${inputCls(errors.recycle_content)} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
              </div>
              <FieldError msg={errors.recycle_content} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                PWM Registration No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.pwm_reg_no}
                onChange={e => field('pwm_reg_no', e.target.value)}
                placeholder="e.g. PWM/MH/2024/001234"
                className={`${inputCls(errors.pwm_reg_no)} font-mono`}
              />
              <FieldError msg={errors.pwm_reg_no} />
            </div>
          </div>

          {/* Status */}
          <div className="border-t border-gray-100 pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={e => field('status', e.target.value as 'active' | 'inactive')}
              className={inputCls()}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/rpet')}
              disabled={isLoading}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                isEdit ? 'Update Declaration' : 'Create Declaration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
