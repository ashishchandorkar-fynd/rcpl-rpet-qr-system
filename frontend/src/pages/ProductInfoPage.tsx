import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { lookupProduct } from '../api/products';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusBadge from '../components/StatusBadge';

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-sm w-36 flex-shrink-0">{label}</span>
      <span className="text-gray-800 text-sm font-medium flex-1">{value}</span>
    </div>
  );
}

function InfoCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

export default function ProductInfoPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', code],
    queryFn: () => lookupProduct(code!),
    enabled: !!code,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-base">Product Information</h1>
            <p className="text-primary-200 text-xs">Batch Code: <span className="font-mono font-bold text-white">{code}</span></p>
          </div>
          <div className="ml-auto">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-xs">R</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {isLoading && <LoadingSkeleton />}

        {error && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-500 text-sm mb-4">
              {(error as Error).message || 'No product found for this batch code. Please check the code on your bottle and try again.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {product && (
          <>
            {/* Product Header */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Product Name</p>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">
                    {product.product_name || product.vendor_name}
                  </h2>
                  {product.sku && (
                    <span className="inline-block mt-1.5 bg-primary-50 text-primary-700 text-xs font-mono px-2 py-0.5 rounded">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>
                <StatusBadge status={product.status} />
              </div>
            </div>

            {/* Product Details */}
            <InfoCard title="Product Details" icon="📦">
              <InfoRow label="Category" value={product.category} />
              <InfoRow label="Sub-Category" value={product.subcategory} />
              <InfoRow label="Product Name" value={product.product_name} />
              <InfoRow label="SKU" value={product.sku} />
            </InfoCard>

            {/* Manufacturer Details */}
            <InfoCard title="Manufacturer Details" icon="🏭">
              <InfoRow label="Manufacturer" value={product.manufacturer} />
              <InfoRow label="Vendor Name" value={product.vendor_name} />
              <InfoRow label="Address" value={product.vendor_address} />
            </InfoCard>

            {/* Compliance */}
            <InfoCard title="Compliance & Licensing" icon="✅">
              <InfoRow label="FSSAI License" value={product.fssai_license} />
              <InfoRow label="Batch Code" value={product.batch_code} />
              <InfoRow label="Status" value={product.status === 'active' ? 'Verified Active' : 'Inactive'} />
            </InfoCard>

            <p className="text-center text-gray-400 text-xs pb-4">
              Data verified by RCPL · Last updated {product.updated_at ? new Date(product.updated_at).toLocaleDateString('en-IN') : '—'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
