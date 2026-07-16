import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Layout from './components/Layout';
import Executive from './pages/Executive';
import Funnel from './pages/Funnel';
import Customer from './pages/Customer';
import Product from './pages/Product';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing site */}
        <Route path="/" element={<LandingPage />} />

        {/* Analytics dashboard */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/executive" replace />} />
          <Route path="executive" element={<Executive />} />
          <Route path="funnel" element={<Funnel />} />
          <Route path="customer" element={<Customer />} />
          <Route path="product" element={<Product />} />
        </Route>

        {/* Legacy redirect: old /executive, /funnel etc → /app/* */}
        <Route path="/executive" element={<Navigate to="/app/executive" replace />} />
        <Route path="/funnel" element={<Navigate to="/app/funnel" replace />} />
        <Route path="/customer" element={<Navigate to="/app/customer" replace />} />
        <Route path="/product" element={<Navigate to="/app/product" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
