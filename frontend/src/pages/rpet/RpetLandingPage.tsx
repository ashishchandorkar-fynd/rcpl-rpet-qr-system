import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RpetLandingPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) { setError('Please enter the code printed on the bottle.'); return; }
    if (!/^[A-Z0-9]+$/.test(code)) { setError('Code must be alphanumeric (letters and numbers only).'); return; }
    navigate(`/rpet/product/${code}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-teal-700 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
          <span className="text-green-700 font-black text-2xl">R</span>
        </div>
        <h1 className="text-white font-black text-3xl tracking-tight">RCPL</h1>
        <p className="text-green-200 text-sm mt-1 font-medium">Plastic Recycle Declaration</p>
      </header>

      {/* Recycle visual */}
      <div className="flex justify-center py-4">
        <div className="text-6xl">♻️</div>
      </div>

      {/* Main card */}
      <main className="flex-1 flex flex-col justify-start px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-auto w-full">
          <h2 className="font-bold text-gray-800 text-xl mb-1 text-center">rPET Recycle Details</h2>
          <p className="text-gray-500 text-sm text-center mb-5">
            Verify the recycled plastic content of your RCPL product.
          </p>

          {/* Instructions */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-5">
            <p className="text-green-900 font-semibold text-xs uppercase tracking-wide mb-2">How to find your code</p>
            <ol className="text-gray-600 text-sm space-y-1.5 list-decimal list-inside">
              <li>Look for the code printed on the <strong>neck of the bottle</strong></li>
              <li>The code is a combination of letters and numbers (e.g.&nbsp;<span className="font-mono font-bold text-green-700">MBB306C</span>)</li>
              <li>Enter the full code below to view the recycle declaration</li>
            </ol>
          </div>

          {/* Code structure info */}
          <div className="bg-gray-50 rounded-xl p-3 mb-5 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">Code structure:</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono">Vendor</span>
              <span className="text-gray-400">+</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">Variant</span>
              <span className="text-gray-400">+</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono">SKU</span>
              <span className="text-gray-400">+</span>
              <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-mono">Recycle</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bottle Code
            </label>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. MBB306C"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-center text-lg tracking-widest uppercase bg-gray-50"
              autoComplete="off"
              autoCapitalize="characters"
            />
            {error && <p className="mt-2 text-red-500 text-xs text-center">{error}</p>}

            <button
              type="submit"
              className="mt-4 w-full bg-gradient-to-r from-green-700 to-teal-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:from-green-800 hover:to-teal-700 active:scale-95 transition-all text-sm"
            >
              View Recycle Declaration →
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="max-w-sm mx-auto w-full mt-4 px-2">
          <p className="text-green-200 text-xs text-center">
            As per Plastic Waste Management Rules, all manufacturers must declare recycled content.
          </p>
          <p className="text-green-300/60 text-xs text-center mt-2">
            RCPL · Certified rPET Products
          </p>
        </div>
      </main>
    </div>
  );
}
