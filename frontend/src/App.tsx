import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ProductInfoPage from './pages/ProductInfoPage'
import AdminPortal from './pages/AdminPortal'
import AdminProductList from './pages/AdminProductList'
import AdminProductForm from './pages/AdminProductForm'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/product/:code" element={<ProductInfoPage />} />
      <Route path="/admin" element={<AdminPortal />}>
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<AdminProductList />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
      </Route>
    </Routes>
  )
}
