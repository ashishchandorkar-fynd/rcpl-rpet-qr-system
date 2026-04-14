import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { useToast } from '../components/useToast';
import { ToastContext } from '../context/ToastContext';

export default function AdminPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-primary-900 text-white flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-primary-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary-800 font-black text-xs">R</span>
              </div>
              <div>
                <p className="font-bold text-sm">RCPL Admin</p>
                <p className="text-primary-300 text-xs">rPET Data Portal</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* FSSAI Products section */}
            <div>
              <p className="text-primary-400 text-xs font-semibold uppercase tracking-wider px-3 mb-1">FSSAI Products</p>
              <NavLink
                to="/admin/products"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span>📋</span> Products
              </NavLink>
              <NavLink
                to="/admin/products/new"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span>➕</span> Add Product
              </NavLink>
            </div>

            {/* rPET Declarations section */}
            <div>
              <p className="text-primary-400 text-xs font-semibold uppercase tracking-wider px-3 mb-1">rPET Declarations</p>
              <NavLink
                to="/admin/rpet"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span>♻️</span> Declarations
              </NavLink>
              <NavLink
                to="/admin/rpet/new"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-primary-200 hover:bg-primary-700 hover:text-white'}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span>➕</span> Add Declaration
              </NavLink>
            </div>
          </nav>
          <div className="p-4 border-t border-primary-700 space-y-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-primary-300 text-xs hover:text-white transition-colors w-full"
            >
              <span>←</span> FSSAI Consumer Page
            </button>
            <button
              onClick={() => navigate('/rpet')}
              className="flex items-center gap-2 text-primary-300 text-xs hover:text-white transition-colors w-full"
            >
              <span>♻️</span> rPET Consumer Page
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-bold text-gray-800">rPET Data Management Portal</h1>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 overflow-auto">
            <Outlet />
          </main>
        </div>

        <Toast toasts={toasts} onRemove={removeToast} />
      </div>
    </ToastContext.Provider>
  );
}
