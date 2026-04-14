import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ProductInfoPage from './pages/ProductInfoPage'
import AdminPortal from './pages/AdminPortal'
import AdminProductList from './pages/AdminProductList'
import AdminProductForm from './pages/AdminProductForm'
import AdminRpetList from './pages/AdminRpetList'
import AdminRpetForm from './pages/AdminRpetForm'
import RpetLandingPage from './pages/rpet/RpetLandingPage'
import RpetProductInfoPage from './pages/rpet/RpetProductInfoPage'

export default function App() {
  return (
    <Routes>
      {/* FSSAI Product Info (existing) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/product/:code" element={<ProductInfoPage />} />

      {/* rPET Recycle Declaration (new) */}
      <Route path="/rpet" element={<RpetLandingPage />} />
      <Route path="/rpet/product/:code" element={<RpetProductInfoPage />} />

      {/* Admin Portal */}
      <Route path="/admin" element={<AdminPortal />}>
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<AdminProductList />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="rpet" element={<AdminRpetList />} />
        <Route path="rpet/new" element={<AdminRpetForm />} />
        <Route path="rpet/:id/edit" element={<AdminRpetForm />} />
      </Route>
    </Routes>
  )
}
