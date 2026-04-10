import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setError('Please enter the batch code from the bottle neck.');
      return;
    }
    if (!/^[A-Z0-9]+$/.test(trimmed)) {
      setError('Batch code must contain only letters and numbers.');
      return;
    }
    if (trimmed.length > 10) {
      setError('Batch code must be at most 10 characters.');
      return;
    }

    setError('');
    navigate(`/product/${trimmed}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-700 flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 text-center">
        <div className="inline-flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary-800 font-black text-xs">R</span>
          </div>
          <span className="text-white font-bold text-xl tracking-wide">RCPL</span>
        </div>
        <p className="text-primary-200 text-xs tracking-widest uppercase">rPET Product Information</p>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-primary-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.24M16.24 12l-1.5 1.5M12 8h.01M9.52 9.52A4 4 0 0012 16a4 4 0 002.48-.8" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-tight">Product Verification</h1>
                  <p className="text-primary-300 text-xs">FSSAI Compliance System</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-6">
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Welcome to the <strong>RCPL rPET Product Information</strong> portal. To verify your product and view manufacturer details, please enter the <strong>batch code</strong> printed on the neck of the bottle.
                </p>
                <ul className="mt-3 text-xs text-gray-500 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-primary-600 text-white rounded-full text-center leading-4 text-xs flex-shrink-0">1</span>
                    Locate the batch number on the bottle neck label
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-primary-600 text-white rounded-full text-center leading-4 text-xs flex-shrink-0">2</span>
                    Enter the first 1–2 characters of the batch number
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-primary-600 text-white rounded-full text-center leading-4 text-xs flex-shrink-0">3</span>
                    Tap "Get Product Details" to view information
                  </li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="batchCode" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Batch Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="batchCode"
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="e.g. AA"
                  maxLength={10}
                  autoComplete="off"
                  autoCapitalize="characters"
                  className={`w-full px-4 py-3 text-lg font-mono tracking-widest border-2 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                    error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-500'
                  }`}
                />
                {error && (
                  <p className="mt-2 text-red-600 text-sm flex items-center gap-1">
                    <span>⚠</span> {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-4 w-full bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-md text-base"
                >
                  Get Product Details →
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-primary-300 text-xs mt-6">
            For queries, contact{' '}
            <span className="text-white">RCPL Customer Care</span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 px-4">
        <p className="text-primary-400 text-xs">© 2026 RCPL Pvt Ltd · FSSAI Compliance System · All Rights Reserved</p>
      </footer>
    </div>
  );
}
