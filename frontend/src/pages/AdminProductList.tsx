import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProducts, deleteProduct, searchProducts } from '../api/products';
import { RpetProduct } from '../types';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { useToastContext } from '../context/ToastContext';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useState(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  });
  return debounced;
}

export default function AdminProductList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToastContext();
  const [page, setPage] = useState(1);
  const [searchQ, setSearchQ] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const debouncedQ = useDebounce(searchQ, 300);

  const { data: paginated, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => getAllProducts(page, 15),
    enabled: !debouncedQ,
  });

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['admin-products-search', debouncedQ],
    queryFn: () => searchProducts(debouncedQ),
    enabled: !!debouncedQ,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      addToast('Product deactivated successfully', 'success');
      setDeleteId(null);
    },
    onError: (err: Error) => {
      addToast(err.message || 'Failed to delete product', 'error');
      setDeleteId(null);
    },
  });

  const products: RpetProduct[] = debouncedQ ? (searchResults || []) : (paginated?.data || []);
  const loading = isLoading || isSearching;

  const handleDelete = useCallback((id: number) => setDeleteId(id), []);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by vendor, category, batch code..."
          value={searchQ}
          onChange={e => { setSearchQ(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <button
          onClick={() => navigate('/admin/products/new')}
          className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap"
        >
          <span>+</span> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-gray-700">No products found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQ ? 'Try a different search term.' : 'Add your first rPET product to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Batch Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Vendor Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">FSSAI</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary-700">{p.batch_code}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{p.category}</div>
                      <div className="text-xs text-gray-400">{p.subcategory}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.vendor_name}</td>
                    <td className="px-4 py-3 font-mono text-gray-500 text-xs hidden lg:table-cell">{p.fssai_license}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                          className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id!)}
                          className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!debouncedQ && paginated && paginated.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, paginated.total)} of {paginated.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >← Prev</button>
              <button
                onClick={() => setPage(p => Math.min(paginated.totalPages, p + 1))}
                disabled={page === paginated.totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Deactivate Product"
        message="This will mark the product as inactive. Consumers will no longer be able to view its details via the QR code. Are you sure?"
        confirmLabel="Deactivate"
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
