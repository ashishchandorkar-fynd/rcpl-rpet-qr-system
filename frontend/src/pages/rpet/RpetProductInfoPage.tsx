import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { lookupDeclaration } from '../../api/declarations';

function RecycleProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Recycled Content</span>
        <span className="font-bold text-green-700">{value}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-teal-400 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-sm w-40 flex-shrink-0">{label}</span>
      <span className="text-gray-800 text-sm font-medium flex-1">{value}</span>
    </div>
  );
}

export default function RpetProductInfoPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const { data: declaration, isLoading, error } = useQuery({
    queryKey: ['declaration', code],
    queryFn: () => lookupDeclaration(code!),
    enabled: !!code,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-teal-700 text-white">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/rpet')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-base">Recycle Declaration</h1>
            <p className="text-green-200 text-xs">Code: <span className="font-mono font-bold text-white">{code}</span></p>
          </div>
          <div className="ml-auto text-2xl">♻️</div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="bg-white rounded-xl p-4 h-28" />
            <div className="bg-white rounded-xl p-4 h-36" />
            <div className="bg-white rounded-xl p-4 h-24" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="font-bold text-gray-800 mb-2">Declaration Not Found</h2>
            <p className="text-gray-500 text-sm mb-4">
              {(error as Error).message || 'No declaration found for this code. Please check the code on your bottle and try again.'}
            </p>
            <button
              onClick={() => navigate('/rpet')}
              className="bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Declaration data */}
        {declaration && (
          <>
            {/* Hero — product header + recycle badge */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Product Name</p>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{declaration.product_name}</h2>
                  <span className="inline-block mt-1.5 bg-green-50 text-green-700 text-xs font-mono px-2 py-0.5 rounded">
                    SKU: {declaration.sku}
                  </span>
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="text-4xl">♻️</div>
                  <p className="text-green-700 font-black text-lg leading-none">{declaration.recycle_content}%</p>
                  <p className="text-gray-400 text-xs">rPET</p>
                </div>
              </div>
            </div>

            {/* Recycle highlight card */}
            <div className="bg-gradient-to-r from-green-700 to-teal-600 rounded-xl shadow-sm p-4 text-white">
              <p className="font-bold text-base mb-0.5">♻️ Recycled Plastic Declaration</p>
              <p className="text-green-100 text-sm leading-snug mb-3">
                This bottle is made using <strong className="text-white">{declaration.recycle_content}% recycled plastic (rPET)</strong>, contributing to a circular economy and reduced plastic waste.
              </p>
              <RecycleProgressBar value={declaration.recycle_content} />
            </div>

            {/* Product & Manufacturing Details */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-lg">🏭</span>
                <h3 className="font-semibold text-gray-800 text-sm">Manufacturing Details</h3>
              </div>
              <div className="px-4 py-1">
                <InfoRow label="Product Name" value={declaration.product_name} />
                <InfoRow label="SKU" value={declaration.sku} />
                <InfoRow label="Manufacturing Location" value={declaration.manufacturing_location} />
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-lg">✅</span>
                <h3 className="font-semibold text-gray-800 text-sm">PWM Compliance</h3>
              </div>
              <div className="px-4 py-1">
                <InfoRow label="Bottle Code" value={declaration.combined_code} />
                <InfoRow label="PWM Reg. No." value={declaration.pwm_reg_no} />
                <InfoRow label="Recycle Content" value={`${declaration.recycle_content}%`} />
                <InfoRow label="Status" value={declaration.status === 'active' ? 'Verified Active' : 'Inactive'} />
              </div>
            </div>

            <p className="text-center text-gray-400 text-xs pb-4">
              Data verified by RCPL · Last updated {declaration.updated_at ? new Date(declaration.updated_at).toLocaleDateString('en-IN') : '—'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
